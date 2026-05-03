import { MapPin, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { API_URL } from "../../auth/authConstants";
import { useAuth } from "../../auth/AuthProvider";

interface LogisticsNode {
  id: string;
  city: string;
  x: number;
  y: number;
  stock: {
    plastico: number;
    guaya: number;
    botella: number;
  };
  color: string;
}

const mapPositions: Record<string, Omit<LogisticsNode, "stock">> = {
  car: { id: "car", city: "Cartagena", x: 42, y: 18, color: "#AA96DA" },
  bar: { id: "bar", city: "Barranquilla", x: 50, y: 13, color: "#F38181" },
  med: { id: "med", city: "Medellín", x: 38, y: 38, color: "#FFE600" },
  per: { id: "per", city: "Pereira", x: 36, y: 47, color: "#FF6B6B" },
  cal: { id: "cal", city: "Cali", x: 30, y: 58, color: "#00A650" },
  iba: { id: "iba", city: "Ibagué", x: 46, y: 53, color: "#FCBAD3" },
  bog: { id: "bog", city: "Bogotá", x: 56, y: 50, color: "#3483FA" },
  tun: { id: "tun", city: "Tunja", x: 59, y: 43, color: "#95E1D3" },
  buc: { id: "buc", city: "Bucaramanga", x: 60, y: 34, color: "#4ECDC4" },
};

interface ColombiaLogisticsMapProps {
  selectedCity: string | null;
  onCitySelect: (cityId: string) => void;
}

export function ColombiaLogisticsMap({
  selectedCity,
  onCitySelect,
}: ColombiaLogisticsMapProps) {
  const auth = useAuth();
  const [nodes, setNodes] = useState<LogisticsNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [nationalWarehouse, setNationalWarehouse] = useState({
    PL: 0,
    GY: 0,
    BT: 0,
  });

  useEffect(() => {
    async function loadCityInventory() {
      try {
        const nationalResponse = await fetch(`${API_URL}/inventory/summary?city=nac`, {
          headers: {
            Authorization: `Bearer ${auth.getAccessToken()}`,
          },
        });

        const nationalData = await nationalResponse.json();
        setNationalWarehouse(nationalData);

        const cityResponse = await fetch(`${API_URL}/inventory/by-city`, {
          headers: {
            Authorization: `Bearer ${auth.getAccessToken()}`,
          },
        });

        const data = await cityResponse.json();

        const inventoryByCity: Record<string, any> = {};

        data.forEach((item: any) => {
          inventoryByCity[item.id] = item;
        });

        const formattedNodes: LogisticsNode[] = Object.values(mapPositions).map(
          (position) => {
            const inventory = inventoryByCity[position.id];

            return {
              ...position,
              city: inventory?.city || position.city,
              stock: inventory?.stock || {
                plastico: 0,
                guaya: 0,
                botella: 0,
              },
            };
          }
        );

        setNodes(formattedNodes);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadCityInventory();
  }, []);

  const selected = nodes.find((n) => n.id === selectedCity);


  const nationalStock = {
    plastico: nationalWarehouse.PL,
    guaya: nationalWarehouse.GY,
    botella: nationalWarehouse.BT,
  };

  const totalNational =
    nationalStock.plastico + nationalStock.guaya + nationalStock.botella;

  const maxPlastico = Math.max(...nodes.map((n) => n.stock.plastico), 1);
  const maxGuaya = Math.max(...nodes.map((n) => n.stock.guaya), 1);
  const maxBotella = Math.max(...nodes.map((n) => n.stock.botella), 1);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <p className="text-gray-600">Cargando distribución logística...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative h-[500px] bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-gray-300 p-4">
          <svg
            viewBox="0 0 400 500"
            className="w-full h-full opacity-30 absolute inset-0"
          >
            <path
              d="M190 35
                C210 20 235 35 245 55
                C260 50 282 60 292 78
                C315 82 333 100 335 124
                C350 150 350 180 335 205
                C350 235 340 265 320 285
                C325 315 310 345 285 362
                C278 390 255 415 225 420
                C200 445 160 440 140 415
                C110 405 95 375 98 345
                C75 320 78 285 95 260
                C75 235 78 200 100 178
                C95 148 108 118 132 102
                C132 75 160 52 190 35 Z"
              fill="#dbeafe"
              stroke="#64748b"
              strokeWidth="3"
            />

            <path
              d="M150 70 C140 100 135 125 120 150"
              stroke="#94a3b8"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M120 150 C135 185 125 215 105 245"
              stroke="#94a3b8"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M210 80 C230 115 250 150 255 195"
              stroke="#94a3b8"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M255 195 C245 245 255 300 230 360"
              stroke="#94a3b8"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
          </svg>

          {nodes.map((node) => (
            <div
              key={node.id}
              className="absolute cursor-pointer transition-transform hover:scale-110 z-10"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              onClick={() => onCitySelect(node.id)}
            >
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 ${selectedCity === node.id
                    ? "border-white scale-125"
                    : "border-gray-200"
                    }`}
                  style={{ backgroundColor: node.color }}
                >
                  <Package className="w-6 h-6 text-white" />
                </div>

                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <div className="bg-white px-2 py-0.5 rounded-full shadow-md border border-gray-300">
                    <p className="font-bold text-xs text-gray-800">
                      {node.city}
                    </p>
                  </div>
                </div>

                {selectedCity === node.id && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border-l-4 border-purple-600">
            <h3 className="font-bold text-lg text-gray-800 mb-2">
              Stock Nacional
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-600">Plástico</p>
                <p className="font-bold text-blue-600">
                  {nationalStock.plastico.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600">Guaya</p>
                <p className="font-bold text-green-600">
                  {nationalStock.guaya.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600">Botella</p>
                <p className="font-bold text-red-600">
                  {nationalStock.botella.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-purple-200">
              <p className="text-sm font-semibold text-gray-800">
                Total: {totalNational.toLocaleString()} unidades
              </p>
              <p className="text-xs text-gray-600">
                Distribuido en {nodes.length} ciudades
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-[#3483FA]">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-[#3483FA]" />
              <h3 className="font-bold text-lg text-gray-800">
                {selected?.city || "Selecciona una ciudad"}
              </h3>
            </div>

            <p className="text-sm text-gray-600">
              {selected
                ? "Centro de Distribución"
                : "Haz clic en una ciudad del mapa"}
            </p>
          </div>

          {selected && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-gray-700">
                DISTRIBUCIÓN DE STOCK:
              </h4>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Precinto Plástico (PL)
                  </span>
                  <span className="font-bold text-lg text-blue-600">
                    {selected.stock.plastico.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(selected.stock.plastico / maxPlastico) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Precinto Guaya (GY)
                  </span>
                  <span className="font-bold text-lg text-green-600">
                    {selected.stock.guaya.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${(selected.stock.guaya / maxGuaya) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Precinto Botella (BT)
                  </span>
                  <span className="font-bold text-lg text-red-600">
                    {selected.stock.botella.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-red-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{
                      width: `${(selected.stock.botella / maxBotella) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-300 mt-4">
                <p className="text-xs font-semibold text-yellow-800">
                  ℹ️ Stock total en {selected.city}:{" "}
                  {(
                    selected.stock.plastico +
                    selected.stock.guaya +
                    selected.stock.botella
                  ).toLocaleString()}{" "}
                  unidades
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}