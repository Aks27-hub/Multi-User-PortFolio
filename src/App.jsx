import { useState, useEffect } from "react";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import Dashboard from "./components/Dashboard.jsx";
import PublicPortfolio from "./components/PublicPortfolio.jsx";

export default function App() {
  // Navigation & Routing state
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Auth States
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Custom router history tracking
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState(null, "", path);
    setCurrentPath(path);
  };

  // Check Auth State on Boot
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Failed to parse saved user credentials", err);
        localStorage.clear();
        setToken(null);
        setUser(null);
      }
    }
    setAuthChecking(false);
  }, []);

  // Handle successful login
  const handleLoginSuccess = (newToken, loggedInUser) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setToken(newToken);
    setUser(loggedInUser);
    navigate("/dashboard");
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-semibold text-sm">Validating credentials...</p>
      </div>
    );
  }

  // Parse path to route
  const pathParts = currentPath.split("/").filter(Boolean);
  const topPart = pathParts[0];

  // Router matching logic
  if (topPart === "login") {
    if (token && user) {
      navigate("/dashboard");
      return null;
    }
    return <Login onLoginSuccess={handleLoginSuccess} onNavigate={navigate} />;
  }

  if (topPart === "register") {
    if (token && user) {
      navigate("/dashboard");
      return null;
    }
    return <Register onNavigate={navigate} />;
  }

  if (topPart === "dashboard") {
    if (!token || !user) {
      navigate("/login");
      return null;
    }
    return <Dashboard user={user} onLogout={handleLogout} onNavigate={navigate} />;
  }

  // Default index routing
  if (!topPart) {
    if (token && user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
    return null;
  }

  return <PublicPortfolio username={topPart} onNavigate={navigate} />;
}
