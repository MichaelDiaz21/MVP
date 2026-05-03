import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  Eye,
  X,
  Package,
  User,
  Truck,
  Calendar,
  MapPin,
} from "lucide-react";
import { API_URL } from "../../auth/authConstants";
import { useAuth } from "../../auth/AuthProvider";

interface Transaction {
  _id: string;
  id_precinto: number;
  tipoCodigo: string;
  ciudadOrigen: string;
  ciudadDestino: string;
  ciudadOrigenId: string;
  ciudadDestinoId: string;
  vehiculo: string;
  operario: string;
  estado: "En Tránsito" | "Recibido";
  fechaDespacho: string;
  fechaRecepcion?: string;
}

interface TransactionsTableProps {
  cityId: string;
  sealType?: string;
}

const cityNames: Record<string, string> = {
  bog: "Bogotá",
  med: "Medellín",
  cal: "Cali",
  per: "Pereira",
  buc: "Bucaramanga",
  tun: "Tunja",
  bar: "Barranquilla",
  car: "Cartagena",
  iba: "Ibagué",
};

const sealTypeNames: Record<string, string> = {
  PL: "Precinto Plástico",
  GY: "Precinto de Guaya",
  BT: "Precinto de Botella",
};

const getStatusBadge = (status: string) => {
  if (status === "Recibido") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <CheckCircle className="w-3 h-3" />
        Recibido
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
      <Clock className="w-3 h-3" />
      En Tránsito
    </span>
  );
};

export function TransactionsTable({ cityId, sealType }: TransactionsTableProps) {
  const auth = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  useEffect(() => {
    async function loadTransactions() {
      try {
        const response = await fetch(`${API_URL}/inventory/transactions/${cityId}`, {
          headers: {
            Authorization: `Bearer ${auth.getAccessToken()}`,
          },
        });

        const data = await response.json();

        if (Array.isArray(data)) {
          setTransactions(data);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadTransactions();
  }, [cityId]);

  const cityTransactions = sealType
    ? transactions.filter((t) => t.tipoCodigo === sealType)
    : transactions;

  const cityName = cityNames[cityId] || "Ciudad";

  const getSealId = (transaction: Transaction) =>
    `${transaction.tipoCodigo}${String(transaction.id_precinto).padStart(7, "0")}`;

  const getSealTypeColor = (tipoCodigo: string) => {
    switch (tipoCodigo) {
      case "PL":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "GY":
        return "bg-green-100 text-green-800 border-green-300";
      case "BT":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-[#3483FA] to-blue-600 px-6 py-4">
        <h3 className="font-bold text-white">
          Transacciones de {cityName}
          {sealType && ` - ${sealTypeNames[sealType]}`}
        </h3>
        <p className="text-xs text-blue-100">
          Precintos enviados desde este centro de distribución
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                ID Precinto
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Operario Responsable
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Placa Vehículo
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Destino
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Fecha/Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {cityTransactions.length > 0 ? (
              cityTransactions.map((transaction, index) => (
                <tr
                  key={transaction._id}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-sm text-[#3483FA]">
                      {getSealId(transaction)}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {(transaction.operario || "NA")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {transaction.operario || "Sin operario"}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">
                      {transaction.vehiculo || "Sin placa"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {transaction.ciudadDestino}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {transaction.fechaDespacho
                      ? new Date(transaction.fechaDespacho).toLocaleString()
                      : "Sin fecha"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(transaction.estado)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedTransaction(transaction)}
                      className="text-[#3483FA] hover:text-blue-700 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <p className="text-gray-500">
                    No hay transacciones registradas para esta ciudad
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {cityTransactions.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando{" "}
            <span className="font-semibold">{cityTransactions.length}</span> de{" "}
            <span className="font-semibold">{cityTransactions.length}</span>{" "}
            transacciones
          </p>
        </div>
      )}

      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-[#3483FA] to-blue-600 px-6 py-4 rounded-t-xl flex items-center justify-between">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Detalles del Precinto
              </h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-white hover:bg-blue-700 p-1 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  Número de Precinto
                </p>
                <p className="text-3xl font-mono font-bold text-[#3483FA] mb-3">
                  {getSealId(selectedTransaction)}
                </p>
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 ${getSealTypeColor(
                    selectedTransaction.tipoCodigo
                  )}`}
                >
                  {sealTypeNames[selectedTransaction.tipoCodigo]}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-[#3483FA]" />
                  <div>
                    <p className="text-xs text-gray-600">Operario</p>
                    <p className="font-semibold text-gray-900">
                      {selectedTransaction.operario}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">Vehículo</p>
                    <p className="font-semibold text-gray-900">
                      {selectedTransaction.vehiculo}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-600">Fecha despacho</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedTransaction.fechaDespacho).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-600">Ruta</p>
                    <p className="font-semibold text-gray-900">
                      {selectedTransaction.ciudadOrigen} →{" "}
                      {selectedTransaction.ciudadDestino}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-2">
                  Estado de la Transacción
                </p>
                <div className="flex justify-center">
                  {getStatusBadge(selectedTransaction.estado)}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-[#3483FA]">
                <p className="text-xs text-gray-600 mb-1">
                  ID de Transacción
                </p>
                <p className="font-mono font-bold text-gray-900">
                  {selectedTransaction._id}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-6 py-2 bg-[#3483FA] text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}