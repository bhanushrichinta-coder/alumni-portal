import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupport, SupportTicket } from '@/contexts/SupportContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';

interface SupportTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SupportTicketModal({ open, onOpenChange }: SupportTicketModalProps) {
  const { user } = useAuth();
  const { createTicket } = useSupport();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    subject: '',
    category: 'general' as SupportTicket['category'],
    priority: 'medium' as SupportTicket['priority'],
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit a support ticket.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.subject.trim() || !formData.description.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    createTicket({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      universityId: user.universityId || 'default',
      universityName: user.university,
      subject: formData.subject,
      category: formData.category,
      priority: formData.priority,
      description: formData.description,
    });

    toast({
      title: 'Ticket Submitted',
      description: 'Your support ticket has been submitted successfully. We will get back to you soon.',
    });

    // Reset form
    setFormData({
      subject: '',
      category: 'general',
      priority: 'medium',
      description: '',
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Support Request</DialogTitle>
          <DialogDescription>
            Need help or have a question? Submit a support ticket and our team will assist you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Brief description of your issue"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as SupportTicket['category'] })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="academic">Academic Records</SelectItem>
                  <SelectItem value="events">Events & Programs</SelectItem>
                  <SelectItem value="mentorship">Mentorship</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as SupportTicket['priority'] })}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Please provide detailed information about your request..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Submit Ticket</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
