import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useState } from 'react';

const ROLE_REDIRECT = {
  CLIENTE: '/',
  VENDEDOR: '/vendor/dashboard',
  ADMIN: '/admin/dashboard',
};

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { role: 'CLIENTE' },
  });
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      const user = await authRegister(data);
      navigate(ROLE_REDIRECT[user.rol.nombre] ?? '/');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🍽️</span>
          <h1 className="text-2xl font-bold text-text mt-3">Crea tu cuenta</h1>
          <p className="text-text-secondary text-sm mt-1">Únete a PediYa</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 border border-border space-y-4">
          <Input
            label="Nombre completo"
            placeholder="Juan Pérez"
            error={errors.name?.message}
            {...register('name', { required: 'El nombre es obligatorio' })}
          />
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="tu@email.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'El correo es obligatorio',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Correo inválido' },
            })}
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="Mínimo 6 caracteres"
            error={errors.password?.message}
            {...register('password', {
              required: 'La contraseña es obligatoria',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' },
            })}
          />
          <Input
            label="Teléfono (opcional)"
            type="tel"
            placeholder="0999999999"
            {...register('phone')}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text">Tipo de cuenta</label>
            <select
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
              {...register('role')}
            >
              <option value="CLIENTE">Cliente</option>
              <option value="VENDEDOR">Vendedor</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
