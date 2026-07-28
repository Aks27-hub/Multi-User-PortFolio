import { useState } from "react";
import { Mail, Lock, LogIn, ArrowRight, Eye, EyeOff } from "lucide-react";
import { api } from "../api.js";

export default function Login({ onLoginSuccess, onNavigate }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.login(usernameOrEmail, password);
      onLoginSuccess(response.token, response.user);
    } catch (err) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50/50 to-indigo-50/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-100/80 border border-slate-200/50 overflow-hidden">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 h-2 w-full" />
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Build your modern professional presence
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Username or Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="name@example.com or username"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20 transition-all disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none disabled:cursor-not-allowed text-sm mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <LogIn className="h-4 w-4 animate-pulse" />
                </>
              )}
            </button>
          </form>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-450 uppercase font-bold tracking-wider">New to Portfolios?</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <button
            onClick={() => onNavigate("/register")}
            className="w-full py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 font-semibold transition-all text-sm flex items-center justify-center gap-2"
          >
            <span>Create an Account</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
