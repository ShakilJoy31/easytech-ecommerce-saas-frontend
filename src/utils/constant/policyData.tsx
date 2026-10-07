import type { ReactNode } from 'react';

export type Tab = {
  id: string;
  title: string;
  content: ReactNode;
};

/* =========================================================================
   Small helpers keep the policy text readable and the styling consistent.
========================================================================= */
const H2 = ({ children }: { children: ReactNode }) => (
  <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
    {children}
  </h2>
);
const H3 = ({ children }: { children: ReactNode }) => (
  <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
    {children}
  </h3>
);
const H4 = ({ children }: { children: ReactNode }) => (
  <h4 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
    {children}
  </h4>
);
const P = ({ children }: { children: ReactNode }) => (
  <p className="text-base text-gray-700 dark:text-gray-300 mb-6">{children}</p>
);
const UL = ({ items }: { items: ReactNode[] }) => (
  <ul className="list-disc list-inside text-base text-gray-700 dark:text-gray-300 space-y-2 mb-6">
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);
const OL = ({ items }: { items: ReactNode[] }) => (
  <ol className="list-decimal list-inside text-base text-gray-700 dark:text-gray-300 space-y-3 mb-6">
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ol>
);
const Brand = () => (
  <strong className="text-[#B37A00] dark:text-[#F2A900]">StoreForge</strong>
);
const Box = ({ children }: { children: ReactNode }) => (
  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
    {children}
  </div>
);
const Mail = ({ to }: { to: string }) => (
  <a
    href={`mailto:${to}`}
    className="text-[#B37A00] dark:text-[#F2A900] font-semibold hover:underline"
  >
    {to}
  </a>
);
const Link2 = ({ href, children }: { href: string; children: ReactNode }) => (
  <a
    href={href}
    className="text-[#B37A00] dark:text-[#F2A900] font-semibold hover:underline"
  >
    {children}
  </a>
);
const Updated = ({ children }: { children: ReactNode }) => (
  <p className="text-sm text-gray-600 dark:text-gray-400 italic">{children}</p>
);

/* TODO: replace these placeholder contact details with the real ones. */
const PRIVACY_EMAIL = 'privacy@storeforge.com';
const SUPPORT_EMAIL = 'support@storeforge.com';
const ADDRESS = 'StoreForge, Dhaka, Bangladesh';

