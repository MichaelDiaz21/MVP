import { useState } from 'react';
import { Mail, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import backgroundImg from "../../imports/image-1.png";

interface ForgotPasswordProps {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (email && email.includes('@')) {
        setSuccess(true);
        setLoading(false);
      } else {
        setError('Por favor ingresa un correo electrónico válido');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div
      className="min-h-screen bg-[#FFE600] flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Contenedor principal a la derecha */}
      <div className="w-full max-w-md ml-auto mr-8 md:mr-20">
        {/* Información del sistema */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-xl mb-4">
            <Shield className="w-9 h-9 text-[#3483FA]" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            SGI
          </h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            Sistema de Gestión de Inventarios
          </h2>
          <p className="text-gray-700">
            Precintos de Seguridad Logísticos
          </p>
        </div>

        {/* Formulario de recuperación */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
          {!success ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Recuperar Contraseña
              </h2>
              <p className="text-sm text-gray-600 mb-6 text-center">
                Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Campo de email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#3483FA] transition-colors" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3483FA]/20 focus:border-[#3483FA] outline-none transition-all"
                      placeholder="ejemplo@correo.com"
                    />
                  </div>
                </div>

                {/* Mensaje de error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Botón de enviar */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3483FA] text-white py-3 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Enviar Instrucciones'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Correo Enviado!
              </h2>
              <p className="text-gray-600 mb-6">
                Hemos enviado las instrucciones para restablecer tu contraseña a <span className="font-semibold">{email}</span>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Revisa tu bandeja de entrada y sigue los pasos indicados
              </p>
            </div>
          )}

          {/* Botón de volver */}
          <div className="mt-6 text-center">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm text-[#3483FA] hover:text-blue-600 hover:underline transition-colors font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-800">
          <p>© 2026 SGI - Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
}
