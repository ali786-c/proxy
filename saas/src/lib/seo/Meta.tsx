import { Helmet } from "react-helmet-async";

interface MetaProps {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

export function Meta({ title, description, canonical, ogImage, noindex }: MetaProps) {
  const fullTitle = title.includes("UpgradedProxy") ? title : `${title} — UpgradedProxy`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
    </Helmet>
  );
}
