import type { ReactNode } from 'react';

export type Tab = {
  id: string;
  title: string;
  content: ReactNode;
};

/* Small helpers keep the policy text readable and the styling consistent. */
const H2 = ({ children }: { children: ReactNode }) => (
  <h2 className='text-3xl font-bold mb-6 text-gray-900 dark:text-white'>{children}</h2>
);
const H3 = ({ children }: { children: ReactNode }) => (
  <h3 className='text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200'>{children}</h3>
);
const H4 = ({ children }: { children: ReactNode }) => (
  <h4 className='text-lg font-medium mb-3 text-gray-800 dark:text-gray-200'>{children}</h4>
);
const P = ({ children }: { children: ReactNode }) => (
  <p className='text-base text-gray-700 dark:text-gray-300 mb-6'>{children}</p>
);
const UL = ({ items }: { items: ReactNode[] }) => (
  <ul className='list-disc list-inside text-base text-gray-700 dark:text-gray-300 space-y-2 mb-6'>
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);
const OL = ({ items }: { items: ReactNode[] }) => (
  <ol className='list-decimal list-inside text-base text-gray-700 dark:text-gray-300 space-y-3 mb-6'>
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ol>
);
const Brand = () => (
  <strong className='text-[#B37A00] dark:text-[#F2A900]'>ALEC Manpower</strong>
);
const Box = ({ children }: { children: ReactNode }) => (
  <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6 text-base text-gray-700 dark:text-gray-300 leading-relaxed'>
    {children}
  </div>
);
const Mail = ({ to }: { to: string }) => (
  <a href={`mailto:${to}`} className='text-[#B37A00] dark:text-[#F2A900] font-semibold hover:underline'>
    {to}
  </a>
);
const Updated = ({ children }: { children: ReactNode }) => (
  <p className='text-sm text-gray-600 dark:text-gray-400 italic'>{children}</p>
);

/* TODO: replace these placeholder contact details with the real ones. */
const PRIVACY_EMAIL = 'privacy@alecmanpower.com';
const SUPPORT_EMAIL = 'support@alecmanpower.com';
const ADDRESS = 'ALEC Manpower, Dhaka, Bangladesh';

