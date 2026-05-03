import { useEffect, useState } from "react";
import { Login } from "./components/Login";
import { Sidebar } from "./components/Sidebar";
import { InventoryCards } from "./components/InventoryCards";
import { InventoryDetail } from "./components/InventoryDetail";
import { AssignSeals } from "./components/AssignSeals";
import { Dispatch } from "./components/Dispatch";
import { TransitCard, type TransitSeal } from "./components/TransitCard";
import { ReceiveSeal } from "./components/ReceiveSeal";
import { DecommissionedSeals } from "./components/DecommissionedSeals";
import { Audit } from "./components/Audit";
import { ColombiaLogisticsMap } from "./components/ColombiaLogisticsMap";
import { TransactionsTable } from "./components/TransactionsTable";
import { QRScanButton } from "./components/QRScanButton";
import { UserManagement } from "./components/UserManagement";
import { CreateUser } from "./components/CreateUser";
import { CityCards } from "./components/CityCards";
import { BulkLoadSeals } from "./components/BulkLoadSeals";
import { Menu, ArrowLeft } from "lucide-react";

import { useAuth } from "../auth/AuthProvider";
import { API_URL } from "../auth/authConstants";

export default function App() {
  const auth = useAuth();
  const user = auth.getUser();

  const currentUser = user
    ? {
        ...user,
        role: (user as any).role || "Administrador",
        city: (user as any).city || "bogota",
        cityName: (user as any).cityName || "Bogotá",
      }
    : null;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedSealType, setSelectedSealType] = useState<string | null>(null);
  const [assigningSealType, setAssigningSealType] = useState<string | null>(null);
  const [dispatchingSealType, setDispatchingSealType] = useState<string | null>(null);
  const [receivingSeal, setReceivingSeal] = useState<TransitSeal | null>(null);
  const [supervisorViewingCity, setSupervisorViewingCity] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);

      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  async function handleLogout() {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getRefreshToken()}`,
        },
      });
    } catch (error) {
      console.log(error);
    } finally {
      auth.signout();
      setCurrentView("dashboard");
      setSelectedCity(null);
      setSelectedSealType(null);
      setAssigningSealType(null);
      setDispatchingSealType(null);
      setReceivingSeal(null);
      setSupervisorViewingCity(null);
    }
  }

  if (!auth.isAuthenticated || !currentUser) {
    return <Login />;
  }

  const showUserManagement = currentUser.role === "Administrador";

  return (
    <div className="min-h-screen bg-[#EBEBEB]">
      <header className="bg-[#FFE600] shadow-md px-4 md:px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentUser.role !== "Operador" && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-yellow-300 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-800" />
              </button>
            )}

            <div>
              <h1 className="font-bold text-lg md:text-xl text-gray-900">
                SGI - Sistema de Gestión de Inventarios
              </h1>
              <p className="text-xs md:text-sm text-gray-700">
                Precintos de Seguridad Logísticos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-gray-800">
                {currentUser.username}
              </p>
              <p className="text-xs text-gray-600">
                {currentUser.role} - {currentUser.cityName}
              </p>
            </div>

            <div className="w-10 h-10 bg-[#3483FA] rounded-full flex items-center justify-center font-bold text-white">
              {currentUser.username.substring(0, 2).toUpperCase()}
            </div>

            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-1.5 text-sm bg-white hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-300 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {currentUser.role !== "Operador" && (
          <Sidebar
            isOpen={sidebarOpen}
            isMobile={isMobile}
            onClose={() => setSidebarOpen(false)}
            onNavigate={(view) => {
              setCurrentView(view);
              setShowCreateUser(false);
              setSelectedSealType(null);
              setAssigningSealType(null);
              setDispatchingSealType(null);
              setReceivingSeal(null);
              setSupervisorViewingCity(null);
            }}
            activeView={currentView}
            userRole={currentUser.role}
          />
        )}

        <main
          className={`flex-1 transition-all duration-300 ${
            currentUser.role !== "Operador" && sidebarOpen && !isMobile
              ? "ml-64"
              : "ml-0"
          }`}
        >
          <div className="p-4 md:p-6 space-y-6">
            {currentView === "bulk-load" ? (
              <BulkLoadSeals />
            ) : currentView === "auditoria" ? (
              <Audit />
            ) : currentView === "decommissioned" ? (
              <DecommissionedSeals />
            ) : currentView === "usuarios" ? (
              showCreateUser ? (
                <CreateUser onBack={() => setShowCreateUser(false)} />
              ) : (
                <UserManagement onCreateUser={() => setShowCreateUser(true)} />
              )
            ) : currentView === "dashboard" ? (
              supervisorViewingCity ? (
                <>
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-[#3483FA] mb-6">
                    <button
                      onClick={() => setSupervisorViewingCity(null)}
                      className="flex items-center gap-2 text-[#3483FA] hover:text-blue-700 font-semibold mb-2 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Volver a Vista General
                    </button>

                    <h2 className="font-bold text-lg text-gray-900">
                      Dashboard de {supervisorViewingCity.name}
                    </h2>

                    <p className="text-sm text-gray-600">
                      Vista de operador - Centro de distribución
                    </p>
                  </div>

                  <section>
                    <h2 className="font-bold text-xl mb-4 text-gray-800">
                      Gestión de Inventario - {supervisorViewingCity.name}
                    </h2>

                    <InventoryCards
                      onViewDetails={(sealType) => setSelectedSealType(sealType)}
                      onAssign={(sealType) => setAssigningSealType(sealType)}
                      onDispatch={(sealType) => setDispatchingSealType(sealType)}
                      cityFilter={supervisorViewingCity.id}
                      isOperator={true}
                    />
                  </section>

                  <section>
                    <h2 className="font-bold text-xl mb-4 text-gray-800">
                      Precintos en Tránsito
                    </h2>

                    <TransitCard
                      destinationCity={supervisorViewingCity.id}
                      destinationCityName={supervisorViewingCity.name}
                      onReceiveSeal={(seal) => setReceivingSeal(seal)}
                    />
                  </section>

                  <section>
                    <h2 className="font-bold text-xl mb-4 text-gray-800">
                      Transacciones Recientes
                    </h2>

                    <TransactionsTable cityId={supervisorViewingCity.id} />
                  </section>
                </>
              ) : receivingSeal ? (
                <ReceiveSeal
                  seal={receivingSeal}
                  destinationCityName={currentUser.cityName}
                  onBack={() => setReceivingSeal(null)}
                />
              ) : dispatchingSealType ? (
                <Dispatch
                  sealType={dispatchingSealType}
                  originCity={currentUser.city}
                  originCityName={currentUser.cityName}
                  onBack={() => setDispatchingSealType(null)}
                />
              ) : assigningSealType ? (
                <AssignSeals
                  sealType={assigningSealType}
                  onBack={() => setAssigningSealType(null)}
                />
              ) : selectedSealType ? (
                <InventoryDetail
                  sealType={selectedSealType}
                  onBack={() => setSelectedSealType(null)}
                />
              ) : (
                <>
                  {currentUser.role === "Operador" && (
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-[#3483FA] mb-6">
                      <h2 className="font-bold text-lg text-gray-900">
                        Dashboard de {currentUser.cityName}
                      </h2>
                      <p className="text-sm text-gray-600">
                        Información y operaciones del centro de distribución
                      </p>
                    </div>
                  )}

                  <section>
                    <h2 className="font-bold text-xl mb-4 text-gray-800">
                      {currentUser.role === "Operador"
                        ? `Gestión de Inventario - ${currentUser.cityName}`
                        : "Gestión de Inventario Central"}
                    </h2>

                    <InventoryCards
                      onViewDetails={(sealType) => setSelectedSealType(sealType)}
                      onAssign={(sealType) => setAssigningSealType(sealType)}
                      onDispatch={(sealType) => setDispatchingSealType(sealType)}
                      cityFilter={
                        currentUser.role === "Operador"
                          ? currentUser.city
                          : undefined
                      }
                      isOperator={currentUser.role === "Operador"}
                    />
                  </section>

                  {currentUser.role === "Operador" && (
                    <section>
                      <h2 className="font-bold text-xl mb-4 text-gray-800">
                        Precintos en Tránsito
                      </h2>

                      <TransitCard
                        destinationCity={currentUser.city}
                        destinationCityName={currentUser.cityName}
                        onReceiveSeal={(seal) => setReceivingSeal(seal)}
                      />
                    </section>
                  )}

                  {currentUser.role !== "Operador" && (
                    <section>
                      <h2 className="font-bold text-xl mb-4 text-gray-800">
                        Distribución Logística Nacional
                      </h2>

                      <ColombiaLogisticsMap
                        selectedCity={selectedCity}
                        onCitySelect={(cityId) => setSelectedCity(cityId)}
                      />
                    </section>
                  )}

                  {currentUser.role === "Supervisor" ? (
                    <section>
                      <h2 className="font-bold text-xl mb-4 text-gray-800">
                        Centros de Distribución
                      </h2>

                      <CityCards
                        onViewDetails={(cityId, cityName) =>
                          setSupervisorViewingCity({
                            id: cityId,
                            name: cityName,
                          })
                        }
                      />
                    </section>
                  ) : (
                    (selectedCity || currentUser.role === "Operador") && (
                      <section>
                        <h2 className="font-bold text-xl mb-4 text-gray-800">
                          {currentUser.role === "Operador"
                            ? "Transacciones Recientes"
                            : "Transacciones de la Ciudad"}
                        </h2>

                        <TransactionsTable
                          cityId={
                            currentUser.role === "Operador"
                              ? currentUser.city
                              : selectedCity!
                          }
                        />
                      </section>
                    )
                  )}
                </>
              )
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Módulo en Desarrollo
                </h2>
                <p className="text-gray-600">
                  Esta funcionalidad estará disponible próximamente
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {isMobile && <QRScanButton />}
    </div>
  );
}