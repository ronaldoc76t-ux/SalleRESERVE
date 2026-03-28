import { Room, Booking, AuthResponse, User } from '../types';

const API_URL = '/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
  
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Erreur réseau' }));
    throw new Error(error.error || 'Erreur');
  }
  
  if (res.status === 204) return null as T;
  return res.json();
}

// Auth
export const register = (data: { email: string; password: string; name: string }) =>
  fetchApi<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) });

export const login = (data: { email: string; password: string }) =>
  fetchApi<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) });

// Rooms
export const getRooms = () => fetchApi<Room[]>('/rooms');
export const getRoom = (id: number) => fetchApi<Room>(`/rooms/${id}`);
export const createRoom = (data: Partial<Room>) => fetchApi<Room>('/rooms', { method: 'POST', body: JSON.stringify(data) });
export const updateRoom = (id: number, data: Partial<Room>) => fetchApi<Room>(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteRoom = (id: number) => fetchApi<void>(`/rooms/${id}`, { method: 'DELETE' });

// Bookings
export const getMyBookings = () => fetchApi<Booking[]>('/bookings');
export const getRoomBookings = (roomId: number, date: string) => 
  fetchApi<Booking[]>(`/bookings/room/${roomId}?date=${date}`);
export const createBooking = (data: Partial<Booking>) => 
  fetchApi<Booking>('/bookings', { method: 'POST', body: JSON.stringify(data) });
export const updateBooking = (id: number, data: Partial<Booking>) => 
  fetchApi<Booking>(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const cancelBooking = (id: number) => fetchApi<void>(`/bookings/${id}`, { method: 'DELETE' });

// Admin
export const getStats = () => fetchApi<any>('/admin/stats');
export const getAllBookings = () => fetchApi<Booking[]>('/admin/bookings');
export const getAllUsers = () => fetchApi<User[]>('/admin/users');