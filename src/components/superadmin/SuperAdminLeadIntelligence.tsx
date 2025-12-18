import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig 
} from '@/components/ui/chart';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, Scatter, ScatterChart,
  ZAxis, Treemap, FunnelChart, Funnel, LabelList
} from 'recharts';
import { 
  Flame, Thermometer, Snowflake, TrendingUp, TrendingDown, Users, Target,
  MousePointerClick, Eye, Map, Briefcase, GraduationCap, Award, Building2,
  Search, Filter, Download, RefreshCcw, ChevronRight, Mail, Phone, Linkedin,
  Calendar, Clock, ArrowUpRight, Sparkles, BarChart3, PieChart as PieChartIcon,
  Activity, Zap, Star, Crown, UserCheck, ExternalLink, Image
} from 'lucide-react';
import { apiClient, AdResponse } from '@/lib/api';

// Types
interface AlumniLead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  universityId: string;
  universityName: string;
  graduationYear: number;
  major: string;
  currentPosition?: string;
  company?: string;
  city: string;
  country: string;
  // Ad Interaction Metrics
  adClicks: number;
  adImpressions: number;
  lastAdInteraction?: string;
  clickedAds: string[];
  // Career Roadmap Metrics
  roadmapViews: number;
  roadmapGenerated: number;
  careerGoals: string[];
  mentorConnections: number;
  // Engagement Metrics
  loginFrequency: number;
  eventAttendance: number;
  groupMemberships: number;
  postsInteracted: number;
  // Calculated scores
  adEngagementScore: number;
  careerEngagementScore: number;
  overallLeadScore: number;
  leadCategory: 'hot' | 'warm' | 'cold';
  lastActive: string;
}

interface University {
  id: string;
  name: string;
  shortName?: string;
}

// Chart configurations
const adChartConfig = {
  clicks: { label: 'Clicks', color: 'hsl(228 68% 58%)' },
  impressions: { label: 'Impressions', color: 'hsl(185 70% 48%)' },
  ctr: { label: 'CTR', color: 'hsl(18 85% 62%)' },
} satisfies ChartConfig;

const leadChartConfig = {
  hot: { label: 'Hot Leads', color: 'hsl(0 84% 60%)' },
  warm: { label: 'Warm Leads', color: 'hsl(38 92% 50%)' },
  cold: { label: 'Cold Leads', color: 'hsl(200 80% 50%)' },
} satisfies ChartConfig;

const engagementChartConfig = {
  adEngagement: { label: 'Ad Engagement', color: 'hsl(280 70% 60%)' },
  careerEngagement: { label: 'Career Engagement', color: 'hsl(150 70% 45%)' },
  overallScore: { label: 'Overall Score', color: 'hsl(228 68% 58%)' },
} satisfies ChartConfig;

