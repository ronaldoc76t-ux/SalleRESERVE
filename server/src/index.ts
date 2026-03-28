import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'sallereserve-secret-key';

// Database setup
const db = new Database('./data.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'USER',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    description TEXT,
    equipment TEXT,
    imageUrl TEXT,
    openingHour INTEGER DEFAULT 8,
    closingHour INTEGER DEFAULT 20,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    roomId INTEGER NOT NULL,
    date TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    status TEXT DEFAULT 'CONFIRMED',
    title TEXT,
    description TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (roomId) REFERENCES rooms(id)
  );
`);

app.use(cors());
app.use(express.json());

// Auth middleware
const auth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requis' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

const adminOnly = (req: any, res: any, next: any) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Accès refusé' });
  next();
};

// ============ AUTH ============
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(1),
    }).parse(req.body);
    
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(400).json({ error: 'Email déjà utilisé' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').run(email, hashedPassword, name);
    
    res.status(201).json({ id: result.lastInsertRowid, email, name, role: 'USER' });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = z.object({
      email: z.string().email(),
      password: z.string(),
    }).parse(req.body);
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============ ROOMS ============
app.get('/api/rooms', (req, res) => {
  const rooms = db.prepare('SELECT * FROM rooms ORDER BY name').all();
  res.json(rooms);
});

app.get('/api/rooms/:id', (req, res) => {
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(parseInt(req.params.id));
  if (!room) return res.status(404).json({ error: 'Salle non trouvée' });
  res.json(room);
});

app.post('/api/rooms', auth, adminOnly, (req, res) => {
  try {
    const { name, capacity, description, equipment, imageUrl, openingHour, closingHour } = z.object({
      name: z.string().min(1),
      capacity: z.number().min(1),
      description: z.string().optional(),
      equipment: z.string().optional(),
      imageUrl: z.string().optional(),
      openingHour: z.number().min(0).max(23).optional(),
      closingHour: z.number().min(0).max(23).optional(),
    }).parse(req.body);
    
    const result = db.prepare(`
      INSERT INTO rooms (name, capacity, description, equipment, imageUrl, openingHour, closingHour)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, capacity, description, equipment, imageUrl, openingHour || 8, closingHour || 20);
    
    res.status(201).json({ id: result.lastInsertRowid, name, capacity, description, openingHour: openingHour || 8, closingHour: closingHour || 20 });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/rooms/:id', auth, adminOnly, (req, res) => {
  try {
    const data = z.object({
      name: z.string().min(1).optional(),
      capacity: z.number().min(1).optional(),
      description: z.string().optional(),
      equipment: z.string().optional(),
      imageUrl: z.string().optional(),
      openingHour: z.number().min(0).max(23).optional(),
      closingHour: z.number().min(0).max(23).optional(),
    }).partial().parse(req.body);
    
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = Object.values(data);
    
    if (fields) {
      db.prepare(`UPDATE rooms SET ${fields} WHERE id = ?`).run(...values, parseInt(req.params.id));
    }
    
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(parseInt(req.params.id));
    res.json(room);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/rooms/:id', auth, adminOnly, (req, res) => {
  db.prepare('DELETE FROM rooms WHERE id = ?').run(parseInt(req.params.id));
  res.status(204).send();
});

