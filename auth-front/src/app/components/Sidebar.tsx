import { Package, Truck, FileCheck, BarChart3, Users, AlertTriangle, X, Upload } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  onNavigate?: (view: string) => void;
  activeView?: string;
  userRole?: string;
}

const baseMenuItems = [
  { icon: Package, label: 'Inventario Central', view: 'dashboard' },
  { icon: Upload, label: 'Cargue de Precintos', view: 'bulk-load' },
  { icon: FileCheck, label: 'Auditoría', view: 'auditoria' },
];

const adminMenuItems = [
  { icon: Users, label: 'Gestionar Usuarios', view: 'usuarios' },
  { icon: AlertTriangle, label: 'Precintos Dados de Baja', view: 'decommissioned' },
];

export function Sidebar({ isOpen, isMobile, onClose, onNavigate, activeView = 'dashboard', userRole }: SidebarProps) {
  let menuItems = baseMenuItems;

  if (userRole === 'Administrador') {
    menuItems = [...baseMenuItems, ...adminMenuItems];
  } else if (userRole === 'Supervisor') {
    // Supervisor tiene acceso a todo excepto gestión de usuarios
    menuItems = [...baseMenuItems, { icon: AlertTriangle, label: 'Precintos Dados de Baja', view: 'decommissioned' }];
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-xl z-50 transition-transform duration-300 ${
          isMobile ? 'w-64' : 'w-64 mt-[72px]'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          {isMobile && (
            <div className="bg-[#FFE600] p-4 flex items-center justify-between">
              <h2 className="font-bold text-lg">Menú Principal</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-yellow-300 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Menu Items */}
          <nav className="flex-1 p-4">
            <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
              Módulos del Sistema
            </h3>
            <ul className="space-y-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={index}>
                    <button
                      onClick={() => {
                        if (onNavigate) onNavigate(item.view);
                        if (isMobile) onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activeView === item.view
                          ? 'bg-[#3483FA] text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold text-sm">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-3 text-xs">
              <p className="font-bold text-[#3483FA] mb-1">Versión 2.1.0</p>
              <p className="text-gray-600">Última actualización: 20/03/2026</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
