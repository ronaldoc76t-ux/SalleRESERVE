import { useEffect, useState } from 'react';
import { getStats, getAllBookings, getRooms, getAllUsers, createRoom, updateRoom, deleteRoom } from '../services/api';
import { Room, Booking, User } from '../types';

export default function Admin() {
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState<'stats' | 'bookings' | 'rooms' | 'users'>('stats');
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [s, b, r, u] = await Promise.all([getStats(), getAllBookings(), getRooms(), getAllUsers()]);
      setStats(s);
      setBookings(b);
      setRooms(r);
      setUsers(u);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      capacity: parseInt((form.elements.namedItem('capacity') as HTMLInputElement).value),
      description: (form.elements.namedItem('description') as HTMLInputElement).value,
      openingHour: parseInt((form.elements.namedItem('openingHour') as HTMLInputElement).value),
      closingHour: parseInt((form.elements.namedItem('closingHour') as HTMLInputElement).value),
    };
    
    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, data);
      } else {
        await createRoom(data);
      }
      setShowRoomForm(false);
      setEditingRoom(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (confirm('Supprimer cette salle ?')) {
      await deleteRoom(id);
      fetchData();
    }
  };

  if (loading) return <div className="text-center py-12">Chargement...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Administration</h1>

      <div className="flex gap-2 mb-6">
        {(['stats', 'bookings', 'rooms', 'users'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg ${tab === t ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            {t === 'stats' && 'Statistiques'}
            {t === 'bookings' && 'Réservations'}
            {t === 'rooms' && 'Salles'}
            {t === 'users' && 'Utilisateurs'}
          </button>
        ))}
      </div>

      {tab === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-3xl font-bold">{stats.totalRooms}</div>
            <div className="text-gray-600">Salles</div>
          </div>
          <div className="card">
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <div className="text-gray-600">Utilisateurs</div>
          </div>
          <div className="card">
            <div className="text-3xl font-bold">{stats.totalBookings}</div>
            <div className="text-gray-600">Réservations</div>
          </div>
          <div className="card">
            <div className="text-3xl font-bold">{stats.bookingsByStatus?.find((s: any) => s.status === 'CONFIRMED')?._count?.status || 0}</div>
            <div className="text-gray-600">Confirmées</div>
          </div>
        </div>
      )}

      {tab === 'bookings' && (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Salle</th>
                <th className="text-left p-3">Utilisateur</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Horaire</th>
                <th className="text-left p-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b">
                  <td className="p-3">{b.room?.name || b.roomId}</td>
                  <td className="p-3">{b.user?.name || b.userId}</td>
                  <td className="p-3">{b.date}</td>
                  <td className="p-3">{b.startTime} - {b.endTime}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${b.status === 'CONFIRMED' ? 'bg-green-100' : b.status === 'CANCELLED' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'rooms' && (
        <div>
          <button onClick={() => { setShowRoomForm(true); setEditingRoom(null); }} className="btn-primary mb-4">
            + Ajouter une salle
          </button>
          
          {showRoomForm && (
            <div className="card mb-6">
              <h3 className="font-bold mb-4">{editingRoom ? 'Modifier' : 'Nouvelle'} salle</h3>
              <form onSubmit={handleSaveRoom} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input name="name" placeholder="Nom" defaultValue={editingRoom?.name} className="border rounded px-3 py-2" required />
                  <input name="capacity" type="number" placeholder="Capacité" defaultValue={editingRoom?.capacity} className="border rounded px-3 py-2" required />
                  <input name="description" placeholder="Description" defaultValue={editingRoom?.description} className="border rounded px-3 py-2" />
                  <input name="openingHour" type="number" placeholder="Heure ouverture" defaultValue={editingRoom?.openingHour || 8} className="border rounded px-3 py-2" />
                  <input name="closingHour" type="number" placeholder="Heure fermeture" defaultValue={editingRoom?.closingHour || 20} className="border rounded px-3 py-2" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary">Enregistrer</button>
                  <button type="button" onClick={() => setShowRoomForm(false)} className="px-4 py-2 border rounded">Annuler</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="card">
                <h3 className="font-bold">{room.name}</h3>
                <p className="text-sm text-gray-500">{room.capacity} personnes</p>
                <p className="text-sm text-gray-500">{room.openingHour}h - {room.closingHour}h</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => { setEditingRoom(room); setShowRoomForm(true); }} className="text-sm text-blue-600">Modifier</button>
                  <button onClick={() => handleDeleteRoom(room.id)} className="text-sm text-red-600">Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Nom</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Rôle</th>
                <th className="text-left p-3">Réservations</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${u.role === 'ADMIN' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}