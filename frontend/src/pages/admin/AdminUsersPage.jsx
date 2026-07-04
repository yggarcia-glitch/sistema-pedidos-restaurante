import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Navbar } from '../../components/layout/Navbar';
import { BottomNav } from '../../components/layout/BottomNav';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';

const ROLE_COLORS = { CLIENTE: 'blue', VENDEDOR: 'orange', ADMIN: 'primary' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    api.get('/users').then(({ data }) => { setUsers(data); setFiltered(data); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = users;
    if (search) result = result.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
    if (roleFilter) result = result.filter((u) => u.role === roleFilter);
    setFiltered(result);
  }, [search, roleFilter, users]);

  const toggleActive = async (user) => {
    await api.patch(`/users/${user.id}`, { isActive: !user.isActive });
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
  };

  const changeRole = async (user, role) => {
    await api.patch(`/users/${user.id}`, { role });
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role } : u));
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-text mb-4">Gestión de usuarios</h1>

        <div className="flex gap-3 mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="flex-1 px-4 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none"
          >
            <option value="">Todos los roles</option>
            <option value="CLIENTE">Cliente</option>
            <option value="VENDEDOR">Vendedor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {loading ? (
          <PageSpinner />
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-text-secondary font-medium">Usuario</th>
                  <th className="text-left px-4 py-3 text-text-secondary font-medium">Rol</th>
                  <th className="text-left px-4 py-3 text-text-secondary font-medium">Estado</th>
                  <th className="text-left px-4 py-3 text-text-secondary font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text">{user.name}</p>
                      <p className="text-xs text-text-secondary">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => changeRole(user, e.target.value)}
                        className="text-xs border border-border rounded-lg px-2 py-1 bg-white focus:outline-none"
                      >
                        <option value="CLIENTE">CLIENTE</option>
                        <option value="VENDEDOR">VENDEDOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={user.isActive ? 'green' : 'red'}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(user)}
                        className={`text-xs hover:underline ${user.isActive ? 'text-red-400' : 'text-green-600'}`}
                      >
                        {user.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-text-secondary">No se encontraron usuarios</div>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
