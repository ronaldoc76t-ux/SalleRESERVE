import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRooms, getRoomBookings, createBooking, getRoom } from '../services/api';
import { Room, Booking } from '../types';

export default function Booking() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRooms().then(setRooms).catch(console.error);
  }, []);

  useEffect(() => {
    const rid = roomId ? parseInt(roomId) : selectedRoom;
    if (rid) {
      setSelectedRoom(rid);
      getRoom(rid).then((r) => setSelectedRoom(r.id)).catch(() => {});
    }
  }, [roomId]);

  useEffect(() => {
    if (selectedRoom && date) {
      getRoomBookings(selectedRoom, date).then(setBookings).catch(console.error);
    }
  }, [selectedRoom, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      await createBooking({ roomId: selectedRoom!, date, startTime, endTime, title, description });
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [];
  for (let h = 8; h <= 20; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    if (h < 20) timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }

  const occupiedSlots = bookings.map((b) => ({ start: b.startTime, end: b.endTime }));

  const isSlotOccupied = (start: string, end: string) => {
    return occupiedSlots.some((o) => start < o.end && end > o.start);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nouvelle réservation</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Salle</label>
              <select
                value={selectedRoom || ''}
                onChange={(e) => setSelectedRoom(parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Sélectionner une salle</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} ({r.capacity} pers.)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Début</label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fin</label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  {timeSlots.filter((t) => t > startTime).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Titre (optionnel)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Réunion équipe, Formation, ..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description (optionnel)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                rows={3}
              />
            </div>

            {error && <div className="bg-red-100 text-red-600 p-3 rounded">{error}</div>}
            {success && <div className="bg-green-100 text-green-600 p-3 rounded">Réservation créée !</div>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Création...' : 'Confirmer la réservation'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="font-bold mb-4">Créneaux du {date}</h3>
          {bookings.length === 0 ? (
            <p className="text-gray-500">Aucun créneau réservé</p>
          ) : (
            <div className="space-y-2">
              {bookings.map((b) => (
                <div key={b.id} className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                  <div className="font-medium">{b.startTime} - {b.endTime}</div>
                  <div className="text-sm text-gray-600">{b.title || 'Réservé'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}