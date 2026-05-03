import { useEffect, useMemo, useState } from "react";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Calendar,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { API_URL } from "../../auth/authConstants";
import { useAuth } from "../../auth/AuthProvider";

interface AuditData {
  totalAvailable: number;
  totalDecommissioned: number;
  totalUsed: number;
  byType: {
    PL: { available: number; decommissioned: number };
    GY: { available: number; decommissioned: number };
    BT: { available: number; decommissioned: number };
  };
  byCondition: {
    bueno: number;
    danado: number;
    violado: number;
  };
}

export function Audit() {
  const auth = useAuth();
  const currentYear = new Date().getFullYear();

  const [auditData, setAuditData] = useState<AuditData>({
    totalAvailable: 0,
    totalDecommissioned: 0,
    totalUsed: 0,
    byType: {
      PL: { available: 0, decommissioned: 0 },
      GY: { available: 0, decommissioned: 0 },
      BT: { available: 0, decommissioned: 0 },
    },
    byCondition: {
      bueno: 0,
      danado: 0,
      violado: 0,
    },
  });

  useEffect(() => {
    async function loadAudit() {
      try {
        const response = await fetch(`${API_URL}/inventory/audit`, {
          headers: {
            Authorization: `Bearer ${auth.getAccessToken()}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setAuditData(data);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadAudit();
  }, []);

  const totalUsedThisYear = auditData.totalUsed;
  const totalDecommissioned = auditData.totalDecommissioned;
  const totalAvailable = auditData.totalAvailable;

  const chartDataByType = useMemo(
    () => [
      {
        id: "bar-pl",
        name: "Plástico",
        usados: auditData.byType.PL.decommissioned,
        dadosBaja: auditData.byType.PL.decommissioned,
        disponibles: auditData.byType.PL.available,
      },
      {
        id: "bar-gy",
        name: "Guaya",
        usados: auditData.byType.GY.decommissioned,
        dadosBaja: auditData.byType.GY.decommissioned,
        disponibles: auditData.byType.GY.available,
      },
      {
        id: "bar-bt",
        name: "Botella",
        usados: auditData.byType.BT.decommissioned,
        dadosBaja: auditData.byType.BT.decommissioned,
        disponibles: auditData.byType.BT.available,
      },
    ],
    [auditData]
  );

  const pieChartData = useMemo(
    () => [
      {
        id: "pie-bueno",
        name: "Bueno",
        value: auditData.byCondition.bueno,
        color: "#22c55e",
      },
      {
        id: "pie-danado",
        name: "Dañado",
        value: auditData.byCondition.danado,
        color: "#f97316",
      },
      {
        id: "pie-violado",
        name: "Violado",
        value: auditData.byCondition.violado,
        color: "#ef4444",
      },
    ],
    [auditData]
  );

  const totalCondition =
    auditData.byCondition.bueno +
    auditData.byCondition.danado +
    auditData.byCondition.violado;

  const sealStats = [
    {
      type: "Precinto Plástico (PL)",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-500",
      textColor: "text-blue-600",
      used: auditData.byType.PL.decommissioned,
      decommissioned: auditData.byType.PL.decommissioned,
      available: auditData.byType.PL.available,
    },
    {
      type: "Precinto de Guaya (GY)",
      bgColor: "bg-green-50",
      borderColor: "border-green-500",
      textColor: "text-green-600",
      used: auditData.byType.GY.decommissioned,
      decommissioned: auditData.byType.GY.decommissioned,
      available: auditData.byType.GY.available,
    },
    {
      type: "Precinto de Botella (BT)",
      bgColor: "bg-red-50",
      borderColor: "border-red-500",
      textColor: "text-red-600",
      used: auditData.byType.BT.decommissioned,
      decommissioned: auditData.byType.BT.decommissioned,
      available: auditData.byType.BT.available,
    },
  ];

  const accumulatedData = [
    {
      id: "area-current",
      mes: "Actual",
      usadosAcum: totalUsedThisYear,
      bajasAcum: totalDecommissioned,
    },
  ];

  const monthlyStats = [
    {
      id: "month-current",
      month: "Actual",
      used: totalUsedThisYear,
      decommissioned: totalDecommissioned,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Auditoría de Precintos
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Resumen real de uso y estado de precintos durante el año {currentYear}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Precintos Usados en {currentYear}
              </p>
              <p className="text-4xl font-bold text-gray-900">
                {totalUsedThisYear.toLocaleString()}
              </p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-7 h-7 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-gray-600">Datos desde MongoDB</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Dados de Baja en {currentYear}
              </p>
              <p className="text-4xl font-bold text-red-600">
                {totalDecommissioned.toLocaleString()}
              </p>
            </div>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {totalUsedThisYear > 0
              ? `${((totalDecommissioned / totalUsedThisYear) * 100).toFixed(
                  1
                )}% del total usado`
              : "0% del total usado"}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Stock Disponible Actual
              </p>
              <p className="text-4xl font-bold text-green-600">
                {totalAvailable.toLocaleString()}
              </p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Precintos disponibles actualmente
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4">
            Comparativa por Tipo de Precinto
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartDataByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="dadosBaja" fill="#ef4444" name="Dados de Baja" />
              <Bar dataKey="disponibles" fill="#22c55e" name="Disponibles" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4">
            Condición de Precintos Dados de Baja
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => {
                  const { name, percent = 0 } = props;
                  return `${name}: ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={80}
                dataKey="value"
              >
                {pieChartData.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>
                Bueno (
                {totalCondition > 0
                  ? Math.round(
                      (auditData.byCondition.bueno / totalCondition) * 100
                    )
                  : 0}
                %)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>
                Dañado (
                {totalCondition > 0
                  ? Math.round(
                      (auditData.byCondition.danado / totalCondition) * 100
                    )
                  : 0}
                %)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>
                Violado (
                {totalCondition > 0
                  ? Math.round(
                      (auditData.byCondition.violado / totalCondition) * 100
                    )
                  : 0}
                %)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-4">
          Desglose por Tipo de Precinto
        </h3>

        <div className="space-y-4">
          {sealStats.map((seal) => (
            <div
              key={seal.type}
              className={`border-l-4 ${seal.borderColor} ${seal.bgColor} rounded-lg p-4`}
            >
              <h4 className={`font-bold ${seal.textColor} mb-3`}>
                {seal.type}
              </h4>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">
                    Usados {currentYear}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {seal.used.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 mb-1">Dados de Baja</p>
                  <p className="text-2xl font-bold text-red-600">
                    {seal.decommissioned.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 mb-1">
                    Stock Disponible
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {seal.available.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>
                    Tasa de baja:{" "}
                    {seal.used > 0
                      ? ((seal.decommissioned / seal.used) * 100).toFixed(1)
                      : "0.0"}
                    %
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-red-600"
                    style={{
                      width:
                        seal.used > 0
                          ? `${(seal.decommissioned / seal.used) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Acumulado Actual {currentYear}
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={accumulatedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="usadosAcum"
                stroke="#3483FA"
                fill="#3483FA"
                fillOpacity={0.6}
                name="Usados"
              />
              <Area
                type="monotone"
                dataKey="bajasAcum"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                name="Dados de Baja"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Resumen Actual {currentYear}
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Total usados:</span>
              <span className="font-bold text-gray-900">
                {totalUsedThisYear.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Total dados de baja:</span>
              <span className="font-bold text-red-600">
                {totalDecommissioned.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Stock disponible:</span>
              <span className="font-bold text-green-600">
                {totalAvailable.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-gray-600">
                Tasa de baja general:
              </span>
              <span className="font-bold text-gray-900">
                {totalUsedThisYear > 0
                  ? ((totalDecommissioned / totalUsedThisYear) * 100).toFixed(
                      1
                    )
                  : "0.0"}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Uso Actual {currentYear}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                  Periodo
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                  Usados
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                  Dados de Baja
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                  Tasa de Baja
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {monthlyStats.map((stat) => (
                <tr key={stat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {stat.month}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {stat.used.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-red-600 font-semibold">
                    {stat.decommissioned.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-gray-700">
                      {stat.used > 0
                        ? ((stat.decommissioned / stat.used) * 100).toFixed(1)
                        : "0.0"}
                      %
                    </span>
                  </td>
                </tr>
              ))}

              <tr className="bg-gray-100 font-bold">
                <td className="px-4 py-3 text-gray-900">TOTAL</td>
                <td className="px-4 py-3 text-gray-900">
                  {totalUsedThisYear.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-red-600">
                  {totalDecommissioned.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-gray-900">
                  {totalUsedThisYear > 0
                    ? (
                        (totalDecommissioned / totalUsedThisYear) *
                        100
                      ).toFixed(1)
                    : "0.0"}
                  %
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Resumen de Auditoría
        </h3>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Observaciones</h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Los datos mostrados provienen directamente de MongoDB.</li>
            <li>
              • Los precintos disponibles corresponden a documentos con estado
              Disponible.
            </li>
            <li>
              • Los dados de baja corresponden a precintos recibidos y cerrados
              en el sistema.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}