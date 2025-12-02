import { createContext, useContext, useState, ReactNode } from 'react';

export interface Group {
  id: number;
  name: string;
  members: number;
  description: string;
  isPrivate: boolean;
  category: string;
  avatar?: string;
  isJoined?: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface GroupsContextType {
  groups: Group[];
  joinedGroups: Group[];
  createGroup: (group: Omit<Group, 'id' | 'members' | 'isJoined'>) => void;
  updateGroup: (id: number, updates: Partial<Group>) => void;
  deleteGroup: (id: number) => void;
  joinGroup: (id: number) => void;
  leaveGroup: (id: number) => void;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

const initialGroups: Group[] = [
  {
    id: 1,
    name: 'Tech Alumni',
    members: 1243,
    description: 'Connect with fellow alumni in the tech industry',
    isPrivate: false,
    category: 'Technology',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=tech',
    isJoined: true,
    lastMessage: 'Anyone attending the tech meetup?',
    lastMessageTime: '2h ago',
    unreadCount: 3,
  },
  {
    id: 2,
    name: 'Bay Area Network',
    members: 567,
    description: 'Alumni living in the San Francisco Bay Area',
    isPrivate: false,
    category: 'Location',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=bayarea',
    isJoined: false,
  },
  {
    id: 3,
    name: 'Class of 2020',
    members: 892,
    description: 'Official group for 2020 graduates',
    isPrivate: true,
    category: 'Class Year',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=class2020',
    isJoined: true,
    lastMessage: 'Reunion plans are finalized!',
    lastMessageTime: '1d ago',
    unreadCount: 0,
  },
  {
    id: 4,
    name: 'Entrepreneurs Club',
    members: 234,
    description: 'For alumni who started their own ventures',
    isPrivate: false,
    category: 'Career',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=entrepreneurs',
    isJoined: false,
  },
  {
    id: 5,
    name: 'Data Science Network',
    members: 456,
    description: 'AI, ML, and Data Science professionals',
    isPrivate: false,
    category: 'Technology',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=datascience',
    isJoined: true,
    lastMessage: 'Great article on neural networks',
    lastMessageTime: '5h ago',
    unreadCount: 5,
  },
];

export const GroupsProvider = ({ children }: { children: ReactNode }) => {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const nextId = 1000;

  const joinedGroups = groups.filter(g => g.isJoined);

  const createGroup = (groupData: Omit<Group, 'id' | 'members' | 'isJoined'>) => {
    const newGroup: Group = {
      ...groupData,
      id: Date.now(),
      members: 1,
      isJoined: true,
      avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${groupData.name}`,
    };
    setGroups(prev => [newGroup, ...prev]);
  };

  const updateGroup = (id: number, updates: Partial<Group>) => {
    setGroups(prev => prev.map(group => 
      group.id === id ? { ...group, ...updates } : group
    ));
  };

  const deleteGroup = (id: number) => {
    setGroups(prev => prev.filter(group => group.id !== id));
  };

  const joinGroup = (id: number) => {
    setGroups(prev => prev.map(group => 
      group.id === id 
        ? { ...group, isJoined: true, members: group.members + 1 } 
        : group
    ));
  };

  const leaveGroup = (id: number) => {
    setGroups(prev => prev.map(group => 
      group.id === id 
        ? { ...group, isJoined: false, members: Math.max(0, group.members - 1) } 
        : group
    ));
  };

  return (
    <GroupsContext.Provider value={{
      groups,
      joinedGroups,
      createGroup,
      updateGroup,
      deleteGroup,
      joinGroup,
      leaveGroup,
    }}>
      {children}
    </GroupsContext.Provider>
  );
};

export const useGroups = () => {
  const context = useContext(GroupsContext);
  if (!context) {
    throw new Error('useGroups must be used within GroupsProvider');
  }
  return context;
};

