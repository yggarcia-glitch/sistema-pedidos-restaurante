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

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { role: 'CLIENTE' },
  });
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const password = watch('password');

  const onSubmit = async ({ confirmPassword, ...data }) => {
    setError('');
    setLoading(true);
    try {
      const user = await authRegister(data);
      navigate(ROLE_REDIRECT[user.rol?.nombre] ?? '/');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8">
      <div className="bg-white rounded-[14px] border border-border p-8 w-full max-w-sm shadow-sm">
        {/* Logo */}
        <div className="w-[56px] h-[56px] rounded-[18px] bg-primary flex items-center justify-center text-[28px] mx-auto mb-[14px]">
          🍽
        </div>
        <h1 className="text-[20px] font-bold text-txt text-center mb-[6px]">Crea tu cuenta</h1>
        <p className="text-[12px] text-txt-2 text-center mb-[28px]">
          Regístrate para empezar a pedir
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <Input
              label="Nombre completo"
              placeholder="Juan Pérez"
              error={errors.name?.message}
              {...register('name', { required: 'El nombre es obligatorio' })}
            />
          </div>
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
          <div className="mb-3">
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
          </div>
          <div className="mb-3">
            <Input
              label="Confirmar contraseña"
              type="password"
              placeholder="Repite la contraseña"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Confirma la contraseña',
                validate: (v) => v === password || 'Las contraseñas no coinciden',
              })}
            />
          </div>

          <div className="mb-[18px]">
            <label className="block text-[11px] font-medium text-txt-2 mb-1">Rol</label>
            <select
              className="bg-background border border-border rounded-[8px] px-3 py-2 text-[12px] text-txt w-full focus:outline-none focus:border-primary"
              {...register('role')}
            >
              <option value="CLIENTE">Cliente</option>
              <option value="VENDEDOR">Vendedor</option>
            </select>
          </div>

          {error && <p className="text-[11px] text-red-500 text-center mb-[10px]">{error}</p>}

          <Button type="submit" variant="primary" fullWidth loading={loading} className="mb-[12px]">
            Crear cuenta
          </Button>
        </form>

        <p className="text-center text-[11px] text-txt-2">
          ¿Ya tienes cuenta?
          <Link to="/login" className="text-primary font-semibold"> Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
