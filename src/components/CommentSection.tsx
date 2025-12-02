import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MoreVertical, Edit, Trash2, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
}

interface CommentSectionProps {
  postId: number;
  initialComments?: Comment[];
  onCommentAdded: () => void;
}

const mockComments: Comment[] = [
  {
    id: '1',
    author: 'Sarah Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'This is amazing! Congratulations! 🎉',
    time: '2h ago',
  },
  {
    id: '2',
    author: 'Michael Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    content: 'Great work! Keep it up!',
    time: '3h ago',
  },
  {
    id: '3',
    author: 'Emily Rodriguez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    content: 'Inspiring! Thanks for sharing.',
    time: '5h ago',
  },
  {
    id: '4',
    author: 'David Kim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    content: 'This is exactly what I needed to see today. Thank you!',
    time: '6h ago',
  },
  {
    id: '5',
    author: 'Lisa Thompson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    content: 'Would love to hear more about this. Can we connect?',
    time: '8h ago',
  },
  {
    id: '6',
    author: 'James Wilson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    content: 'Absolutely brilliant! Keep sharing such valuable content.',
    time: '10h ago',
  },
  {
    id: '7',
    author: 'Sophie Brown',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
    content: 'This resonates with me so much. Great insights!',
    time: '12h ago',
  },
  {
    id: '8',
    author: 'Ryan Martinez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan',
    content: 'Fantastic post! Looking forward to more content like this.',
    time: '14h ago',
  },
  {
    id: '9',
    author: 'Amanda Lee',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda',
    content: 'Very informative and well articulated. Thanks for sharing!',
    time: '16h ago',
  },
  {
    id: '10',
    author: 'Chris Anderson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
    content: 'I completely agree with your perspective on this topic.',
    time: '18h ago',
  },
];

const CommentSection = ({ postId, initialComments, onCommentAdded }: CommentSectionProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments || mockComments);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: user?.name || 'You',
      avatar: user?.avatar || '',
      content: newComment.trim(),
      time: 'Just now',
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
    onCommentAdded();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleEditComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setEditingCommentId(commentId);
      setEditContent(comment.content);
    }
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editContent.trim()) return;
    
    setComments(prev => prev.map(comment =>
      comment.id === commentId
        ? { ...comment, content: editContent.trim(), time: 'Edited' }
        : comment
    ));
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleDeleteComment = (commentId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this comment?');
    if (confirmed) {
      setComments(prev => prev.filter(c => c.id !== commentId));
      // Note: Would decrease comment count in parent, but keeping simple for now
    }
  };

  const isUserComment = (author: string) => {
    return author === user?.name || author === 'You';
  };

  return (
    <div className="border-t border-border bg-muted/30">
      {/* Comments List */}
      <div className="max-h-[500px] overflow-y-auto">
        <div className="p-4 space-y-4">
          {comments.slice(0, 5).map((comment) => {
            const isEditing = editingCommentId === comment.id;
            const isOwn = isUserComment(comment.author);

            return (
              <div key={comment.id} className="flex gap-3 group">
                <img
                  src={comment.avatar}
                  alt={comment.author}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex-shrink-0 object-cover"
                />
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="bg-card rounded-lg p-3 shadow-sm border-2 border-primary">
                      <Input
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="h-9 mb-2"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(comment.id)}
                          className="h-7 text-xs gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="h-7 text-xs gap-1"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-card rounded-lg p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm">{comment.author}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground flex-shrink-0">{comment.time}</span>
                          {isOwn && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem
                                  onClick={() => handleEditComment(comment.id)}
                                  className="gap-2 text-xs cursor-pointer"
                                >
                                  <Edit className="w-3 h-3" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-foreground">{comment.content}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {comments.length > 5 && (
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground mb-3 px-1">
                {comments.length - 5} more {comments.length - 5 === 1 ? 'comment' : 'comments'}
              </p>
              <div className="space-y-4 pr-3">
                {comments.slice(5).map((comment) => {
                    const isEditing = editingCommentId === comment.id;
                    const isOwn = isUserComment(comment.author);

                    return (
                      <div key={comment.id} className="flex gap-3 group">
                        <img
                          src={comment.avatar}
                          alt={comment.author}
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex-shrink-0 object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="bg-card rounded-lg p-3 shadow-sm border-2 border-primary">
                              <Input
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="h-9 mb-2"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEdit(comment.id)}
                                  className="h-7 text-xs gap-1"
                                >
                                  <Check className="w-3 h-3" />
                                  Save
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                  className="h-7 text-xs gap-1"
                                >
                                  <X className="w-3 h-3" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-card rounded-lg p-3 shadow-sm">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="font-semibold text-sm">{comment.author}</p>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground flex-shrink-0">{comment.time}</span>
                                  {isOwn && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <MoreVertical className="w-3 h-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-32">
                                        <DropdownMenuItem
                                          onClick={() => handleEditComment(comment.id)}
                                          className="gap-2 text-xs cursor-pointer"
                                        >
                                          <Edit className="w-3 h-3" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleDeleteComment(comment.id)}
                                          className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-foreground">{comment.content}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Comment */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2 sm:gap-3">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex-shrink-0 object-cover"
          />
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-9 sm:h-10 text-sm"
            />
            <Button
              size="icon"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;

