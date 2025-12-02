import { Home, Users, Calendar, MessageCircle, User, GraduationCap, Sparkles, LogOut, FileText, Moon, Sun, UserPlus } from 'lucide-react';
import { NavLink } from './NavLink';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const DesktopNav = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Feed' },
    { to: '/connections', icon: UserPlus, label: 'Connections' },
    { to: '/roadmap', icon: Sparkles, label: 'AI Roadmap' },
    { to: '/groups', icon: Users, label: 'Groups' },
    { to: '/events', icon: Calendar, label: 'Events' },
    { to: '/chat', icon: MessageCircle, label: 'Messages' },
    { to: '/documents', icon: FileText, label: 'Documents' },
  ];

  return (
    <aside className="hidden md:flex md:fixed md:left-0 md:top-0 flex-col w-64 bg-card border-r border-border h-screen z-40">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Alumni Network</h1>
            <p className="text-xs text-muted-foreground">{user?.university}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            activeClassName="bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
        >
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </NavLink>
        <Button
          variant="ghost"
          onClick={toggleTheme}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-5 h-5" />
              <span>Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="w-5 h-5" />
              <span>Light Mode</span>
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-muted-foreground"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default DesktopNav;