export const tabs: Tab[] = [
  /* =======================================================================
     PRIVACY POLICY
  ======================================================================= */
  {
    id: 'privacy',
    title: 'Privacy Policy',
    content: (
      <>
        <H2>Privacy Policy</H2>
        <P>
          <Brand /> is a multi-store e-commerce platform. Store owners use it
          to run their own online shops, and shoppers use it to browse and buy
          products. This policy explains what personal information the platform
          holds, why we hold it, who can see it, and how we protect it.
        </P>

        <H3>1. Information We Collect</H3>

        <H4>Store owner accounts</H4>
        <UL
          items={[
            <>
              <strong>Identity:</strong> Name, email, phone number, and
              password
            </>,
            <>
              <strong>Store details:</strong> Store name, tagline, description,
              logo, banner, address, district, and social links
            </>,
            <>
              <strong>Subscription:</strong> Chosen package, subscription
              dates, and renewal history
            </>,
            <>
              <strong>Payments:</strong> Manual payment records including
              transaction IDs, sender account numbers, amount, and channel used
              (bKash, Nagad, bank transfer, etc.)
            </>,
          ]}
        />

        <H4>Shopper information</H4>
        <UL
          items={[
            <>
              <strong>Checkout details:</strong> Name, phone number, delivery
              address, district, and optional email or delivery note
            </>,
            <>
              <strong>Order history:</strong> Products bought, quantities,
              prices, payment status, and delivery status
            </>,
          ]}
        />
        <P>
          Shoppers do not need an account to buy. Orders are placed as guests
          with only the information needed to deliver the purchase.
        </P>

        <H4>Product and store content</H4>
        <UL
          items={[
            'Product titles, descriptions, images, prices, and stock levels added by store owners',
            'Category titles added by store owners',
            'Public storefront information shoppers can see',
          ]}
        />

        <H4>Technical data</H4>
        <UL
          items={[
            'IP address, browser, and device type for security and troubleshooting',
            'Login times for store owners, kept to protect accounts',
          ]}
        />

        <H3>2. How We Use Information</H3>
        <OL
          items={[
            <>
              <strong>Running stores:</strong> Let store owners add products,
              manage stock, receive orders, and generate invoices
            </>,
            <>
              <strong>Processing orders:</strong> Record the items, compute
              totals, and send confirmed orders to the correct store owner
            </>,
            <>
              <strong>Subscription billing:</strong> Track which package each
              store is on, when it expires, and whether renewal is due
            </>,
            <>
              <strong>Manual payment verification:</strong> Let a platform
              admin review the transaction ID and account number a store owner
              submitted, and activate the store on approval
            </>,
            <>
              <strong>Security and accountability:</strong> Control access by
              role and keep a record of important actions
            </>,
          ]}
        />

        <H3>3. Who Can See What</H3>
        <P>
          Access is limited by role. Each store owner sees only their own
          store's products, orders, and reports. Platform admins see stores,
          subscriptions, and manual payments across the platform so they can
          verify payments and manage activation. Shoppers see only public
          storefront pages and their own order confirmation.
        </P>

        <H3>4. Sharing and Disclosure</H3>
        <UL
          items={[
            <>
              <strong>Payment gateways:</strong> SSLCommerz and similar
              providers receive the amount, transaction ID, and contact details
              needed to process a card or mobile payment
            </>,
            <>
              <strong>Delivery partners:</strong> Store owners share the
              customer's name, phone, and address with their courier when
              shipping an order
            </>,
            <>
              <strong>Service providers:</strong> Hosting and technology
              providers that operate the platform on our behalf
            </>,
            <>
              <strong>Legal requirements:</strong> When required by law, court
              order, or a regulator
            </>,
          ]}
        />
        <P>We do not sell personal information.</P>

        <H3>5. Payment Information</H3>
        <P>
          When a shopper pays for an order, the card or mobile wallet details
          are entered on the payment gateway's secure page. <Brand /> does not
          store full card numbers or wallet PINs. We store only a transaction
          reference so the payment can be matched to the order.
        </P>
        <P>
          When a store owner pays their subscription fee manually (for example
          by bKash), we store the transaction ID, the account number used, and
          the amount so a platform admin can verify the payment.
        </P>

        <H3>6. Data Security</H3>
        <UL
          items={[
            'Role-based access control and authenticated access to store and admin dashboards',
            'Encrypted connections when data is transmitted',
            'Audit records of important actions such as activating a store or cancelling a subscription',
            'Regular review of user accounts and permissions',
          ]}
        />

        <H3>7. Retention</H3>
        <P>
          We keep store records for as long as the store is active and for a
          reasonable period after, so we can meet legal, tax, and dispute
          requirements. Order history is kept because store owners and shoppers
          may need it later. Past subscription records are kept so the billing
          trail is complete.
        </P>

        <H3>8. Your Rights</H3>
        <P>
          Store owners and shoppers may ask to see the information we hold
          about them, to correct inaccurate details, or to raise a concern
          about how it is used. Some records must be kept to meet legal, tax,
          or order-history requirements, and we will explain this if a request
          cannot be fully met.
        </P>

        <H3>9. Changes to This Policy</H3>
        <P>
          We may update this policy as the platform changes. Material changes
          will be announced to store owners through their dashboard.
        </P>

        <H3>10. Contact Us</H3>
        <Box>
          <strong>Email:</strong> <Mail to={PRIVACY_EMAIL} />
          <br />
          <strong>Address:</strong> {ADDRESS}
        </Box>

        <Updated>Last Updated: October 8, 2026</Updated>
      </>
    ),
  },

  /* =======================================================================
     TERMS OF SERVICE
  ======================================================================= */
  {
    id: 'terms',
    title: 'Terms of Service',
    content: (
      <>
        <H2>Terms of Service</H2>
        <P>
          These terms govern the use of <Brand />, a multi-store e-commerce
          platform where store owners run their own shops and shoppers buy
          products. By creating a store, signing in, or placing an order, you
          agree to these terms.
        </P>

        <H3>1. Store Owner Accounts</H3>
        <UL
          items={[
            'A store owner account is created when you register on the platform. It is linked to exactly one store.',
            'Your store starts inactive until your first subscription payment has been verified by a platform admin.',
            'You may use only the access your role gives you.',
            'Keep your password private. Do not share your account.',
            'Report a lost password or suspected unauthorized access immediately.',
          ]}
        />

        <H3>2. Packages and Subscriptions</H3>
        <UL
          items={[
            'The platform offers packages with different prices, durations, and limits (maximum products, categories, etc.).',
            'Each package is valid for the number of days stated at purchase.',
            'When a subscription expires, the store is deactivated and its storefront becomes unavailable until renewed.',
            'The platform may change package prices or limits for future purchases. Existing subscriptions keep the terms they were bought under.',
          ]}
        />

        <H3>3. Manual Payment Verification</H3>
        <P>
          Subscription fees are paid manually through a payment channel listed
          by the platform (bKash, Nagad, bank transfer, etc.). After sending
          the money, a store owner submits the transaction ID and account
          number. A platform admin checks the payment and, if it is valid,
          activates the store and starts the subscription.
        </P>
        <UL
          items={[
            'Submitting a false, reused, or altered transaction ID is prohibited.',
            'The platform may reject any payment that cannot be verified and ask for a valid one.',
            'Activation happens after verification, not at the moment of payment.',
          ]}
        />

        <H3>4. Selling on the Platform</H3>
        <UL
          items={[
            'You are responsible for the accuracy of the products, prices, stock, categories, and descriptions you add.',
            'You must have the legal right to sell anything you list.',
            'You may not list illegal, counterfeit, dangerous, or prohibited items.',
            'Orders you receive must be fulfilled honestly and within a reasonable time.',
            'You are responsible for any taxes that apply to your sales.',
          ]}
        />

        <H3>5. Shopper Obligations</H3>
        <UL
          items={[
            'Provide accurate name, phone, and delivery address at checkout.',
            'Pay the amount shown for the order you place.',
            'Do not place orders you do not intend to pay for.',
          ]}
        />

        <H3>6. Payments and Refunds</H3>
        <P>
          Shopper payments are processed through the platform's payment gateway
          (SSLCommerz). The platform collects the amount on behalf of the store
          owner and records the transaction. Refunds, if any, are governed by
          the store owner's own return policy. The platform facilitates but
          does not itself guarantee refunds.
        </P>

        <H3>7. Order and Fulfillment</H3>
        <UL
          items={[
            'Once a payment is confirmed, the order appears in the store owner\'s dashboard as "Confirmed".',
            'The store owner may update the status through Processing, Shipped, and Delivered as the order progresses.',
            'If an order is cancelled, the store owner is responsible for any refund or communication with the shopper.',
          ]}
        />

        <H3>8. Account Suspension</H3>
        <P>
          The platform may suspend or deactivate a store at any time if these
          terms are broken, if a subscription is not renewed, if a payment is
          found to be fraudulent, or if the store harms other users or the
          platform.
        </P>

        <H3>9. Intellectual Property</H3>
        <P>
          The platform, its design, and its code belong to <Brand /> and its
          developer. Store owners keep ownership of the product content,
          images, and store branding they upload. By uploading them, you grant
          the platform a licence to display them on your storefront and in the
          public catalogue.
        </P>

        <H3>10. Availability and Liability</H3>
        <P>
          We work to keep the platform available but do not guarantee it will
          be uninterrupted. Store owners should keep their own copies of any
          critical business records. To the extent permitted by law, we are not
          liable for indirect or consequential loss arising from the use of the
          platform, including lost sales during downtime.
        </P>

        <H3>11. Governing Law</H3>
        <P>These terms are governed by the laws of Bangladesh.</P>

        <H3>12. Changes to These Terms</H3>
        <P>
          We may update these terms and will notify store owners in the
          dashboard. Continued use means you accept the updated terms.
        </P>

        <H3>13. Contact</H3>
        <Box>
          <strong>Support:</strong> <Mail to={SUPPORT_EMAIL} />
          <br />
          <strong>Address:</strong> {ADDRESS}
        </Box>

        <Updated>Effective Date: October 8, 2026</Updated>
      </>
    ),
  },

  /* =======================================================================
     COOKIE POLICY
  ======================================================================= */
  {
    id: 'cookies',
    title: 'Cookie Policy',
    content: (
      <>
        <H2>Cookie Policy</H2>
        <P>
          This policy explains the cookies and similar storage used by the{' '}
          <Brand /> platform, including the public storefront and the store
          owner dashboard, and how you can control them.
        </P>

        <H3>1. What We Use</H3>

        <H4>Essential</H4>
        <P>
          These keep store owners signed in and protect accounts. The dashboard
          cannot work without them.
        </P>
        <UL
          items={[
            <>
              <strong>Session and authentication:</strong> Keeps a store owner
              signed in as they move between dashboard pages
            </>,
            <>
              <strong>Security:</strong> Helps protect against forged requests
              and misuse of the dashboard
            </>,
            <>
              <strong>Cart:</strong> Remembers what a shopper added to their
              cart so it survives a page reload or a return visit
            </>,
          ]}
        />

        <H4>Preferences</H4>
        <UL
          items={[
            <>
              <strong>Theme:</strong> Remembers light or dark mode
            </>,
            <>
              <strong>Interface choices:</strong> Remembers saved filters and
              table settings in the dashboard
            </>,
          ]}
        />

        <H4>Analytics (if enabled)</H4>
        <P>
          If analytics is enabled on the public storefront, it uses anonymous
          data to understand which pages and products are popular. It does not
          identify individual shoppers.
        </P>

        <H3>2. What We Do Not Use</H3>
        <P>
          The platform does not use advertising cookies and does not track
          shoppers across other websites.
        </P>

        <H3>3. Third-Party Cookies</H3>
        <P>
          When a shopper pays for an order, the payment gateway (SSLCommerz)
          may set its own cookies on its payment page to complete the
          transaction securely. Those cookies are governed by SSLCommerz's own
          policy.
        </P>

        <H3>4. Managing Cookies</H3>
        <P>
          You can clear or block cookies in your browser settings. If you block
          essential cookies, store owners will not be able to sign in and
          shoppers will not be able to keep items in their cart. Clearing
          preference cookies resets the theme and any saved filters.
        </P>

        <H3>5. Changes</H3>
        <P>
          We will update this page if the cookies we use change.
        </P>

        <H3>6. Contact</H3>
        <Box>
          <strong>Email:</strong> <Mail to={PRIVACY_EMAIL} />
        </Box>

        <Updated>Last Updated: October 8, 2026</Updated>
      </>
    ),
  },
];