import { Product } from '@/lib/products'
import React from 'react'
import styles from './BestSellers.module.css'
import ProductCard from '../ProductCard/ProductCard'

type BestSellersProps = {
  products: Product[];
};

const BestSellers = ({ products }: BestSellersProps) => {

  return (
    <div className={styles.bestSellers}>
      <h2>Best Sellers</h2>
      <div className={styles.productGrid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

export default BestSellers