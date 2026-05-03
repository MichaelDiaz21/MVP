import { useState } from "react";
import {
  ArrowLeft,
  Package,
  MapPin,
  Truck,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { API_URL } from "../../auth/authConstants";
import { useAuth } from "../../auth/AuthProvider";

interface DispatchProps {
  sealType: string;
  originCity: string;
  originCityName: string;
  onBack: () => void;
}

const cities = [
  { id: "bog", name: "Bogotá" },
  { id: "med", name: "Medellín" },
  { id: "cal", name: "Cali" },
  { id: "per", name: "Pereira" },
  { id: "buc", name: "Bucaramanga" },
  { id: "tun", name: "Tunja" },
  { id: "bar", name: "Barranquilla" },
  { id: "car", name: "Cartagena" },
  { id: "iba", name: "Ibagué" },
];

const sealTypeInfo: Record<string, { name: string; color: string; prefix: string }> = {
  PL: { name: "Precinto Plástico", color: "text-blue-600", prefix: "PL" },
  GY: { name: "Precinto de Guaya", color: "text-green-600", prefix: "GY" },
  BT: { name: "Precinto de Botella", color: "text-red-600", prefix: "BT" },
};

export function Dispatch({ sealType, originCity, originCityName, onBack }: DispatchProps) {
  const auth = useAuth();
  const typeInfo = sealTypeInfo[sealType];

  const [sealNumber, setSealNumber] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [operator, setOperator] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const availableCities = cities.filter((c) => c.id !== originCity);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!sealNumber.trim()) {
      newErrors.sealNumber = "Ingresa el número del precinto";
    } else {
      const num = parseInt(sealNumber, 10);
      if (isNaN(num) || num < 1 || num > 9999999) {
        newErrors.sealNumber = "Número inválido (1-9999999)";
      }
    }

    if (!destinationCity) newErrors.destinationCity = "Selecciona la ciudad de destino";
    if (!vehicle.trim()) newErrors.vehicle = "Ingresa la placa del vehículo";
    if (!operator.trim()) newErrors.operator = "Ingresa el nombre del operario";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const destCity = cities.find((c) => c.id === destinationCity);

      const response = await fetch(`${API_URL}/inventory/dispatch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify({
          tipoCodigo: sealType,
          sealNumber,
          originCity,
          destinationCity,
          destinationCityName: destCity?.name,
          vehicle,
          operator,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          general: data.error || "Error al registrar despacho",
        });
        setLoading(false);
        return;
      }

      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        onBack();
      }, 3000);
    } catch (error) {
      console.error(error);
      setErrors({
        general: "Error de conexión con el servidor",
      });
      setLoading(false);
    }
  };

  if (success) {
    const destCityName = cities.find((c) => c.id === destinationCity)?.name;
    const fullSealId = `${typeInfo.prefix}${sealNumber.padStart(7, "0")}`;

    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Despacho Registrado!
          </h2>

          <p className="text-gray-600 mb-4">
            El precinto ha sido marcado en tránsito
          </p>

          <div className="bg-blue-50 rounded-lg p-4 text-sm text-left space-y-2">
            <p className="text-gray-700">
              <span className="font-semibold">Precinto:</span> {fullSealId}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Origen:</span> {originCityName}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Destino:</span> {destCityName}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Vehículo:</span> {vehicle}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Operario:</span> {operator}
            </p>
          </div>

          <p className="text-sm text-gray-500 mt-4">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">Despacho de Precinto</h2>
          <p className="text-gray-600 text-sm mt-1">
            Registrar envío de {typeInfo.name} desde {originCityName}
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border-l-4 border-[#3483FA]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-800 mb-1">Ciudad de Origen</h3>
            <p className="text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {originCityName}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-600">Tipo de Precinto</p>
            <p className={`text-lg font-bold ${typeInfo.color}`}>{typeInfo.name}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
              <p className="text-sm text-red-700 font-semibold">{errors.general}</p>
            </div>
          )}

          <div>
            <label htmlFor="sealNumber" className="block text-sm font-semibold text-gray-700 mb-2">
              Número del Precinto *
            </label>

            <div className="flex items-center">
              <span className="bg-gray-200 px-4 py-3 border-2 border-r-0 border-gray-200 rounded-l-lg font-mono font-bold text-gray-700">
                {typeInfo.prefix}
              </span>

              <input
                type="text"
                id="sealNumber"
                value={sealNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setSealNumber(value);
                  if (errors.sealNumber) setErrors({ ...errors, sealNumber: "" });
                }}
                maxLength={7}
                className={`flex-1 px-4 py-3 border-2 rounded-r-lg outline-none transition-all font-mono text-lg ${errors.sealNumber
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-gray-200 focus:border-[#3483FA] focus:ring-2 focus:ring-[#3483FA]/20"
                  }`}
                placeholder="0000001"
              />
            </div>

            {errors.sealNumber && (
              <p className="text-red-600 text-sm mt-1">{errors.sealNumber}</p>
            )}

            {sealNumber && (
              <p className="text-sm text-gray-600 mt-2">
                ID Completo:{" "}
                <span className="font-mono font-bold">
                  {typeInfo.prefix}
                  {sealNumber.padStart(7, "0")}
                </span>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="destinationCity" className="block text-sm font-semibold text-gray-700 mb-2">
              Ciudad de Destino *
            </label>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <select
                id="destinationCity"
                value={destinationCity}
                onChange={(e) => {
                  setDestinationCity(e.target.value);
                  if (errors.destinationCity) setErrors({ ...errors, destinationCity: "" });
                }}
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg outline-none transition-all appearance-none bg-white ${errors.destinationCity
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-gray-200 focus:border-[#3483FA] focus:ring-2 focus:ring-[#3483FA]/20"
                  }`}
              >
                <option value="">Seleccionar ciudad</option>
                {availableCities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {errors.destinationCity && (
              <p className="text-red-600 text-sm mt-1">{errors.destinationCity}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="vehicle" className="block text-sm font-semibold text-gray-700 mb-2">
                Placa del Vehículo *
              </label>

              <div className="relative">
                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="text"
                  id="vehicle"
                  value={vehicle}
                  onChange={(e) => {
                    setVehicle(e.target.value.toUpperCase());
                    if (errors.vehicle) setErrors({ ...errors, vehicle: "" });
                  }}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg outline-none transition-all uppercase ${errors.vehicle
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-200 focus:border-[#3483FA] focus:ring-2 focus:ring-[#3483FA]/20"
                    }`}
                  placeholder="ABC-123"
                  maxLength={10}
                />
              </div>

              {errors.vehicle && (
                <p className="text-red-600 text-sm mt-1">{errors.vehicle}</p>
              )}
            </div>

            <div>
              <label htmlFor="operator" className="block text-sm font-semibold text-gray-700 mb-2">
                Operario Responsable *
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="text"
                  id="operator"
                  value={operator}
                  onChange={(e) => {
                    setOperator(e.target.value);
                    if (errors.operator) setErrors({ ...errors, operator: "" });
                  }}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg outline-none transition-all ${errors.operator
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-200 focus:border-[#3483FA] focus:ring-2 focus:ring-[#3483FA]/20"
                    }`}
                  placeholder="Nombre del operario"
                />
              </div>

              {errors.operator && (
                <p className="text-red-600 text-sm mt-1">{errors.operator}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
              Observaciones (Opcional)
            </label>

            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none transition-all focus:border-[#3483FA] focus:ring-2 focus:ring-[#3483FA]/20 resize-none"
              placeholder="Información adicional sobre el despacho..."
              maxLength={200}
            />

            <p className="text-xs text-gray-500 mt-1">{notes.length}/200 caracteres</p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">Importante</p>
                <p className="text-sm text-yellow-700">
                  El precinto será marcado como "En Tránsito" en el sistema y aparecerá en la ciudad de destino para su recepción.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#3483FA] text-white font-semibold rounded-lg hover:bg-blue-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registrando Despacho..." : "Registrar Despacho"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}