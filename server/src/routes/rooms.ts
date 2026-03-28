import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const roomSchema = z.object({
  name: z.string().min(1),
  capacity: z.number().min(1),
  description: z.string().optional(),
  equipment: z.string().optional(),
  imageUrl: z.string().optional(),
  openingHour: z.number().min(0).max(23).optional(),
  closingHour: z.number().min(0).max(23).optional(),
});

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get single room
router.get('/:id', async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!room) {
      return res.status(404).json({ error: 'Salle non trouvée' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create room (admin only)
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    const data = roomSchema.parse(req.body);
    const room = await prisma.room.create({ data });
    res.status(201).json(room);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Update room (admin only)
router.put('/:id', authenticate, async (req, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    const data = roomSchema.partial().parse(req.body);
    const room = await prisma.room.update({
      where: { id: parseInt(req.params.id) },
      data,
    });
    res.json(room);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Delete room (admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    await prisma.room.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;