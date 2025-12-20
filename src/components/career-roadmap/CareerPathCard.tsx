import { Users, TrendingUp, ArrowRight, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface CareerPath {
  id: string;
  title: string;
  alumniCount: number;
  successRate: number;
  timeline: string;
  keySteps: string[];
}

interface CareerPathCardProps {
  careerPath: CareerPath;
  onUseTemplate: (careerPath: CareerPath) => void;
}

export const CareerPathCard = ({ careerPath, onUseTemplate }: CareerPathCardProps) => {
  return (
    <Card className="w-full p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-border/60">
      {/* Header Section */}
      <div className="mb-5">
        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3">
          {careerPath.title}
        </h3>
        
        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{careerPath.alumniCount} alumni</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span>{careerPath.successRate}% success</span>
          </div>
          
          <Badge 
            variant="secondary" 
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full"
          >
            <Clock className="w-3 h-3" />
            {careerPath.timeline}
          </Badge>
        </div>
      </div>

      {/* Key Steps Section */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-foreground mb-3">Key Steps:</p>
        <div className="flex flex-wrap gap-2">
          {careerPath.keySteps.map((step, index) => (
            <Badge 
              key={index}
              variant="outline"
              className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full bg-muted/30"
            >
              {index + 1}. {step}
            </Badge>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <Button
        variant="secondary"
        className="w-full gap-2 h-11 text-sm font-medium rounded-lg hover:bg-secondary/80 transition-colors"
        onClick={() => onUseTemplate(careerPath)}
      >
        Use This Template
        <ArrowRight className="w-4 h-4" />
      </Button>
    </Card>
  );
};

export default CareerPathCard;

