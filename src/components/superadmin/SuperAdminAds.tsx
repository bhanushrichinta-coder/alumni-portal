import { useState, useEffect } from 'react';
import { apiClient, AdResponse } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Image, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2, 
  RefreshCw,
  Video,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface University {
  id: string;
  name: string;
  logo?: string;
  is_enabled: boolean;
}

const SuperAdminAds = () => {
  const { toast } = useToast();
  const [ads, setAds] = useState<AdResponse[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdResponse | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    media_url: '',
    media_type: 'image' as 'image' | 'video',
    link_url: '',
    placement: 'feed' as 'left-sidebar' | 'right-sidebar' | 'feed',
    targetAll: true,
    selectedUniversities: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [adsResponse, universitiesResponse] = await Promise.all([
        apiClient.getAds(true),
        apiClient.getSuperAdminUniversities()
      ]);
      setAds(adsResponse.ads);
      setUniversities(universitiesResponse);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load ads',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.media_url) {
      toast({
        title: 'Missing information',
        description: 'Please fill in title and media URL',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const newAd = await apiClient.createAd({
        title: formData.title,
        description: formData.description || undefined,
        media_url: formData.media_url,
        media_type: formData.media_type,
        link_url: formData.link_url || undefined,
        placement: formData.placement,
        target_universities: formData.targetAll ? ['all'] : formData.selectedUniversities,
      });

      setAds([newAd, ...ads]);
      toast({
        title: 'Ad created',
        description: `Ad will be shown to ${formData.targetAll ? 'all universities' : formData.selectedUniversities.length + ' universities'}`,
      });
      resetForm();
    } catch (error: any) {
      console.error('Failed to create ad:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create ad',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (ad: AdResponse) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description || '',
      media_url: ad.media_url,
      media_type: ad.media_type,
      link_url: ad.link_url || '',
      placement: ad.placement,
      targetAll: ad.target_universities.includes('all'),
      selectedUniversities: ad.target_universities.filter(id => id !== 'all'),
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingAd) return;

    setIsSaving(true);
    try {
      const updatedAd = await apiClient.updateAd(editingAd.id, {
        title: formData.title,
        description: formData.description || undefined,
        media_url: formData.media_url,
        media_type: formData.media_type,
        link_url: formData.link_url || undefined,
        placement: formData.placement,
        target_universities: formData.targetAll ? ['all'] : formData.selectedUniversities,
      });

      setAds(ads.map(ad => ad.id === editingAd.id ? updatedAd : ad));
      toast({
        title: 'Ad updated',
        description: 'Ad has been updated successfully',
      });
      resetForm();
    } catch (error: any) {
      console.error('Failed to update ad:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update ad',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (ad: AdResponse) => {
    try {
      const updatedAd = await apiClient.toggleAdStatus(ad.id);
      setAds(ads.map(a => a.id === ad.id ? updatedAd : a));
      toast({
        title: updatedAd.is_active ? 'Ad activated' : 'Ad deactivated',
        description: updatedAd.is_active ? 'Ad is now visible to users' : 'Ad is no longer visible',
      });
    } catch (error: any) {
      console.error('Failed to toggle ad:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to toggle ad status',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (ad: AdResponse) => {
    if (!window.confirm('Are you sure you want to delete this ad? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.deleteAd(ad.id);
      setAds(ads.filter(a => a.id !== ad.id));
      toast({
        title: 'Ad deleted',
        description: 'Ad has been removed',
      });
    } catch (error: any) {
      console.error('Failed to delete ad:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete ad',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      media_url: '',
      media_type: 'image',
      link_url: '',
      placement: 'feed',
      targetAll: true,
      selectedUniversities: [],
    });
    setEditingAd(null);
    setIsModalOpen(false);
  };

  const toggleUniversity = (uniId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedUniversities: prev.selectedUniversities.includes(uniId)
        ? prev.selectedUniversities.filter(id => id !== uniId)
        : [...prev.selectedUniversities, uniId]
    }));
  };

  const getTargetDisplay = (targets: string[]) => {
    if (targets.includes('all')) return 'All Universities';
    const names = targets.map(id => universities.find(u => u.id === id)?.name || id);
    if (names.length <= 2) return names.join(', ');
    return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`;
  };

  const getPlacementLabel = (placement: string) => {
    switch (placement) {
      case 'left-sidebar': return 'Left Sidebar';
      case 'right-sidebar': return 'Right Sidebar';
      case 'feed': return 'In Feed';
      default: return placement;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold">Advertisement Management</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Create and manage ads across all universities
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={loadData} title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Ad
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-2xl font-bold">{ads.length}</p>
            <p className="text-xs text-muted-foreground">Total Ads</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-2xl font-bold text-green-600">{ads.filter(a => a.is_active).length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-2xl font-bold">{ads.reduce((sum, a) => sum + a.impressions, 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Views</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-2xl font-bold">{ads.reduce((sum, a) => sum + a.clicks, 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Clicks</p>
          </div>
        </div>
      </Card>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ads.length === 0 ? (
          <Card className="p-8 text-center col-span-full">
            <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No ads created yet</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Ad
            </Button>
          </Card>
        ) : (
          ads.map(ad => (
            <Card key={ad.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Media Preview */}
              <div className="relative aspect-video bg-muted">
                {ad.media_type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-black/10">
                    <Video className="w-12 h-12 text-muted-foreground" />
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      Video
                    </span>
                  </div>
                ) : (
                  <img 
                    src={ad.media_url} 
                    alt={ad.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x225?text=Image+Not+Found';
                    }}
                  />
                )}
                <Badge 
                  variant={ad.is_active ? 'default' : 'secondary'} 
                  className="absolute top-2 right-2"
                >
                  {ad.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">{ad.title}</h3>
                
                {ad.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{ad.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Placement:</span>
                    <Badge variant="outline">{getPlacementLabel(ad.placement)}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Target:</span>
                    <span className="text-right max-w-[150px] truncate" title={getTargetDisplay(ad.target_universities)}>
                      {getTargetDisplay(ad.target_universities)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDate(ad.created_at)}</span>
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{ad.impressions.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    <span>{ad.clicks.toLocaleString()} clicks</span>
                  </div>
                  {ad.impressions > 0 && (
                    <div className="ml-auto">
                      <span className="font-medium">
                        {((ad.clicks / ad.impressions) * 100).toFixed(1)}% CTR
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(ad)} className="flex-1">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleToggleActive(ad)}
                    title={ad.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {ad.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                  {ad.link_url && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(ad.link_url, '_blank')}
                      title="Open link"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDelete(ad)}
                    className="text-destructive hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setIsModalOpen(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}</DialogTitle>
            <DialogDescription>
              {editingAd 
                ? 'Update the advertisement details below.' 
                : 'Fill in the details to create a new advertisement.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Ad Title *</Label>
              <Input
                id="title"
                placeholder="Master Your Career"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Professional development courses from top universities"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mediaType">Media Type *</Label>
                <Select 
                  value={formData.media_type} 
                  onValueChange={(value: 'image' | 'video') => setFormData({ ...formData, media_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="placement">Placement *</Label>
                <Select 
                  value={formData.placement} 
                  onValueChange={(value: 'left-sidebar' | 'right-sidebar' | 'feed') => setFormData({ ...formData, placement: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left-sidebar">Left Sidebar</SelectItem>
                    <SelectItem value="right-sidebar">Right Sidebar</SelectItem>
                    <SelectItem value="feed">In Feed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mediaUrl">
                {formData.media_type === 'video' ? 'Video' : 'Image'} URL *
              </Label>
              <Input
                id="mediaUrl"
                placeholder={formData.media_type === 'video' 
                  ? 'https://example.com/video.mp4' 
                  : 'https://example.com/image.jpg'}
                value={formData.media_url}
                onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
              />
              {formData.media_url && formData.media_type === 'image' && (
                <div className="mt-2 rounded-lg overflow-hidden border">
                  <img 
                    src={formData.media_url} 
                    alt="Preview" 
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkUrl">Link URL (Learn More Target)</Label>
              <Input
                id="linkUrl"
                placeholder="https://example.com/offer"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                This URL opens when user clicks "Learn More"
              </p>
            </div>

            <div className="space-y-3">
              <Label>Target Universities</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="targetAll"
                  checked={formData.targetAll}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    targetAll: checked as boolean,
                    selectedUniversities: checked ? [] : formData.selectedUniversities
                  })}
                />
                <label htmlFor="targetAll" className="text-sm font-medium cursor-pointer">
                  Show to all universities
                </label>
              </div>

              {!formData.targetAll && (
                <div className="space-y-2 pl-6 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {universities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No universities found</p>
                  ) : (
                    universities.map(uni => (
                      <div key={uni.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={uni.id}
                          checked={formData.selectedUniversities.includes(uni.id)}
                          onCheckedChange={() => toggleUniversity(uni.id)}
                        />
                        <label htmlFor={uni.id} className="text-sm cursor-pointer flex items-center gap-2">
                          {uni.logo && (
                            <img src={uni.logo} alt="" className="w-4 h-4 rounded" />
                          )}
                          {uni.name}
                          {!uni.is_enabled && (
                            <Badge variant="secondary" className="text-xs">Disabled</Badge>
                          )}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              )}
              {!formData.targetAll && formData.selectedUniversities.length === 0 && (
                <p className="text-xs text-destructive">
                  Please select at least one university
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={resetForm} disabled={isSaving}>
              Cancel
            </Button>
            <Button 
              onClick={editingAd ? handleUpdate : handleCreate} 
              disabled={isSaving || !formData.title || !formData.media_url || (!formData.targetAll && formData.selectedUniversities.length === 0)}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingAd ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingAd ? 'Update Ad' : 'Create Ad'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminAds;
