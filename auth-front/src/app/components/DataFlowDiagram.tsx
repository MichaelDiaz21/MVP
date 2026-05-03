import { Package, FileSpreadsheet, Building2, UserCheck, CloudOff, ArrowRight } from 'lucide-react';

interface FlowStep {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const flowSteps: FlowStep[] = [
  {
    id: 'provider',
    title: 'PROVEEDOR',
    icon: <Package className="w-6 h-6" />,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  {
    id: 'reception',
    title: 'RECEPCIÓN MASIVA',
    subtitle: '(OFFREST)',
    icon: <FileSpreadsheet className="w-6 h-6" />,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  {
    id: 'cedi',
    title: 'CEDI',
    icon: <Building2 className="w-6 h-6" />,
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  {
    id: 'assignment',
    title: 'ASIGNACIÓN CAMPO',
    subtitle: 'NOMINAL',
    icon: <UserCheck className="w-6 h-6" />,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
  {
    id: 'operation',
    title: 'OPERACIÓN CAMPO',
    subtitle: '(OFFLINE SYNC)',
    icon: <CloudOff className="w-6 h-6" />,
    color: 'text-green-800',
    bgColor: 'bg-green-100',
  },
];

export function DataFlowDiagram() {
  return (
    <div className="bg-white rounded border border-gray-300 shadow-sm p-5">
      <h2 className="font-bold mb-1">FLUXOGRAMA DE DATOS</h2>
      <p className="text-sm font-bold text-gray-600 mb-4">LIFE CYCLE:</p>
      
      <div className="flex items-center justify-between gap-2">
        {flowSteps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-2">
            {/* Step Card */}
            <div className="flex flex-col items-center">
              <div className={`${step.bgColor} border-2 border-gray-400 rounded p-3 w-24 h-24 flex flex-col items-center justify-center transition-all hover:shadow-md ${step.color}`}>
                <div className="mb-1">
                  {step.icon}
                </div>
                <p className="text-[10px] font-bold text-center text-black leading-tight">
                  {step.title}
                </p>
                {step.subtitle && (
                  <p className="text-[9px] text-gray-700 text-center font-semibold">
                    {step.subtitle}
                  </p>
                )}
              </div>
            </div>
            
            {/* Arrow between steps */}
            {index < flowSteps.length - 1 && (
              <ArrowRight className="w-5 h-5 text-gray-500 flex-shrink-0" strokeWidth={2} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}