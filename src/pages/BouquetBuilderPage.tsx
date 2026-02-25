import React from 'react';
import Navigation from '@/components/Navigation';
import { ImprovedBouquetBuilder } from '@/components/bouquet-builder/ImprovedBouquetBuilder';

const BouquetBuilderPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <ImprovedBouquetBuilder />
      </main>
    </div>
  );
};

export default BouquetBuilderPage;