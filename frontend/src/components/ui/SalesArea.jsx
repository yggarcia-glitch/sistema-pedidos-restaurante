import { useState } from 'react';
import { money } from '../../lib/format';

// Gráfico de línea minimalista (estilo Uber): una sola serie, línea fina,
// relleno muy sutil, sin puntos fijos; dot + guía + tooltip solo al hover.
export function SalesArea({ data, height = 180 }) {
  const [hover, setHover] = useState(null);
  const n = data.length;
  const max = Math.max(1, ...data.map((d) => d.value));
  const padX = 4;

  const xFor = (i) => (n <= 1 ? 50 : padX + (i / (n - 1)) * (100 - 2 * padX));
  const yFor = (v) => 90 - (v / max) * 78; // 12..90 (%)

  const line = data.map((d, i) => `${xFor(i)},${yFor(d.value)}`).join(' ');
  const area =
    `M ${xFor(0)},100 L ` +
    data.map((d, i) => `${xFor(i)},${yFor(d.value)}`).join(' L ') +
    ` L ${xFor(n - 1)},100 Z`;
  const seg = (100 - 2 * padX) / Math.max(1, n - 1);

  return (
    <div>
      <div className="relative" style={{ height }} onMouseLeave={() => setHover(null)}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E85D26" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#E85D26" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#salesArea)" />
          <polyline
            points={line}
            fill="none"
            stroke="#E85D26"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0">
          {hover != null && (
            <>
              <div
                className="absolute top-0 bottom-0 border-l border-border"
                style={{ left: `${xFor(hover)}%` }}
              />
              <span
                className="absolute w-[9px] h-[9px] rounded-full bg-primary border-2 border-white shadow"
                style={{ left: `${xFor(hover)}%`, top: `${yFor(data[hover].value)}%`, transform: 'translate(-50%,-50%)' }}
              />
              <div
                className="absolute z-10 -translate-x-1/2 -translate-y-[150%] whitespace-nowrap rounded-[6px] bg-txt px-2 py-1 text-[10px] font-semibold text-white pointer-events-none"
                style={{ left: `${xFor(hover)}%`, top: `${yFor(data[hover].value)}%` }}
              >
                {data[hover].label} · {money(data[hover].value)}
              </div>
            </>
          )}
          {data.map((d, i) => (
            <div
              key={`hit-${i}`}
              className="absolute top-0 bottom-0"
              style={{ left: `${xFor(i) - seg / 2}%`, width: `${seg}%` }}
              onMouseEnter={() => setHover(i)}
            />
          ))}
        </div>
      </div>

      <div className="relative h-[14px] mt-[6px]">
        {data.map((d, i) => (
          <span
            key={`lbl-${i}`}
            className="absolute -translate-x-1/2 text-[10px] text-txt-3"
            style={{ left: `${xFor(i)}%` }}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
