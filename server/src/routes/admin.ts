import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Stats (admin only)
router.get('/stats', authenticate, async (req, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    const totalRooms = await prisma.room.count();
    const totalUsers = await prisma.user.count();
    const totalBookings = await prisma.booking.count();
    
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    
    const bookingsByRoom = await prisma.booking.groupBy({
      by: ['roomId'],
      _count: { roomId: true },
      where: { status: { not: 'CANCELLED' } },
    });
    
    const rooms = await prisma.room.findMany();
    const roomStats = await Promise.all(
      rooms.map(async (room) => {
        const count = await prisma.booking.count({
          where: { roomId: room.id, status: { not: 'CANCELLED' } },
        });
        return { roomId: room.id, roomName: room.name, count };
      })
    );
    
    res.json({
      totalRooms,
      totalUsers,
      totalBookings,
      bookingsByStatus,
      roomStats,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// All bookings (admin)
router.get('/bookings', authenticate, async (req, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    const bookings = await prisma.booking.findMany({
      include: { user: { select: { id: true, name: true, email: true } }, room: true },
      orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
      take: 100,
    });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// All users (admin)
router.get('/users', authenticate, async (req, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true, _count: { select: { bookings: true } } },
      orderBy: { createdAt: 'desc' },
    });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;