import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConnections } from '@/contexts/ConnectionsContext';
import DesktopNav from '@/components/DesktopNav';
import MobileNav from '@/components/MobileNav';
import ProfileEditModal from '@/components/ProfileEditModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Calendar, Mail, Linkedin, Edit, MessageCircle, ArrowLeft, Plus, Phone, Globe, Camera, UserCheck, UserPlus, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  name: string;
  avatar: string;
  university: string;
  year: string;
  major?: string;
  email?: string;
}

interface ProfileData {
  name: string;
  bio: string;
  major: string;
  graduationYear: string;
  jobTitle: string;
  company: string;
  location: string;
  linkedin: string;
  email: string;
  phone: string;
  website: string;
  avatar: string;
  banner: string;
}

const Profile = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isConnected, hasPendingRequest, sendConnectionRequest } = useConnections();
  
  // Get user data from navigation state (when viewing other user's profile)
  const viewingUserData = location.state?.userData as UserData | undefined;
  const isOwnProfile = !viewingUserData;
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Check connection status
  const connected = !isOwnProfile && isConnected(viewingUserData?.name || '');
  const requestPending = !isOwnProfile && hasPendingRequest(viewingUserData?.name || '');
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || '',
    bio: 'Passionate about technology and building meaningful connections. Always eager to help fellow alumni and students navigate their career paths.',
    major: user?.major || 'Computer Science',
    graduationYear: user?.graduationYear || '2020',
    jobTitle: 'Software Engineer',
    company: 'Tech Company',
    location: 'San Francisco, CA',
    linkedin: 'https://linkedin.com/in/yourprofile',
    email: user?.email || '',
    phone: '+1 (555) 000-0000',
    website: 'https://yourwebsite.com',
    avatar: user?.avatar || '',
    banner: '',
  });

  // Update profile data when user changes
  useEffect(() => {
    if (user && isOwnProfile) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        avatar: user.avatar || prev.avatar,
        major: user.major || prev.major,
        graduationYear: user.graduationYear || prev.graduationYear,
      }));
    }
  }, [user, isOwnProfile]);
  
  // Use either logged-in user data or the data passed from feed
  const displayUser = isOwnProfile ? profileData : {
    ...profileData,
    name: viewingUserData.name,
    avatar: viewingUserData.avatar,
    university: viewingUserData.university,
    graduationYear: viewingUserData.year,
    major: viewingUserData.major || 'Not specified',
    email: viewingUserData.email || 'Not available',
  };

  const handleSaveProfile = (data: ProfileData) => {
    setProfileData(data);
    toast({
      title: 'Profile updated!',
      description: 'Your profile has been updated successfully',
    });
  };

  const handleConnect = () => {
    if (viewingUserData) {
      sendConnectionRequest(viewingUserData);
      toast({
        title: 'Connection request sent!',
        description: `Your request has been sent to ${viewingUserData.name}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DesktopNav />
      <MobileNav />
      
      <main className="min-h-screen pb-20 md:pb-0 md:ml-64">
        <div className="max-w-4xl mx-auto">
          {/* Back Button for Other Profiles */}
          {!isOwnProfile && (
            <div className="p-4 sm:p-6">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="gap-2 -ml-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Feed
              </Button>
            </div>
          )}

          {/* Cover & Avatar */}
          <div className="relative">
            <div className="h-40 sm:h-48 bg-gradient-to-r from-primary to-secondary overflow-hidden">
              {displayUser.banner && (
                <img
                  src={displayUser.banner}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="absolute -bottom-12 sm:-bottom-16 left-4 sm:left-8">
              <img
                src={displayUser.avatar}
                alt={displayUser.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-background object-cover"
              />
            </div>
          </div>

          <div className="px-4 sm:px-8 pt-16 sm:pt-20 pb-8">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 truncate">{displayUser.name}</h1>
                <p className="text-sm sm:text-base text-muted-foreground mb-1">
                  {displayUser.major} • {user?.university}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                  {displayUser.jobTitle} at {displayUser.company}
                </p>
                <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{displayUser.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>Class of {displayUser.graduationYear}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                {isOwnProfile ? (
                  <Button className="gap-2 flex-1 sm:flex-none" onClick={() => setIsEditModalOpen(true)}>
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button 
                      className="gap-2 flex-1 sm:flex-none"
                      onClick={() => navigate('/chat')}
                      disabled={!connected}
                      title={connected ? 'Send a message' : 'Connect first to message'}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </Button>
                    {connected ? (
                      <Button variant="outline" className="gap-2 flex-1 sm:flex-none" disabled>
                        <UserCheck className="w-4 h-4" />
                        Connected
                      </Button>
                    ) : requestPending ? (
                      <Button variant="outline" className="gap-2 flex-1 sm:flex-none" disabled>
                        <Clock className="w-4 h-4" />
                        Pending
                      </Button>
                    ) : (
                      <Button variant="outline" className="gap-2 flex-1 sm:flex-none" onClick={handleConnect}>
                        <UserPlus className="w-4 h-4" />
                        Connect
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* About */}
              <Card className="p-5 sm:p-6 md:col-span-2 space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-3">About</h2>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {displayUser.bio}
                  </p>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-4">Experience</h2>
                  <div className="space-y-4">
                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base">{displayUser.jobTitle}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{displayUser.company} • 2021 - Present</p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{displayUser.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-4">Education</h2>
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base">{user?.university}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{displayUser.major}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Class of {displayUser.graduationYear}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Contact & Links */}
              <Card className="p-5 sm:p-6 space-y-5 h-fit">
                <h2 className="text-lg sm:text-xl font-semibold">Contact</h2>
                <div className="space-y-3">
                  {displayUser.email && displayUser.email !== 'Not available' && (
                    <a 
                      href={`mailto:${displayUser.email}`} 
                      className="flex items-center gap-3 text-xs sm:text-sm hover:text-primary transition-colors group"
                    >
                      <Mail className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate group-hover:underline">{displayUser.email}</span>
                    </a>
                  )}
                  {displayUser.phone && (
                    <a 
                      href={`tel:${displayUser.phone}`} 
                      className="flex items-center gap-3 text-xs sm:text-sm hover:text-primary transition-colors group"
                    >
                      <Phone className="w-5 h-5 flex-shrink-0" />
                      <span className="group-hover:underline">{displayUser.phone}</span>
                    </a>
                  )}
                  {displayUser.linkedin && (
                    <a 
                      href={displayUser.linkedin} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-xs sm:text-sm hover:text-primary transition-colors group"
                    >
                      <Linkedin className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate group-hover:underline">LinkedIn</span>
                    </a>
                  )}
                  {displayUser.website && (
                    <a 
                      href={displayUser.website} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-xs sm:text-sm hover:text-primary transition-colors group"
                    >
                      <Globe className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate group-hover:underline">Website</span>
                    </a>
                  )}
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="font-semibold mb-3 text-base">Stats</h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-primary/5">
                      <p className="text-xl sm:text-2xl font-bold text-primary">156</p>
                      <p className="text-xs text-muted-foreground mt-1">Connections</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/5">
                      <p className="text-xl sm:text-2xl font-bold text-secondary">23</p>
                      <p className="text-xs text-muted-foreground mt-1">Posts</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Profile Edit Modal */}
      {isOwnProfile && (
        <ProfileEditModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleSaveProfile}
          currentData={profileData}
        />
      )}

      <MobileNav />
    </div>
  );
};

export default Profile;