export const tabs: Tab[] = [
  {
    id: 'privacy',
    title: 'Privacy Policy',
    content: (
      <>
        <H2>Privacy Policy</H2>
        <P>
          <Brand /> operates a recruitment-to-deployment management system to
          process candidates for overseas employment. This policy explains what
          personal information the system holds, why, who can see it, and how it
          is protected. It applies to staff who use the system and to the
          candidates whose records it contains.
        </P>

        <H3>1. Information We Collect</H3>
        <H4>Candidate records</H4>
        <UL
          items={[
            <><strong>Identity:</strong> Name, father&apos;s name, date of birth, gender, photo, and address</>,
            <><strong>Contact:</strong> Mobile number and email address</>,
            <><strong>Passport:</strong> Passport number, issue and expiry dates, issue place, and a copy of the passport</>,
            <><strong>Recruitment:</strong> CV, interview results, selection status, and source agency or reference</>,
            <><strong>Medical:</strong> Appointment details, fit or unfit result, and medical reports</>,
            <><strong>Processing:</strong> Visa, PCC, biometric, training, BMET, ticket, and flight records</>,
            <><strong>Deployment:</strong> Departure, arrival, client receipt, and joining details</>
          ]}
        />

        <H4>Staff and system information</H4>
        <UL
          items={[
            <><strong>Account details:</strong> Name, work email, role, and department</>,
            <><strong>Activity records:</strong> Actions taken in the system, recorded in the audit log with date and time</>,
            <><strong>Technical data:</strong> IP address, browser, and device type for security and troubleshooting</>
          ]}
        />

        <H3>2. How We Use Information</H3>
        <OL
          items={[
            <><strong>Recruitment and processing:</strong> Match candidates to job orders and move them through each stage until deployment</>,
            <><strong>Client reporting:</strong> Share the status of selected candidates with the client who placed the job order</>,
            <><strong>Compliance:</strong> Prepare the documents that destination countries, embassies, and government bodies such as BMET require</>,
            <><strong>Operations:</strong> Create tasks, issues, and reminders, such as an expiring passport or a missed flight</>,
            <><strong>Security and accountability:</strong> Control access by role and keep an audit trail of important changes</>
          ]}
        />

        <H3>3. Who Can See Candidate Information</H3>
        <P>
          Access is limited by role. A medical team member sees the medical
          queue, a visa team member sees visa records, and so on. Management
          roles have read-only dashboards and reports. Every document requires a
          signed-in, authorized user.
        </P>

        <H3>4. Sharing and Disclosure</H3>
        <UL
          items={[
            <><strong>Clients and employers:</strong> The details needed to confirm selection, visa, and travel for their workers</>,
            <><strong>Medical centers, embassies, and authorities:</strong> Only what is needed for the specific process</>,
            <><strong>Service providers:</strong> Hosting and technology providers that operate the system for us</>,
            <><strong>Legal requirements:</strong> When required by law, court order, or a regulator</>
          ]}
        />
        <P>We do not sell personal information.</P>

        <H3>5. Data Security</H3>
        <UL
          items={[
            'Role-based access control and authenticated document access',
            'Encrypted connections when data is transmitted',
            'An audit log of important actions that cannot be edited',
            'Regular review of user accounts and permissions'
          ]}
        />

        <H3>6. Retention</H3>
        <P>
          We keep candidate records for as long as needed to complete
          processing, meet legal and client requirements, and resolve disputes.
          Historical passport details are kept against the candidate so earlier
          documents can still be traced.
        </P>

        <H3>7. Your Rights</H3>
        <P>
          Candidates may ask to see the information we hold about them, to
          correct inaccurate details, or to raise a concern about how it is
          used. Some records must be kept to meet legal or client requirements,
          and we will explain this if a request cannot be fully met.
        </P>

        <H3>8. Changes to This Policy</H3>
        <P>
          We may update this policy as the system changes. Material changes will
          be announced to staff through the system.
        </P>

        <H3>9. Contact Us</H3>
        <Box>
          <strong>Email:</strong> <Mail to={PRIVACY_EMAIL} />
          <br />
          <strong>Address:</strong> {ADDRESS}
        </Box>

        <Updated>Last Updated: October 4, 2026</Updated>
      </>
    )
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    content: (
      <>
        <H2>Terms of Service</H2>
        <P>
          These terms govern use of the <Brand /> management system. The system
          is for authorized staff only. By signing in you agree to follow them.
        </P>

        <H3>1. Accounts and Access</H3>
        <UL
          items={[
            'Accounts are created by a Super Admin and tied to a department and role.',
            'You may use only the access your role gives you.',
            'Keep your password private. Do not share your account.',
            'Report a lost password or suspected unauthorized access to your administrator immediately.'
          ]}
        />

        <H3>2. Responsible Use of Candidate Data</H3>
        <P>You must handle candidate information with care. You may not:</P>
        <UL
          items={[
            'Copy, export, or share candidate data or documents outside approved work purposes',
            'Look up candidates you have no work reason to view',
            'Upload files that are false, altered, or belong to someone else',
            'Share passport, medical, or visa documents through personal messaging apps or email'
          ]}
        />

        <H3>3. Accuracy of Records</H3>
        <P>
          Each team is responsible for the records in its own module. Update
          statuses promptly and enter dates and reference numbers as they appear
          on the source document. Corrections are made by adding a new entry,
          and the history is kept.
        </P>

        <H3>4. Audit and Monitoring</H3>
        <P>
          Important actions are recorded with your name, the time, and the
          change made. This log is used to resolve errors, review security, and
          meet client or regulatory requests.
        </P>

        <H3>5. Prohibited Activity</H3>
        <UL
          items={[
            'Attempting to access modules or records outside your role',
            'Uploading malicious files or trying to disrupt the system',
            'Deleting or altering records to conceal an action',
            'Using the system for any unlawful purpose'
          ]}
        />

        <H3>6. Intellectual Property</H3>
        <P>
          The system, its design, and its content belong to <Brand /> and its
          developer. You may not copy, resell, or reverse engineer it.
        </P>

        <H3>7. Suspension</H3>
        <P>
          We may suspend or remove access at any time if these terms are
          broken, a role changes, or employment ends.
        </P>

        <H3>8. Availability and Liability</H3>
        <P>
          We work to keep the system available but do not guarantee it will be
          uninterrupted. Staff should keep copies of critical deadlines where
          the business requires it. To the extent permitted by law, we are not
          liable for indirect or consequential loss from using the system.
        </P>

        <H3>9. Governing Law</H3>
        <P>These terms are governed by the laws of Bangladesh.</P>

        <H3>10. Changes to These Terms</H3>
        <P>
          We may update these terms and will notify users in the system.
          Continued use means you accept the updated terms.
        </P>

        <H3>11. Contact</H3>
        <Box>
          <strong>System support:</strong> <Mail to={SUPPORT_EMAIL} />
          <br />
          <strong>Address:</strong> {ADDRESS}
        </Box>

        <Updated>Effective Date: October 4, 2026</Updated>
      </>
    )
  },
  {
    id: 'cookies',
    title: 'Cookie Policy',
    content: (
      <>
        <H2>Cookie Policy</H2>
        <P>
          This policy explains the cookies and similar storage that the{' '}
          <Brand /> system uses, and how you can control them.
        </P>

        <H3>1. What We Use</H3>
        <H4>Essential</H4>
        <P>
          These keep you signed in and protect your account. The system cannot
          work without them.
        </P>
        <UL
          items={[
            <><strong>Session and authentication:</strong> Keeps you signed in as you move between pages</>,
            <><strong>Security:</strong> Helps protect against forged requests and misuse</>
          ]}
        />

        <H4>Preferences</H4>
        <UL
          items={[
            <><strong>Theme:</strong> Remembers light or dark mode</>,
            <><strong>Interface choices:</strong> Remembers saved filters and table settings on your device</>
          ]}
        />

        <H3>2. What We Do Not Use</H3>
        <P>
          The system does not use advertising cookies and does not track you
          across other websites.
        </P>

        <H3>3. Managing Cookies</H3>
        <P>
          You can clear or block cookies in your browser settings. If you block
          essential cookies you will not be able to sign in. Clearing
          preference cookies resets your theme and saved filters.
        </P>

        <H3>4. Changes</H3>
        <P>We will update this page if the cookies we use change.</P>

        <H3>5. Contact</H3>
        <Box>
          <strong>Email:</strong> <Mail to={PRIVACY_EMAIL} />
        </Box>

        <Updated>Last Updated: October 4, 2026</Updated>
      </>
    )
  }
];