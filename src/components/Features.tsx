import { Brain, MessageCircle, Calendar, Users, TrendingUp, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI Career Roadmap",
    description: "Get personalized career guidance powered by AI. Discover paths taken by successful alumni and connect with mentors in your field.",
    gradient: "gradient-accent",
  },
  {
    icon: MessageCircle,
    title: "Connect & Chat",
    description: "Real-time messaging with fellow alumni and students. Build meaningful relationships that last beyond graduation.",
    gradient: "gradient-primary",
  },
  {
    icon: Calendar,
    title: "Events & Meetups",
    description: "Discover and register for alumni events, workshops, and networking sessions. Never miss an opportunity to connect.",
    gradient: "gradient-secondary",
  },
  {
    icon: Users,
    title: "Groups & Communities",
    description: "Join interest-based groups, create communities, and engage with alumni who share your passions and goals.",
    gradient: "gradient-accent",
  },
  {
    icon: TrendingUp,
    title: "Career Insights",
    description: "Explore where alumni work, what they do, and how they got there. Get inspired by real success stories.",
    gradient: "gradient-primary",
  },
  {
    icon: FileText,
    title: "Document Services",
    description: "Request transcripts, recommendations, and other university documents seamlessly through the portal.",
    gradient: "gradient-secondary",
  },
];

const Features = () => {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Everything You Need to
            <span className="text-primary font-extrabold"> Thrive</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From AI-powered career guidance to seamless networking, we've built the complete alumni experience.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group relative overflow-hidden p-8 border-border/50 hover:border-primary/50 transition-smooth shadow-custom-sm hover:shadow-custom-md bg-card"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 ${feature.gradient} opacity-0 group-hover:opacity-5 transition-smooth`} />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-smooth`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-smooth">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${feature.gradient} scale-x-0 group-hover:scale-x-100 transition-smooth origin-left`} />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;