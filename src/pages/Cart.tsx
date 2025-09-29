import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { CartCheckout } from '@/components/CartCheckout';

export const Cart: React.FC = () => {
  return (
    <Layout>
      <CartCheckout />
    </Layout>
  );
};

export default Cart;