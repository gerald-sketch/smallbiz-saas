import { LegalLayout } from "./LegalLayout";

export function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="September 28, 2026">
      <p>
        This Privacy Policy describes how SmallBiz ("we", "us", or "our")
        collects, uses, and protects personal information when you use our
        business management platform (the "Service"). We are committed to
        protecting your privacy in accordance with the Data Privacy Act of 2012
        (Republic Act No. 10173) and its Implementing Rules and Regulations.
      </p>

      <h2>1. Information We Collect</h2>

      <h3>Information you provide directly</h3>
      <ul>
        <li>
          <strong>Account information:</strong> business name, your name, email
          address, and hashed password
        </li>
        <li>
          <strong>Business data:</strong> products, prices, inventory,
          customers, suppliers, employees, expenses, and transactions you record
          in the Service
        </li>
        <li>
          <strong>Payment information:</strong> processed by PayMongo; we do not
          store full card numbers or e-wallet credentials
        </li>
        <li>
          <strong>Support communications:</strong> messages you send us for help
          or feedback
        </li>
      </ul>

      <h3>Information collected automatically</h3>
      <ul>
        <li>
          <strong>Log data:</strong> IP address, browser type, operating system,
          and timestamps of requests
        </li>
        <li>
          <strong>Usage data:</strong> pages visited, features used, and actions
          taken within the Service
        </li>
        <li>
          <strong>Session data:</strong> authentication tokens and refresh
          cookies required for you to stay logged in
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide, operate, and maintain the Service</li>
        <li>Authenticate your account and secure your session</li>
        <li>Process transactions and maintain accurate records</li>
        <li>Generate reports and analytics for your business</li>
        <li>
          Communicate with you about your account, updates, and support requests
        </li>
        <li>Detect and prevent fraud, abuse, and security incidents</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>3. Legal Basis for Processing</h2>
      <p>
        Under the Data Privacy Act of 2012, we process your personal information
        based on the following legal grounds:
      </p>
      <ul>
        <li>
          <strong>Contractual necessity:</strong> to provide the Service you
          have requested
        </li>
        <li>
          <strong>Legitimate interests:</strong> to secure the Service, prevent
          fraud, and improve functionality
        </li>
        <li>
          <strong>Consent:</strong> where you have provided explicit consent,
          such as for marketing communications
        </li>
        <li>
          <strong>Legal compliance:</strong> where processing is required by
          Philippine law
        </li>
      </ul>

      <h2>4. Data Sharing</h2>
      <p>We do not sell your personal information. We share data only with:</p>
      <ul>
        <li>
          <strong>Service providers:</strong> hosting, database, and
          infrastructure providers who process data on our behalf under strict
          contractual obligations
        </li>
        <li>
          <strong>Payment processors:</strong> PayMongo, for processing
          subscription payments
        </li>
        <li>
          <strong>Legal authorities:</strong> when required by law, court order,
          or valid government request
        </li>
        <li>
          <strong>Business successors:</strong> in connection with a merger,
          acquisition, or sale of assets, with advance notice to you
        </li>
      </ul>

      <h2>5. Payment Information</h2>
      <p>
        All payment transactions are processed by PayMongo, a payment processor
        regulated by the Bangko Sentral ng Pilipinas. When you subscribe to a
        paid plan, your payment details are collected and stored by PayMongo
        under their own privacy policy. We receive only a confirmation of
        successful payment and limited metadata such as a transaction reference
        number.
      </p>
      <p>
        We do not store, process, or have access to your full credit card
        number, GCash credentials, or Maya account details.
      </p>

      <h2>6. Cookies and Session Data</h2>
      <p>We use the following types of cookies and similar technologies:</p>
      <ul>
        <li>
          <strong>Session cookies:</strong> short-lived HTTP-only cookies
          required to authenticate your session
        </li>
        <li>
          <strong>Refresh cookies:</strong> HTTP-only cookies with a seven-day
          lifetime that allow you to stay logged in without re-entering
          credentials
        </li>
        <li>
          <strong>Local storage:</strong> browser storage used to remember your
          user profile between page loads
        </li>
      </ul>
      <p>
        We do not use third-party tracking cookies, advertising pixels, or
        analytics scripts that share data with external marketing platforms.
      </p>

      <h2>7. Data Retention</h2>
      <p>
        We retain your personal information for as long as your account is
        active. After account termination, your data is retained for thirty (30)
        days to allow for recovery, then permanently deleted. Some data may be
        retained longer where required by law, such as transaction records
        subject to BIR retention requirements (typically ten years).
      </p>

      <h2>8. Security Measures</h2>
      <p>
        We implement industry-standard security measures to protect your data:
      </p>
      <ul>
        <li>Passwords are hashed using bcrypt with a cost factor of 12</li>
        <li>All data in transit is encrypted using TLS</li>
        <li>
          Authentication uses short-lived access tokens and rotating refresh
          tokens
        </li>
        <li>
          Database access is restricted and parameterized to prevent injection
          attacks
        </li>
        <li>
          Webhook signatures are cryptographically verified to prevent tampering
        </li>
        <li>
          Rate limiting is applied to authentication endpoints to slow
          brute-force attempts
        </li>
      </ul>
      <p>
        No method of transmission or storage is completely secure. While we
        strive to protect your data, we cannot guarantee absolute security.
      </p>

      <h2>9. Your Rights as a Data Subject</h2>
      <p>Under the Data Privacy Act of 2012, you have the following rights:</p>
      <ul>
        <li>
          <strong>Right to be informed:</strong> to know how your data is being
          collected and used
        </li>
        <li>
          <strong>Right to object:</strong> to object to the processing of your
          data in certain circumstances
        </li>
        <li>
          <strong>Right to access:</strong> to obtain a copy of your personal
          data
        </li>
        <li>
          <strong>Right to rectification:</strong> to correct inaccurate or
          incomplete data
        </li>
        <li>
          <strong>Right to erasure or blocking:</strong> to request deletion or
          blocking of your data
        </li>
        <li>
          <strong>Right to damages:</strong> to claim compensation for damages
          due to inaccurate or unlawfully obtained data
        </li>
        <li>
          <strong>Right to data portability:</strong> to obtain your data in a
          structured, commonly used format
        </li>
        <li>
          <strong>Right to file a complaint:</strong> with the National Privacy
          Commission (NPC)
        </li>
      </ul>
      <p>
        To exercise any of these rights, contact us at privacy@smallbiz.example.
        We will respond within fifteen (15) business days.
      </p>

      <h2>10. Data Location and International Transfers</h2>
      <p>
        Your data is stored on servers located in Singapore and may be
        transferred to other jurisdictions where our service providers operate.
        We ensure that any international transfer is protected by appropriate
        safeguards, including contractual clauses and compliance with the NPC's
        requirements for cross-border data transfers.
      </p>

      <h2>11. Children's Privacy</h2>
      <p>
        The Service is not intended for individuals under the age of 18. We do
        not knowingly collect personal information from minors. If we become
        aware that we have collected information from a minor without parental
        consent, we will delete it promptly.
      </p>

      <h2>12. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material changes
        will be communicated via email or through a prominent notice within the
        Service at least fourteen (14) days before the changes take effect.
        Continued use of the Service after the effective date constitutes
        acceptance of the updated policy.
      </p>

      <h2>13. Contact Us</h2>
      <p>
        For questions about this Privacy Policy, to exercise your data subject
        rights, or to report a privacy concern, please contact:
      </p>
      <p>
        <strong>Data Protection Officer</strong>
        <br />
        <strong>Email:</strong> privacy@smallbiz.example
        <br />
        <strong>Address:</strong> Metro Manila, Philippines
      </p>
      <p>
        If you believe your privacy rights have been violated, you have the
        right to file a complaint with the National Privacy Commission at{" "}
        <a
          href="https://privacy.gov.ph"
          target="_blank"
          rel="noopener noreferrer"
        >
          privacy.gov.ph
        </a>
        .
      </p>
    </LegalLayout>
  );
}
