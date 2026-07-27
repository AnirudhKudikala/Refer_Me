import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, MessageSquare, User, Users, Home, Sun, Moon } from "lucide-react";
import { getRoleHomePath } from "./ProtectedRoute";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";
import { Button } from "../ui/Button";
import { Logo } from "../ui/Logo";
import { cn } from "../../lib/utils";

function NavLink({ to, icon: Icon, label, end = false }: { to: string; icon: React.ElementType; label: string; end?: boolean }) {
  const location = useLocation();
  const isActive = end ? location.pathname === to : location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all nav-link",
        isActive && "nav-link-active font-medium"
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const homePath = getRoleHomePath(user?.role);

  return (
    <motion.nav
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 border-b border-theme backdrop-blur-xl"
      style={{ backgroundColor: "var(--color-nav-bg)" }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to={homePath}>
          <Logo size="sm" />
        </Link>

        <div className="flex items-center gap-1.5">
          {user ? (
            <>
              {user.role === "SEEKER" && (
                <>
                  <NavLink to="/seeker" icon={Home} label="Home" end />
                  <NavLink to="/seeker/profile" icon={User} label="Profile" />
                </>
              )}
              {user.role === "REFERRER" && (
                <NavLink to="/referrer" icon={Users} label="Browse" />
              )}
              <NavLink to="/chat" icon={MessageSquare} label="Messages" />
              <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Log out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
              <Link to="/register"><Button size="sm">Get started</Button></Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
