import React from 'react'
import styles from './TopBrands.module.css'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

const BRANDS = [
  { name: 'Rolex', logo: '/logos/rolex.png' },
  { name: 'Omega', logo: '/logos/omega.svg' },
  { name: 'Seiko', logo: '/logos/seiko.svg' },
  { name: 'Casio', logo: '/logos/casio.svg' },
  { name: 'Tissot', logo: '/logos/tissot.svg' },
  {name: 'Citizen', logo: '/logos/citizen.svg' },
  { name: 'Curren', logo: '/logos/curren.png' },]

const TopBrands = () => {
  return (
    <div className={styles.topBrands}>
      <div className={styles.header}>
        <h2>Top Brands</h2>
        <Link href="/brands"> View All</Link>
      </div>
      <div className={styles.brandList}>
        {BRANDS.map((brand) => (
          <Link href={'/'} key={brand.name} className={styles.brandItem}>
            <img src={brand.logo} alt={brand.name} className={styles.brandLogo} />
            <span className={styles.brandName}>{brand.name} </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default TopBrands