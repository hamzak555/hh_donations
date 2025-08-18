import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: object;
}

const SEO: React.FC<SEOProps> = ({
  title = 'H&H Donations - Community Clothing Donation Bins',
  description = 'Find donation bins near you or schedule a pickup. H&H Donations makes it easy to donate clothes and household items to help families in need across your community.',
  keywords = 'clothing donation, donation bins, charity pickup, donate clothes, community donations, H&H Donations, textile recycling, household donations',
  image = '/images/HH Logo Green.png',
  url = 'https://hhdonations.com',
  type = 'website',
  jsonLd
}) => {
  const siteTitle = title === 'H&H Donations - Community Clothing Donation Bins' 
    ? title 
    : `${title} | H&H Donations`;
  
  const fullUrl = url.startsWith('http') ? url : `https://hhdonations.com${url}`;
  const fullImage = image.startsWith('http') ? image : `https://hhdonations.com${image}`;

  // Default Organization Schema
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "H&H Donations",
    "url": "https://hhdonations.com",
    "logo": "https://hhdonations.com/images/HH Logo Green.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-647-774-5750",
      "contactType": "Customer Service",
      "email": "info@hhdonations.com",
      "areaServed": "CA",
      "availableLanguage": ["English", "French"]
    },
    "sameAs": [
      "https://www.facebook.com/hhdonations",
      "https://www.instagram.com/hhdonations",
      "https://www.linkedin.com/company/hhdonations"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CA"
    }
  };

  const combinedJsonLd = jsonLd ? [defaultSchema, jsonLd] : defaultSchema;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="title" content={siteTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="H&H Donations" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />
      
      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="author" content="H&H Donations" />
      <meta name="publisher" content="H&H Donations" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      
      {/* Geo Tags for Local SEO */}
      <meta name="geo.region" content="CA" />
      <meta name="geo.placename" content="Canada" />
      
      {/* Mobile Web App */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="H&H Donations" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(combinedJsonLd)}
      </script>
    </Helmet>
  );
};

export default SEO;