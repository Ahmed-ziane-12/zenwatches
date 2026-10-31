'use client'
import React from 'react'
import styles from './ProductCard.module.css'
import { Star } from 'lucide-react'
import { useCart } from '../CartProvider';
import { Product } from '@/lib/products';
import Link from 'next/link';

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product}: ProductCardProps) => {
    const { add } = useCart();
    if (!product) {
        return null;
    }
  return (
    
    <article className={styles.productCard}>
      <Link href={`/products/${product.id}`} className={styles.productImage}>
        <img src={product.imageUrl ? product.imageUrl : "/images/product.jpg"} alt="Product" />
      </Link>
      <div className={styles.productInfo}>
        <div className={styles.productName}>
            <h3>{product.name}</h3>
            <span className={styles.productRating}> <Star color="orange" size={12} /> 4.5</span>
        </div>
        <p className={styles.productSpec}>{product.spec}</p>
        <p className={styles.productPrice}>{product.price.toFixed(2)}{product.currency}</p>
        <button className={styles.addToCartButton} >
            Add to Cart
        </button>
      </div>
      
    </article>
  )
}

export default ProductCard