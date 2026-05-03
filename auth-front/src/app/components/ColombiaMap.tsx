import { MapPin } from 'lucide-react';
import { useState } from 'react';

interface Location {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  color: string;
}

const locations: Location[] = [
  { id: '1', name: 'HUB\nMEDELLÍN', type: 'hub', x: 35, y: 25, color: '#60a5fa' },
  { id: '2', name: 'ESTACIÓN\nÚLTIMA MILLA\n(CALI)', type: 'station', x: 25, y: 55, color: '#f87171' },
  { id: '3', name: 'ESTACIÓN\nPRINCIPAL\n(BOGOTÁ)', type: 'station', x: 55, y: 40, color: '#fbbf24' },
];

export function ColombiaMap() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  return (
    <div className="relative w-full h-full bg-white rounded border border-gray-300 shadow-sm">
      <div className="absolute top-4 left-4 bg-yellow-50 border-2 border-yellow-400 rounded p-3 max-w-sm z-10 shadow-sm">
        <div className="flex items-start gap-2">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-bold text-sm mb-1">Comentario</p>
            <p className="text-xs text-gray-800 leading-relaxed">
              Esta vista utiliza el mapa logístico con los datos de los módulos de sincronización (datos de alta).
            </p>
          </div>
        </div>
      </div>

      <div className="relative w-full h-full flex items-center justify-center p-8">
        {/* Mapa de Colombia SVG simplificado */}
        <svg
          viewBox="0 0 400 500"
          className="w-full max-w-sm h-auto"
        >
          {/* Contorno de Colombia */}
          <path
            d="M 150 80 Q 120 90 110 120 L 95 160 Q 85 190 90 220 L 100 280 Q 105 320 120 350 L 140 390 Q 150 410 170 420 L 200 430 Q 220 435 240 430 L 270 420 Q 285 410 295 390 L 310 350 Q 320 320 325 280 L 330 240 Q 335 210 325 180 L 310 140 Q 300 110 280 90 L 260 75 Q 240 65 220 70 L 190 75 Q 170 75 150 80 Z"
            fill="#f3f4f6"
            stroke="#d1d5db"
            strokeWidth="2"
          />
          
          {/* Líneas de conexión entre ubicaciones */}
          <line x1="140" y1="125" x2="100" y2="275" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8,4" />
          <line x1="140" y1="125" x2="220" y2="200" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8,4" />
        </svg>

        {/* Marcadores de ubicación */}
        {locations.map((location) => (
          <div
            key={location.id}
            className="absolute cursor-pointer transition-transform hover:scale-110"
            style={{
              left: `${location.x}%`,
              top: `${location.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={() => setSelectedLocation(location.id)}
          >
            <div className="relative">
              <MapPin
                className="w-10 h-10 drop-shadow-md"
                style={{ color: location.color }}
                fill={selectedLocation === location.id ? location.color : 'white'}
                strokeWidth={2.5}
              />
              <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-pre-line text-center min-w-max">
                <div className="bg-white px-3 py-1.5 rounded shadow border border-gray-200 text-xs font-bold">
                  {location.name}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}