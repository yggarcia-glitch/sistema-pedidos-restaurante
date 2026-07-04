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

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async ({ email, password }) => {
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(ROLE_REDIRECT[user.role] ?? '/');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🍽️</span>
          <h1 className="text-2xl font-bold text-text mt-3">Bienvenido de nuevo</h1>
          <p className="text-text-secondary text-sm mt-1">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 border border-border space-y-4">
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
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', { required: 'La contraseña es obligatoria' })}
          />
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-4">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
