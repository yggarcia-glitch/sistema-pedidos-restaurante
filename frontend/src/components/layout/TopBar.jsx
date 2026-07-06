// Barra superior de cada página del portal (estilo partner PedidosYa/Glovo).
// title + subtitle a la izquierda; `actions` (nodos) a la derecha.
export function TopBar({ title, subtitle, actions }) {
  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-border px-[22px] h-[60px] flex items-center justify-between">
      <div>
        <h1 className="text-[15px] font-bold text-txt leading-tight">{title}</h1>
        {subtitle && <p className="text-[11px] text-txt-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-[10px]">{actions}</div>}
    </header>
  );
}
