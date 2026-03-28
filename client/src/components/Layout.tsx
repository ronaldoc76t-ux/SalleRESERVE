import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-secondary text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">SalleRESERVE</Link>
          <div className="flex gap-4 items-center">
            <Link to="/" className="hover:text-gray-300">Dashboard</Link>
            <Link to="/rooms" className="hover:text-gray-300">Salles</Link>
            {user && (
              <>
                <Link to="/booking" className="hover:text-gray-300">Réserver</Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="hover:text-gray-300">Admin</Link>
                )}
              </>
            )}
            {user ? (
              <div className="flex gap-3 items-center ml-4">
                <span className="text-sm text-gray-400">{user.name}</span>
                <button onClick={handleLogout} className="text-sm bg-red-600 px-3 py-1 rounded hover:bg-red-700">
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link to="/login" className="ml-4">Connexion</Link>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}