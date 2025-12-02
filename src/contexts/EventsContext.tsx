import { createContext, useContext, useState, ReactNode } from 'react';

export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  image: string;
  description: string;
  isVirtual: boolean;
  meetingLink?: string;
  organizer: string;
  category: string;
  isRegistered?: boolean;
}

interface EventsContextType {
  events: Event[];
  registeredEvents: Event[];
  createEvent: (event: Omit<Event, 'id' | 'attendees' | 'isRegistered' | 'organizer'>) => void;
  updateEvent: (id: number, updates: Partial<Event>) => void;
  deleteEvent: (id: number) => void;
  registerForEvent: (id: number) => void;
  unregisterFromEvent: (id: number) => void;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

const initialEvents: Event[] = [
  {
    id: 1,
    title: 'Tech Networking Mixer',
    date: 'Dec 15, 2024',
    time: '6:00 PM',
    location: 'San Francisco, CA',
    attendees: 45,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop',
    description: 'Join us for an evening of networking with tech professionals from our alumni network.',
    isVirtual: false,
    organizer: 'Alumni Association',
    category: 'Networking',
    isRegistered: true,
  },
  {
    id: 2,
    title: 'Annual Alumni Reunion',
    date: 'Dec 20, 2024',
    time: '5:00 PM',
    location: 'Campus Main Hall',
    attendees: 234,
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=500&fit=crop',
    description: 'Celebrate with your fellow alumni at our annual reunion event.',
    isVirtual: false,
    organizer: 'University Events',
    category: 'Social',
    isRegistered: false,
  },
  {
    id: 3,
    title: 'Career Development Workshop',
    date: 'Dec 22, 2024',
    time: '2:00 PM',
    location: 'Virtual',
    attendees: 89,
    image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=500&fit=crop',
    description: 'Learn strategies for advancing your career with expert speakers.',
    isVirtual: true,
    meetingLink: 'https://zoom.us/j/example',
    organizer: 'Career Services',
    category: 'Professional',
    isRegistered: true,
  },
  {
    id: 4,
    title: 'AI & Machine Learning Webinar',
    date: 'Dec 28, 2024',
    time: '10:00 AM',
    location: 'Virtual',
    attendees: 156,
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=500&fit=crop',
    description: 'Explore the latest trends in AI and ML with industry leaders.',
    isVirtual: true,
    meetingLink: 'https://meet.google.com/example',
    organizer: 'Tech Alumni Group',
    category: 'Technology',
    isRegistered: false,
  },
];

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>(initialEvents);

  const registeredEvents = events.filter(e => e.isRegistered);

  const createEvent = (eventData: Omit<Event, 'id' | 'attendees' | 'isRegistered' | 'organizer'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now(),
      attendees: 0,
      isRegistered: true, // Auto-register creator
      organizer: 'You',
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  const updateEvent = (id: number, updates: Partial<Event>) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
  };

  const deleteEvent = (id: number) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const registerForEvent = (id: number) => {
    setEvents(prev => prev.map(event => 
      event.id === id 
        ? { ...event, isRegistered: true, attendees: event.attendees + 1 } 
        : event
    ));
  };

  const unregisterFromEvent = (id: number) => {
    setEvents(prev => prev.map(event => 
      event.id === id 
        ? { ...event, isRegistered: false, attendees: Math.max(0, event.attendees - 1) } 
        : event
    ));
  };

  return (
    <EventsContext.Provider value={{
      events,
      registeredEvents,
      createEvent,
      updateEvent,
      deleteEvent,
      registerForEvent,
      unregisterFromEvent,
    }}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within EventsProvider');
  }
  return context;
};

