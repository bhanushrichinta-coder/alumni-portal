import { createContext, useContext, useState, ReactNode } from 'react';

export interface Connection {
  id: number;
  name: string;
  avatar: string;
  university: string;
  year: string;
  major: string;
  jobTitle: string;
  company: string;
  connectedDate: string;
}

export interface ConnectionRequest {
  id: string;
  from: {
    name: string;
    avatar: string;
    university: string;
    year: string;
  };
  to: string;
  status: 'pending' | 'accepted' | 'rejected';
  date: string;
}

interface ConnectionsContextType {
  connections: Connection[];
  sentRequests: ConnectionRequest[];
  receivedRequests: ConnectionRequest[];
  isConnected: (userName: string) => boolean;
  hasPendingRequest: (userName: string) => boolean;
  sendConnectionRequest: (userData: Connection['from']) => void;
  acceptRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;
  removeConnection: (connectionId: number) => void;
}

const ConnectionsContext = createContext<ConnectionsContextType | undefined>(undefined);

const mockConnections: Connection[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    university: 'MIT',
    year: '2020',
    major: 'Computer Science',
    jobTitle: 'Software Engineer',
    company: 'Google',
    connectedDate: '2024-01-15',
  },
  {
    id: 2,
    name: 'Michael Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    university: 'Stanford',
    year: '2019',
    major: 'Business',
    jobTitle: 'Product Manager',
    company: 'Facebook',
    connectedDate: '2024-02-10',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    university: 'Harvard',
    year: '2021',
    major: 'Engineering',
    jobTitle: 'Startup Founder',
    company: 'TechVentures',
    connectedDate: '2024-03-05',
  },
];

export const ConnectionsProvider = ({ children }: { children: ReactNode }) => {
  const [connections, setConnections] = useState<Connection[]>(mockConnections);
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ConnectionRequest[]>([
    {
      id: 'req1',
      from: {
        name: 'David Kim',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
        university: 'Berkeley',
        year: '2018',
      },
      to: 'You',
      status: 'pending',
      date: new Date().toISOString(),
    },
  ]);

  const isConnected = (userName: string) => {
    return connections.some(c => c.name === userName);
  };

  const hasPendingRequest = (userName: string) => {
    return sentRequests.some(r => r.to === userName && r.status === 'pending');
  };

  const sendConnectionRequest = (userData: any) => {
    const request: ConnectionRequest = {
      id: Date.now().toString(),
      from: {
        name: 'You', // Current user
        avatar: userData.avatar || '',
        university: userData.university || '',
        year: userData.year || '',
      },
      to: userData.name,
      status: 'pending',
      date: new Date().toISOString(),
    };
    setSentRequests(prev => [...prev, request]);
  };

  const acceptRequest = (requestId: string) => {
    const request = receivedRequests.find(r => r.id === requestId);
    if (!request) return;

    // Add to connections
    const newConnection: Connection = {
      id: Date.now(),
      name: request.from.name,
      avatar: request.from.avatar,
      university: request.from.university,
      year: request.from.year,
      major: 'Computer Science', // Default
      jobTitle: 'Professional',
      company: 'Company',
      connectedDate: new Date().toISOString().split('T')[0],
    };

    setConnections(prev => [newConnection, ...prev]);
    setReceivedRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const rejectRequest = (requestId: string) => {
    setReceivedRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const removeConnection = (connectionId: number) => {
    setConnections(prev => prev.filter(c => c.id !== connectionId));
  };

  return (
    <ConnectionsContext.Provider value={{
      connections,
      sentRequests,
      receivedRequests,
      isConnected,
      hasPendingRequest,
      sendConnectionRequest,
      acceptRequest,
      rejectRequest,
      removeConnection,
    }}>
      {children}
    </ConnectionsContext.Provider>
  );
};

export const useConnections = () => {
  const context = useContext(ConnectionsContext);
  if (!context) {
    throw new Error('useConnections must be used within ConnectionsProvider');
  }
  return context;
};

