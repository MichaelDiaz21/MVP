import { useEffect, useState } from "react";
import { Package, MapPin, Truck, Clock } from "lucide-react";
import { API_URL } from "../../auth/authConstants";
import { useAuth } from "../../auth/AuthProvider";

export interface TransitSeal {
  _id: string;
  id_precinto: number;
  tipoCodigo: string;
  ciudadOrigenId: string;
  ciudadOrigen: string;
  ciudadDestinoId: string;
  ciudadDestino: string;
  vehiculo: string;
  operario: string;
  fechaDespacho: string;
}

interface TransitCardProps {
  destinationCity: string;
  destinationCityName: string;
  onReceiveSeal?: (seal: any) => void;
}

const sealTypeColors: Record<string, { color: string; bg: string; name: string }> = {
  PL: { color: "text-blue-600", bg: "bg-blue-100", name: "Plástico" },
  GY: { color: "text-green-600", bg: "bg-green-100", name: "Guaya" },
  BT: { color: "text-red-600", bg: "bg-red-100", name: "Botella" },
};

export function TransitCard({
  destinationCity,
  destinationCityName,
  onReceiveSeal,
}: TransitCardProps) {
  const auth = useAuth();
  const [incomingSeals, setIncomingSeals] = useState<TransitSeal[]>([]);

  useEffect(() => {
    async function loadTransitSeals() {
      try {
        const response = await fetch(`${API_URL}/inventory/transit/${destinationCity}`, {
          headers: {
            Authorization: `Bearer ${auth.getAccessToken()}`,
          },
        });

        const data = await response.json();

        if (Array.isArray(data)) {
          setIncomingSeals(data);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadTransitSeals();
  }, [destinationCity]);

  const totalInTransit = incomingSeals.length;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5" />
              En Tránsito a {destinationCityName}
            </h3>
            <p className="text-xs text-orange-100">
              Precintos en camino desde otras ciudades
            </p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-2xl font-bold text-white">{totalInTransit}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {totalInTransit > 0 ? (
          <div className="space-y-3">
            {incomingSeals.map((seal) => {
              const typeInfo = sealTypeColors[seal.tipoCodigo];

              return (
                <div
                  key={seal._id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:bg-orange-50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${typeInfo.bg} ${typeInfo.color}`}
                        >
                          {typeInfo.name}
                        </span>

                        <span className="font-mono font-bold text-gray-900">
                          {seal.tipoCodigo}
                          {String(seal.id_precinto).padStart(7, "0")}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>
                          Desde:{" "}
                          <span className="font-semibold">
                            {seal.ciudadOrigen}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="bg-orange-100 rounded-full p-2">
                      <Package className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500">Vehículo</p>
                      <p className="font-semibold text-gray-900">
                        {seal.vehiculo}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Operario</p>
                      <p className="font-semibold text-gray-900">
                        {seal.operario}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>
                        Despachado:{" "}
                        {seal.fechaDespacho
                          ? new Date(seal.fechaDespacho).toLocaleString()
                          : "Sin fecha"}
                      </span>
                    </div>

                    <button
                      onClick={() => onReceiveSeal?.(seal)}
                      className="text-xs font-semibold text-[#3483FA] hover:text-blue-700 transition-colors"
                    >
                      Marcar como Recibido
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Truck className="w-8 h-8 text-gray-400" />
            </div>

            <p className="text-gray-600 font-semibold mb-1">
              No hay precintos en tránsito
            </p>
            <p className="text-sm text-gray-500">
              Actualmente no hay envíos pendientes hacia {destinationCityName}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}