import { useState } from "react";
import { Lock, User, Shield } from "lucide-react";
import backgroundImg from "../../imports/image-1.png";
import { ForgotPassword } from "./ForgotPassword";

import { useAuth } from "../../auth/AuthProvider";
import { API_URL } from "../../auth/authConstants";
import type { AuthResponse, AuthResponseError } from "../../types/types";

export interface UserData {
  username: string;
  role: "Administrador" | "Supervisor" | "Operador";
  city: string;
  cityName: string;
}

export function Login() {
  const auth = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const json = (await response.json()) as AuthResponse;

        if (json.body.accessToken && json.body.refreshToken) {
          auth.saveUser(json);
        }
      } else {
        const json = (await response.json()) as AuthResponseError;
        setError(json.body?.error || "Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.log(error);
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <div
      className="min-h-screen bg-[#FFE600] flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md ml-auto mr-8 md:mr-20">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-xl mb-4">
            <Shield className="w-9 h-9 text-[#3483FA]" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">SGI</h1>

          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            Sistema de Gestión de Inventarios
          </h2>

          <p className="text-gray-700">Precintos de Seguridad Logísticos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Usuario
              </label>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#3483FA] transition-colors" />
                </div>

                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3483FA]/20 focus:border-[#3483FA] outline-none transition-all"
                  placeholder="Ingresa tu usuario"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Contraseña
              </label>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#3483FA] transition-colors" />
                </div>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3483FA]/20 focus:border-[#3483FA] outline-none transition-all"
                  placeholder="Ingresa tu contraseña"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3483FA] text-white py-3 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-[#3483FA] hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-gray-800">
          <p>© 2026 SGI - Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
}