import { useState } from "react";
import { Package, Plus, X, AlertCircle, CheckCircle } from "lucide-react";
import { API_URL } from "../../auth/authConstants";
import { useAuth } from "../../auth/AuthProvider";

interface SealType {
  code: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const sealTypes: SealType[] = [
  { code: 'PL', name: 'Precinto Plástico', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-500' },
  { code: 'GY', name: 'Precinto de Guaya', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-500' },
  { code: 'BT', name: 'Precinto de Botella', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-500' },
];

export function BulkLoadSeals() {
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [startCode, setStartCode] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const auth = useAuth();

  const handleOpenModal = (typeCode: string) => {
    setLoadingType(typeCode);
    setStartCode('');
    setQuantity('');
    setSuccessMessage('');
  };

  const handleCloseModal = () => {
    setLoadingType(null);
    setStartCode('');
    setQuantity('');
  };

  const extractNumber = (code: string): number => {
    const match = code.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const formatCode = (prefix: string, number: number): string => {
    return `${prefix}${number.toString().padStart(7, '0')}`;
  };

  const calculateEndCode = (): string => {
    if (!startCode || !quantity) return '';
    const prefix = startCode.substring(0, 2);
    const startNumber = extractNumber(startCode);
    const endNumber = startNumber + parseInt(quantity, 10);
    return formatCode(prefix, endNumber);
  };

  const handleConfirmLoad = async () => {
  if (!loadingType) return;

  setIsLoading(true);

  try {
    const response = await fetch(`${API_URL}/inventory/bulk-load`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.getAccessToken()}`,
      },
      body: JSON.stringify({
        tipoCodigo: loadingType,
        startCode,
        quantity: parseInt(quantity, 10),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Error al cargar precintos");
      setIsLoading(false);
      return;
    }

    const sealType = sealTypes.find((t) => t.code === loadingType);

    setSuccessMessage(
      `Se cargaron exitosamente ${data.inserted.toLocaleString()} precintos de tipo ${sealType?.name} al stock nacional.`
    );

    setTimeout(() => {
      handleCloseModal();
    }, 3000);
  } catch (error) {
    console.error(error);
    alert("Error de conexión con el servidor");
  } finally {
    setIsLoading(false);
  }
};

  const isValidForm = () => {
    if (!startCode || !quantity) return false;
    const prefix = startCode.substring(0, 2);
    if (prefix !== loadingType) return false;
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) return false;
    return true;
  };

  const currentSealType = sealTypes.find(t => t.code === loadingType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Cargue Masivo de Precintos</h2>
        <p className="text-gray-600 text-sm mt-1">
          Carga de precintos al stock nacional del sistema
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-l-4 border-[#3483FA] p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#3483FA] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900 mb-1">Instrucciones de Cargue</p>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Ingrese el código inicial del precinto (ej: PL0004000)</li>
              <li>Indique la cantidad de precintos a cargar</li>
              <li>Los códigos se generarán en orden numérico secuencial</li>
              <li>Los precintos se agregarán al stock nacional para posterior asignación</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Seal Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sealTypes.map((sealType) => (
          <div
            key={sealType.code}
            className={`bg-white rounded-xl shadow-md border-2 ${sealType.borderColor} overflow-hidden hover:shadow-lg transition-all`}
          >
            {/* Header */}
            <div className={`${sealType.bgColor} px-6 py-4 border-b-2 ${sealType.borderColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                    <Package className={`w-6 h-6 ${sealType.color}`} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${sealType.color}`}>{sealType.name}</h3>
                    <p className="text-xs text-gray-600">Código: {sealType.code}XXXXXXX</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Ejemplo de código:</p>
                <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
                  <p className="font-mono font-bold text-gray-900 text-center">
                    {sealType.code}0001000
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleOpenModal(sealType.code)}
                className={`w-full flex items-center justify-center gap-2 ${sealType.bgColor} hover:opacity-80 ${sealType.color} font-semibold py-3 rounded-lg transition-all border-2 ${sealType.borderColor}`}
              >
                <Plus className="w-5 h-5" />
                Cargar Precintos
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Cargue */}
      {loadingType && currentSealType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            {/* Header */}
            <div className={`${currentSealType.bgColor} px-6 py-4 rounded-t-xl flex items-center justify-between border-b-2 ${currentSealType.borderColor}`}>
              <h3 className={`font-bold text-lg ${currentSealType.color} flex items-center gap-2`}>
                <Package className="w-5 h-5" />
                Cargar {currentSealType.name}
              </h3>
              <button
                onClick={handleCloseModal}
                className={`${currentSealType.color} hover:opacity-70 p-1 rounded transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {successMessage ? (
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 mb-1">¡Cargue Exitoso!</p>
                    <p className="text-sm text-green-800">{successMessage}</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Código Inicial */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Código Inicial del Precinto
                    </label>
                    <input
                      type="text"
                      value={startCode}
                      onChange={(e) => setStartCode(e.target.value.toUpperCase())}
                      placeholder={`${loadingType}0004000`}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Formato: {loadingType} seguido de 7 dígitos
                    </p>
                  </div>

                  {/* Cantidad */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cantidad de Precintos a Cargar
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="1000"
                      min="1"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  {/* Preview del Rango */}
                  {startCode && quantity && isValidForm() && (
                    <div className={`${currentSealType.bgColor} border-2 ${currentSealType.borderColor} rounded-lg p-4`}>
                      <p className={`text-sm font-semibold ${currentSealType.color} mb-2`}>
                        Rango de Cargue:
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Desde:</span>
                          <span className="font-mono font-bold text-gray-900">{startCode}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Hasta:</span>
                          <span className="font-mono font-bold text-gray-900">{calculateEndCode()}</span>
                        </div>
                        <div className="border-t-2 border-gray-300 pt-2 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">Total:</span>
                            <span className={`font-bold ${currentSealType.color}`}>
                              {parseInt(quantity).toLocaleString()} precintos
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warning si el código no coincide */}
                  {startCode && startCode.substring(0, 2) !== loadingType && (
                    <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-800">
                        El código debe comenzar con <span className="font-bold">{loadingType}</span>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {!successMessage && (
              <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmLoad}
                  disabled={!isValidForm() || isLoading}
                  className={`px-6 py-2 ${currentSealType.bgColor} ${currentSealType.color} rounded-lg transition-colors font-semibold border-2 ${currentSealType.borderColor} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? 'Cargando...' : 'Confirmar Cargue'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
