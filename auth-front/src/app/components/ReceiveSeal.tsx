import { useState } from "react";
import {
  ArrowLeft,
  Package,
  MapPin,
  CheckCircle,
  AlertTriangle,
  User,
} from "lucide-react";
import { API_URL } from "../../auth/authConstants";
import { useAuth } from "../../auth/AuthProvider";

interface ReceiveSealProps {
  seal: {
    _id: string;
    id_precinto: number;
    tipoCodigo: string;
    ciudadOrigenId?: string;
    ciudadOrigen: string;
    ciudadDestinoId?: string;
    ciudadDestino?: string;
    vehiculo: string;
    operario: string;
    fechaDespacho: string;
  };
  destinationCityName: string;
  onBack: () => void;
}

export function ReceiveSeal({
  seal,
  destinationCityName,
  onBack,
}: ReceiveSealProps) {
  const auth = useAuth();

  const [receiver, setReceiver] = useState("");
  const [condition, setCondition] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const sealId = `${seal.tipoCodigo}${String(seal.id_precinto).padStart(
    7,
    "0"
  )}`;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!receiver.trim()) {
      newErrors.receiver = "Ingresa el nombre del receptor";
    }

    if (!condition) {
      newErrors.condition = "Selecciona la condición del precinto";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/inventory/receive/${seal._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify({
          receiver,
          condition,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          general: data.error || "Error al recibir precinto",
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
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Precinto Recibido!
          </h2>

          <p className="text-gray-600 mb-4">
            El precinto <span className="font-bold">{sealId}</span> ha sido
            marcado como recibido y dado de baja del sistema
          </p>

          <div className="bg-red-50 rounded-lg p-4 text-sm text-left border border-red-200">
            <p className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Estado: Dado de Baja
            </p>
            <p className="text-red-700 text-xs">
              Este precinto ha finalizado su ciclo de vida y ya no está
              disponible para uso.
            </p>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Redirigiendo al dashboard...
          </p>
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
            Recepción de Precinto
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Confirmar recepción y dar de baja el precinto
          </p>
        </div>
      </div>

      {/* Seal Info Card */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border-l-4 border-orange-500">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-1 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" />
              {sealId}
            </h3>
            <p className="text-sm text-gray-700">Precinto en tránsito</p>
          </div>

          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            En Tránsito
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1">Origen</p>
            <p className="font-semibold text-gray-900 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {seal.ciudadOrigen}
            </p>
          </div>

          <div>
            <p className="text-gray-600 mb-1">Destino</p>
            <p className="font-semibold text-gray-900 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {seal.ciudadDestino || destinationCityName}
            </p>
          </div>

          <div>
            <p className="text-gray-600 mb-1">Vehículo</p>
            <p className="font-semibold text-gray-900">{seal.vehiculo}</p>
          </div>

          <div>
            <p className="text-gray-600 mb-1">Operario Despacho</p>
            <p className="font-semibold text-gray-900">{seal.operario}</p>
          </div>

          <div className="col-span-2">
            <p className="text-gray-600 mb-1">Fecha de Despacho</p>
            <p className="font-semibold text-gray-900">
              {seal.fechaDespacho
                ? new Date(seal.fechaDespacho).toLocaleString()
                : "Sin fecha"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4">
            Datos de Recepción
          </h3>

          {errors.general && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
              <p className="text-sm text-red-700 font-semibold">
                {errors.general}
              </p>
            </div>
          )}

          {/* Receptor */}
          <div>
            <label
              htmlFor="receiver"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Nombre del Receptor *
            </label>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type="text"
                id="receiver"
                value={receiver}
                onChange={(e) => {
                  setReceiver(e.target.value);
                  if (errors.receiver) {
                    setErrors({ ...errors, receiver: "" });
                  }
                }}
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg outline-none transition-all ${
                  errors.receiver
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-gray-200 focus:border-[#3483FA] focus:ring-2 focus:ring-[#3483FA]/20"
                }`}
                placeholder="Nombre completo del receptor"
              />
            </div>

            {errors.receiver && (
              <p className="text-red-600 text-sm mt-1">{errors.receiver}</p>
            )}
          </div>

          {/* Condición */}
          <div>
            <label
              htmlFor="condition"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Condición del Precinto *
            </label>

            <select
              id="condition"
              value={condition}
              onChange={(e) => {
                setCondition(e.target.value);
                if (errors.condition) {
                  setErrors({ ...errors, condition: "" });
                }
              }}
              className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all appearance-none bg-white ${
                errors.condition
                  ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-gray-200 focus:border-[#3483FA] focus:ring-2 focus:ring-[#3483FA]/20"
              }`}
            >
              <option value="">Seleccionar condición</option>
              <option value="bueno">Bueno - Sin daños visibles</option>
              <option value="danado">Dañado - Con daños o alteraciones</option>
              <option value="violado">Violado - Evidencia de manipulación</option>
            </select>

            {errors.condition && (
              <p className="text-red-600 text-sm mt-1">{errors.condition}</p>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Observaciones
            </label>

            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none transition-all focus:border-[#3483FA] focus:ring-2 focus:ring-[#3483FA]/20 resize-none"
              placeholder="Detalles adicionales sobre la recepción del precinto..."
              maxLength={300}
            />

            <p className="text-xs text-gray-500 mt-1">
              {notes.length}/300 caracteres
            </p>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />

              <div>
                <p className="text-sm font-semibold text-red-800 mb-1">
                  Acción Irreversible
                </p>
                <p className="text-sm text-red-700">
                  Al confirmar la recepción, este precinto será dado de baja
                  automáticamente y finalizará su ciclo de vida en el sistema.
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
              disabled={loading}
              className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Procesando..." : "Confirmar Recepción y Dar de Baja"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}