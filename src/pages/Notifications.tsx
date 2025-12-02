import { useState } from 'react';
import DesktopNav from '@/components/DesktopNav';
import MobileNav from '@/components/MobileNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Heart, MessageCircle, Users, Calendar, Briefcase, Megaphone, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'connection' | 'event' | 'job' | 'announcement';
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatar?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    title: 'Sarah Johnson liked your post',
    message: 'Your post about career growth resonated with the community',
    time: '5m ago',
    read: false,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
  {
    id: '2',
    type: 'comment',
    title: 'Michael Chen commented',
    message: 'Great insights! Would love to connect and discuss further.',
    time: '1h ago',
    read: false,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
  },
  {
    id: '3',
    type: 'connection',
    title: 'New connection request',
    message: 'Emily Rodriguez wants to connect with you',
    time: '3h ago',
    read: false,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
  },
  {
    id: '4',
    type: 'event',
    title: 'Event Reminder',
    message: 'Alumni Networking Mixer starts in 2 days',
    time: '5h ago',
    read: true,
  },
  {
    id: '5',
    type: 'job',
    title: 'New job opportunity',
    message: 'Senior Software Engineer at Google matches your profile',
    time: '1d ago',
    read: true,
  },
  {
    id: '6',
    type: 'announcement',
    title: 'University Announcement',
    message: 'Annual Alumni Gala registration is now open',
    time: '2d ago',
    read: true,
  },
  {
    id: '7',
    type: 'like',
    title: 'David Kim liked your post',
    message: 'Your post about AI trends received positive feedback',
    time: '2d ago',
    read: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
  },
  {
    id: '8',
    type: 'comment',
    title: 'Lisa Thompson commented',
    message: 'Thanks for sharing this valuable information!',
    time: '3d ago',
    read: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
  },
];

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadNotifications = notifications.filter(n => !n.read);
  const displayedNotifications = filter === 'unread' ? unreadNotifications : notifications;

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      like: { icon: Heart, color: 'text-red-500 bg-red-500/10' },
      comment: { icon: MessageCircle, color: 'text-blue-500 bg-blue-500/10' },
      connection: { icon: Users, color: 'text-green-500 bg-green-500/10' },
      event: { icon: Calendar, color: 'text-purple-500 bg-purple-500/10' },
      job: { icon: Briefcase, color: 'text-orange-500 bg-orange-500/10' },
      announcement: { icon: Megaphone, color: 'text-primary bg-primary/10' },
    };
    return iconMap[type as keyof typeof iconMap] || { icon: Bell, color: 'text-gray-500 bg-gray-500/10' };
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllRead = () => {
    setNotifications(prev => prev.filter(n => !n.read));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigate based on type
    if (notification.type === 'event') {
      navigate('/events');
    } else if (notification.type === 'job') {
      navigate('/dashboard');
    } else if (notification.type === 'connection') {
      navigate('/groups');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DesktopNav />
      <MobileNav />
      
      <main className="min-h-screen pb-20 md:pb-0 md:ml-64">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Notifications</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Stay updated with your network activity
              </p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')} className="w-full sm:w-auto">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="all" className="flex-1 sm:flex-none">
                    All ({notifications.length})
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="flex-1 sm:flex-none">
                    Unread ({unreadNotifications.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex gap-2 w-full sm:w-auto">
                {unreadNotifications.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    className="flex-1 sm:flex-none"
                  >
                    Mark all read
                  </Button>
                )}
                {notifications.some(n => n.read) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllRead}
                    className="flex-1 sm:flex-none text-destructive hover:text-destructive"
                  >
                    Clear read
                  </Button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            {displayedNotifications.length === 0 ? (
              <Card className="p-12 text-center">
                <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  {filter === 'unread' 
                    ? "You're all caught up! No unread notifications."
                    : "You don't have any notifications yet."}
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {displayedNotifications.map((notification) => {
                  const { icon: Icon, color } = getNotificationIcon(notification.type);
                  
                  return (
                    <Card
                      key={notification.id}
                      className={`p-4 hover:shadow-md transition-all cursor-pointer group ${
                        !notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                        {notification.avatar ? (
                          <img
                            src={notification.avatar}
                            alt=""
                            className="w-12 h-12 rounded-full flex-shrink-0 ring-2 ring-primary/10"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-sm sm:text-base leading-tight">
                              {notification.title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">{notification.time}</p>
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;

