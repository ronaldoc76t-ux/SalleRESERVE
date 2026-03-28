import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { getMyBookings, getRooms } from '../services/api';
import { Booking, Room } from '../types';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [b, r] = await Promise.all([getMyBookings(), getRooms()]);
        setBookings(b);
        setRooms(r);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Bienvenue sur SalleRESERVE</h1>
        <p className="text-gray-600 mb-6">Réservez vos salles facilement</p>
        <Link to="/register" className="btn-primary">Commencer</Link>
      </div>
    );
  }

  const upcoming = bookings.filter((b) => b.status !== 'CANCELLED' && b.date >= new Date().toISOString().split('T')[0]);
  const past = bookings.filter((b) => b.status === 'CANCELLED' || b.date < new Date().toISOString().split('T')[0]);

  if (loading) return <div className="text-center py-12">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bonjour, {user.name}</h1>
        <Link to="/booking" className="btn-primary">Nouvelle réservation</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-3xl font-bold text-primary">{rooms.length}</div>
          <div className="text-gray-600">Salles disponibles</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold text-green-600">{upcoming.length}</div>
          <div className="text-gray-600">Réservations à venir</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold text-gray-400">{past.length}</div>
          <div className="text-gray-600">Historique</div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Prochaines réservations</h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-500">Aucune réservation à venir</p>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((b) => (
              <div key={b.id} className="flex justify-between items-center border-b pb-3">
                <div>
                  <div className="font-medium">{b.room?.name || `Salle ${b.roomId}`}</div>
                  <div className="text-sm text-gray-500">{b.date} {b.startTime}-{b.endTime}</div>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}