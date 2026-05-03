import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Package,
  MapPin,
  AlertCircle,
  CheckCircle,
  Truck,
} from "lucide-react";
import { API_URL } from "../../auth/authConstants";
import { useAuth } from "../../auth/AuthProvider";

interface AssignSealsProps {
  sealType: string;
  onBack: () => void;
}

const sealTypeInfo: Record<
  string,
  { name: string; color: string; bgColor: string; prefix: string }
> = {
  PL: {
    name: "Precinto Plástico",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    prefix: "PL",
  },
  GY: {
    name: "Precinto de Guaya",
    color: "text-green-600",
    bgColor: "bg-green-50",
    prefix: "GY",
  },
  BT: {
    name: "Precinto de Botella",
    color: "text-red-600",
    bgColor: "bg-red-50",
    prefix: "BT",
  },
};

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

export function AssignSeals({ sealType, onBack }: AssignSealsProps) {
  const auth = useAuth();
  const typeInfo = sealTypeInfo[sealType];

  const [destinationCity, setDestinationCity] = useState("");
  const [startNumber, setStartNumber] = useState("");
  const [endNumber, setEndNumber] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [operator, setOperator] = useState("");
  const [nationalStock, setNationalStock] = useState(0);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadNationalStock() {
      try {
        const response = await fetch(`${API_URL}/inventory/summary?city=nac`, {
          headers: {
            Authorization: `Bearer ${auth.getAccessToken()}`,
          },
        });

        const data = await response.json();
        setNationalStock(data[sealType] ?? 0);
      } catch (error) {
        console.error(error);
      }
    }

    loadNationalStock();
  }, [sealType]);

  const calculateQuantity = () => {
    const start = parseInt(startNumber, 10);
    const end = parseInt(endNumber, 10);

    if (isNaN(start) || isNaN(end)) return 0;
    if (end < start) return 0;

    return end - start + 1;
  };

  const quantity = calculateQuantity();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!destinationCity)
      newErrors.destinationCity = "Selecciona una ciudad de destino";
    if (!startNumber) newErrors.startNumber = "Ingresa el número inicial";
    if (!endNumber) newErrors.endNumber = "Ingresa el número final";
    if (!vehicle) newErrors.vehicle = "Ingresa la placa del vehículo";
    if (!operator) newErrors.operator = "Ingresa el nombre del operario";

    const start = parseInt(startNumber, 10);
    const end = parseInt(endNumber, 10);

    if (startNumber && isNaN(start)) {
      newErrors.startNumber = "Debe ser un número válido";
    }

    if (endNumber && isNaN(end)) {
      newErrors.endNumber = "Debe ser un número válido";
    }

    if (!isNaN(start) && !isNaN(end)) {
      if (end < start) {
        newErrors.endNumber = "El número final debe ser mayor al inicial";
      }

      if (start < 1) {
        newErrors.startNumber = "El número debe ser mayor a 0";
      }

      if (end > 9999999) {
        newErrors.endNumber = "El número no puede exceder 9999999";
      }

      const qty = end - start + 1;

      if (qty > nationalStock) {
        newErrors.endNumber = `No hay suficiente stock nacional disponible. Disponible: ${nationalStock}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const selectedCity = cities.find((c) => c.id === destinationCity);

      const response = await fetch(`${API_URL}/inventory/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify({
          tipoCodigo: sealType,
          startNumber,
          endNumber,
          destinationCity,
          destinationCityName: selectedCity?.name,
          vehicle,
          operator,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          general: data.error || "Error al asignar precintos",
        });
        setLoading(false);
        return;
      }

      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        onBack();
      }, 2500);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setErrors({
        general: "Error de conexión con el servidor",
      });
    }
  };

  if (success) {
    const cityName = cities.find((c) => c.id === destinationCity)?.name;

    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Asignación Exitosa!
          </h2>

          <p className="text-gray-600 mb-4">
            Se han asignado <span className="font-bold">{quantity}</span>{" "}
            precintos con destino a{" "}
            <span className="font-bold">{cityName}</span>
          </p>

          <div className="bg-blue-50 rounded-lg p-4 text-sm text-left">
            <p className="text-gray-700">
              <span className="font-semibold">Rango:</span> {typeInfo.prefix}
              {startNumber.padStart(7, "0")} - {typeInfo.prefix}
              {endNumber.padStart(7, "0")}
            </p>

            <p className="text-gray-700">
              <span className="font-semibold">Vehículo:</span> {vehicle}
            </p>

            <p className="text-gray-700">
              <span className="font-semibold">Operario:</span> {operator}
            </p>
          </div>

          <p className="text-sm text-gray-500 mt-4">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">
            Asignar {typeInfo.name}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Asignación de precintos para despacho a ciudades
          </p>
        </div>
      </div>

      {/* Stock Nacional */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border-l-4 border-purple-600">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-800 mb-1">
              Stock Nacional Disponible
            </h3>
            <p className="text-sm text-gray-600">
              Total de {typeInfo.name} disponibles
            </p>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2">
              <Package className={`w-8 h-8 ${typeInfo.color}`} />
              <span className={`text-4xl font-bold ${typeInfo.color}`}>
                {nationalStock.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">unidades</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
              <p className="text-sm text-red-700 font-semibold">
                {errors.general}
              </p>
            </div>
          )}

          {/* Ciudad de Destino */}
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Ciudad de Destino *
            </label>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <select
                id="city"
                value={destinationCity}
                onChange={(e) => {
                  setDestinationCity(e.target.value);
                  if (errors.destinationCity)
                    setErrors({ ...errors, destinationCity: "" });
                }}
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg outline-none transition-all appearance-none bg-white ${
                  errors.destinationCity
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-gray-200 focus:border-[#3483FA] focus:ring-2 focus:ring-[#3483FA]/20"
                }`}
              >
                <option value="">Seleccionar ciudad</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {errors.destinationCity && (
              <p className="text-red-600 text-sm mt-1">
                {errors.destinationCity}
              </p>
            )}
          </div>

          {/* Rango */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#3483FA]" />
              Rango de Números de Precinto
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Número Inicial */}
              <div>
                <label
                  htmlFor="startNumber"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Número Inicial *
                </label>

                <div className="flex items-center">
                  <span className="bg-gray-200 px-3 py-3 border-2 border-r-0 border-gray-200 rounded-l-lg font-mono text-sm font-bold text-gray-700">
                    {typeInfo.prefix}
                  </span>

                  <input
                    type="text"
                    id="startNumber"
                    value={startNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setStartNumber(value);
                      if (errors.startNumber)
                        setErrors({ ...errors, startNumber: "" });
                    }}
                    maxLength={7}
                    className={`flex-1 px-4 py-3 border-2 rounded-r-lg outline-none transition-all font-mono ${
                      errors.startNumber
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 focus:border-[#3483FA] focus:ring-2 focus:ring-[#3483FA]/20"
                    }`}
                    placeholder="0000001"
                  />
                </div>

                {errors.startNumber && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.startNumber}
                  </p>
                )}
              </div>

              {/* Número Final */}
              <div>
                <label
                  htmlFor="endNumber"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Número Final *
                </label>

                <div className="flex items-center">
                  <span className="bg-gray-200 px-3 py-3 border-2 border-r-0 border-gray-200 rounded-l-lg font-mono text-sm font-bold text-gray-700">
                    {typeInfo.prefix}
                  </span>

                  <input
                    type="text"
                    id="endNumber"
                    value={endNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setEndNumber(value);
                      if (errors.endNumber)
                        setErrors({ ...errors, endNumber: "" });
                    }}
                    maxLength={7}
                    className={`flex-1 px-4 py-3 border-2 rounded-r-lg outline-none transition-all font-mono ${
                      errors.endNumber
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 focus:border-[#3483FA] focus:ring-2 focus:ring-[#3483FA]/20"
                    }`}
                    placeholder="0000100"
                  />
                </div>

                {errors.endNumber && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.endNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Preview */}
            {quantity > 0 && (
              <div className="mt-4 bg-white rounded-lg p-4 border-2 border-blue-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Total de precintos a asignar:
                    </p>
                    <p className="text-2xl font-bold text-[#3483FA]">
                      {quantity.toLocaleString()} unidades
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">Rango completo:</p>
                    <p className="font-mono text-sm font-bold text-gray-700">
                      {typeInfo.prefix}
                      {startNumber.padStart(7, "0")} - {typeInfo.prefix}
                      {endNumber.padStart(7, "0")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Información del Despacho */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehículo */}
            <div>
              <label
                htmlFor="vehicle"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
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
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg outline-none transition-all uppercase ${
                    errors.vehicle
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

            {/* Operario */}
            <div>
              <label
                htmlFor="operator"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Operario Responsable *
              </label>

              <input
                type="text"
                id="operator"
                value={operator}
                onChange={(e) => {
                  setOperator(e.target.value);
                  if (errors.operator)
                    setErrors({ ...errors, operator: "" });
                }}
                className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all ${
                  errors.operator
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-gray-200 focus:border-[#3483FA] focus:ring-2 focus:ring-[#3483FA]/20"
                }`}
                placeholder="Nombre del operario"
              />

              {errors.operator && (
                <p className="text-red-600 text-sm mt-1">{errors.operator}</p>
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  Importante
                </p>
                <p className="text-sm text-yellow-700">
                  Los precintos se asignarán en orden numérico consecutivo.
                  Verifica que el rango de números esté correcto antes de
                  confirmar.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
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
              disabled={loading || quantity === 0}
              className="flex-1 px-6 py-3 bg-[#3483FA] text-white font-semibold rounded-lg hover:bg-blue-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Asignando..."
                : `Asignar ${quantity > 0 ? quantity : ""} Precinto${
                    quantity !== 1 ? "s" : ""
                  }`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}