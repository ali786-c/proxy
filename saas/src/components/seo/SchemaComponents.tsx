import { Helmet } from "react-helmet-async";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}

export function SchemaOrg() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "UpgradedProxy",
        alternateName: "upgraderpx",
        url: "https://upgraderpx.com",
        description: "Premium residential, datacenter, ISP, mobile, and SOCKS5 proxy services with global coverage.",
        sameAs: [],
      }}
    />
  );
}

export function SchemaFAQ({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((i) => ({
          "@type": "Question",
          name: i.question,
          acceptedAnswer: { "@type": "Answer", text: i.answer },
        })),
      }}
    />
  );
}

export function SchemaProduct({
  name,
  description,
  price,
  currency = "USD",
  url,
}: {
  name: string;
  description: string;
  price: string;
  currency?: string;
  url?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        url,
        offers: {
          "@type": "Offer",
          price,
          priceCurrency: currency,
          availability: "https://schema.org/InStock",
        },
      }}
    />
  );
}
