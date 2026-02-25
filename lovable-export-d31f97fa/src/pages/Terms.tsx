import { SEOHead } from "@/components/seo/SEOHead";

export default function Terms() {
  return (
    <>
      <SEOHead
        title="Terms of Service"
        description="UpgradedProxy terms of service. Read about acceptable use, service guarantees, and your rights as a customer."
        canonical="https://upgraderpx.com/terms"
      />
      <article className="container py-14">
        <div className="mx-auto max-w-3xl prose prose-sm dark:prose-invert">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: February 20, 2026</p>

          <p>These Terms of Service ("Terms") govern your use of UpgradedProxy's website and services. By creating an account or using our services, you agree to these Terms.</p>

          <h2>1. Service Description</h2>
          <p>UpgradedProxy provides proxy infrastructure services including residential, datacenter, ISP, mobile, and SOCKS5 proxies. We provide the network infrastructure; you are responsible for how you use it.</p>

          <h2>2. Account Registration</h2>
          <ul>
            <li>You must be at least 18 years old to create an account</li>
            <li>You must provide accurate and complete registration information</li>
            <li>You are responsible for maintaining the security of your account credentials</li>
            <li>You must notify us immediately of any unauthorized access</li>
          </ul>

          <h2>3. Acceptable Use</h2>
          <p>You agree to use our services only for lawful purposes. Prohibited activities include:</p>
          <ul>
            <li>Any activity that violates applicable local, state, national, or international law</li>
            <li>Unauthorized access to computer systems or networks</li>
            <li>Distribution of malware, viruses, or malicious code</li>
            <li>Sending spam, phishing, or unsolicited communications</li>
            <li>Activities that infringe on intellectual property rights</li>
            <li>Harassment, threats, or abuse directed at any person</li>
            <li>Activities related to fraud, identity theft, or financial crimes</li>
          </ul>
          <p>We reserve the right to suspend or terminate accounts that violate these terms without prior notice.</p>

          <h2>4. Legitimate Use Cases</h2>
          <p>Our services are designed for legitimate business purposes including:</p>
          <ul>
            <li>Market research and competitive intelligence</li>
            <li>Ad verification and brand protection</li>
            <li>SEO monitoring and SERP tracking</li>
            <li>Price comparison and monitoring</li>
            <li>Academic research</li>
            <li>Quality assurance and testing</li>
          </ul>

          <h2>5. Service Level Agreement</h2>
          <ul>
            <li><strong>Uptime:</strong> We target 99.9% uptime for our proxy infrastructure</li>
            <li><strong>Support:</strong> Email support with 24-hour response time; priority support for Pro and Enterprise plans</li>
            <li><strong>Refunds:</strong> Money-back guarantee within the first 3 days of subscription</li>
          </ul>

          <h2>6. Billing & Payments</h2>
          <ul>
            <li>Plans are billed monthly in advance</li>
            <li>Pay-as-you-go bandwidth is billed in arrears</li>
            <li>All prices are in EUR (euros)</li>
            <li>Failed payments may result in service suspension after a 3-day grace period</li>
            <li>You may cancel your subscription at any time; access continues until the end of the billing period</li>
          </ul>

          <h2>7. Intellectual Property</h2>
          <p>All content, trademarks, and technology on our website and services are owned by UpgradedProxy. You may not reproduce, distribute, or create derivative works without our written consent.</p>

          <h2>8. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, UpgradedProxy's total liability for any claim arising from your use of our services shall not exceed the amount you paid us in the 12 months preceding the claim.</p>

          <h2>9. Indemnification</h2>
          <p>You agree to indemnify and hold harmless UpgradedProxy from any claims, damages, or expenses arising from your use of our services or violation of these Terms.</p>

          <h2>10. Governing Law</h2>
          <p>These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles. For EU residents, mandatory consumer protection laws of your country of residence apply.</p>

          <h2>11. Changes to Terms</h2>
          <p>We may modify these Terms at any time. Material changes will be communicated via email at least 30 days before taking effect. Continued use after changes constitutes acceptance.</p>

          <h2>12. Contact</h2>
          <p>For questions about these Terms, contact legal@upgraderpx.com.</p>
        </div>
      </article>
    </>
  );
}
