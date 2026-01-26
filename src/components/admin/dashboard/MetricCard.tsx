import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description: string;
  isLoading?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const variantStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-green-500/10 text-green-500',
  warning: 'bg-yellow-500/10 text-yellow-500',
};

export const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description,
  isLoading = false,
  variant = 'default'
}: MetricCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-4 w-24 mt-4" />
          <Skeleton className="h-3 w-32 mt-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', variantStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold text-foreground">{value}</span>
        </div>
        <h3 className="mt-4 font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};
