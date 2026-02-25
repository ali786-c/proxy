import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

export function SEOHead({ title, description, canonical, ogImage, noindex }: SEOHeadProps) {
  const fullTitle = title.includes("UpgradedProxy") ? title : `${title} | UpgradedProxy`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