// ============ BOOKINGS ============
app.get('/api/bookings', auth, (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, r.name as roomName, r.capacity
    FROM bookings b
    JOIN rooms r ON b.roomId = r.id
    WHERE b.userId = ?
    ORDER BY b.date, b.startTime
  `).all(req.user.userId);
  res.json(bookings);
});

app.get('/api/bookings/room/:roomId', (req, res) => {
  const { date } = req.query;
  const bookings = db.prepare(`
    SELECT * FROM bookings
    WHERE roomId = ? AND date = ? AND status != 'CANCELLED'
    ORDER BY startTime
  `).all(parseInt(req.params.roomId), date);
  res.json(bookings);
});

app.post('/api/bookings', auth, (req, res) => {
  try {
    const { roomId, date, startTime, endTime, title, description } = z.object({
      roomId: z.number(),
      date: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
    }).parse(req.body);
    
    // Check room exists
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
    if (!room) return res.status(404).json({ error: 'Salle non trouvée' });
    
    // Check conflicts
    const conflicts = db.prepare(`
      SELECT * FROM bookings
      WHERE roomId = ? AND date = ? AND status != 'CANCELLED'
      AND ((startTime <= ? AND endTime > ?) OR (startTime < ? AND endTime >= ?) OR (startTime >= ? AND endTime <= ?))
    `).all(roomId, date, startTime, startTime, endTime, endTime, startTime, endTime);
    
    if (conflicts.length > 0) return res.status(409).json({ error: 'Créneau déjà réservé' });
    
    const result = db.prepare(`
      INSERT INTO bookings (userId, roomId, date, startTime, endTime, title, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.userId, roomId, date, startTime, endTime, title, description);
    
    const booking = db.prepare('SELECT b.*, r.name as roomName FROM bookings b JOIN rooms r ON b.roomId = r.id WHERE b.id = ?').get(result.lastInsertRowid);
    res.status(201).json(booking);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/bookings/:id', auth, (req, res) => {
  try {
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(parseInt(req.params.id)) as any;
    if (!booking) return res.status(404).json({ error: 'Réservation non trouvée' });
    if (booking.userId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    const data = z.object({
      date: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
    }).partial().parse(req.body);
    
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = Object.values(data);
    
    if (fields) {
      db.prepare(`UPDATE bookings SET ${fields} WHERE id = ?`).run(...values, parseInt(req.params.id));
    }
    
    const updated = db.prepare('SELECT b.*, r.name as roomName FROM bookings b JOIN rooms r ON b.roomId = r.id WHERE b.id = ?').get(parseInt(req.params.id));
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/bookings/:id', auth, (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(parseInt(req.params.id));
  if (!booking) return res.status(404).json({ error: 'Réservation non trouvée' });
  if ((booking as any).userId !== req.user.userId && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  
  db.prepare("UPDATE bookings SET status = 'CANCELLED' WHERE id = ?").run(parseInt(req.params.id));
  res.status(204).send();
});

// ============ ADMIN ============
app.get('/api/admin/stats', auth, adminOnly, (req, res) => {
  const totalRooms = db.prepare('SELECT COUNT(*) as count FROM rooms').get() as any;
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
  const totalBookings = db.prepare('SELECT COUNT(*) as count FROM bookings').get() as any;
  
  const roomStats = db.prepare(`
    SELECT r.id, r.name, COUNT(b.id) as bookingCount
    FROM rooms r
    LEFT JOIN bookings b ON r.id = b.roomId AND b.status != 'CANCELLED'
    GROUP BY r.id
  `).all();
  
  res.json({
    totalRooms: totalRooms.count,
    totalUsers: totalUsers.count,
    totalBookings: totalBookings.count,
    roomStats,
  });
});

app.get('/api/admin/bookings', auth, adminOnly, (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, u.name as userName, u.email as userEmail, r.name as roomName
    FROM bookings b
    JOIN users u ON b.userId = u.id
    JOIN rooms r ON b.roomId = r.id
    ORDER BY b.date DESC, b.startTime DESC
    LIMIT 100
  `).all();
  res.json(bookings);
});

app.get('/api/admin/users', auth, adminOnly, (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.email, u.name, u.role, u.createdAt, COUNT(b.id) as bookingCount
    FROM users u
    LEFT JOIN bookings b ON u.id = b.userId
    GROUP BY u.id
    ORDER BY u.createdAt DESC
  `).all();
  res.json(users);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Seed default rooms if none exist
const roomCount = db.prepare('SELECT COUNT(*) as count FROM rooms').get() as any;
if (roomCount.count === 0) {
  db.prepare('INSERT INTO rooms (name, capacity, description) VALUES (?, ?, ?)').run('Salle de réunion A', 10, 'Grande salle de réunion avec écran');
  db.prepare('INSERT INTO rooms (name, capacity, description) VALUES (?, ?, ?)').run('Salle de réunion B', 6, 'Petite salle pour équipes');
  db.prepare('INSERT INTO rooms (name, capacity, description) VALUES (?, ?, ?)').run('Salle de formation', 20, 'Salle équipée pour formations');
  console.log('✓ Salles par défaut créées');
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;