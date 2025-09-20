import React from 'react';
import Navigation from '@/components/Navigation';
import { EnhancedBouquetBuilder } from '@/components/EnhancedBouquetBuilder';

const BouquetBuilderPage: React.FC = () => {
  return (
    <div>
      <Navigation />
      <EnhancedBouquetBuilder />
    </div>
  );
};

export default BouquetBuilderPage;