import { Sidebar } from './Sidebar';

// Envuelve las páginas de vendedor/admin: sidebar fija (216px) + contenido gris.
export function SidebarLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-[216px] min-h-screen bg-background">{children}</main>
    </div>
  );
}
