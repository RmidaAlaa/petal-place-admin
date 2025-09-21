import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Package,
  CheckCircle,
  Truck,
  MapPin,
  Clock,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface TimelineStage {
  id: string;
  status: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  completed: boolean;
  current: boolean;
  timestamp?: string;
  location?: string;
}

interface DeliveryTimelineProps {
  currentStatus: string;
  trackingEntries?: Array<{
    id: string;
    status: string;
    description: string;
    location?: string;
    timestamp: string;
    created_by?: string;
    first_name?: string;
    last_name?: string;
  }>;
  estimatedDelivery?: Date;
  className?: string;
}

const getTimelineStages = (currentStatus: string): Omit<TimelineStage, 'completed' | 'current' | 'timestamp' | 'location'>[] => {
  const status = currentStatus.toLowerCase();

  return [
    {
      id: 'confirmed',
      status: 'confirmed',
      label: 'Order Confirmed',
      description: 'Your order has been received and confirmed',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'processing',
      status: 'processing',
      label: 'Processing',
      description: 'Your order is being prepared for shipment',
      icon: <Package className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'shipped',
      status: 'shipped',
      label: 'Shipped',
      description: 'Your order has been shipped and is on the way',
      icon: <Truck className="h-5 w-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'in-transit',
      status: 'in-transit',
      label: 'In Transit',
      description: 'Your package is out for delivery',
      icon: <MapPin className="h-5 w-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      id: 'delivered',
      status: 'delivered',
      label: 'Delivered',
      description: 'Your package has been successfully delivered',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];
};

const getStatusOrder = (status: string): number => {
  const order = {
    'confirmed': 1,
    'processing': 2,
    'shipped': 3,
    'in-transit': 4,
    'delivered': 5
  };
  return order[status.toLowerCase() as keyof typeof order] || 0;
};

export const DeliveryTimeline: React.FC<DeliveryTimelineProps> = ({
  currentStatus,
  trackingEntries = [],
  estimatedDelivery,
  className
}) => {
  const stages = getTimelineStages(currentStatus);
  const currentStatusOrder = getStatusOrder(currentStatus);

  // Mark stages as completed, current, or pending
  const timelineStages: TimelineStage[] = stages.map(stage => {
    const stageOrder = getStatusOrder(stage.status);
    const completed = stageOrder < currentStatusOrder;
    const current = stageOrder === currentStatusOrder;

    // Find matching tracking entry for timestamp and location
    const matchingEntry = trackingEntries.find(entry =>
      entry.status.toLowerCase() === stage.status.toLowerCase()
    );

    return {
      ...stage,
      completed,
      current,
      timestamp: matchingEntry?.timestamp,
      location: matchingEntry?.location
    };
  });

  const getStageIcon = (stage: TimelineStage) => {
    if (stage.completed) {
      return (
        <div className={cn("flex items-center justify-center w-10 h-10 rounded-full", stage.bgColor)}>
          <CheckCircle className={cn("h-6 w-6", stage.color)} />
        </div>
      );
    }

    if (stage.current) {
      return (
        <div className={cn("flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary bg-background animate-pulse")}>
          {stage.icon}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-muted bg-muted">
        <Clock className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  };

  const getConnectorLine = (stage: TimelineStage, index: number) => {
    if (index === timelineStages.length - 1) return null;

    const nextStage = timelineStages[index + 1];
    const isCompleted = stage.completed;
    const isNextCompleted = nextStage.completed;

    if (isCompleted && isNextCompleted) {
      return <div className="w-0.5 h-16 bg-green-500 mx-auto" />;
    } else if (isCompleted) {
      return <div className="w-0.5 h-16 bg-primary mx-auto" />;
    } else {
      return <div className="w-0.5 h-16 bg-muted mx-auto" />;
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Delivery Timeline</h2>
          {estimatedDelivery && (
            <p className="text-muted-foreground">
              Estimated delivery: {new Date(estimatedDelivery).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Timeline */}
        <div className="relative">
          {timelineStages.map((stage, index) => (
            <div key={stage.id} className="relative flex items-start">
              {/* Timeline line */}
              {index > 0 && (
                <div className="absolute left-5 top-0 w-0.5 h-8 bg-muted" />
              )}

              {/* Stage content */}
              <div className="flex items-start space-x-4 flex-1">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {getStageIcon(stage)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-8">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={cn(
                      "font-semibold text-base",
                      stage.completed || stage.current ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {stage.label}
                    </h3>
                    {stage.timestamp && (
                      <Badge variant="outline" className="text-xs">
                        {new Date(stage.timestamp).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>

                  <p className={cn(
                    "text-sm mb-2",
                    stage.completed || stage.current ? "text-muted-foreground" : "text-muted-foreground/70"
                  )}>
                    {stage.description}
                  </p>

                  {stage.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {stage.location}
                    </div>
                  )}

                  {stage.current && (
                    <Badge className="mt-2 bg-primary text-primary-foreground">
                      Current Status
                    </Badge>
                  )}
                </div>
              </div>

              {/* Connector to next stage */}
              {index < timelineStages.length - 1 && (
                <div className="absolute left-5 top-12">
                  {getConnectorLine(stage, index)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="mt-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round((currentStatusOrder / timelineStages.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(currentStatusOrder / timelineStages.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTimeline;