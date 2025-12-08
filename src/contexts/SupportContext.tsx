import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  universityId: string;
  universityName: string;
  subject: string;
  category: 'general' | 'technical' | 'academic' | 'events' | 'mentorship' | 'other';
  priority: 'low' | 'medium' | 'high';
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  responses?: TicketResponse[];
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: 'alumni' | 'admin';
  message: string;
  createdAt: string;
}

interface SupportContextType {
  tickets: SupportTicket[];
  createTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status'], adminNotes?: string) => void;
  addResponse: (ticketId: string, message: string) => void;
  getTicketsByUser: (userId: string) => SupportTicket[];
  getTicketsByUniversity: (universityId: string) => SupportTicket[];
  getTicketById: (ticketId: string) => SupportTicket | undefined;
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

export const useSupport = () => {
  const context = useContext(SupportContext);
  if (!context) throw new Error('useSupport must be used within SupportProvider');
  return context;
};

export const SupportProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Load tickets from localStorage on mount
  useEffect(() => {
    const storedTickets = localStorage.getItem('support_tickets');
    if (storedTickets) {
      setTickets(JSON.parse(storedTickets));
    } else {
      // Initialize with some demo tickets
      const demoTickets: SupportTicket[] = [
        {
          id: 'ticket_1',
          userId: 'alumni_1',
          userName: 'John Doe',
          userEmail: 'john.doe@mit.edu',
          universityId: 'mit',
          universityName: 'Massachusetts Institute of Technology',
          subject: 'Unable to access alumni directory',
          category: 'technical',
          priority: 'medium',
          description: 'I am having trouble accessing the alumni directory. When I click on the directory link, it shows a loading spinner but never loads.',
          status: 'open',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          responses: [],
        },
        {
          id: 'ticket_2',
          userId: 'alumni_2',
          userName: 'Sarah Chen',
          userEmail: 'sarah.chen@mit.edu',
          universityId: 'mit',
          universityName: 'Massachusetts Institute of Technology',
          subject: 'Request for transcript verification letter',
          category: 'academic',
          priority: 'high',
          description: 'I need a verified transcript letter for my job application. Can you please provide this?',
          status: 'in-progress',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          adminNotes: 'Working with registrar office to process the request.',
          responses: [
            {
              id: 'response_1',
              ticketId: 'ticket_2',
              userId: 'admin_mit',
              userName: 'MIT Admin',
              userRole: 'admin',
              message: 'We have received your request. Our registrar office will process this within 3-5 business days.',
              createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
        },
        {
          id: 'ticket_3',
          userId: 'alumni_3',
          userName: 'Michael Smith',
          userEmail: 'michael.smith@stanford.edu',
          universityId: 'stanford',
          universityName: 'Stanford University',
          subject: 'Question about upcoming alumni event',
          category: 'events',
          priority: 'low',
          description: 'Is the Spring Alumni Gala open to all graduates or just recent ones?',
          status: 'resolved',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          adminNotes: 'Provided event details and registration link.',
          responses: [
            {
              id: 'response_2',
              ticketId: 'ticket_3',
              userId: 'admin_stanford',
              userName: 'Stanford Admin',
              userRole: 'admin',
              message: 'The Spring Alumni Gala is open to all Stanford graduates regardless of graduation year. You can register using the link in the events section.',
              createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
        },
      ];
      setTickets(demoTickets);
      localStorage.setItem('support_tickets', JSON.stringify(demoTickets));
    }
  }, []);

  // Save tickets to localStorage whenever they change
  useEffect(() => {
    if (tickets.length > 0) {
      localStorage.setItem('support_tickets', JSON.stringify(tickets));
    }
  }, [tickets]);

  const createTicket = (ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const newTicket: SupportTicket = {
      ...ticketData,
      id: `ticket_${Date.now()}`,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [],
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicket['status'], adminNotes?: string) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          status,
          adminNotes: adminNotes || ticket.adminNotes,
          updatedAt: new Date().toISOString(),
        };
      }
      return ticket;
    }));
  };

  const addResponse = (ticketId: string, message: string) => {
    if (!user) return;

    const newResponse: TicketResponse = {
      id: `response_${Date.now()}`,
      ticketId,
      userId: user.id,
      userName: user.name,
      userRole: user.role || 'alumni',
      message,
      createdAt: new Date().toISOString(),
    };

    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          responses: [...(ticket.responses || []), newResponse],
          updatedAt: new Date().toISOString(),
        };
      }
      return ticket;
    }));
  };

  const getTicketsByUser = (userId: string) => {
    return tickets.filter(ticket => ticket.userId === userId);
  };

  const getTicketsByUniversity = (universityId: string) => {
    return tickets.filter(ticket => ticket.universityId === universityId);
  };

  const getTicketById = (ticketId: string) => {
    return tickets.find(ticket => ticket.id === ticketId);
  };

  return (
    <SupportContext.Provider
      value={{
        tickets,
        createTicket,
        updateTicketStatus,
        addResponse,
        getTicketsByUser,
        getTicketsByUniversity,
        getTicketById,
      }}
    >
      {children}
    </SupportContext.Provider>
  );
};
