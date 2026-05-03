import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Package, TrendingUp } from "lucide-react";
import { TransactionsTable } from "./TransactionsTable";
import { API_URL } from "../../auth/authConstants";
import { useAuth } from "../../auth/AuthProvider";

interface CityStock {
  cityId: string;
  cityName: string;
  stock: number;
  color: string;
}

const cityColors: Record<string, string> = {
  bog: "#3483FA",
  med: "#FFE600",
  cal: "#00A650",
  per: "#FF6B6B",
  buc: "#4ECDC4",
  tun: "#95E1D3",
  bar: "#F38181",
  car: "#AA96DA",
  iba: "#FCBAD3",
};

const sealTypeInfo: Record<string, { name: string; color: string; bgColor: string }> = {
  PL: { name: "Precinto Plástico", color: "text-blue-600", bgColor: "bg-blue-50" },
  GY: { name: "Precinto de Guaya", color: "text-green-600", bgColor: "bg-green-50" },
  BT: { name: "Precinto de Botella", color: "text-red-600", bgColor: "bg-red-50" },
};

interface InventoryDetailProps {
  sealType: string;
  onBack: () => void;
}

export function InventoryDetail({ sealType, onBack }: InventoryDetailProps) {
  const auth = useAuth();

  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [cities, setCities] = useState<CityStock[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        // Ciudades normales
        const response = await fetch(`${API_URL}/inventory/by-city`, {
          headers: {
            Authorization: `Bearer ${auth.getAccessToken()}`,
          },
        });

        const data = await response.json();

        // Stock nacional
        const nationalResponse = await fetch(
          `${API_URL}/inventory/summary?city=nac`,
          {
            headers: {
              Authorization: `Bearer ${auth.getAccessToken()}`,
            },
          }
        );

        const nationalData = await nationalResponse.json();

        // Mapear ciudades
        const mapped: CityStock[] = data.map((item: any) => {
          let stock = 0;

          if (sealType === "PL") stock = item.stock.plastico;
          if (sealType === "GY") stock = item.stock.guaya;
          if (sealType === "BT") stock = item.stock.botella;

          return {
            cityId: item.id,
            cityName: item.city,
            stock,
            color: cityColors[item.id] || "#999",
          };
        });

        // Calcular stock nacional según tipo
        const nationalStock =
          sealType === "PL"
            ? nationalData.PL
            : sealType === "GY"
              ? nationalData.GY
              : nationalData.BT;

        //  Agregar Stock Nacional arriba
        setCities([
          {
            cityId: "nac",
            cityName: "Stock Nacional",
            stock: nationalStock,
            color: "#9333ea",
          },
          ...mapped,
        ]);
      } catch (error) {
        console.error(error);
      }
    }

    loadData();
  }, [sealType]);

  const typeInfo = sealTypeInfo[sealType];
  const totalStock = cities.reduce((sum, city) => sum + city.stock, 0);
  const selectedCityData = cities.find((c) => c.cityId === selectedCity);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">
            {typeInfo.name}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Distribución nacional por ciudad - Serie {sealType}XXXXXX
          </p>
        </div>

        <div className="bg-white rounded-lg shadow px-6 py-3 border border-gray-200">
          <p className="text-sm text-gray-600">Stock Nacional Total</p>
          <p className={`text-3xl font-bold ${typeInfo.color}`}>
            {totalStock.toLocaleString()}
          </p>
        </div>
      </div>

      {/* GRID CIUDADES */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="font-bold text-lg text-gray-800 mb-4">
          Distribución por Ciudad
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.map((city) => (
            <button
              key={city.cityId}
              onClick={() => setSelectedCity(city.cityId)}
              className={`text-left p-4 rounded-lg border-2 transition-all hover:shadow-lg ${selectedCity === city.cityId
                  ? "border-[#3483FA] bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: city.color }}
                  >
                    <MapPin className="w-5 h-5 text-white" />
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900">
                      {city.cityName}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Centro de Distribución
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className={`w-5 h-5 ${typeInfo.color}`} />
                    <span className="text-sm font-semibold text-gray-700">
                      Stock Disponible
                    </span>
                  </div>

                  <span className={`text-2xl font-bold ${typeInfo.color}`}>
                    {city.stock}
                  </span>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                {totalStock > 0
                  ? ((city.stock / totalStock) * 100).toFixed(1)
                  : 0}
                % del total
              </div>

              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-[#3483FA] h-1.5 rounded-full"
                  style={{
                    width: `${totalStock > 0
                        ? (city.stock / totalStock) * 100
                        : 0
                      }%`,
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* DETALLE */}
      {selectedCity && selectedCityData && (
        <>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border-l-4 border-[#3483FA]">
            <h3 className="text-xl font-bold text-gray-900">
              {selectedCityData.cityName}
            </h3>

            <p className="text-gray-700">
              Stock:{" "}
              <span className="font-bold">
                {selectedCityData.stock} unidades
              </span>
            </p>
          </div>

          <TransactionsTable
            cityId={selectedCity}
            sealType={sealType}
          />
        </>
      )}
    </div>
  );
}