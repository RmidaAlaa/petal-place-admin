import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-flowers.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Fresh Flowers
            <span className="block text-primary">Delivered Daily</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            Discover beautiful blooms from local vendors. Perfect arrangements for every occasion, delivered fresh to your door.
          </p>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search flowers, arrangements..."
                className="pl-10 h-12 bg-background/95 border-border"
              />
            </div>
            <Button size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground">
              Search
            </Button>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Shop Now
            </Button>
            <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-sage hover:text-sage-foreground">
              Browse Categories
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;