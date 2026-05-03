import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { API_URL } from "../../auth/authConstants";
import { useAuth } from "../../auth/AuthProvider";

interface SealCardData {
  type: string;
  seriesPrefix: string;
  stock: number;
  status: string;
  statusColor: string;
  iconColor: string;
  bgColor: string;
  trend: "up" | "down";
  trendValue: string;
}

interface InventoryCardsProps {
  onViewDetails?: (sealType: string) => void;
  onAssign?: (sealType: string) => void;
  onDispatch?: (sealType: string) => void;
  cityFilter?: string;
  isOperator?: boolean;
}

const baseSealData: Record<string, Omit<SealCardData, "stock">> = {
  PL: {
    type: "Precinto Plástico",
    seriesPrefix: "PL",
    status: "Disponible",
    statusColor: "text-green-600",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    trend: "up",
    trendValue: "+12%",
  },
  GY: {
    type: "Precinto de Guaya (Cable)",
    seriesPrefix: "GY",
    status: "Disponible",
    statusColor: "text-green-600",
    iconColor: "text-green-600",
    bgColor: "bg-green-50",
    trend: "down",
    trendValue: "-5%",
  },
  BT: {
    type: "Precinto de Botella (Perno)",
    seriesPrefix: "BT",
    status: "Disponible",
    statusColor: "text-green-600",
    iconColor: "text-red-600",
    bgColor: "bg-red-50",
    trend: "up",
    trendValue: "+8%",
  },
};

const getSealIcon = (prefix: string, color: string, bgColor: string) => {
  switch (prefix) {
    case "PL":
      return (
        <div className={`${bgColor} p-4 rounded-full`}>
          <svg viewBox="0 0 60 60" className={`w-12 h-12 ${color}`}>
            <ellipse cx="30" cy="30" rx="8" ry="22" fill="currentColor" opacity="0.2" />
            <ellipse cx="30" cy="30" rx="6" ry="20" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <rect x="24" y="8" width="12" height="6" rx="2" fill="currentColor" />
          </svg>
        </div>
      );
    case "GY":
      return (
        <div className={`${bgColor} p-4 rounded-full`}>
          <svg viewBox="0 0 60 60" className={`w-12 h-12 ${color}`}>
            <circle cx="30" cy="30" rx="18" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="30" cy="30" rx="13" fill="currentColor" opacity="0.15" />
            <path d="M 30 12 L 30 20 M 30 40 L 30 48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      );
    case "BT":
      return (
        <div className={`${bgColor} p-4 rounded-full`}>
          <svg viewBox="0 0 60 60" className={`w-12 h-12 ${color}`}>
            <rect x="22" y="26" width="16" height="26" rx="2" fill="currentColor" opacity="0.2" />
            <rect x="24" y="28" width="12" height="22" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="26" y="18" width="8" height="10" fill="currentColor" />
            <circle cx="30" cy="14" r="3" fill="currentColor" />
          </svg>
        </div>
      );
    default:
      return null;
  }
};

export function InventoryCards({
  onViewDetails,
  onAssign,
  onDispatch,
  cityFilter,
  isOperator = false,
}: InventoryCardsProps) {
  const auth = useAuth();
  const [displayData, setDisplayData] = useState<SealCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInventory() {
      try {
        const url = cityFilter
          ? `${API_URL}/inventory/summary?city=${cityFilter}`
          : `${API_URL}/inventory/summary`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${auth.getAccessToken()}`,
          },
        });

        const data = await response.json();

        const cards: SealCardData[] = ["PL", "GY", "BT"].map((prefix) => ({
          ...baseSealData[prefix],
          stock: data[prefix] ?? 0,
        }));

        setDisplayData(cards);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    loadInventory();
  }, [cityFilter]);

  if (loading) {
    return <p className="text-gray-600">Cargando inventario...</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {displayData.map((seal) => (
        <div
          key={seal.seriesPrefix}
          className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-start justify-between mb-4">
            {getSealIcon(seal.seriesPrefix, seal.iconColor, seal.bgColor)}

            <div
              className={`flex items-center gap-1 text-xs font-semibold ${
                seal.trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {seal.trend === "up" ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{seal.trendValue}</span>
            </div>
          </div>

          <h3 className="font-bold text-lg mb-1 text-gray-800">{seal.type}</h3>
          <p className="text-sm text-gray-500 mb-4">
            Serie: {seal.seriesPrefix}XXXXXX
          </p>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Stock Actual:</span>
              <span className="font-bold text-2xl text-gray-900">
                {seal.stock.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Estado:</span>
              <span className={`font-bold ${seal.statusColor}`}>
                {seal.status}
              </span>
            </div>

            <div className="pt-3 border-t border-gray-200">
              {isOperator ? (
                <button
                  onClick={() => onDispatch?.(seal.seriesPrefix)}
                  className="w-full bg-[#3483FA] hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-colors"
                >
                  Despacho
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewDetails?.(seal.seriesPrefix)}
                    className="flex-1 bg-[#3483FA] hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    Ver Detalles
                  </button>

                  <button
                    onClick={() => onAssign?.(seal.seriesPrefix)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    Asignar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}