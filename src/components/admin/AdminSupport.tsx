import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi, AdminTicketResponse } from '@/api/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Search,
  Send,
  User,
  Calendar,
  Tag,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// Transform API response to component format
interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
}

const transformTicket = (apiTicket: AdminTicketResponse): SupportTicket => ({
  id: apiTicket.id,
  userId: apiTicket.user_id,
  userName: apiTicket.user_name,
  userEmail: apiTicket.user_email,
  subject: apiTicket.subject,
  category: apiTicket.category,
  priority: apiTicket.priority,
  status: apiTicket.status,
  description: apiTicket.description,
  responseCount: apiTicket.response_count,
  createdAt: apiTicket.created_at,
  updatedAt: apiTicket.updated_at,
});

export default function AdminSupport() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch tickets from admin API
  const fetchTickets = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await adminApi.getTickets({ page_size: 100 });
      setTickets(response.tickets.map(transformTicket));
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load support tickets',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const universityTickets = tickets;

  const filteredTickets = universityTickets.filter(ticket => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === 'all' ||
      ticket.status === activeTab ||
      (activeTab === 'in-progress' && ticket.status === 'inprogress');

    return matchesSearch && matchesTab;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'closed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case 'in-progress':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'resolved':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'closed':
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'low':
        return 'bg-green-500/10 text-green-500';
      default:
        return '';
    }
  };

  const handleTicketClick = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setStatusUpdate(ticket.status);
    setResponseMessage('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedTicket) return;

    setIsSubmitting(true);
    try {
      await adminApi.updateTicketStatus(selectedTicket.id, statusUpdate);
      
      // Update local state
      setTickets(prev => prev.map(t => 
        t.id === selectedTicket.id ? { ...t, status: statusUpdate, updatedAt: new Date().toISOString() } : t
      ));

      toast({
        title: 'Ticket Updated',
        description: 'The ticket status has been updated successfully.',
      });

      setSelectedTicket(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update ticket status',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendResponse = async () => {
    if (!selectedTicket || !responseMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await adminApi.respondToTicket(selectedTicket.id, responseMessage);
      
      // Update local state
      setTickets(prev => prev.map(t => 
        t.id === selectedTicket.id 
          ? { ...t, responseCount: t.responseCount + 1, status: t.status === 'open' ? 'in-progress' : t.status, updatedAt: new Date().toISOString() } 
          : t
      ));

      toast({
        title: 'Response Sent',
        description: 'Your response has been sent to the user.',
      });

      setResponseMessage('');
      setSelectedTicket(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send response',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = {
    total: universityTickets.length,
    open: universityTickets.filter(t => t.status === 'open').length,
    inProgress: universityTickets.filter(t => t.status === 'in-progress' || t.status === 'inprogress').length,
    resolved: universityTickets.filter(t => t.status === 'resolved').length,
    closed: universityTickets.filter(t => t.status === 'closed').length,
    highPriority: universityTickets.filter(t => t.priority === 'high' && t.status !== 'resolved' && t.status !== 'closed').length,
  };

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                <div className="h-4 bg-muted rounded w-16 mb-2"></div>
                <div className="h-8 bg-muted rounded w-12"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="p-3 sm:p-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={fetchTickets} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <CardDescription className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
              Total
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <CardDescription className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
              Open
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl text-blue-500">{stats.open}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <CardDescription className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
              In Progress
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl text-yellow-500">{stats.inProgress}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <CardDescription className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              Resolved
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl text-green-500">{stats.resolved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <CardDescription className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
              Closed
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl text-gray-500">{stats.closed}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-red-500/20">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <CardDescription className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
              High Priority
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl text-red-500">{stats.highPriority}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 sm:pl-9 text-sm sm:text-base h-9 sm:h-10"
          />
        </div>
      </div>

      {/* Tickets Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex-wrap h-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm flex-1 min-w-[80px]">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="open" className="text-xs sm:text-sm flex-1 min-w-[80px]">Open ({stats.open})</TabsTrigger>
          <TabsTrigger value="in-progress" className="text-xs sm:text-sm flex-1 min-w-[80px]">In Progress ({stats.inProgress})</TabsTrigger>
          <TabsTrigger value="resolved" className="text-xs sm:text-sm flex-1 min-w-[80px]">Resolved ({stats.resolved})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 sm:mt-6">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">No Tickets Found</h3>
                <p className="text-sm sm:text-base text-muted-foreground text-center">
                  {searchQuery
                    ? 'No tickets match your search criteria.'
                    : 'No support tickets in this category.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredTickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleTicketClick(ticket)}
                >
                  <CardHeader className="p-3 sm:p-6">
                    <div className="flex items-start justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                          <Badge className={`${getStatusColor(ticket.status)} text-xs`}>
                            {getStatusIcon(ticket.status)}
                            <span className="ml-1 capitalize">{ticket.status.replace('-', ' ')}</span>
                          </Badge>
                          <Badge className={`${getPriorityColor(ticket.priority)} text-xs`}>
                            <span className="capitalize">{ticket.priority} Priority</span>
                          </Badge>
                          <Badge variant="outline" className="capitalize text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {ticket.category}
                          </Badge>
                        </div>
                        <CardTitle className="mb-2 text-base sm:text-lg md:text-xl break-words">{ticket.subject}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {ticket.userName}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="w-full sm:w-auto truncate">{ticket.userEmail}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                          </span>
                          <span className="hidden md:inline">•</span>
                          <span className="hidden md:inline">
                            Updated {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                          </span>
                          {ticket.responseCount > 0 && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span>{ticket.responseCount} response{ticket.responseCount !== 1 ? 's' : ''}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Ticket Details Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getStatusColor(selectedTicket.status)}>
                    {getStatusIcon(selectedTicket.status)}
                    <span className="ml-1 capitalize">{selectedTicket.status.replace('-', ' ')}</span>
                  </Badge>
                  <Badge className={getPriorityColor(selectedTicket.priority)}>
                    <span className="capitalize">{selectedTicket.priority} Priority</span>
                  </Badge>
                  <Badge variant="outline">Ticket #{selectedTicket.id.slice(-6)}</Badge>
                </div>
                <DialogTitle>{selectedTicket.subject}</DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-2">
                  <span>{selectedTicket.userName}</span>
                  <span>•</span>
                  <span>{selectedTicket.userEmail}</span>
                  <span>•</span>
                  <span>{format(new Date(selectedTicket.createdAt), 'MMM d, yyyy h:mm a')}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Original Description */}
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                  </div>
                </div>

                {/* Response Count Info */}
                {selectedTicket.responseCount > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      This ticket has {selectedTicket.responseCount} response{selectedTicket.responseCount !== 1 ? 's' : ''}.
                    </p>
                  </div>
                )}

                {/* Send Response */}
                <div>
                  <Label htmlFor="response">Send Response to User</Label>
                  <div className="flex gap-2 mt-2">
                    <Textarea
                      id="response"
                      placeholder="Type your response here..."
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      rows={4}
                      className="flex-1"
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button onClick={handleSendResponse} className="mt-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send Response
                  </Button>
                </div>

                {/* Update Status */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-3">Update Ticket Status</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={statusUpdate} onValueChange={setStatusUpdate} disabled={isSubmitting}>
                        <SelectTrigger id="status" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setSelectedTicket(null)} disabled={isSubmitting}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateStatus} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Update Status
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
