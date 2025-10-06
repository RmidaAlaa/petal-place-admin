import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import SearchBar from "./SearchBar";
import AnimatedBackground from "./AnimatedBackground";
import heroImage from "@/assets/hero-flowers.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSearch = (query: string) => {
    navigate(`/?search=${encodeURIComponent(query)}`);
  };

  const handleShopNow = () => {
    navigate('/marketplace');
  };

  const handleBrowseCategories = () => {
    navigate('/categories');
  };

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      <AnimatedBackground />
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            <span className="block text-primary gradient-text">Roses Garden</span>
            Fresh Flowers & Gifts
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            Premium natural roses, gift arrangements, and special occasion flowers. From wedding bouquets to birthday surprises - we make every moment beautiful.
          </p>

                 {/* Search Bar */}
                 <div className="mb-8 max-w-lg">
                   <SearchBar
                     placeholder={t('common.search')}
                     onSearch={handleSearch}
                     showSuggestions={true}
                     showFilters={true}
                     enableVoiceSearch={true}
                     className="h-12"
                   />
                 </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              variant="default" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleShopNow}
            >
              {t('common.shopNow')}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-border text-foreground hover:bg-sage hover:text-sage-foreground"
              onClick={handleBrowseCategories}
            >
              {t('common.browseCategories')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;