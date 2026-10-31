import React from 'react'
import styles from './Contact.module.css'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const Contact = () => {
  return (
    <div className={styles.banner}>
            <img src="/contact.avif" alt="Promo Banner" className={styles.bannerImage} />
            <div className={styles.heroGradient} />
            <p className={styles.promoDescription}>Have questions? We're here to help!</p>
            <h2 className={styles.promoTitle}>Contact Us</h2>
            <p className={styles.promoDescription}>Get in touch with our team</p>
            <form className={styles.contactForm}>
                <input type="text" placeholder="Your Name" className={styles.contactInput} />
                <input type="email" placeholder="Your Email" className={styles.contactInput} />
                <textarea placeholder="Your Message" className={styles.contactTextarea}></textarea>
                <button type="submit" className={styles.contactButton}>Send Message</button>
            </form>
            <p className={styles.promoDescription}>Or reach us at:</p>
            <p className={styles.promoDescription}>Email:   <a href="mailto:info@zenwatches.com">info@zenwatches.com</a></p>
        </div>
  )
}

export default Contact