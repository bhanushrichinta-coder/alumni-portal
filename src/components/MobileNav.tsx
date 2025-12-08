import { Home, Users, Calendar, MessageCircle, User, FileText, Moon, Sun, Heart, Shield, LayoutDashboard, Settings, Headset } from 'lucide-react';
import { NavLink } from './NavLink';
import { useAuth } from '@/contexts/AuthContext';

const MobileNav = () => {
  const { isAdmin, isSuperAdmin } = useAuth();
  
  // Super Admin navigation items
  const superAdminNavItems = [
    { to: '/superadmin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  // Admin navigation items
  const adminNavItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/support', icon: Headset, label: 'Support' },
    { to: '/admin/branding', icon: Settings, label: 'Branding' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  // Alumni navigation items
  const alumniNavItems = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/mentorship', icon: Heart, label: 'Mentor' },
    { to: '/support', icon: Headset, label: 'Support' },
    { to: '/chat', icon: MessageCircle, label: 'Chat' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const navItems = isSuperAdmin ? superAdminNavItems : (isAdmin ? adminNavItems : alumniNavItems);

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary"
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
