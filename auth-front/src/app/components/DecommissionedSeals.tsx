import { useEffect, useState } from "react";
import {
  AlertTriangle,
  MapPin,
  User,
  Calendar,
  Search,
  Eye,
} from "lucide-react";
import { API_URL } from "../../auth/authConstants";
import { useAuth } from "../../auth/AuthProvider";

interface DecommissionedSeal {
  _id: string;
  id_precinto: number;
  tipoCodigo: string;
  ciudadOrigen: string;
  ciudadDestino: string;
  fechaDespacho: string;
  fechaRecepcion: string;
  receptor: string;
  condicion: string;
  observacionesRecepcion: string;
}

const sealTypeColors: Record<string, { color: string; bg: string; name: string }> = {
  PL: { color: "text-blue-600", bg: "bg-blue-100", name: "Plástico" },
  GY: { color: "text-green-600", bg: "bg-green-100", name: "Guaya" },
  BT: { color: "text-red-600", bg: "bg-red-100", name: "Botella" },
};

const conditionLabels: Record<string, { label: string; color: string }> = {
  bueno: { label: "Bueno", color: "bg-green-100 text-green-800" },
  danado: { label: "Dañado", color: "bg-orange-100 text-orange-800" },
  violado: { label: "Violado", color: "bg-red-100 text-red-800" },
};

export function DecommissionedSeals() {
  const auth = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [seals, setSeals] = useState<DecommissionedSeal[]>([]);
  const [selectedSeal, setSelectedSeal] = useState<DecommissionedSeal | null>(null);

  useEffect(() => {
    async function loadDecommissioned() {
      try {
        const response = await fetch(`${API_URL}/inventory/decommissioned`, {
          headers: {
            Authorization: `Bearer ${auth.getAccessToken()}`,
          },
        });

        const data = await response.json();

        if (Array.isArray(data)) {
          setSeals(data);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadDecommissioned();
  }, []);

  const getSealId = (seal: DecommissionedSeal) =>
    `${seal.tipoCodigo}${String(seal.id_precinto).padStart(7, "0")}`;

  const filteredSeals = seals.filter((seal) => {
    const sealId = getSealId(seal).toLowerCase();
    const origin = seal.ciudadOrigen?.toLowerCase() || "";
    const destination = seal.ciudadDestino?.toLowerCase() || "";
    const receiver = seal.receptor?.toLowerCase() || "";

    return (
      sealId.includes(searchTerm.toLowerCase()) ||
      origin.includes(searchTerm.toLowerCase()) ||
      destination.includes(searchTerm.toLowerCase()) ||
      receiver.includes(searchTerm.toLowerCase())
    );
  });

  if (selectedSeal) {
    const typeInfo = sealTypeColors[selectedSeal.tipoCodigo];
    const conditionInfo =
      conditionLabels[selectedSeal.condicion] || conditionLabels.bueno;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Detalle de Precinto Dado de Baja
          </h2>
          <button
            onClick={() => setSelectedSeal(null)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            Volver al Listado
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {getSealId(selectedSeal)}
              </h3>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${typeInfo.bg} ${typeInfo.color}`}
              >
                Precinto {typeInfo.name}
              </span>
            </div>

            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Dado de Baja
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800 border-b pb-2">
                Información del Trayecto
              </h4>

              <div>
                <p className="text-sm text-gray-600 mb-1">Ciudad de Origen</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  {selectedSeal.ciudadOrigen}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Ciudad de Destino</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  {selectedSeal.ciudadDestino}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Fecha de Despacho</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {selectedSeal.fechaDespacho
                    ? new Date(selectedSeal.fechaDespacho).toLocaleString()
                    : "Sin fecha"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Fecha de Recepción</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {selectedSeal.fechaRecepcion
                    ? new Date(selectedSeal.fechaRecepcion).toLocaleString()
                    : "Sin fecha"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-gray-800 border-b pb-2">
                Información de Recepción
              </h4>

              <div>
                <p className="text-sm text-gray-600 mb-1">Receptor</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  {selectedSeal.receptor}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Condición</p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${conditionInfo.color}`}
                >
                  {conditionInfo.label}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Observaciones</p>
                <p className="text-gray-900">
                  {selectedSeal.observacionesRecepcion || "Sin observaciones"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Precintos Dados de Baja
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Registro histórico de precintos que finalizaron su ciclo de vida
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Dados de Baja</p>
          <p className="text-2xl font-bold text-gray-900">{seals.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <p className="text-sm text-gray-600">En Buen Estado</p>
          <p className="text-2xl font-bold text-green-600">
            {seals.filter((s) => s.condicion === "bueno").length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Dañados</p>
          <p className="text-2xl font-bold text-orange-600">
            {seals.filter((s) => s.condicion === "danado").length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Violados</p>
          <p className="text-2xl font-bold text-red-600">
            {seals.filter((s) => s.condicion === "violado").length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por ID, ciudad o receptor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3483FA]/20 focus:border-[#3483FA] outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  ID Precinto
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Trayecto
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Receptor
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Condición
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Fecha Baja
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredSeals.length > 0 ? (
                filteredSeals.map((seal) => {
                  const typeInfo = sealTypeColors[seal.tipoCodigo];
                  const conditionInfo =
                    conditionLabels[seal.condicion] || conditionLabels.bueno;

                  return (
                    <tr
                      key={seal._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-sm text-gray-900">
                          {getSealId(seal)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${typeInfo.bg} ${typeInfo.color}`}
                        >
                          {typeInfo.name}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{seal.ciudadOrigen}</p>
                          <p className="text-gray-500">→ {seal.ciudadDestino}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{seal.receptor}</p>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${conditionInfo.color}`}
                        >
                          {conditionInfo.label}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {seal.fechaRecepcion
                            ? new Date(seal.fechaRecepcion).toLocaleString()
                            : "Sin fecha"}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedSeal(seal)}
                          className="text-[#3483FA] hover:text-blue-700 transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      No se encontraron precintos dados de baja
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}