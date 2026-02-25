import { SEOHead } from "@/components/seo/SEOHead";

export default function Privacy() {
  return (
    <>
      <SEOHead
        title="Privacy Policy"
        description="UpgradedProxy's privacy policy. Learn how we collect, use, and protect your personal data in compliance with GDPR, CCPA, PIPEDA, and Australian Privacy Act."
        canonical="https://upgraderpx.com/privacy"
      />
      <article className="container py-14">
        <div className="mx-auto max-w-3xl prose prose-sm dark:prose-invert">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: February 20, 2026</p>

          <p>UpgradedProxy ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.</p>

          <h2>1. Information We Collect</h2>
          <h3>1.1 Account Information</h3>
          <p>When you create an account, we collect your email address and a hashed password. We do not store plaintext passwords.</p>
          <h3>1.2 Billing Information</h3>
          <p>Payment processing is handled by our third-party payment processor. We do not store full credit card numbers. We retain only the last four digits for reference.</p>
          <h3>1.3 Usage Data</h3>
          <p>We collect aggregate bandwidth usage, connection timestamps, and error rates to provide service analytics. <strong>We do not log your browsing activity, destination URLs, or traffic content.</strong></p>
          <h3>1.4 Technical Data</h3>
          <p>We collect IP addresses used for authentication (allowlisted IPs), browser type, and device information solely for security and service delivery.</p>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To provide, maintain, and improve our proxy services</li>
            <li>To process transactions and send billing communications</li>
            <li>To detect and prevent fraud, abuse, and security threats</li>
            <li>To respond to customer support inquiries</li>
            <li>To send service announcements (you may opt out at any time)</li>
          </ul>

          <h2>3. What We Do NOT Collect</h2>
          <ul>
            <li><strong>No browsing logs:</strong> We do not monitor, log, or store the websites you visit through our proxies</li>
            <li><strong>No traffic content:</strong> We do not inspect, store, or analyze the content of your proxy traffic</li>
            <li><strong>No reverse DNS records:</strong> Our proxy IPs have no PTR records configured, providing complete anonymity</li>
            <li><strong>No third-party tracking:</strong> We do not sell, rent, or share personal data with advertisers</li>
          </ul>

          <h2>4. Data Retention</h2>
          <p>Account data is retained for the duration of your account plus 30 days after deletion. Aggregate usage statistics (bandwidth, error rates) are retained for 90 days. All personal data is deleted upon verified account deletion request.</p>

          <h2>5. International Data Transfers</h2>
          <p>Our infrastructure spans multiple regions. When your data is processed outside your jurisdiction, we ensure adequate protection through:</p>
          <ul>
            <li>EU Standard Contractual Clauses (SCCs) for EU/EEA residents</li>
            <li>Data Processing Agreements with all sub-processors</li>
            <li>Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
          </ul>

          <h2>6. Your Rights</h2>
          <h3>6.1 For EU/EEA Residents (GDPR)</h3>
          <p>You have the right to access, rectify, erase, restrict processing, data portability, and object to processing of your personal data. To exercise these rights, contact privacy@upgraderpx.com.</p>
          <h3>6.2 For California Residents (CCPA/CPRA)</h3>
          <p>You have the right to know what personal information we collect, request deletion, and opt out of the sale of personal information. <strong>We do not sell personal information.</strong></p>
          <h3>6.3 For Canadian Residents (PIPEDA)</h3>
          <p>You have the right to access your personal information, challenge its accuracy, and withdraw consent for non-essential processing.</p>
          <h3>6.4 For Australian Residents (APPs)</h3>
          <p>You have the right to access and correct your personal information under the Australian Privacy Principles. We comply with the Privacy Act 1988 (Cth).</p>

          <h2>7. Security Measures</h2>
          <ul>
            <li>All data encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
            <li>SOC 2 Type II compliant infrastructure</li>
            <li>Regular penetration testing and security audits</li>
            <li>Strict access controls with multi-factor authentication for staff</li>
            <li>No reverse DNS lookup on proxy IPs</li>
          </ul>

          <h2>8. Cookies</h2>
          <p>We use essential cookies only for session management and authentication. See our <a href="/cookies">Cookie Policy</a> for details.</p>

          <h2>9. Children's Privacy</h2>
          <p>Our services are not intended for individuals under 18. We do not knowingly collect personal information from minors.</p>

          <h2>10. Changes to This Policy</h2>
          <p>We may update this policy periodically. We will notify registered users of material changes via email at least 30 days before they take effect.</p>

          <h2>11. Contact</h2>
          <p>For privacy inquiries or to exercise your data rights:</p>
          <ul>
            <li>Email: privacy@upgraderpx.com</li>
            <li>Data Protection Officer: dpo@upgraderpx.com</li>
          </ul>
        </div>
      </article>
    </>
  );
}
