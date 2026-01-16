import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Flower2, Package, CreditCard, Truck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CheckoutStep = 'design' | 'customize' | 'review' | 'checkout' | 'complete';

interface Step {
  id: CheckoutStep;
  label: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  { id: 'design', label: 'Design', icon: <Flower2 className="w-4 h-4" /> },
  { id: 'customize', label: 'Customize', icon: <Package className="w-4 h-4" /> },
  { id: 'review', label: 'Review', icon: <CheckCircle2 className="w-4 h-4" /> },
  { id: 'checkout', label: 'Payment', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'complete', label: 'Delivery', icon: <Truck className="w-4 h-4" /> },
];

interface CheckoutProgressBarProps {
  currentStep: CheckoutStep;
  completedSteps?: CheckoutStep[];
  className?: string;
  onStepClick?: (step: CheckoutStep) => void;
}

export const CheckoutProgressBar: React.FC<CheckoutProgressBarProps> = ({
  currentStep,
  completedSteps = [],
  className,
  onStepClick,
}) => {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop Progress Bar */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Progress Line Background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
        
        {/* Progress Line Active */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id) || index < currentIndex;
          const isCurrent = step.id === currentStep;
          const isClickable = onStepClick && (isCompleted || isCurrent);

          return (
            <div
              key={step.id}
              className={cn(
                'relative z-10 flex flex-col items-center gap-2',
                isClickable && 'cursor-pointer'
              )}
              onClick={() => isClickable && onStepClick?.(step.id)}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                  'border-2',
                  isCurrent && 'bg-primary text-primary-foreground border-primary scale-110 shadow-lg',
                  isCompleted && !isCurrent && 'bg-primary/20 text-primary border-primary',
                  !isCompleted && !isCurrent && 'bg-background text-muted-foreground border-muted'
                )}
              >
                {isCompleted && !isCurrent ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  step.icon
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium transition-colors',
                  isCurrent && 'text-primary',
                  isCompleted && !isCurrent && 'text-primary/80',
                  !isCompleted && !isCurrent && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Progress Bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            Step {currentIndex + 1} of {STEPS.length}
          </Badge>
          <span className="text-sm font-medium">{STEPS[currentIndex]?.label}</span>
        </div>
        
        <div className="flex gap-1">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'flex-1 h-1.5 rounded-full transition-all duration-300',
                index <= currentIndex ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
