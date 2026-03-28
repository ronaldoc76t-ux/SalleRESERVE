import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRooms } from '../services/api';
import { Room } from '../types';

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRooms().then(setRooms).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12">Chargement...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nos salles</h1>
      </div>

      {rooms.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Aucune salle disponible</p>
          <Link to="/booking" className="btn-primary">Première réservation</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="card">
              {room.imageUrl && (
                <img src={room.imageUrl} alt={room.name} className="w-full h-40 object-cover rounded-lg mb-4" />
              )}
              <h3 className="text-lg font-bold">{room.name}</h3>
              <p className="text-sm text-gray-500 mb-2">Capacité: {room.capacity} personnes</p>
              {room.description && <p className="text-gray-600 text-sm mb-4">{room.description}</p>}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {room.openingHour}h - {room.closingHour}h
                </span>
                <Link to={`/booking/${room.id}`} className="text-primary font-medium hover:underline">
                  Réserver →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}