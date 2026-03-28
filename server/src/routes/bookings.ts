import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const bookingSchema = z.object({
  roomId: z.number(),
  date: z.string(), // YYYY-MM-DD
  startTime: z.string(),
  endTime: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
});

// Get user's bookings
router.get('/', authenticate, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.userId },
      include: { room: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get bookings for a specific room and date
router.get('/room/:roomId', async (req, res) => {
  try {
    const { date } = req.query;
    const bookings = await prisma.booking.findMany({
      where: {
        roomId: parseInt(req.params.roomId),
        date: date as string,
        status: { not: 'CANCELLED' },
      },
      orderBy: { startTime: 'asc' },
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create booking
router.post('/', authenticate, async (req, res) => {
  try {
    const data = bookingSchema.parse(req.body);
    
    // Check room exists
    const room = await prisma.room.findUnique({
      where: { id: data.roomId },
    });
    if (!room) {
      return res.status(404).json({ error: 'Salle non trouvée' });
    }
    
    // Check for conflicts
    const conflicts = await prisma.booking.findMany({
      where: {
        roomId: data.roomId,
        date: data.date,
        status: { not: 'CANCELLED' },
        OR: [
          { AND: [{ startTime: { lte: data.startTime } }, { endTime: { gt: data.startTime } }] },
          { AND: [{ startTime: { lt: data.endTime } }, { endTime: { gte: data.endTime } }] },
          { AND: [{ startTime: { gte: data.startTime } }, { endTime: { lte: data.endTime } }] },
        ],
      },
    });
    
    if (conflicts.length > 0) {
      return res.status(409).json({ error: 'Créneau déjà réservé' });
    }
    
    const booking = await prisma.booking.create({
      data: { ...data, userId: req.user.userId },
      include: { room: true },
    });
    
    res.status(201).json(booking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Update booking (only own bookings)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }
    
    if (booking.userId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    const data = bookingSchema.partial().parse(req.body);
    
    // If changing time/room, check conflicts
    if (data.date || data.startTime || data.endTime || data.roomId) {
      const newDate = data.date || booking.date;
      const newStartTime = data.startTime || booking.startTime;
      const newEndTime = data.endTime || booking.endTime;
      const newRoomId = data.roomId || booking.roomId;
      
      const conflicts = await prisma.booking.findMany({
        where: {
          roomId: newRoomId,
          date: newDate,
          status: { not: 'CANCELLED' },
          id: { not: booking.id },
          OR: [
            { AND: [{ startTime: { lte: newStartTime } }, { endTime: { gt: newStartTime } }] },
            { AND: [{ startTime: { lt: newEndTime } }, { endTime: { gte: newEndTime } }] },
          ],
        },
      });
      
      if (conflicts.length > 0) {
        return res.status(409).json({ error: 'Créneau déjà réservé' });
      }
    }
    
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data,
      include: { room: true },
    });
    
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Cancel booking
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }
    
    if (booking.userId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED' },
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;