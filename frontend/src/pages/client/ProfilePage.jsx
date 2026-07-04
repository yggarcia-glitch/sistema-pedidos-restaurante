import { useForm } from 'react-hook-form';
import { useState } from 'react';
import api from '../../api/axios';
import { Navbar } from '../../components/layout/Navbar';
import { BottomNav } from '../../components/layout/BottomNav';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
  });

  const {
    register: regPwd,
    handleSubmit: handlePwd,
    reset: resetPwd,
    formState: { errors: errPwd },
  } = useForm();

  const onSaveProfile = async (data) => {
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await api.patch(`/users/${user.id}`, data);
      setSuccess('Perfil actualizado correctamente');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (data) => {
    setError(''); setSuccess('');
    if (data.newPassword !== data.confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await api.patch(`/users/${user.id}`, { password: data.newPassword });
      setSuccess('Contraseña actualizada');
      resetPwd();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-primary text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">{user?.name}</h1>
            <p className="text-sm text-text-secondary">{user?.email}</p>
          </div>
        </div>

        {success && <p className="text-sm text-green-600 mb-4 text-center">{success}</p>}
        {error && <p className="text-sm text-red-500 mb-4 text-center">{error}</p>}

        {/* Editar perfil */}
        <div className="bg-white rounded-2xl border border-border p-4 mb-4">
          <h2 className="font-semibold text-text mb-4">Datos personales</h2>
          <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-3">
            <Input
              label="Nombre"
              error={errors.name?.message}
              {...register('name', { required: 'El nombre es obligatorio' })}
            />
            <Input label="Teléfono" type="tel" {...register('phone')} />
            <Button type="submit" disabled={loading} className="w-full">Guardar cambios</Button>
          </form>
        </div>

        {/* Cambiar contraseña */}
        <div className="bg-white rounded-2xl border border-border p-4 mb-4">
          <h2 className="font-semibold text-text mb-4">Cambiar contraseña</h2>
          <form onSubmit={handlePwd(onChangePassword)} className="space-y-3">
            <Input
              label="Nueva contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              error={errPwd.newPassword?.message}
              {...regPwd('newPassword', {
                required: 'Ingresa la nueva contraseña',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              })}
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              placeholder="Repite la contraseña"
              {...regPwd('confirm', { required: 'Confirma la contraseña' })}
            />
            <Button type="submit" disabled={loading} variant="secondary" className="w-full">
              Actualizar contraseña
            </Button>
          </form>
        </div>

        <Button variant="danger" onClick={logout} className="w-full">
          Cerrar sesión
        </Button>
      </div>
      <BottomNav />
    </div>
  );
}
