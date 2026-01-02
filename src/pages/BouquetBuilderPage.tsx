import React from 'react';
import Navigation from '@/components/Navigation';
import { ImprovedBouquetBuilder } from '@/components/bouquet-builder/ImprovedBouquetBuilder';

const BouquetBuilderPage: React.FC = () => {
  return (
    <div>
      <Navigation />
      <ImprovedBouquetBuilder />
    </div>
  );
};

export default BouquetBuilderPage;