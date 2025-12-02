import DesktopNav from '@/components/DesktopNav';
import MobileNav from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, Lock } from 'lucide-react';

const mockGroups = [
  {
    id: 1,
    name: 'Tech Alumni',
    members: 1243,
    description: 'Connect with fellow alumni in the tech industry',
    isPrivate: false,
    category: 'Technology',
  },
  {
    id: 2,
    name: 'Bay Area Network',
    members: 567,
    description: 'Alumni living in the San Francisco Bay Area',
    isPrivate: false,
    category: 'Location',
  },
  {
    id: 3,
    name: 'Class of 2020',
    members: 892,
    description: 'Official group for 2020 graduates',
    isPrivate: true,
    category: 'Class Year',
  },
  {
    id: 4,
    name: 'Entrepreneurs Club',
    members: 234,
    description: 'For alumni who started their own ventures',
    isPrivate: false,
    category: 'Career',
  },
];

const Groups = () => {
  return (
    <div className="min-h-screen bg-background">
      <DesktopNav />
      <MobileNav />
      
      <main className="min-h-screen pb-20 md:pb-0 md:ml-64">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Groups</h1>
              <p className="text-muted-foreground">Join communities and connect with peers</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Group
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search groups..." className="pl-10" />
          </div>

          {/* Groups Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {mockGroups.map((group) => (
              <Card key={group.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                      <Users className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{group.name}</h3>
                        {group.isPrivate && <Lock className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {group.members.toLocaleString()} members
                      </p>
                      <Badge variant="secondary">{group.category}</Badge>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {group.description}
                </p>

                <Button variant="outline" className="w-full">
                  Join Group
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default Groups;
