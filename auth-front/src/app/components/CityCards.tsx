import { useEffect, useState } from "react";
import { MapPin, Eye } from "lucide-react";
import { API_URL } from "../../auth/authConstants";
import { useAuth } from "../../auth/AuthProvider";

interface CityCardsProps {
  onViewDetails: (cityId: string, cityName: string) => void;
}

interface CityData {
  id: string;
  city: string;
  stock: {
    plastico: number;
    guaya: number;
    botella: number;
  };
}

export function CityCards({ onViewDetails }: CityCardsProps) {
  const auth = useAuth();
  const [cities, setCities] = useState<CityData[]>([]);

  useEffect(() => {
    async function loadCities() {
      try {
        const response = await fetch(`${API_URL}/inventory/by-city`, {
          headers: {
            Authorization: `Bearer ${auth.getAccessToken()}`,
          },
        });

        const data = await response.json();

        if (Array.isArray(data)) {
          setCities(data);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadCities();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cities.map((city) => {
        const totalStock =
          city.stock.plastico + city.stock.guaya + city.stock.botella;

        return (
          <div
            key={city.id}
            className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#3483FA] to-blue-600 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-white" />
                  <h3 className="font-bold text-white">{city.city}</h3>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                  <p className="text-sm font-bold text-white">
                    {totalStock.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4">
              <p className="text-xs text-gray-600 mb-3 uppercase font-semibold">
                Stock por Tipo
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
                  <span className="text-xs font-semibold text-blue-700">
                    Plástico
                  </span>
                  <span className="font-bold text-blue-900">
                    {city.stock.plastico.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2 border border-green-200">
                  <span className="text-xs font-semibold text-green-700">
                    Guaya
                  </span>
                  <span className="font-bold text-green-900">
                    {city.stock.guaya.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                  <span className="text-xs font-semibold text-red-700">
                    Botella
                  </span>
                  <span className="font-bold text-red-900">
                    {city.stock.botella.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onViewDetails(city.id, city.city)}
                className="w-full flex items-center justify-center gap-2 bg-[#3483FA] hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                Ver Detalles
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}