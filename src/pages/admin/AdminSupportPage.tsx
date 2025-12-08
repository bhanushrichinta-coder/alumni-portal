import { useSidebar } from '@/contexts/SidebarContext';
import DesktopNav from '@/components/DesktopNav';
import MobileNav from '@/components/MobileNav';
import AdminSupport from '@/components/admin/AdminSupport';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export default function AdminSupportPage() {
  const { isOpen: isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <DesktopNav />
      <MobileNav />

      <main
        className={`min-h-screen pb-20 md:pb-0 transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-0'
        }`}
      >
        {/* Header with Sidebar Toggle */}
        <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
          <div className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <div className="max-w-7xl mx-auto flex items-center gap-3">
              {/* Sidebar Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 hover:bg-accent rounded-lg"
                title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>

              {/* Page Title */}
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold truncate">Support Tickets</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Manage alumni support requests
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          <AdminSupport />
        </div>
      </main>
    </div>
  );
}
