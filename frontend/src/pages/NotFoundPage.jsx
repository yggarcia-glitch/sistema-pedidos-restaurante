import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <p className="text-[48px] font-bold text-primary mb-[6px]">404</p>
      <h1 className="text-[16px] font-bold text-txt mb-[4px]">Página no encontrada</h1>
      <p className="text-[12px] text-txt-2 mb-[20px]">
        La página que buscas no existe o fue movida.
      </p>
      <Button variant="primary" onClick={() => navigate('/')}>
        Volver al inicio
      </Button>
    </div>
  );
}
