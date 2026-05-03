import { QrCode } from 'lucide-react';
import { useState } from 'react';

export function QRScanButton() {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    // Simular escaneo
    setTimeout(() => {
      setIsScanning(false);
      alert('¡Código QR escaneado correctamente!\nPrecinto: PL0003456');
    }, 2000);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleScan}
        className="fixed bottom-6 right-6 w-16 h-16 bg-[#FFE600] hover:bg-yellow-500 shadow-2xl rounded-full flex items-center justify-center z-50 transition-all hover:scale-110 active:scale-95"
        aria-label="Escanear QR"
      >
        <QrCode className="w-8 h-8 text-gray-900" />
      </button>

      {/* Scanning Overlay */}
      {isScanning && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-64 h-64 border-4 border-[#FFE600] rounded-lg mb-6">
              {/* Scanning animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-1 bg-[#FFE600] animate-pulse" style={{ animation: 'scan 2s ease-in-out infinite' }} />
              </div>
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#FFE600]" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#FFE600]" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#FFE600]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#FFE600]" />
            </div>
            <p className="text-white font-bold text-lg mb-2">Escaneando código QR...</p>
            <p className="text-gray-300 text-sm">Apunta la cámara al código del precinto</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }
      `}</style>
    </>
  );
}
