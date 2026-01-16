import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Leaf, TreeDeciduous, Droplets, MapPin, Recycle, Heart, 
  Truck, Award, Globe, Users, Target, TrendingUp 
} from 'lucide-react';

const ImpactDetails: React.FC = () => {
  const stats = [
    { label: 'Trees Planted', value: '12,450+', icon: <TreeDeciduous className="w-6 h-6" />, color: 'bg-green-100 text-green-700' },
    { label: 'Water Saved', value: '2.5M L', icon: <Droplets className="w-6 h-6" />, color: 'bg-blue-100 text-blue-700' },
    { label: 'Local Farms Supported', value: '85+', icon: <Users className="w-6 h-6" />, color: 'bg-amber-100 text-amber-700' },
    { label: 'Carbon Offset', value: '150 tons', icon: <Globe className="w-6 h-6" />, color: 'bg-purple-100 text-purple-700' },
  ];

  const initiatives = [
    {
      title: 'Zero Waste Packaging',
      description: 'All our packaging is 100% recyclable or biodegradable. We\'ve eliminated plastic from our supply chain.',
      progress: 95,
      icon: <Recycle className="w-5 h-5 text-green-600" />,
    },
    {
      title: 'Local Sourcing Initiative',
      description: 'We partner with local farms within 100 miles to reduce transportation emissions and support communities.',
      progress: 78,
      icon: <MapPin className="w-5 h-5 text-rose-500" />,
    },
    {
      title: 'Fair Trade Certification',
      description: 'All imported flowers are Fair Trade certified, ensuring fair wages and safe working conditions.',
      progress: 100,
      icon: <Award className="w-5 h-5 text-amber-500" />,
    },
    {
      title: 'Carbon Neutral Delivery',
      description: 'We offset 100% of our delivery emissions through verified carbon credit programs.',
      progress: 100,
      icon: <Truck className="w-5 h-5 text-blue-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-green-100 text-green-700">
            <Leaf className="w-3 h-3 mr-1" />
            Sustainability First
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Environmental Impact</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            At Roses Garden, we believe beautiful flowers shouldn't cost the Earth. 
            Every bouquet you buy contributes to our sustainability mission.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className={`w-12 h-12 rounded-full ${stat.color} mx-auto flex items-center justify-center mb-3`}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Initiatives */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          Our Initiatives
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {initiatives.map((initiative, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  {initiative.icon}
                  {initiative.title}
                  {initiative.progress === 100 && (
                    <Badge className="ml-auto bg-green-500">Complete</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{initiative.description}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span className="font-medium">{initiative.progress}%</span>
                  </div>
                  <Progress value={initiative.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200">
          <CardContent className="py-8 text-center">
            <Heart className="w-10 h-10 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Every Purchase Plants a Tree</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              For every bouquet sold, we plant one tree through our partnership with global reforestation programs.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ImpactDetails;
