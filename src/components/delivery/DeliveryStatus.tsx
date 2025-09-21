import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DeliveryStatusProps {
  status: "processing" | "shipped" | "in-transit" | "delivered"
  progress: number
  className?: string
}

const statusConfig = {
  processing: {
    label: "Processing",
    variant: "secondary" as const,
    description: "Your order is being prepared"
  },
  shipped: {
    label: "Shipped",
    variant: "outline" as const,
    description: "Package has left the facility"
  },
  "in-transit": {
    label: "In Transit",
    variant: "outline" as const,
    description: "On the way to you"
  },
  delivered: {
    label: "Delivered",
    variant: "default" as const,
    description: "Package has been delivered"
  }
}

export const DeliveryStatus = ({ status, progress, className }: DeliveryStatusProps) => {
  const config = statusConfig[status]

  return (
    <div className={cn("space-y-4 animate-slide-in-up", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Delivery Status</h2>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
        <Badge
          variant={config.variant}
          className="px-4 py-2 text-sm font-semibold animate-pulse-glow"
        >
          {config.label}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}