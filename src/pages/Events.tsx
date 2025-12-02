import DesktopNav from '@/components/DesktopNav';
import MobileNav from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Users, Plus, Search } from 'lucide-react';

const mockEvents = [
  {
    id: 1,
    title: 'Tech Networking Mixer',
    date: 'Dec 15, 2025',
    time: '6:00 PM',
    location: 'San Francisco, CA',
    attendees: 45,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
  },
  {
    id: 2,
    title: 'Annual Alumni Reunion',
    date: 'Dec 20, 2025',
    time: '5:00 PM',
    location: 'Campus Main Hall',
    attendees: 234,
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400',
  },
  {
    id: 3,
    title: 'Career Development Workshop',
    date: 'Dec 22, 2025',
    time: '2:00 PM',
    location: 'Virtual',
    attendees: 89,
    image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400',
  },
];

const Events = () => {
  return (
    <div className="min-h-screen bg-background">
      <DesktopNav />
      <MobileNav />
      
      <main className="min-h-screen pb-20 md:pb-0 md:ml-64">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Events</h1>
              <p className="text-muted-foreground">Discover and join alumni events</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search events..." className="pl-10" />
          </div>

          {/* Events Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {event.date} at {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {event.attendees} attending
                    </div>
                  </div>

                  <Button className="w-full">Register</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default Events;
