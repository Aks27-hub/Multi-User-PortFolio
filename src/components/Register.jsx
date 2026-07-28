import { useState } from "react";
import { User, Mail, Lock, UserPlus, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { api } from "../api.js";

export default function Register({ onNavigate }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await api.register(username, email, password);
      setSuccessMsg("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        onNavigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to register account.");
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
              Create Account
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Start showcasing your skills & experience today
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Public Handle / Username *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Your portfolio URL will be: portfolio.app/<span className="text-indigo-600 font-semibold">{username || "username"}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email Address *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="At least 6 characters"
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
                  <span>Register Account</span>
                  <UserPlus className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-450 uppercase font-bold tracking-wider">Already registered?</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <button
            onClick={() => onNavigate("/login")}
            className="w-full py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 font-semibold transition-all text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
}
