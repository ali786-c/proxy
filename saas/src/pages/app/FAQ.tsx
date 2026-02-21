import { SEOHead } from "@/components/seo/SEOHead";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "How does the proxy rotation work?", a: "Our system automatically rotates IPs based on your session settings. You can choose sticky sessions (same IP for a set duration) or rotating sessions (new IP per request)." },
  { q: "What payment methods do you accept?", a: "We accept Stripe (credit/debit cards), PayPal, and cryptocurrency (BTC, ETH, USDT). Available methods depend on admin configuration." },
  { q: "Is there a free trial?", a: "Yes! We offer a free trial on Core Residential, Datacenter, and Mobile proxy plans. No credit card required to start." },
  { q: "What's the difference between Core and Premium Residential?", a: "Premium Residential offers 100M+ IPs with Speed/Quality/Size optimization modes, while Core Residential provides 50M+ IPs at a lower price point." },
  { q: "How do I generate proxies?", a: "Go to the Products section, select your proxy type, choose your plan, and click 'Generate Proxy'. You'll receive connection details instantly." },
  { q: "What is the refund policy?", a: "We offer a money-back guarantee if you've used less than 1GB or 10% of your plan. No questions asked." },
  { q: "Can I use the API for scraping?", a: "Absolutely. Check our Scraper API (Beta) in the Scraping Solutions section, or use our proxies with your own scraping tools." },
  { q: "How does the referral program work?", a: "Share your referral link and earn 10% commission on every first purchase made by referred users. Earnings are credited to your balance." },
];

export default function FAQ() {
  return (
    <>
      <SEOHead title="FAQ" noindex />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Frequently Asked Questions</h1>
        <Accordion type="single" collapsible className="space-y-2">
          {FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border rounded-lg px-4">
              <AccordionTrigger className="text-sm font-medium">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
}
