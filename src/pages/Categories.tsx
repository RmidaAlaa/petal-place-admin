import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { useLanguage } from '@/contexts/LanguageContext';

const Categories = () => {
  const { t } = useLanguage();

  const categories = [
    {
      id: 'natural-roses',
      name: t('categories.naturalRoses'),
      nameAr: 'الورود الطبيعية',
      items: 15,
      color: 'bg-rose-100',
      route: '/category/natural-roses'
    },
    {
      id: 'gift-boxes',
      name: t('categories.giftBoxes'),
      nameAr: 'صناديق الهدايا',
      items: 12,
      color: 'bg-pink-100',
      route: '/gift-boxes'
    },
    {
      id: 'wedding-services',
      name: t('categories.weddingServices'),
      nameAr: 'خدمات الأعراس',
      items: 8,
      color: 'bg-sage/20',
      route: '/category/wedding-services'
    },
    {
      id: 'bridal-bouquets',
      name: t('categories.bridalBouquets'),
      nameAr: 'باقات العروس',
      items: 6,
      color: 'bg-coral/20',
      route: '/category/bridal-bouquets'
    },
    {
      id: 'special-occasions',
      name: t('categories.specialOccasions'),
      nameAr: 'المناسبات الخاصة',
      items: 20,
      color: 'bg-cream',
      route: '/occasions'
    },
    {
      id: 'premium-flowers',
      name: t('categories.premiumFlowers'),
      nameAr: 'الورود الفاخرة',
      items: 8,
      color: 'bg-accent/20',
      route: '/category/premium-flowers'
    },
    {
      id: 'wedding',
      name: t('categories.wedding'),
      nameAr: 'الأعراس',
      items: 5,
      color: 'bg-sage/30',
      route: '/category/wedding'
    },
    {
      id: 'occasions',
      name: t('categories.occasions'),
      nameAr: 'المناسبات',
      items: 10,
      color: 'bg-coral/30',
      route: '/category/occasions'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">{t('common.shopByCategory')}</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('common.discoverCollection')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card 
              key={category.id} 
              className="group hover:shadow-lg transition-all duration-300 border-border"
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 rounded-full ${category.color} mx-auto mb-4 flex items-center justify-center`}>
                  <div className="w-8 h-8 bg-primary rounded-full"></div>
                </div>
                
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {category.name}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {category.items} {t('common.items')}
                </p>

                <div className="space-y-2">
                  <Link to={category.route}>
                    <Button variant="outline" className="w-full">
                      {t('common.browseCategory')}
                    </Button>
                  </Link>
                  
                  <Link to={`/builder?category=${category.id}`}>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      {t('common.customGift')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-muted/50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            {t('common.cantFind')}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {t('common.createCustom')}
          </p>
          <Link to="/builder">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              {t('common.startCustomDesign')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Categories;