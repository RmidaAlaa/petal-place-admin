import React from 'react';
import Navigation from '@/components/Navigation';
import { AdvancedBouquetBuilder } from '@/components/AdvancedBouquetBuilder';

const BouquetBuilderPage: React.FC = () => {
  return (
    <div>
      <Navigation />
      <AdvancedBouquetBuilder />
    </div>
  );
};

export default BouquetBuilderPage;