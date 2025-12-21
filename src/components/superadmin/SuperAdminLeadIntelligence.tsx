import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
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
  PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart
} from 'recharts';
import { 
  Flame, Thermometer, Snowflake, TrendingUp, TrendingDown, Users, Target,
  MousePointerClick, Eye, Map, Briefcase, GraduationCap, Award, Building2,
  Search, Filter, Download, RefreshCcw, ChevronRight, Mail, Phone, Linkedin,
  Calendar, Clock, ArrowUpRight, Sparkles, BarChart3, PieChart as PieChartIcon,
  Activity, Zap, Star, Crown, UserCheck, ExternalLink, AlertTriangle,
  Lightbulb, TrendingUp as TrendUp, Bell, FileText
} from 'lucide-react';

import {
  leadIntelligenceApi,
  type AnalyticsOverview,
  type UniversityComparison,
  type CareerIntelligence,
  type TrendItem,
  type TopAd,
  type AIInsight,
  type Lead,
  type University,
} from '@/api/leadIntelligence';

// Chart configurations
const leadChartConfig = {
  hot: { label: 'Hot Leads', color: 'hsl(0 84% 60%)' },
  warm: { label: 'Warm Leads', color: 'hsl(38 92% 50%)' },
  cold: { label: 'Cold Leads', color: 'hsl(200 80% 50%)' },
} satisfies ChartConfig;

const engagementChartConfig = {
  ad_engagement: { label: 'Ad Engagement', color: 'hsl(280 70% 60%)' },
  career_engagement: { label: 'Career Engagement', color: 'hsl(150 70% 45%)' },
  feed_engagement: { label: 'Feed Engagement', color: 'hsl(38 92% 50%)' },
  mentor_engagement: { label: 'Mentor Engagement', color: 'hsl(228 68% 58%)' },
} satisfies ChartConfig;

const adChartConfig = {
  clicks: { label: 'Clicks', color: 'hsl(228 68% 58%)' },
  impressions: { label: 'Impressions', color: 'hsl(185 70% 48%)' },
  ctr: { label: 'CTR', color: 'hsl(18 85% 62%)' },
} satisfies ChartConfig;

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
      <span className="text-sm font-bold">{score.toFixed(1)}%</span>
    </div>
    <Progress value={score} className={`h-2 ${color}`} />
  </div>
);

const InsightIcon = ({ type }: { type: string }) => {
  const icons: Record<string, typeof Lightbulb> = {
    trend: TrendUp,
    alert: AlertTriangle,
    success: Star,
    recommendation: Lightbulb,
    pattern: Activity,
    insight: Sparkles,
  };
  const Icon = icons[type] || Lightbulb;
  return <Icon className="w-5 h-5" />;
};

const InsightBadge = ({ type }: { type: string }) => {
  const styles: Record<string, string> = {
    trend: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    alert: 'bg-red-500/10 text-red-600 border-red-500/20',
    success: 'bg-green-500/10 text-green-600 border-green-500/20',
    recommendation: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    pattern: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    insight: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  };
  
  return (
    <Badge variant="outline" className={styles[type] || styles.insight}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </Badge>
  );
};

