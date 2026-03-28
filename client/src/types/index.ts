export interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  description?: string;
  equipment?: string;
  imageUrl?: string;
  openingHour: number;
  closingHour: number;
}

export interface Booking {
  id: number;
  userId: number;
  roomId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  title?: string;
  description?: string;
  createdAt: string;
  room?: Room;
  user?: { id: number; name: string; email: string };
}

export interface AuthResponse {
  token: string;
  user: User;
}