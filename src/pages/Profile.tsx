import { useAuth } from '@/contexts/AuthContext';
import DesktopNav from '@/components/DesktopNav';
import MobileNav from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Briefcase, Calendar, Mail, Linkedin, Edit } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <DesktopNav />
      <MobileNav />
      
      <main className="min-h-screen pb-20 md:pb-0 md:ml-64">
        <div className="max-w-4xl mx-auto">
          {/* Cover & Avatar */}
          <div className="relative">
            <div className="h-48 bg-gradient-to-r from-primary to-secondary" />
            <div className="absolute -bottom-16 left-8">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-32 h-32 rounded-full border-4 border-background"
              />
            </div>
          </div>

          <div className="px-8 pt-20 pb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
                <p className="text-muted-foreground mb-4">
                  {user?.major || 'Computer Science'} • {user?.university}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Software Engineer
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    San Francisco, CA
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Class of {user?.graduationYear || '2020'}
                  </div>
                </div>
              </div>
              <Button className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* About */}
              <Card className="p-6 md:col-span-2 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3">About</h2>
                  <p className="text-muted-foreground">
                    {user?.bio || 'Passionate about technology and building meaningful connections. Always eager to help fellow alumni and students navigate their career paths.'}
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">Experience</h2>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Senior Software Engineer</h3>
                        <p className="text-sm text-muted-foreground">Tech Company • 2021 - Present</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Contact & Links */}
              <Card className="p-6 space-y-4 h-fit">
                <h2 className="text-xl font-semibold">Contact</h2>
                <div className="space-y-3">
                  <a href={`mailto:${user?.email}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                    <Mail className="w-5 h-5" />
                    {user?.email}
                  </a>
                  <a href="#" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                    <Linkedin className="w-5 h-5" />
                    Connect on LinkedIn
                  </a>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="font-semibold mb-2">Stats</h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">156</p>
                      <p className="text-xs text-muted-foreground">Connections</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-secondary">23</p>
                      <p className="text-xs text-muted-foreground">Posts</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default Profile;