const SuperAdminLeadIntelligence = () => {
  const { toast } = useToast();
  
  // State
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Data state
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [universityComparison, setUniversityComparison] = useState<UniversityComparison[]>([]);
  const [careerIntelligence, setCareerIntelligence] = useState<CareerIntelligence | null>(null);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [topAds, setTopAds] = useState<TopAd[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsTotal, setLeadsTotal] = useState(0);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [leadFilter, setLeadFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [leadsPage, setLeadsPage] = useState(1);
  
  // Modal state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  // Load data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const universityId = selectedUniversity === 'all' ? undefined : selectedUniversity;
      
      // Load all data in parallel
      const [
        overviewData,
        uniComparisonData,
        careerData,
        trendsData,
        adsData,
        insightsData,
        universitiesData,
      ] = await Promise.all([
        leadIntelligenceApi.getAnalyticsOverview({ university_id: universityId }),
        leadIntelligenceApi.getUniversityComparison(),
        leadIntelligenceApi.getCareerIntelligence({ university_id: universityId }),
        leadIntelligenceApi.getTrends({ university_id: universityId }),
        leadIntelligenceApi.getTopAds({ university_id: universityId }),
        leadIntelligenceApi.getAIInsights({ university_id: universityId }),
        leadIntelligenceApi.getUniversities(),
      ]);
      
      setOverview(overviewData);
      setUniversityComparison(uniComparisonData);
      setCareerIntelligence(careerData);
      setTrends(trendsData);
      setTopAds(adsData);
      setAiInsights(insightsData);
      setUniversities(universitiesData);
      
    } catch (error) {
      console.error('Failed to load lead intelligence data:', error);
      toast({
        title: 'Error Loading Data',
        description: 'Failed to load lead intelligence data. Using demo data.',
        variant: 'destructive',
      });
      // Load demo data as fallback
      loadDemoData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeads = async () => {
    try {
      const universityId = selectedUniversity === 'all' ? undefined : selectedUniversity;
      const category = leadFilter === 'all' ? undefined : leadFilter;
      
      const response = await leadIntelligenceApi.getLeads({
        university_id: universityId,
        category,
        search: searchQuery || undefined,
        page: leadsPage,
        page_size: 12,
      });
      
      setLeads(response.leads);
      setLeadsTotal(response.total);
    } catch (error) {
      console.error('Failed to load leads:', error);
    }
  };

  // Demo data fallback
  const loadDemoData = () => {
    setOverview({
      funnel: {
        total_leads: 487,
        hot_leads: 89,
        warm_leads: 203,
        cold_leads: 195,
        conversion_rate: 18.3,
        avg_lead_score: 52.4,
        hot_percentage: 18.3,
      },
      engagement: {
        ad_views: 15420,
        ad_clicks: 892,
        ctr: 5.78,
        roadmap_views: 3245,
        roadmap_generates: 567,
        mentor_connects: 234,
        feed_likes: 4532,
        feed_comments: 1234,
        feed_shares: 567,
        total_feed_engagement: 6333,
      },
      score_distribution: {
        avg_ad_score: 45.2,
        avg_career_score: 58.7,
        avg_feed_score: 32.1,
        avg_mentor_score: 28.4,
      },
    });
    
    setUniversityComparison([
      { university_id: '1', university_name: 'MIT', total_leads: 156, hot_leads: 42, warm_leads: 68, cold_leads: 46, avg_score: 67.3, hot_percentage: 26.9 },
      { university_id: '2', university_name: 'Stanford', total_leads: 134, hot_leads: 28, warm_leads: 62, cold_leads: 44, avg_score: 58.4, hot_percentage: 20.9 },
      { university_id: '3', university_name: 'Harvard', total_leads: 112, hot_leads: 15, warm_leads: 52, cold_leads: 45, avg_score: 48.2, hot_percentage: 13.4 },
    ]);
    
    setCareerIntelligence({
      most_requested: [
        { career: 'Tech Lead', count: 145 },
        { career: 'Product Manager', count: 98 },
        { career: 'Data Scientist', count: 87 },
        { career: 'Startup Founder', count: 76 },
        { career: 'VP Engineering', count: 54 },
      ],
      most_viewed: [
        { career: 'Software Engineer', views: 234 },
        { career: 'Product Manager', views: 187 },
        { career: 'Data Scientist', views: 156 },
      ],
      highest_conversion: [
        { career: 'Tech Lead', connects: 45 },
        { career: 'Startup Founder', connects: 32 },
        { career: 'VP Engineering', connects: 28 },
      ],
    });
    
    setTrends([
      { month: 'Jan', year: 2024, ad_engagement: 320, career_engagement: 245, feed_engagement: 180, mentor_engagement: 45, total_engagement: 790, new_leads: 42 },
      { month: 'Feb', year: 2024, ad_engagement: 380, career_engagement: 290, feed_engagement: 220, mentor_engagement: 58, total_engagement: 948, new_leads: 56 },
      { month: 'Mar', year: 2024, ad_engagement: 420, career_engagement: 340, feed_engagement: 280, mentor_engagement: 72, total_engagement: 1112, new_leads: 68 },
      { month: 'Apr', year: 2024, ad_engagement: 480, career_engagement: 395, feed_engagement: 320, mentor_engagement: 85, total_engagement: 1280, new_leads: 78 },
      { month: 'May', year: 2024, ad_engagement: 520, career_engagement: 420, feed_engagement: 350, mentor_engagement: 92, total_engagement: 1382, new_leads: 85 },
      { month: 'Jun', year: 2024, ad_engagement: 580, career_engagement: 480, feed_engagement: 410, mentor_engagement: 108, total_engagement: 1578, new_leads: 94 },
    ]);
    
    setTopAds([
      { ad_id: '1', ad_title: 'MBA Leadership Program', clicks: 342, impressions: 4500, ctr: 7.6 },
      { ad_id: '2', ad_title: 'Tech Career Bootcamp', clicks: 287, impressions: 5200, ctr: 5.5 },
      { ad_id: '3', ad_title: 'Executive Summit 2024', clicks: 256, impressions: 3800, ctr: 6.7 },
      { ad_id: '4', ad_title: 'Data Science Certificate', clicks: 198, impressions: 4100, ctr: 4.8 },
      { ad_id: '5', ad_title: 'Startup Incubator', clicks: 175, impressions: 2900, ctr: 6.0 },
    ]);
    
    setAiInsights([
      {
        type: 'trend',
        category: 'career',
        title: "'Tech Lead' is the Most Sought-After Career",
        description: "145 alumni have requested roadmaps for Tech Lead. Consider creating targeted content and ads for this career path.",
        impact_score: 0.9,
        confidence_score: 0.95,
        related_data: { career: 'Tech Lead', count: 145 },
      },
      {
        type: 'alert',
        category: 'leads',
        title: "89 Hot Leads Ready for Conversion",
        description: "You have 89 highly engaged alumni with scores above 80. These leads show strong intent and should be prioritized for outreach.",
        impact_score: 0.95,
        confidence_score: 0.9,
        related_data: { hot_leads: 89 },
      },
      {
        type: 'success',
        category: 'ad',
        title: "Above Average Ad Performance (5.78% CTR)",
        description: "Your ads are performing well with a 5.78% click-through rate. Industry average is 2-5%. Keep up the good targeting!",
        impact_score: 0.7,
        confidence_score: 0.85,
        related_data: { ctr: 5.78 },
      },
      {
        type: 'pattern',
        category: 'career',
        title: "'Tech Lead' Has Highest Conversion Rate",
        description: "Alumni interested in Tech Lead have the highest mentor connection rate. Target ads and content to this segment for better ROI.",
        impact_score: 0.85,
        confidence_score: 0.82,
        related_data: { career: 'Tech Lead', connects: 45 },
      },
    ]);
    
    setUniversities([
      { id: '1', name: 'Massachusetts Institute of Technology' },
      { id: '2', name: 'Stanford University' },
      { id: '3', name: 'Harvard University' },
    ]);
  };

  // Effects
  useEffect(() => {
    loadData();
  }, [selectedUniversity]);

  useEffect(() => {
    if (activeTab === 'leads') {
      loadLeads();
    }
  }, [activeTab, selectedUniversity, leadFilter, searchQuery, leadsPage]);

  // Handlers
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await leadIntelligenceApi.refreshScores(
        selectedUniversity === 'all' ? undefined : selectedUniversity
      );
      await loadData();
      toast({
        title: 'Data Refreshed',
        description: 'Lead scores have been recalculated.',
      });
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh lead scores.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportLeads = async () => {
    try {
      const blob = await leadIntelligenceApi.exportLeadsCSV({
        university_id: selectedUniversity === 'all' ? undefined : selectedUniversity,
        category: leadFilter === 'all' ? undefined : leadFilter,
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Successful',
        description: 'Leads exported to CSV file.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export leads data.',
        variant: 'destructive',
      });
    }
  };

  const handleExportAnalytics = async () => {
    try {
      const blob = await leadIntelligenceApi.exportAnalyticsCSV(
        selectedUniversity === 'all' ? undefined : selectedUniversity
      );
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Successful',
        description: 'Analytics exported to CSV file.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export analytics data.',
        variant: 'destructive',
      });
    }
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsLeadModalOpen(true);
  };

  // Chart data
  const leadDistributionData = overview ? [
    { name: 'Hot', value: overview.funnel.hot_leads, fill: 'hsl(0 84% 60%)' },
    { name: 'Warm', value: overview.funnel.warm_leads, fill: 'hsl(38 92% 50%)' },
    { name: 'Cold', value: overview.funnel.cold_leads, fill: 'hsl(200 80% 50%)' },
  ] : [];

  const engagementRadarData = overview ? [
    { subject: 'Ad Clicks', A: Math.min(100, overview.score_distribution.avg_ad_score) },
    { subject: 'Roadmaps', A: Math.min(100, overview.score_distribution.avg_career_score) },
    { subject: 'Feed', A: Math.min(100, overview.score_distribution.avg_feed_score) },
    { subject: 'Mentors', A: Math.min(100, overview.score_distribution.avg_mentor_score) },
  ] : [];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
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
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative mb-4">
            <div className="w-14 h-14 rounded-full border-4 border-primary/20 animate-pulse" />
            <div className="w-14 h-14 rounded-full border-4 border-t-primary border-transparent animate-spin absolute inset-0" />
            <Target className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading lead intelligence data...</p>
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
                AI-powered insights combining ad engagement, career roadmaps & feed analytics
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
                    {uni.name.length > 25 ? uni.name.substring(0, 25) + '...' : uni.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefreshData} 
              disabled={isRefreshing}
              title="Refresh Scores"
            >
              <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button variant="outline" onClick={handleExportAnalytics}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Cards Row */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <Card className="p-4 hover:shadow-lg transition-all duration-300 group cursor-pointer border-l-4 border-l-primary">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-primary" />
              <Badge variant="secondary" className="text-[10px]">Total</Badge>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{overview.funnel.total_leads}</p>
            <p className="text-xs text-muted-foreground mt-1">Potential Leads</p>
          </Card>

          <Card 
            className="p-4 hover:shadow-lg transition-all duration-300 group cursor-pointer border-l-4 border-l-red-500"
            onClick={() => { setLeadFilter('hot'); setActiveTab('leads'); }}
          >
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-5 h-5 text-red-500" />
              <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px]">
                {overview.funnel.hot_percentage.toFixed(1)}%
              </Badge>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-red-600">{overview.funnel.hot_leads}</p>
            <p className="text-xs text-muted-foreground mt-1">Hot Leads</p>
          </Card>

          <Card 
            className="p-4 hover:shadow-lg transition-all duration-300 group cursor-pointer border-l-4 border-l-amber-500"
            onClick={() => { setLeadFilter('warm'); setActiveTab('leads'); }}
          >
            <div className="flex items-center justify-between mb-2">
              <Thermometer className="w-5 h-5 text-amber-500" />
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600">{overview.funnel.warm_leads}</p>
            <p className="text-xs text-muted-foreground mt-1">Warm Leads</p>
          </Card>

          <Card 
            className="p-4 hover:shadow-lg transition-all duration-300 group cursor-pointer border-l-4 border-l-blue-500"
            onClick={() => { setLeadFilter('cold'); setActiveTab('leads'); }}
          >
            <div className="flex items-center justify-between mb-2">
              <Snowflake className="w-5 h-5 text-blue-500" />
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{overview.funnel.cold_leads}</p>
            <p className="text-xs text-muted-foreground mt-1">Cold Leads</p>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-all duration-300 group cursor-pointer border-l-4 border-l-green-500">
            <div className="flex items-center justify-between mb-2">
              <MousePointerClick className="w-5 h-5 text-green-500" />
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{overview.engagement.ctr.toFixed(2)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Avg. CTR</p>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-all duration-300 group cursor-pointer border-l-4 border-l-violet-500">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-5 h-5 text-violet-500" />
              <Sparkles className="w-4 h-4 text-violet-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-violet-600">{overview.funnel.avg_lead_score.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground mt-1">Avg. Score</p>
          </Card>
        </div>
      )}

      {/* AI Insights Banner */}
      {aiInsights.length > 0 && (
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-violet-500/5 via-primary/5 to-cyan-500/5 border-violet-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-violet-500" />
            <h3 className="font-semibold">AI-Powered Insights</h3>
            <Badge variant="secondary" className="text-[10px]">
              {aiInsights.length} insights
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {aiInsights.slice(0, 4).map((insight, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-card border hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    insight.type === 'alert' ? 'bg-red-500/10 text-red-600' :
                    insight.type === 'success' ? 'bg-green-500/10 text-green-600' :
                    insight.type === 'trend' ? 'bg-blue-500/10 text-blue-600' :
                    'bg-amber-500/10 text-amber-600'
                  }`}>
                    <InsightIcon type={insight.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <InsightBadge type={insight.type} />
                  </div>
                </div>
                <h4 className="font-medium text-sm mb-1 line-clamp-2">{insight.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{insight.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

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
                <BarChart data={universityComparison.slice(0, 5)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="university_name" 
                    type="category" 
                    width={80}
                    tickFormatter={(value) => value.length > 10 ? value.substring(0, 10) + '...' : value}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="hot_leads" stackId="a" fill="hsl(0 84% 60%)" name="Hot" />
                  <Bar dataKey="warm_leads" stackId="a" fill="hsl(38 92% 50%)" name="Warm" />
                  <Bar dataKey="cold_leads" stackId="a" fill="hsl(200 80% 50%)" name="Cold" radius={[0, 4, 4, 0]} />
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
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
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
              <div className="flex gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary"></div>
                  <span className="text-muted-foreground">Ad</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span className="text-muted-foreground">Career</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-amber-500"></div>
                  <span className="text-muted-foreground">Feed</span>
                </div>
              </div>
            </div>
            <ChartContainer config={engagementChartConfig} className="h-[300px] w-full">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorAd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(228 68% 58%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(228 68% 58%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCareer" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(150 70% 45%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(150 70% 45%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFeed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="ad_engagement"
                  stroke="hsl(228 68% 58%)"
                  fillOpacity={1}
                  fill="url(#colorAd)"
                  strokeWidth={2}
                  name="Ad Engagement"
                />
                <Area
                  type="monotone"
                  dataKey="career_engagement"
                  stroke="hsl(150 70% 45%)"
                  fillOpacity={1}
                  fill="url(#colorCareer)"
                  strokeWidth={2}
                  name="Career Engagement"
                />
                <Area
                  type="monotone"
                  dataKey="feed_engagement"
                  stroke="hsl(38 92% 50%)"
                  fillOpacity={1}
                  fill="url(#colorFeed)"
                  strokeWidth={2}
                  name="Feed Engagement"
                />
              </AreaChart>
            </ChartContainer>
          </Card>
        </TabsContent>

        {/* Ad Analytics Tab */}
        <TabsContent value="ads" className="space-y-4">
          {overview && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ad Views</p>
                    <p className="text-2xl font-bold">{overview.engagement.ad_views.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <MousePointerClick className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ad Clicks</p>
                    <p className="text-2xl font-bold">{overview.engagement.ad_clicks.toLocaleString()}</p>
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
                    <p className="text-2xl font-bold">{overview.engagement.ctr.toFixed(2)}%</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Conversions</p>
                    <p className="text-2xl font-bold">{Math.round(overview.engagement.ad_clicks * 0.12)}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Performing Ads */}
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-primary" />
                Top Performing Ads
              </h3>
              <div className="space-y-3">
                {topAds.slice(0, 5).map((ad, idx) => (
                  <div key={ad.ad_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
                        idx === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                        idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                        idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                        'bg-muted-foreground/30'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{ad.ad_title}</p>
                        <p className="text-xs text-muted-foreground">{ad.impressions.toLocaleString()} impressions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{ad.clicks} clicks</p>
                      <p className="text-xs text-green-500">{ad.ctr.toFixed(1)}% CTR</p>
                    </div>
                  </div>
                ))}
                {topAds.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No ad data available</p>
                )}
              </div>
            </Card>

            {/* Ad Performance Over Time */}
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                Ad Performance Trend
              </h3>
              <ChartContainer config={adChartConfig} className="h-[280px] w-full">
                <ComposedChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar yAxisId="left" dataKey="ad_engagement" fill="hsl(228 68% 58%)" radius={[4, 4, 0, 0]} name="Ad Engagement" />
                  <Line yAxisId="right" type="monotone" dataKey="new_leads" stroke="hsl(18 85% 62%)" strokeWidth={2} dot={{ fill: 'hsl(18 85% 62%)' }} name="New Leads" />
                </ComposedChart>
              </ChartContainer>
            </Card>
          </div>
        </TabsContent>

        {/* Career Roadmap Tab */}
        <TabsContent value="career" className="space-y-4">
          {overview && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Map className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Roadmap Views</p>
                    <p className="text-2xl font-bold">{overview.engagement.roadmap_views.toLocaleString()}</p>
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
                    <p className="text-2xl font-bold">{overview.engagement.roadmap_generates}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mentor Connects</p>
                    <p className="text-2xl font-bold">{overview.engagement.mentor_connects}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Conversion Rate</p>
                    <p className="text-2xl font-bold">{overview.funnel.conversion_rate.toFixed(1)}%</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Popular Career Goals */}
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-primary" />
                Most Requested Careers
              </h3>
              <div className="space-y-4">
                {careerIntelligence?.most_requested.slice(0, 5).map((career, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{career.career}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{career.count}</span>
                        <Badge variant="secondary" className="text-[10px] text-green-600">
                          requests
                        </Badge>
                      </div>
                    </div>
                    <Progress value={((career.count || 0) / (careerIntelligence?.most_requested[0]?.count || 1)) * 100} className="h-2" />
                  </div>
                ))}
                {(!careerIntelligence || careerIntelligence.most_requested.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No career data available</p>
                )}
              </div>
            </Card>

            {/* Career Engagement by University */}
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-primary" />
                Career Engagement by University
              </h3>
              <ChartContainer config={engagementChartConfig} className="h-[280px] w-full">
                <BarChart data={universityComparison.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="university_name" 
                    tickFormatter={(value) => value.length > 8 ? value.substring(0, 8) + '...' : value}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="avg_score" fill="hsl(280 70% 60%)" radius={[4, 4, 0, 0]} name="Avg Score">
                    {universityComparison.slice(0, 5).map((entry, index) => (
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
                  placeholder="Search by name or email..."
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
              <Button variant="outline" onClick={handleExportLeads}>
                <Download className="w-4 h-4 mr-2" />
                Export Leads
              </Button>
            </div>
          </Card>

          {/* Lead Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {leads.map(lead => (
              <Card 
                key={lead.id} 
                className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => handleViewLead(lead)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${
                      lead.lead_category === 'hot' ? 'bg-gradient-to-br from-red-500 to-orange-500' :
                      lead.lead_category === 'warm' ? 'bg-gradient-to-br from-amber-500 to-yellow-500' :
                      'bg-gradient-to-br from-blue-500 to-cyan-500'
                    }`}>
                      {lead.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-semibold group-hover:text-primary transition-colors">{lead.name}</h4>
                      <p className="text-xs text-muted-foreground">{lead.job_title || 'Alumni'}</p>
                    </div>
                  </div>
                  <LeadCategoryBadge category={lead.lead_category} />
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="truncate">{lead.company || 'Company'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span className="truncate">
                      {lead.university_name.length > 20 ? lead.university_name.substring(0, 20) + '...' : lead.university_name}
                      {lead.graduation_year && ` • ${lead.graduation_year}`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">{lead.overall_score.toFixed(0)}</p>
                    <p className="text-[10px] text-muted-foreground">Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-orange-500">{lead.ad_engagement_score.toFixed(0)}</p>
                    <p className="text-[10px] text-muted-foreground">Ad Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-500">{lead.career_engagement_score.toFixed(0)}</p>
                    <p className="text-[10px] text-muted-foreground">Career</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {lead.last_activity_at ? new Date(lead.last_activity_at).toLocaleDateString() : 'No activity'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Card>
            ))}
          </div>

          {leads.length === 0 && (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No Leads Found</h3>
              <p className="text-muted-foreground">
                {searchQuery || leadFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Lead data will appear here once users engage with the platform'}
              </p>
            </Card>
          )}

          {leadsTotal > leads.length && (
            <div className="text-center">
              <Button variant="outline" className="gap-2" onClick={() => setLeadsPage(p => p + 1)}>
                Load More ({leadsTotal - leads.length} remaining)
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
                    selectedLead.lead_category === 'hot' ? 'bg-gradient-to-br from-red-500 to-orange-500' :
                    selectedLead.lead_category === 'warm' ? 'bg-gradient-to-br from-amber-500 to-yellow-500' :
                    'bg-gradient-to-br from-blue-500 to-cyan-500'
                  }`}>
                    {selectedLead.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <DialogTitle className="text-xl">{selectedLead.name}</DialogTitle>
                      <LeadCategoryBadge category={selectedLead.lead_category} />
                    </div>
                    <p className="text-muted-foreground">
                      {selectedLead.job_title ? `${selectedLead.job_title} at ${selectedLead.company || 'Company'}` : 'Alumni'}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start gap-2" asChild>
                    <a href={`mailto:${selectedLead.email}`}>
                      <Mail className="w-4 h-4" />
                      <span className="truncate text-xs">{selectedLead.email}</span>
                    </a>
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    <Building2 className="w-4 h-4" />
                    <span className="truncate text-xs">{selectedLead.university_name}</span>
                  </Button>
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
                            strokeDasharray={`${selectedLead.overall_score * 2.51} 251`}
                            className={
                              selectedLead.lead_category === 'hot' ? 'text-red-500' :
                              selectedLead.lead_category === 'warm' ? 'text-amber-500' :
                              'text-blue-500'
                            }
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold">{selectedLead.overall_score.toFixed(0)}</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <ScoreGauge score={selectedLead.ad_engagement_score} label="Ad Engagement" color="[&>div]:bg-orange-500" />
                        <ScoreGauge score={selectedLead.career_engagement_score} label="Career Engagement" color="[&>div]:bg-green-500" />
                        <ScoreGauge score={selectedLead.feed_engagement_score} label="Feed Engagement" color="[&>div]:bg-blue-500" />
                        <ScoreGauge score={selectedLead.mentor_engagement_score} label="Mentor Engagement" color="[&>div]:bg-violet-500" />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Activity Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card className="p-3 text-center">
                    <Activity className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="text-xl font-bold">{selectedLead.total_activities}</p>
                    <p className="text-[10px] text-muted-foreground">Total Activities</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-cyan-500" />
                    <p className="text-xl font-bold">{selectedLead.activities_last_7_days}</p>
                    <p className="text-[10px] text-muted-foreground">Last 7 Days</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <Calendar className="w-5 h-5 mx-auto mb-1 text-green-500" />
                    <p className="text-xl font-bold">{selectedLead.activities_last_30_days}</p>
                    <p className="text-[10px] text-muted-foreground">Last 30 Days</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <Zap className="w-5 h-5 mx-auto mb-1 text-violet-500" />
                    <p className="text-xl font-bold">{selectedLead.engagement_multiplier.toFixed(1)}x</p>
                    <p className="text-[10px] text-muted-foreground">Multiplier</p>
                  </Card>
                </div>

                {/* Background Info */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Background</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">University</p>
                      <p className="font-medium">{selectedLead.university_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Graduation Year</p>
                      <p className="font-medium">{selectedLead.graduation_year || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Major</p>
                      <p className="font-medium">{selectedLead.major || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{selectedLead.location || 'Not specified'}</p>
                    </div>
                  </div>
                </Card>

                {/* Career Interests */}
                {selectedLead.career_interests && selectedLead.career_interests.length > 0 && (
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Career Interests
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.primary_career_interest && (
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          <Star className="w-3 h-3 mr-1" />
                          {selectedLead.primary_career_interest}
                        </Badge>
                      )}
                      {selectedLead.career_interests
                        .filter(i => i !== selectedLead.primary_career_interest)
                        .map((interest, idx) => (
                          <Badge key={idx} variant="secondary">{interest}</Badge>
                        ))}
                    </div>
                  </Card>
                )}

                {/* Conversion Probability */}
                <Card className="p-4 bg-gradient-to-r from-green-500/5 to-emerald-500/5 border-green-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-semibold">Conversion Probability</p>
                        <p className="text-sm text-muted-foreground">Based on engagement patterns</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">
                        {(selectedLead.conversion_probability * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button className="flex-1 gap-2" asChild>
                    <a href={`mailto:${selectedLead.email}`}>
                      <Mail className="w-4 h-4" />
                      Contact Lead
                    </a>
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <FileText className="w-4 h-4" />
                    View Full Profile
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
