import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

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
      navigate(ROLE_REDIRECT[user.rol?.nombre] ?? '/');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-white rounded-[14px] border border-border p-8 w-full max-w-sm shadow-sm">
        {/* Logo */}
        <div className="w-[56px] h-[56px] rounded-[18px] bg-primary flex items-center justify-center text-[28px] mx-auto mb-[14px]">
          🍽
        </div>
        <h1 className="text-[20px] font-bold text-txt text-center mb-[6px]">Bienvenido</h1>
        <p className="text-[12px] text-txt-2 text-center mb-[28px]">
          Ingresa para pedir tu comida favorita
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tucorreo@ejemplo.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'El correo es obligatorio',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Correo inválido' },
              })}
            />
          </div>
          <div className="mb-[18px]">
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', { required: 'La contraseña es obligatoria' })}
            />
          </div>

          {error && <p className="text-[11px] text-red-500 text-center mb-[10px]">{error}</p>}

          <Button type="submit" variant="primary" fullWidth loading={loading} className="mb-[10px]">
            Iniciar sesión
          </Button>
        </form>

        <p className="text-center text-[11px] text-txt-2 mb-[12px]">
          ¿No tienes cuenta?
          <Link to="/register" className="text-primary font-semibold"> Regístrate</Link>
        </p>

        <div className="border-t border-border my-[10px]" />

        <Button type="button" variant="outline" fullWidth>
          <span className="font-bold">G</span> Continuar con Google
        </Button>
      </div>
    </div>
  );
}
