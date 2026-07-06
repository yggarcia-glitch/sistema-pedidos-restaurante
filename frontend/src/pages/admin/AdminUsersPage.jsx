import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { SidebarLayout } from '../../components/layout/SidebarLayout';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PageSpinner } from '../../components/ui/Spinner';

const ROLE_BADGE = { ADMIN: 'info', VENDEDOR: 'warn', CLIENTE: 'default' };
const ROLES = ['CLIENTE', 'VENDEDOR', 'ADMIN'];
const GRID = { display: 'grid', gridTemplateColumns: '1fr 1fr 70px 65px 40px', gap: '8px' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // usuario en edición
  const [form, setForm] = useState({ role: 'CLIENTE', isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/users')
      .then(({ data }) => setUsers(Array.isArray(data) ? data : data.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const openEdit = (user) => {
    setEditing(user);
    setForm({ role: user.rol?.nombre ?? 'CLIENTE', isActive: user.isActive });
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch(`/users/${editing.id}`, {
        role: form.role,
        isActive: form.isActive,
      });
      // Refleja el cambio en la lista (el backend devuelve el usuario actualizado).
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editing.id
            ? { ...u, isActive: form.isActive, rol: data.rol ?? { nombre: form.role } }
            : u,
        ),
      );
      setEditing(null);
    } catch (err) {
      alert(err.response?.data?.message ?? 'No se pudo actualizar el usuario');
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    const rows = [['Nombre', 'Email', 'Rol', 'Estado']];
    filtered.forEach((u) =>
      rows.push([u.name, u.email, u.rol?.nombre ?? '', u.isActive ? 'Activo' : 'Inactivo']),
    );
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usuarios.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = users.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SidebarLayout>
      <TopBar
        title="Gestión de usuarios"
        subtitle={`${users.length} usuarios`}
        actions={<Button size="sm" onClick={exportCsv}>⬇ Exportar</Button>}
      />
      <div className="p-[22px]">
        {/* Buscador */}
        <div className="bg-white rounded-full px-[14px] py-[8px] flex items-center gap-[8px] border border-border mb-[12px] max-w-md shadow-sm">
          <span className="text-txt-3">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuarios..."
            className="bg-transparent text-[12px] text-txt placeholder:text-txt-3 focus:outline-none w-full"
          />
        </div>

        {loading ? (
          <PageSpinner />
        ) : (
          <div className="bg-white border border-border rounded-[12px] overflow-hidden shadow-sm">
            <div style={GRID} className="bg-background px-[12px] py-[7px] border-b border-border text-[10px] font-bold text-txt-2">
              <span>Nombre</span>
              <span>Email</span>
              <span>Rol</span>
              <span>Estado</span>
              <span />
            </div>

            {filtered.map((user) => (
              <div
                key={user.id}
                style={GRID}
                className="px-[12px] py-[8px] border-b border-border last:border-0 items-center"
              >
                <span className="text-[12px] font-semibold text-txt truncate">{user.name}</span>
                <span className="text-[11px] text-txt-2 truncate">{user.email}</span>
                <span>
                  <Badge type={ROLE_BADGE[user.rol?.nombre] ?? 'default'}>{user.rol?.nombre}</Badge>
                </span>
                <span>
                  <Badge type={user.isActive ? 'ok' : 'default'}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </span>
                <button
                  onClick={() => openEdit(user)}
                  className="text-txt-2 cursor-pointer text-center hover:text-primary"
                  title="Editar usuario"
                >
                  ⋮
                </button>
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="text-center text-[12px] text-txt-2 py-8">No se encontraron usuarios</p>
            )}
          </div>
        )}
      </div>

      {/* Modal de edición */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar usuario">
        {editing && (
          <div className="space-y-[14px]">
            <div>
              <p className="text-[12px] font-bold text-txt">{editing.name}</p>
              <p className="text-[11px] text-txt-2">{editing.email}</p>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-txt-2 mb-1">Rol</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="bg-background border border-border rounded-[8px] px-3 py-2 text-[12px] text-txt w-full focus:outline-none focus:border-primary"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="accent-primary"
              />
              <span className="text-[12px] text-txt">Cuenta activa</span>
            </label>

            <div className="flex gap-[8px] pt-[4px]">
              <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button variant="primary" className="flex-1" loading={saving} onClick={save}>
                Guardar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </SidebarLayout>
  );
}
