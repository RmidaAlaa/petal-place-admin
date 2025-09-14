import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Star } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  vendor: string;
  rating: number;
  reviewCount: number;
  category: string;
  isNew?: boolean;
}

const ProductCard = ({
  name,
  price,
  originalPrice,
  image,
  vendor,
  rating,
  reviewCount,
  category,
  isNew = false,
}: ProductCardProps) => {
  return (
    <Card className="group overflow-hidden bg-card hover:shadow-lg transition-all duration-300 border-border/50">
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {isNew && (
            <Badge variant="default" className="bg-primary text-primary-foreground">
              New
            </Badge>
          )}
          <Badge variant="secondary" className="bg-sage text-sage-foreground">
            {category}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-background/80 hover:bg-background text-foreground"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-card-foreground line-clamp-2">{name}</h3>
          <p className="text-sm text-muted-foreground">by {vendor}</p>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-sm font-medium">{rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">${price}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">${originalPrice}</span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;