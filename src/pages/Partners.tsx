import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Mail, Phone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';

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
      const response = await apiService.getPartners();
      setPartners(response as Partner[]);
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: 'Failed to load partners',
        variant: 'destructive',
      });
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                          <span className="text-primary font-semibold text-lg">
                            {partner.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                          {partner.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{partner.name_ar}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {partner.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    {partner.contact_email && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{partner.contact_email}</span>
                      </div>
                    )}
                    {partner.contact_phone && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
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
                      onClick={() => navigate('/')}
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
            <p className="text-lg text-muted-foreground">No partners found</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Partners;
