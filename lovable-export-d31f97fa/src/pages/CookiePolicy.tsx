import { SEOHead } from "@/components/seo/SEOHead";

export default function CookiePolicy() {
  return (
    <>
      <SEOHead
        title="Cookie Policy"
        description="UpgradedProxy cookie policy. We use only essential cookies — no tracking, no advertising cookies."
        canonical="https://upgraderpx.com/cookies"
      />
      <article className="container py-14">
        <div className="mx-auto max-w-3xl prose prose-sm dark:prose-invert">
          <h1>Cookie Policy</h1>
          <p className="text-muted-foreground">Last updated: February 20, 2026</p>

          <p>This Cookie Policy explains how UpgradedProxy uses cookies and similar technologies.</p>

          <h2>1. What Are Cookies?</h2>
          <p>Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your experience.</p>

          <h2>2. Cookies We Use</h2>

          <h3>2.1 Essential Cookies (Required)</h3>
          <p>These cookies are strictly necessary for the operation of our website and cannot be disabled.</p>
          <table>
            <thead>
              <tr><th>Cookie</th><th>Purpose</th><th>Duration</th></tr>
            </thead>
            <tbody>
              <tr><td>session_id</td><td>Authentication session</td><td>Session</td></tr>
              <tr><td>csrf_token</td><td>Security (CSRF protection)</td><td>Session</td></tr>
              <tr><td>theme</td><td>Dark/light mode preference</td><td>1 year</td></tr>
            </tbody>
          </table>

          <h3>2.2 Cookies We Do NOT Use</h3>
          <ul>
            <li><strong>No advertising cookies:</strong> We do not use cookies for targeted advertising</li>
            <li><strong>No third-party tracking:</strong> We do not embed third-party trackers (Google Analytics, Facebook Pixel, etc.)</li>
            <li><strong>No cross-site cookies:</strong> Our cookies are first-party only</li>
          </ul>

          <h2>3. How to Manage Cookies</h2>
          <p>You can control cookies through your browser settings. Note that disabling essential cookies may prevent you from logging in or using our services.</p>

          <h2>4. Changes</h2>
          <p>We may update this policy periodically. Changes will be posted on this page with an updated date.</p>

          <h2>5. Contact</h2>
          <p>For questions, contact privacy@upgraderpx.com.</p>
        </div>
      </article>
    </>
  );
}
