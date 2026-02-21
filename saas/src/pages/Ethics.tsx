import { SEOHead } from "@/components/seo/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export default function Ethics() {
  return (
    <>
      <SEOHead
        title="Ethics & Compliance"
        description="UpgradedProxy's commitment to ethical proxy sourcing, privacy, and regulatory compliance across GDPR, CCPA, PIPEDA, and Australian Privacy Act."
        canonical="https://upgraderpx.com/ethics"
      />
      <article className="container py-14">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">Ethics & Compliance</h1>
          <p className="mt-2 text-muted-foreground">How we build trust through transparency, ethical sourcing, and global regulatory compliance.</p>

          <div className="mt-8 flex flex-wrap gap-2">
            <Badge variant="outline">GDPR Compliant</Badge>
            <Badge variant="outline">CCPA/CPRA Compliant</Badge>
            <Badge variant="outline">PIPEDA Compliant</Badge>
            <Badge variant="outline">Australian Privacy Act</Badge>
            <Badge variant="outline">SOC 2 Type II</Badge>
            <Badge variant="outline">Zero Activity Logs</Badge>
          </div>

          <div className="mt-10 space-y-8 prose prose-sm dark:prose-invert">
            <section>
              <h2>Ethical IP Sourcing</h2>
              <p>Every IP in our network is ethically sourced with explicit, informed consent from the IP owner. We do not use:</p>
              <ul>
                <li>Botnets or compromised devices</li>
                <li>Deceptive SDK agreements that hide proxy functionality</li>
                <li>IPs from malware-infected devices</li>
              </ul>
              <p>Our residential IP partners maintain transparent opt-in programs where users are fully informed that their connection may be used as a proxy, and are compensated for participation.</p>
            </section>

            <section>
              <h2>Zero-Log Architecture</h2>
              <p>Our infrastructure is purpose-built to ensure customer anonymity:</p>
              <ul>
                <li><strong>No browsing logs:</strong> We never record destination URLs, page content, or browsing patterns</li>
                <li><strong>No traffic inspection:</strong> Proxy traffic is encrypted end-to-end; we cannot and do not inspect it</li>
                <li><strong>No reverse DNS:</strong> Our proxy IPs have no PTR records — reverse lookups return nothing</li>
                <li><strong>Minimal metadata:</strong> We retain only aggregate bandwidth usage for billing purposes</li>
              </ul>
            </section>

            <section>
              <h2>Global Regulatory Compliance</h2>

              <h3>European Union (GDPR)</h3>
              <ul>
                <li>Data Protection Officer appointed (dpo@upgraderpx.com)</li>
                <li>Standard Contractual Clauses for international transfers</li>
                <li>Data Processing Agreements with all sub-processors</li>
                <li>Right to access, rectify, erase, and port personal data</li>
                <li>72-hour breach notification procedure</li>
              </ul>

              <h3>United States (CCPA/CPRA)</h3>
              <ul>
                <li>We do not sell personal information</li>
                <li>Right to know, delete, and opt out fully supported</li>
                <li>No discrimination for exercising privacy rights</li>
              </ul>

              <h3>Canada (PIPEDA)</h3>
              <ul>
                <li>Consent-based data collection</li>
                <li>Data minimization — we only collect what's necessary</li>
                <li>Right to access and challenge accuracy of data</li>
              </ul>

              <h3>Australia (Privacy Act 1988)</h3>
              <ul>
                <li>Compliance with Australian Privacy Principles (APPs)</li>
                <li>Transparent handling of personal information</li>
                <li>Right to access and correct personal information</li>
              </ul>
            </section>

            <section>
              <h2>Infrastructure Security</h2>
              <div className="not-prose grid gap-2 sm:grid-cols-2">
                {[
                  "TLS 1.3 encryption in transit",
                  "AES-256 encryption at rest",
                  "SOC 2 Type II certified infrastructure",
                  "Regular penetration testing",
                  "Multi-factor authentication for staff",
                  "Automated threat detection",
                  "No reverse DNS lookup on proxy IPs",
                  "DNS leak protection",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2>Acceptable Use Enforcement</h2>
              <p>We actively monitor for and take action against misuse of our services. Accounts engaged in illegal activity, fraud, or abuse are terminated immediately without refund. We cooperate with law enforcement when required by valid legal process.</p>
            </section>

            <section>
              <h2>Contact Our Compliance Team</h2>
              <ul>
                <li>General inquiries: compliance@upgraderpx.com</li>
                <li>Data protection: dpo@upgraderpx.com</li>
                <li>Abuse reports: abuse@upgraderpx.com</li>
              </ul>
            </section>
          </div>
        </div>
      </article>
    </>
  );
}
