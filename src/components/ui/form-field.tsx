import React from 'react';
import { Input } from './input';
import { Label } from './label';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  isLoading,
  leftIcon,
  rightIcon,
  onRightIconClick,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1">
      <Label htmlFor={props.id || props.name}>
        {label}
      </Label>
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-500">
            {leftIcon}
          </div>
        )}
        <Input
          {...props}
          className={cn(
            'w-full',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          disabled={isLoading || props.disabled}
        />
        {(rightIcon || isLoading) && (
          <div 
            className={cn(
              "absolute inset-y-0 right-0 pr-2.5 flex items-center",
              onRightIconClick && "cursor-pointer"
            )}
            onClick={onRightIconClick}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};