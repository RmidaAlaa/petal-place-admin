import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { Heart, Calendar, Gift } from 'lucide-react';

const Occasions = () => {
  const occasions = [
    {
      id: 1,
      name: 'Valentine\'s Day',
      description: 'Romantic flower arrangements for your loved one',
      image: '/api/placeholder/300/200',
      date: 'February 14',
      icon: Heart,
      color: 'bg-red-500',
    },
    {
      id: 2,
      name: 'Mother\'s Day',
      description: 'Beautiful bouquets to honor mom',
      image: '/api/placeholder/300/200',
      date: 'Second Sunday of May',
      icon: Heart,
      color: 'bg-pink-500',
    },
    {
      id: 3,
      name: 'Anniversaries',
      description: 'Celebrate your special milestones',
      image: '/api/placeholder/300/200',
      date: 'Year Round',
      icon: Calendar,
      color: 'bg-purple-500',
    },
    {
      id: 4,
      name: 'Birthdays',
      description: 'Colorful arrangements for birthday celebrations',
      image: '/api/placeholder/300/200',
      date: 'Year Round',
      icon: Gift,
      color: 'bg-yellow-500',
    },
    {
      id: 5,
      name: 'Graduations',
      description: 'Congratulatory flowers for achievements',
      image: '/api/placeholder/300/200',
      date: 'May - June',
      icon: Gift,
      color: 'bg-blue-500',
    },
    {
      id: 6,
      name: 'Get Well Soon',
      description: 'Uplifting flowers to brighten someone\'s day',
      image: '/api/placeholder/300/200',
      date: 'Year Round',
      icon: Heart,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Special Occasions</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Make every moment memorable with our curated flower arrangements for life's special occasions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {occasions.map((occasion) => {
            const IconComponent = occasion.icon;
            return (
              <Card key={occasion.id} className="group hover:shadow-lg transition-all duration-300">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={occasion.image}
                    alt={occasion.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className={`absolute top-4 left-4 ${occasion.color} p-2 rounded-full text-white`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <Badge className="absolute top-4 right-4 bg-background/90 text-foreground">
                    {occasion.date}
                  </Badge>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{occasion.name}</h3>
                  <p className="text-muted-foreground mb-4">{occasion.description}</p>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1">
                      Browse Collection
                    </Button>
                    <Button variant="outline" size="icon">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 bg-muted/50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Custom Occasion Arrangements</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Don't see your special occasion? We create custom arrangements for any celebration. 
            Contact us to discuss your unique needs.
          </p>
          <Button size="lg">
            Request Custom Arrangement
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Occasions;