// Generate mock data
const generateMockLeads = (universities: University[]): AlumniLead[] => {
  const firstNames = ['Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'James', 'Amanda', 'Robert', 'Jennifer', 'Christopher', 'Lisa', 'Daniel', 'Ashley', 'Matthew', 'Nicole', 'Andrew', 'Stephanie', 'Joshua', 'Michelle', 'Ryan'];
  const lastNames = ['Chen', 'Johnson', 'Williams', 'Brown', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White', 'Lopez', 'Lee'];
  const majors = ['Computer Science', 'Business Administration', 'Data Science', 'Engineering', 'Marketing', 'Finance', 'Product Management', 'Design', 'Economics', 'Psychology'];
  const positions = ['Software Engineer', 'Product Manager', 'Data Scientist', 'Marketing Manager', 'Business Analyst', 'UX Designer', 'Consultant', 'VP Engineering', 'Director of Operations', 'Startup Founder'];
  const companies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Stripe', 'Salesforce', 'Adobe', 'Spotify', 'Tesla', 'Uber', 'Airbnb', 'LinkedIn', 'Twitter'];
  const cities = ['San Francisco', 'New York', 'Boston', 'Seattle', 'Austin', 'Chicago', 'Los Angeles', 'Denver', 'Atlanta', 'Miami'];
  const careerGoals = ['Tech Lead', 'VP Engineering', 'Product Director', 'Startup Founder', 'C-Suite Executive', 'Principal Engineer', 'Chief Data Officer', 'CMO'];

  const leads: AlumniLead[] = [];
  
  universities.forEach(uni => {
    const numLeads = Math.floor(Math.random() * 30) + 20; // 20-50 leads per university
    
    for (let i = 0; i < numLeads; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      // Generate random metrics
      const adClicks = Math.floor(Math.random() * 50);
      const adImpressions = adClicks * (Math.floor(Math.random() * 10) + 5);
      const roadmapViews = Math.floor(Math.random() * 30);
      const roadmapGenerated = Math.floor(roadmapViews * 0.4);
      const loginFrequency = Math.floor(Math.random() * 30);
      const eventAttendance = Math.floor(Math.random() * 10);
      const mentorConnections = Math.floor(Math.random() * 5);
      const groupMemberships = Math.floor(Math.random() * 8);
      const postsInteracted = Math.floor(Math.random() * 50);
      
      // Calculate scores (0-100)
      const adEngagementScore = Math.min(100, Math.round(
        (adClicks * 3) + (adImpressions / 10) + (loginFrequency * 2)
      ));
      
      const careerEngagementScore = Math.min(100, Math.round(
        (roadmapViews * 4) + (roadmapGenerated * 10) + (mentorConnections * 15) + (eventAttendance * 5)
      ));
      
      const overallLeadScore = Math.round(
        (adEngagementScore * 0.4) + (careerEngagementScore * 0.4) + 
        ((groupMemberships + postsInteracted) * 0.2)
      );
      
      // Categorize lead
      let leadCategory: 'hot' | 'warm' | 'cold';
      if (overallLeadScore >= 70) leadCategory = 'hot';
      else if (overallLeadScore >= 40) leadCategory = 'warm';
      else leadCategory = 'cold';
      
      const daysAgo = Math.floor(Math.random() * 60);
      const lastActive = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
      
      leads.push({
        id: `lead_${uni.id}_${i}`,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
        phone: Math.random() > 0.3 ? `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}` : undefined,
        linkedin: Math.random() > 0.2 ? `linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}` : undefined,
        universityId: uni.id,
        universityName: uni.name,
        graduationYear: Math.floor(Math.random() * 10) + 2014,
        major: majors[Math.floor(Math.random() * majors.length)],
        currentPosition: positions[Math.floor(Math.random() * positions.length)],
        company: companies[Math.floor(Math.random() * companies.length)],
        city: cities[Math.floor(Math.random() * cities.length)],
        country: 'USA',
        adClicks,
        adImpressions,
        lastAdInteraction: adClicks > 0 ? new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString() : undefined,
        clickedAds: [],
        roadmapViews,
        roadmapGenerated,
        careerGoals: [careerGoals[Math.floor(Math.random() * careerGoals.length)]],
        mentorConnections,
        loginFrequency,
        eventAttendance,
        groupMemberships,
        postsInteracted,
        adEngagementScore,
        careerEngagementScore,
        overallLeadScore,
        leadCategory,
        lastActive,
      });
    }
  });
  
  return leads;
};

// Helper components
const LeadCategoryBadge = ({ category }: { category: 'hot' | 'warm' | 'cold' }) => {
  const config = {
    hot: { icon: Flame, color: 'bg-red-500/10 text-red-600 border-red-500/20', label: 'Hot Lead' },
    warm: { icon: Thermometer, color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', label: 'Warm Lead' },
    cold: { icon: Snowflake, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', label: 'Cold Lead' },
  };
  const { icon: Icon, color, label } = config[category];
  
  return (
    <Badge variant="outline" className={`${color} gap-1.5 font-medium`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </Badge>
  );
};

const ScoreGauge = ({ score, label, color }: { score: number; label: string; color: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-bold">{score}%</span>
    </div>
    <Progress value={score} className={`h-2 ${color}`} />
  </div>
);

const SuperAdminLeadIntelligence = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [leads, setLeads] = useState<AlumniLead[]>([]);
  const [ads, setAds] = useState<AdResponse[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<AlumniLead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [leadFilter, setLeadFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdsLoading, setIsAdsLoading] = useState(true);

  // Load ads data from API
  const loadAdsData = async () => {
    setIsAdsLoading(true);
    try {
      const adsResponse = await apiClient.getAds(true);
      setAds(adsResponse.ads || []);
    } catch (error) {
      console.error('Failed to load ads data:', error);
      setAds([]);
    } finally {
      setIsAdsLoading(false);
    }
  };

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Load universities
      const storedUniversities = JSON.parse(localStorage.getItem('alumni_universities') || '[]');
      const unis: University[] = storedUniversities.length > 0 
        ? storedUniversities.map((u: any) => ({ id: u.id, name: u.name, shortName: u.shortName }))
        : [
            { id: 'mit', name: 'Massachusetts Institute of Technology', shortName: 'MIT' },
            { id: 'stanford', name: 'Stanford University', shortName: 'Stanford' },
            { id: 'harvard', name: 'Harvard University', shortName: 'Harvard' },
          ];
      
      setUniversities(unis);
      
      // Generate or load leads
      const storedLeads = localStorage.getItem('super_admin_leads');
      if (storedLeads) {
        setLeads(JSON.parse(storedLeads));
      } else {
        const generatedLeads = generateMockLeads(unis);
        localStorage.setItem('super_admin_leads', JSON.stringify(generatedLeads));
        setLeads(generatedLeads);
      }
      
      // Load real ads data from API
      await loadAdsData();
      
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesUniversity = selectedUniversity === 'all' || lead.universityId === selectedUniversity;
      const matchesSearch = searchQuery === '' || 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.currentPosition?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = leadFilter === 'all' || lead.leadCategory === leadFilter;
      
      return matchesUniversity && matchesSearch && matchesCategory;
    });
  }, [leads, selectedUniversity, searchQuery, leadFilter]);

  // Real ads analytics from API
  const realAdsAnalytics = useMemo(() => {
    const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
    const totalImpressions = ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
    const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0';
    const activeAds = ads.filter(ad => ad.is_active).length;
    // Estimate conversions as ~12% of clicks (industry average)
    const estimatedConversions = Math.round(totalClicks * 0.12);
    
    return {
      totalAds: ads.length,
      activeAds,
      totalClicks,
      totalImpressions,
      avgCTR,
      estimatedConversions,
    };
  }, [ads]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const data = filteredLeads;
    const hot = data.filter(l => l.leadCategory === 'hot');
    const warm = data.filter(l => l.leadCategory === 'warm');
    const cold = data.filter(l => l.leadCategory === 'cold');
    
    // Use real ads data for ad metrics
    const totalAdClicks = realAdsAnalytics.totalClicks;
    const totalImpressions = realAdsAnalytics.totalImpressions;
    const avgCTR = realAdsAnalytics.avgCTR;
    
    const totalRoadmapViews = data.reduce((sum, l) => sum + l.roadmapViews, 0);
    const totalRoadmapGenerated = data.reduce((sum, l) => sum + l.roadmapGenerated, 0);
    const avgMentorConnections = data.length > 0 
      ? (data.reduce((sum, l) => sum + l.mentorConnections, 0) / data.length).toFixed(1) 
      : '0';
    
    const avgOverallScore = data.length > 0
      ? Math.round(data.reduce((sum, l) => sum + l.overallLeadScore, 0) / data.length)
      : 0;
    
    return {
      totalLeads: data.length,
      hotLeads: hot.length,
      warmLeads: warm.length,
      coldLeads: cold.length,
      totalAdClicks,
      totalImpressions,
      avgCTR,
      totalRoadmapViews,
      totalRoadmapGenerated,
      avgMentorConnections,
      avgOverallScore,
      hotPercentage: data.length > 0 ? Math.round(hot.length / data.length * 100) : 0,
    };
  }, [filteredLeads, realAdsAnalytics]);

  // Chart data
  const leadDistributionData = [
    { name: 'Hot', value: analytics.hotLeads, fill: 'hsl(0 84% 60%)' },
    { name: 'Warm', value: analytics.warmLeads, fill: 'hsl(38 92% 50%)' },
    { name: 'Cold', value: analytics.coldLeads, fill: 'hsl(200 80% 50%)' },
  ];

  const universityComparisonData = useMemo(() => {
    return universities.map(uni => {
      const uniLeads = leads.filter(l => l.universityId === uni.id);
      const hot = uniLeads.filter(l => l.leadCategory === 'hot').length;
      const warm = uniLeads.filter(l => l.leadCategory === 'warm').length;
      const cold = uniLeads.filter(l => l.leadCategory === 'cold').length;
      
      return {
        name: uni.shortName || uni.name.split(' ')[0],
        hot,
        warm,
        cold,
        total: uniLeads.length,
        avgScore: uniLeads.length > 0 
          ? Math.round(uniLeads.reduce((sum, l) => sum + l.overallLeadScore, 0) / uniLeads.length)
          : 0,
      };
    });
  }, [universities, leads]);

  const monthlyTrendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.slice(0, currentMonth + 1).map((month, idx) => {
      const base = Math.floor(Math.random() * 20) + 30;
      return {
        month,
        adEngagement: base + Math.floor(Math.random() * 30),
        careerEngagement: base + Math.floor(Math.random() * 25) + 10,
        newLeads: Math.floor(Math.random() * 15) + 5,
        conversions: Math.floor(Math.random() * 8) + 2,
      };
    });
  }, []);

  // Real ads performance data by placement
  const adsByPlacementData = useMemo(() => {
    if (ads.length === 0) return [];
    
    const placements = ['feed', 'left-sidebar', 'right-sidebar'];
    return placements.map(placement => {
      const placementAds = ads.filter(ad => ad.placement === placement);
      const clicks = placementAds.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
      const impressions = placementAds.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
      return {
        placement: placement === 'feed' ? 'In Feed' : placement === 'left-sidebar' ? 'Left Sidebar' : 'Right Sidebar',
        clicks,
        impressions,
        ctr: impressions > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(1)) : 0,
        count: placementAds.length,
      };
    }).filter(p => p.count > 0);
  }, [ads]);

  const engagementRadarData = useMemo(() => {
    const data = filteredLeads;
    if (data.length === 0) return [];
    
    return [
      { subject: 'Ad Clicks', A: Math.round(data.reduce((s, l) => s + l.adClicks, 0) / data.length * 10) },
      { subject: 'Roadmap Views', A: Math.round(data.reduce((s, l) => s + l.roadmapViews, 0) / data.length * 5) },
      { subject: 'Mentor Connects', A: Math.round(data.reduce((s, l) => s + l.mentorConnections, 0) / data.length * 30) },
      { subject: 'Events', A: Math.round(data.reduce((s, l) => s + l.eventAttendance, 0) / data.length * 15) },
      { subject: 'Groups', A: Math.round(data.reduce((s, l) => s + l.groupMemberships, 0) / data.length * 15) },
      { subject: 'Posts', A: Math.round(data.reduce((s, l) => s + l.postsInteracted, 0) / data.length * 3) },
    ];
  }, [filteredLeads]);

  // Compute top performing ads from real API data
  const topPerformingAdsData = useMemo(() => {
    if (ads.length === 0) {
      // Fallback if no ads
      return [];
    }
    
    return [...ads]
      .filter(ad => ad.is_active || ad.impressions > 0 || ad.clicks > 0)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
      .map(ad => ({
        id: ad.id,
        name: ad.title,
        clicks: ad.clicks || 0,
        impressions: ad.impressions || 0,
        ctr: ad.impressions > 0 ? parseFloat(((ad.clicks / ad.impressions) * 100).toFixed(1)) : 0,
        placement: ad.placement,
        isActive: ad.is_active,
        mediaType: ad.media_type,
        mediaUrl: ad.media_url,
      }));
  }, [ads]);

  const careerPathsData = [
    { name: 'Tech Lead', value: 145, growth: 23 },
    { name: 'VP Engineering', value: 98, growth: 15 },
    { name: 'Product Director', value: 87, growth: 31 },
    { name: 'Startup Founder', value: 76, growth: 42 },
    { name: 'C-Suite', value: 54, growth: 18 },
  ];

  const handleRefreshData = () => {
    const generatedLeads = generateMockLeads(universities);
    localStorage.setItem('super_admin_leads', JSON.stringify(generatedLeads));
    setLeads(generatedLeads);
  };

  const handleViewLead = (lead: AlumniLead) => {
    setSelectedLead(lead);
    setIsLeadModalOpen(true);
  };

  const handleExportData = () => {
    const csvContent = [
      ['Name', 'Email', 'University', 'Lead Category', 'Overall Score', 'Ad Clicks', 'Roadmap Views'].join(','),
      ...filteredLeads.map(lead => [
        lead.name,
        lead.email,
        lead.universityName,
        lead.leadCategory.toUpperCase(),
        lead.overallLeadScore,
        lead.adClicks,
        lead.roadmapViews,
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lead-intelligence-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header Skeleton */}
        <div className="p-4 sm:p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-xl shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 via-secondary/30 to-accent/30 animate-pulse" />
              <div className="space-y-2">
                <div className="h-8 w-64 bg-gradient-to-r from-primary/20 to-secondary/20 rounded animate-pulse" />
                <div className="h-4 w-80 bg-muted/50 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-card border border-l-4 border-l-primary/30">
              <div className="flex items-center justify-between mb-2">
                <div className="w-5 h-5 rounded bg-primary/20 animate-pulse" />
                <div className="w-12 h-4 rounded-full bg-muted animate-pulse" />
              </div>
              <div className="h-8 w-16 bg-muted rounded animate-pulse mb-1" />
              <div className="h-3 w-20 bg-muted/50 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-card border">
              <div className="h-5 w-40 bg-muted rounded animate-pulse mb-4" />
              <div className="h-64 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <div className="h-3 w-24 bg-muted/50 rounded animate-pulse mx-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Message */}
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative mb-4">
            <div className="w-14 h-14 rounded-full border-4 border-primary/20 animate-pulse" />
            <div className="w-14 h-14 rounded-full border-4 border-t-primary border-transparent animate-spin absolute inset-0" />
            <Target className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Analyzing lead intelligence data...</p>
          <div className="flex gap-1 mt-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-0 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg flex-shrink-0">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Lead Intelligence Center
              </h1>
              <p className="text-muted-foreground mt-1">
                AI-powered insights combining ad engagement & career roadmap analytics
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
              <SelectTrigger className="w-[180px] sm:w-[220px]">
                <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Select University" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Universities</SelectItem>
                {universities.map(uni => (
                  <SelectItem key={uni.id} value={uni.id}>
                    {uni.shortName || uni.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" onClick={handleRefreshData} title="Refresh Data">
              <RefreshCcw className="w-4 h-4" />
            </Button>
            
            <Button variant="outline" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Leads */}
        <Card className="p-4 hover:shadow-lg transition-all duration-300 group cursor-pointer border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-primary" />
            <Badge variant="secondary" className="text-[10px]">Total</Badge>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{analytics.totalLeads}</p>
          <p className="text-xs text-muted-foreground mt-1">Potential Leads</p>
        </Card>

        {/* Hot Leads */}
        <Card className="p-4 hover:shadow-lg transition-all duration-300 group cursor-pointer border-l-4 border-l-red-500" onClick={() => setLeadFilter('hot')}>
          <div className="flex items-center justify-between mb-2">
            <Flame className="w-5 h-5 text-red-500" />
            <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px]">{analytics.hotPercentage}%</Badge>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-red-600">{analytics.hotLeads}</p>
          <p className="text-xs text-muted-foreground mt-1">Hot Leads</p>
        </Card>

        {/* Warm Leads */}
        <Card className="p-4 hover:shadow-lg transition-all duration-300 group cursor-pointer border-l-4 border-l-amber-500" onClick={() => setLeadFilter('warm')}>
          <div className="flex items-center justify-between mb-2">
            <Thermometer className="w-5 h-5 text-amber-500" />
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-600">{analytics.warmLeads}</p>
          <p className="text-xs text-muted-foreground mt-1">Warm Leads</p>
        </Card>

        {/* Cold Leads */}
        <Card className="p-4 hover:shadow-lg transition-all duration-300 group cursor-pointer border-l-4 border-l-blue-500" onClick={() => setLeadFilter('cold')}>
          <div className="flex items-center justify-between mb-2">
            <Snowflake className="w-5 h-5 text-blue-500" />
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">{analytics.coldLeads}</p>
          <p className="text-xs text-muted-foreground mt-1">Cold Leads</p>
        </Card>

        {/* Avg CTR */}
        <Card className="p-4 hover:shadow-lg transition-all duration-300 group cursor-pointer border-l-4 border-l-green-500">
          <div className="flex items-center justify-between mb-2">
            <MousePointerClick className="w-5 h-5 text-green-500" />
            <ArrowUpRight className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">{analytics.avgCTR}%</p>
          <p className="text-xs text-muted-foreground mt-1">Avg. CTR</p>
        </Card>

        {/* Avg Lead Score */}
        <Card className="p-4 hover:shadow-lg transition-all duration-300 group cursor-pointer border-l-4 border-l-violet-500">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-5 h-5 text-violet-500" />
            <Sparkles className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-violet-600">{analytics.avgOverallScore}</p>
          <p className="text-xs text-muted-foreground mt-1">Avg. Score</p>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full sm:w-auto flex flex-wrap gap-1 h-auto p-1 bg-muted/50">
          <TabsTrigger value="overview" className="flex items-center gap-2 text-xs sm:text-sm">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="ads" className="flex items-center gap-2 text-xs sm:text-sm">
            <MousePointerClick className="w-4 h-4" />
            <span className="hidden sm:inline">Ad Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="career" className="flex items-center gap-2 text-xs sm:text-sm">
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Career Roadmap</span>
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2 text-xs sm:text-sm">
            <UserCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Lead List</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Lead Distribution Pie Chart */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-primary" />
                  Lead Distribution
                </h3>
              </div>
              <ChartContainer config={leadChartConfig} className="h-[250px] w-full">
                <PieChart>
                  <Pie
                    data={leadDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {leadDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </Card>

            {/* University Comparison */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  University Comparison
                </h3>
              </div>
              <ChartContainer config={leadChartConfig} className="h-[250px] w-full">
                <BarChart data={universityComparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={60} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="hot" stackId="a" fill="hsl(0 84% 60%)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="warm" stackId="a" fill="hsl(38 92% 50%)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="cold" stackId="a" fill="hsl(200 80% 50%)" radius={[4, 4, 4, 4]} />
                </BarChart>
              </ChartContainer>
            </Card>

            {/* Engagement Radar */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Engagement Radar
                </h3>
              </div>
              <ChartContainer config={engagementChartConfig} className="h-[250px] w-full">
                <RadarChart data={engagementRadarData}>
                  <PolarGrid className="stroke-muted" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Engagement"
                    dataKey="A"
                    stroke="hsl(228 68% 58%)"
                    fill="hsl(228 68% 58%)"
                    fillOpacity={0.5}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RadarChart>
              </ChartContainer>
            </Card>
          </div>

          {/* Trend Chart - Full Width */}
          <Card className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Monthly Engagement Trends
              </h3>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary"></div>
                  <span className="text-muted-foreground">Ad Engagement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span className="text-muted-foreground">Career Engagement</span>
                </div>
              </div>
            </div>
            <ChartContainer config={engagementChartConfig} className="h-[300px] w-full">
              <AreaChart data={monthlyTrendData}>
                <defs>
                  <linearGradient id="colorAd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(228 68% 58%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(228 68% 58%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCareer" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(150 70% 45%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(150 70% 45%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="adEngagement"
                  stroke="hsl(228 68% 58%)"
                  fillOpacity={1}
                  fill="url(#colorAd)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="careerEngagement"
                  stroke="hsl(150 70% 45%)"
                  fillOpacity={1}
                  fill="url(#colorCareer)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </Card>
        </TabsContent>

        {/* Ad Analytics Tab */}
        <TabsContent value="ads" className="space-y-4">
          {/* Real-time data indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isAdsLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-xs text-muted-foreground">
                {isAdsLoading ? 'Loading real-time data...' : `Real-time data from ${realAdsAnalytics.totalAds} ads (${realAdsAnalytics.activeAds} active)`}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={loadAdsData} disabled={isAdsLoading} className="gap-2">
              <RefreshCcw className={`w-3 h-3 ${isAdsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MousePointerClick className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Clicks</p>
                  <p className="text-2xl font-bold">{realAdsAnalytics.totalClicks.toLocaleString()}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Impressions</p>
                  <p className="text-2xl font-bold">{realAdsAnalytics.totalImpressions.toLocaleString()}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg. CTR</p>
                  <p className="text-2xl font-bold">{realAdsAnalytics.avgCTR}%</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Est. Conversions</p>
                  <p className="text-2xl font-bold">{realAdsAnalytics.estimatedConversions.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Performing Ads */}
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-primary" />
                Top Performing Ads
                {ads.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-[10px]">Live Data</Badge>
                )}
              </h3>
              {topPerformingAdsData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <Image className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No ads data available</p>
                  <p className="text-xs text-muted-foreground mt-1">Create ads in the Ads Management section</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topPerformingAdsData.map((ad, idx) => (
                    <div key={ad.id || idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
                          idx === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                          idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                          idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                          'bg-muted-foreground/30'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{ad.name}</p>
                            {ad.isActive ? (
                              <Badge variant="default" className="text-[8px] h-4 px-1">Active</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[8px] h-4 px-1">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {ad.impressions.toLocaleString()} impressions • {ad.placement?.replace('-', ' ') || 'feed'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{ad.clicks.toLocaleString()} clicks</p>
                        <p className={`text-xs ${ad.ctr >= 2 ? 'text-green-500' : 'text-muted-foreground'}`}>
                          {ad.ctr}% CTR
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Ad Performance by Placement */}
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                Performance by Placement
                {ads.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-[10px]">Live Data</Badge>
                )}
              </h3>
              {adsByPlacementData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[280px] text-center">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <BarChart3 className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No placement data available</p>
                </div>
              ) : (
                <ChartContainer config={adChartConfig} className="h-[280px] w-full">
                  <ComposedChart data={adsByPlacementData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="placement" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar yAxisId="left" dataKey="clicks" name="Clicks" fill="hsl(228 68% 58%)" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="left" dataKey="impressions" name="Impressions" fill="hsl(185 70% 48%)" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="ctr" name="CTR %" stroke="hsl(18 85% 62%)" strokeWidth={2} dot={{ fill: 'hsl(18 85% 62%)' }} />
                  </ComposedChart>
                </ChartContainer>
              )}
            </Card>
          </div>

          {/* All Ads Performance Table */}
          {ads.length > 0 && (
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-primary" />
                All Ads Performance
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Ad Title</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Placement</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Impressions</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Clicks</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">CTR</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ads.map(ad => (
                      <tr key={ad.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center overflow-hidden">
                              {ad.media_type === 'video' ? (
                                <Zap className="w-4 h-4 text-muted-foreground" />
                              ) : ad.media_url ? (
                                <img src={ad.media_url} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                              ) : (
                                <Image className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <span className="font-medium truncate max-w-[200px]">{ad.title}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant="outline" className="text-xs">
                            {ad.placement === 'feed' ? 'In Feed' : ad.placement === 'left-sidebar' ? 'Left Sidebar' : 'Right Sidebar'}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">{(ad.impressions || 0).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{(ad.clicks || 0).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`font-mono ${ad.impressions > 0 && (ad.clicks / ad.impressions) * 100 >= 2 ? 'text-green-500' : ''}`}>
                            {ad.impressions > 0 ? `${((ad.clicks / ad.impressions) * 100).toFixed(1)}%` : '—'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {ad.is_active ? (
                            <Badge variant="default" className="text-[10px]">Active</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Career Roadmap Tab */}
        <TabsContent value="career" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Map className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Roadmap Views</p>
                  <p className="text-2xl font-bold">{analytics.totalRoadmapViews.toLocaleString()}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Generated</p>
                  <p className="text-2xl font-bold">{analytics.totalRoadmapGenerated}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg. Mentors</p>
                  <p className="text-2xl font-bold">{analytics.avgMentorConnections}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Goals</p>
                  <p className="text-2xl font-bold">{Math.round(filteredLeads.length * 0.65)}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Popular Career Paths */}
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-primary" />
                Popular Career Goals
              </h3>
              <div className="space-y-4">
                {careerPathsData.map((path, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{path.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{path.value}</span>
                        <Badge variant="secondary" className="text-[10px] text-green-600">
                          +{path.growth}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={path.value / 1.5} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Career Engagement by University */}
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-primary" />
                Career Engagement by University
              </h3>
              <ChartContainer config={engagementChartConfig} className="h-[280px] w-full">
                <BarChart data={universityComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="avgScore" fill="hsl(280 70% 60%)" radius={[4, 4, 0, 0]}>
                    {universityComparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${280 - index * 30} 70% ${50 + index * 5}%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </Card>
          </div>
        </TabsContent>

        {/* Lead List Tab */}
        <TabsContent value="leads" className="space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, company, or position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={leadFilter} onValueChange={(v: any) => setLeadFilter(v)}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leads</SelectItem>
                  <SelectItem value="hot">Hot Leads</SelectItem>
                  <SelectItem value="warm">Warm Leads</SelectItem>
                  <SelectItem value="cold">Cold Leads</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Lead Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredLeads.slice(0, 12).map(lead => (
              <Card 
                key={lead.id} 
                className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => handleViewLead(lead)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${
                      lead.leadCategory === 'hot' ? 'bg-gradient-to-br from-red-500 to-orange-500' :
                      lead.leadCategory === 'warm' ? 'bg-gradient-to-br from-amber-500 to-yellow-500' :
                      'bg-gradient-to-br from-blue-500 to-cyan-500'
                    }`}>
                      {lead.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-semibold group-hover:text-primary transition-colors">{lead.name}</h4>
                      <p className="text-xs text-muted-foreground">{lead.currentPosition}</p>
                    </div>
                  </div>
                  <LeadCategoryBadge category={lead.leadCategory} />
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="truncate">{lead.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span className="truncate">{lead.universityName.split(' ')[0]} • {lead.graduationYear}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">{lead.overallLeadScore}</p>
                    <p className="text-[10px] text-muted-foreground">Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-orange-500">{lead.adClicks}</p>
                    <p className="text-[10px] text-muted-foreground">Ad Clicks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-500">{lead.roadmapViews}</p>
                    <p className="text-[10px] text-muted-foreground">Roadmaps</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Active {new Date(lead.lastActive).toLocaleDateString()}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Card>
            ))}
          </div>

          {filteredLeads.length > 12 && (
            <div className="text-center">
              <Button variant="outline" className="gap-2">
                View All {filteredLeads.length} Leads
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Lead Detail Modal */}
      <Dialog open={isLeadModalOpen} onOpenChange={setIsLeadModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedLead && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl text-white ${
                    selectedLead.leadCategory === 'hot' ? 'bg-gradient-to-br from-red-500 to-orange-500' :
                    selectedLead.leadCategory === 'warm' ? 'bg-gradient-to-br from-amber-500 to-yellow-500' :
                    'bg-gradient-to-br from-blue-500 to-cyan-500'
                  }`}>
                    {selectedLead.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <DialogTitle className="text-xl">{selectedLead.name}</DialogTitle>
                      <LeadCategoryBadge category={selectedLead.leadCategory} />
                    </div>
                    <p className="text-muted-foreground">{selectedLead.currentPosition} at {selectedLead.company}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button variant="outline" className="justify-start gap-2" asChild>
                    <a href={`mailto:${selectedLead.email}`}>
                      <Mail className="w-4 h-4" />
                      <span className="truncate text-xs">{selectedLead.email}</span>
                    </a>
                  </Button>
                  {selectedLead.phone && (
                    <Button variant="outline" className="justify-start gap-2" asChild>
                      <a href={`tel:${selectedLead.phone}`}>
                        <Phone className="w-4 h-4" />
                        <span className="truncate text-xs">{selectedLead.phone}</span>
                      </a>
                    </Button>
                  )}
                  {selectedLead.linkedin && (
                    <Button variant="outline" className="justify-start gap-2" asChild>
                      <a href={`https://${selectedLead.linkedin}`} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4" />
                        <span className="truncate text-xs">LinkedIn</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  )}
                </div>

                {/* Lead Score Breakdown */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-500" />
                    Lead Score Breakdown
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 relative">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-muted"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${selectedLead.overallLeadScore * 2.51} 251`}
                            className={
                              selectedLead.leadCategory === 'hot' ? 'text-red-500' :
                              selectedLead.leadCategory === 'warm' ? 'text-amber-500' :
                              'text-blue-500'
                            }
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold">{selectedLead.overallLeadScore}</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <ScoreGauge score={selectedLead.adEngagementScore} label="Ad Engagement" color="[&>div]:bg-orange-500" />
                        <ScoreGauge score={selectedLead.careerEngagementScore} label="Career Engagement" color="[&>div]:bg-green-500" />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card className="p-3 text-center">
                    <MousePointerClick className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="text-xl font-bold">{selectedLead.adClicks}</p>
                    <p className="text-[10px] text-muted-foreground">Ad Clicks</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <Eye className="w-5 h-5 mx-auto mb-1 text-cyan-500" />
                    <p className="text-xl font-bold">{selectedLead.adImpressions}</p>
                    <p className="text-[10px] text-muted-foreground">Impressions</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <Map className="w-5 h-5 mx-auto mb-1 text-green-500" />
                    <p className="text-xl font-bold">{selectedLead.roadmapViews}</p>
                    <p className="text-[10px] text-muted-foreground">Roadmap Views</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <Users className="w-5 h-5 mx-auto mb-1 text-violet-500" />
                    <p className="text-xl font-bold">{selectedLead.mentorConnections}</p>
                    <p className="text-[10px] text-muted-foreground">Mentor Connects</p>
                  </Card>
                </div>

                {/* Background Info */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Background</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">University</p>
                      <p className="font-medium">{selectedLead.universityName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Graduation Year</p>
                      <p className="font-medium">{selectedLead.graduationYear}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Major</p>
                      <p className="font-medium">{selectedLead.major}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{selectedLead.city}, {selectedLead.country}</p>
                    </div>
                  </div>
                </Card>

                {/* Career Goals */}
                {selectedLead.careerGoals.length > 0 && (
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Career Goals
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.careerGoals.map((goal, idx) => (
                        <Badge key={idx} variant="secondary">{goal}</Badge>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Activity Summary */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Activity Summary
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{selectedLead.eventAttendance}</p>
                      <p className="text-xs text-muted-foreground">Events Attended</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{selectedLead.groupMemberships}</p>
                      <p className="text-xs text-muted-foreground">Groups Joined</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{selectedLead.postsInteracted}</p>
                      <p className="text-xs text-muted-foreground">Posts Interacted</p>
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button className="flex-1 gap-2">
                    <Mail className="w-4 h-4" />
                    Contact Lead
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule Call
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminLeadIntelligence;

