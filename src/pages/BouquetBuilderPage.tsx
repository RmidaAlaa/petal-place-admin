import React from 'react';
import Navigation from '@/components/Navigation';
import { BouquetBuilder } from '@/components/BouquetBuilder';

const BouquetBuilderPage: React.FC = () => {
  return (
    <div>
      <Navigation />
      <BouquetBuilder />
    </div>
  );
};

export default BouquetBuilderPage;