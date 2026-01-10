import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Mail, Phone, ArrowLeft, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Static partners data since we don't have a partners table in Supabase
const STATIC_PARTNERS = [
  {
    id: '1',
    name: 'Al Madinah Flowers',
    name_ar: 'زهور المدينة',
    description: 'Premium flower supplier with over 20 years of experience in the Saudi market.',
    description_ar: 'مورد زهور فاخر مع أكثر من 20 عاماً من الخبرة في السوق السعودي.',
    logo_url: '',
    website_url: 'https://example.com',
    contact_email: 'contact@almadinahflowers.com',
    contact_phone: '+966 50 111 2222',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Royal Gardens',
    name_ar: 'الحدائق الملكية',
    description: 'Specializing in exotic flowers and rare botanical collections from around the world.',
    description_ar: 'متخصصون في الزهور الغريبة والمجموعات النباتية النادرة من جميع أنحاء العالم.',
    logo_url: '',
    website_url: 'https://example.com',
    contact_email: 'info@royalgardens.sa',
    contact_phone: '+966 50 333 4444',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Bloom Express',
    name_ar: 'بلوم اكسبريس',
    description: 'Fast and reliable flower delivery service across the Kingdom with same-day options.',
    description_ar: 'خدمة توصيل زهور سريعة وموثوقة في جميع أنحاء المملكة مع خيارات التوصيل في نفس اليوم.',
    logo_url: '',
    website_url: 'https://example.com',
    contact_email: 'support@bloomexpress.com',
    contact_phone: '+966 50 555 6666',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Desert Rose Co.',
    name_ar: 'شركة وردة الصحراء',
    description: 'Local greenhouse specialists growing sustainable flowers adapted to the Gulf climate.',
    description_ar: 'متخصصون في البيوت الزجاجية المحلية لزراعة زهور مستدامة متكيفة مع مناخ الخليج.',
    logo_url: '',
    website_url: 'https://example.com',
    contact_email: 'hello@desertrose.sa',
    contact_phone: '+966 50 777 8888',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

interface Partner {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  logo_url?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  created_at: string;
}

const Partners = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setIsLoading(true);
      // Use static data instead of API call to avoid backend errors in production
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
      setPartners(STATIC_PARTNERS);
    } catch (error: unknown) {
      console.error('Failed to load partners:', error);
      // Fallback to static data
      setPartners(STATIC_PARTNERS);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <div>
            <h1 className="text-3xl font-bold text-foreground">Our Trusted Partners</h1>
            <p className="text-muted-foreground mt-2">
              Quality partners providing exceptional floral services
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading partners...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {partners.map((partner) => (
              <Card key={partner.id} className="bg-card border-border/50 hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {partner.logo_url ? (
                        <img
                          src={partner.logo_url}
                          alt={partner.name}
                          className="w-12 h-12 rounded-lg object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                          {partner.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{partner.name_ar}</p>
                      </div>
                    </div>
                  </div>

                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 mb-3">
                    Active Partner
                  </Badge>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {partner.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    {partner.contact_email && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{partner.contact_email}</span>
                      </div>
                    )}
                    {partner.contact_phone && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span>{partner.contact_phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {partner.website_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-border hover:bg-primary hover:text-primary-foreground"
                        onClick={() => window.open(partner.website_url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 hover:bg-muted"
                      onClick={() => toast({ title: 'Partner Details', description: `More info about ${partner.name} coming soon!` })}
                    >
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {partners.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">No partners found</p>
            <p className="text-sm text-muted-foreground mt-2">Check back later for partner updates.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Partners;
