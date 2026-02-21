import { Helmet } from "react-helmet-async";

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}

export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "UpgradedProxy",
        alternateName: "upgraderpx",
        url: "https://upgraderpx.com",
        description: "Premium proxy services for businesses and developers.",
      }}
    />
  );
}

export function ProductSchema({
  name,
  description,
  price,
  currency = "USD",
}: {
  name: string;
  description: string;
  price: string;
  currency?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        offers: { "@type": "Offer", price, priceCurrency: currency, availability: "https://schema.org/InStock" },
      }}
    />
  );
}

export function FAQSchema({ items }: { items: { question: string; answer: string }[] }) {
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
