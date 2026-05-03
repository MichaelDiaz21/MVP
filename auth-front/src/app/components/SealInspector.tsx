import { useState } from 'react';

type SealType = 'plastico' | 'guaya' | 'botella';

interface SealInfo {
  serial: string;
  state: string;
  location: string;
  date: string;
}

const sealData: Record<SealType, SealInfo> = {
  plastico: {
    serial: 'PL0000001',
    state: 'DISPONIBLE',
    location: 'CEDI BOGOTÁ',
    date: '19/03/2026',
  },
  guaya: {
    serial: 'GY0000023',
    state: 'EN USO',
    location: 'HUB MEDELLÍN',
    date: '18/03/2026',
  },
  botella: {
    serial: 'BT0000045',
    state: 'ASIGNADO',
    location: 'ESTACIÓN CALI',
    date: '17/03/2026',
  },
};

export function SealInspector() {
  const [selectedSeal, setSelectedSeal] = useState<SealType>('plastico');
  const currentSeal = sealData[selectedSeal];

  const getSealIcon = (type: SealType) => {
    switch (type) {
      case 'plastico':
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <ellipse cx="40" cy="40" rx="12" ry="30" fill="currentColor" opacity="0.2" />
            <ellipse cx="40" cy="40" rx="8" ry="26" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <rect x="32" y="10" width="16" height="8" rx="2" fill="currentColor" />
          </svg>
        );
      case 'guaya':
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle cx="40" cy="40" rx="25" ry="25" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="40" cy="40" rx="18" ry="18" fill="currentColor" opacity="0.15" />
            <path d="M 40 15 L 40 25 M 40 55 L 40 65" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );
      case 'botella':
        return (
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <rect x="30" y="35" width="20" height="35" rx="3" fill="currentColor" opacity="0.2" />
            <rect x="32" y="37" width="16" height="30" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="35" y="25" width="10" height="12" fill="currentColor" />
            <circle cx="40" cy="20" r="4" fill="currentColor" />
          </svg>
        );
    }
  };

  return (
    <div className="h-full bg-white rounded border border-gray-300 shadow-sm p-5 flex flex-col">
      <h2 className="font-bold mb-4">INSPECTOR DE DATOS DE PRECINTOS</h2>
      
      {/* Selección de tipo de precinto */}
      <div className="mb-6">
        <h3 className="font-bold text-sm mb-3">SELECCIÓN DE TIPO DE PRECINTO</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setSelectedSeal('plastico')}
            className={`p-3 rounded border-2 transition-all ${
              selectedSeal === 'plastico'
                ? 'bg-blue-50 border-blue-500'
                : 'bg-white border-gray-300 hover:border-blue-300'
            }`}
          >
            <div className="w-14 h-14 mx-auto mb-1 text-blue-600">
              {getSealIcon('plastico')}
            </div>
            <p className="font-bold text-xs">Plástico</p>
          </button>
          
          <button
            onClick={() => setSelectedSeal('guaya')}
            className={`p-3 rounded border-2 transition-all ${
              selectedSeal === 'guaya'
                ? 'bg-green-50 border-green-500'
                : 'bg-white border-gray-300 hover:border-green-300'
            }`}
          >
            <div className="w-14 h-14 mx-auto mb-1 text-green-600">
              {getSealIcon('guaya')}
            </div>
            <p className="font-bold text-xs">Guaya</p>
          </button>
          
          <button
            onClick={() => setSelectedSeal('botella')}
            className={`p-3 rounded border-2 transition-all ${
              selectedSeal === 'botella'
                ? 'bg-red-50 border-red-500'
                : 'bg-white border-gray-300 hover:border-red-300'
            }`}
          >
            <div className="w-14 h-14 mx-auto mb-1 text-red-600">
              {getSealIcon('botella')}
            </div>
            <p className="font-bold text-xs">Botella</p>
          </button>
        </div>
      </div>

      {/* Información detallada */}
      <div className="border-t border-gray-300 pt-4 flex-1">
        <h3 className="font-bold text-sm mb-3">
          INFORMACIÓN DETALLADA
          <br />
          <span className="text-xs text-gray-600 font-normal">
            (PRECINTO {selectedSeal.toUpperCase()})
          </span>
        </h3>
        
        <div className="flex items-start gap-4">
          <div className={`w-20 h-20 flex-shrink-0 ${
            selectedSeal === 'plastico' ? 'text-blue-600' :
            selectedSeal === 'guaya' ? 'text-green-600' :
            'text-red-600'
          }`}>
            {getSealIcon(selectedSeal)}
          </div>
          
          <div className="space-y-2.5 flex-1">
            <div>
              <p className="text-xs font-bold text-gray-600">SERIAL ÚNICO:</p>
              <p className="font-bold">{currentSeal.serial}</p>
            </div>
            
            <div>
              <p className="text-xs font-bold text-gray-600">ESTADO:</p>
              <p className="font-bold">{currentSeal.state}</p>
            </div>
            
            <div>
              <p className="text-xs font-bold text-gray-600">UBICACIÓN:</p>
              <p className="font-bold">{currentSeal.location}</p>
            </div>
            
            <div>
              <p className="text-xs font-bold text-gray-600">FECHA INGRESO:</p>
              <p className="font-bold">{currentSeal.date}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}