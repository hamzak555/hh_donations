import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * NoIndexSEO Component
 * Prevents search engines from indexing admin/backend pages
 * Use this on all admin, login, and private pages
 */
const NoIndexSEO: React.FC<{ title?: string }> = ({ title = 'Admin' }) => {
  return (
    <Helmet>
      <title>{title} | H&H Donations Admin</title>
      {/* Prevent all search engines from indexing this page */}
      <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
      <meta name="googlebot" content="noindex, nofollow" />
      <meta name="bingbot" content="noindex, nofollow" />
      
      {/* Additional security headers for admin pages */}
      <meta name="referrer" content="no-referrer" />
      <meta http-equiv="X-Frame-Options" content="DENY" />
      
      {/* Disable caching for admin pages */}
      <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
      <meta http-equiv="Pragma" content="no-cache" />
      <meta http-equiv="Expires" content="0" />
    </Helmet>
  );
};

export default NoIndexSEO;