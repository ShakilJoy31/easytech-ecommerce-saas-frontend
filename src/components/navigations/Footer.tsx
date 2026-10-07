import { MdLocationOn, MdEmail, MdLock } from 'react-icons/md';
import { FaLinkedinIn, FaFacebookF, FaGlobe } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import Link from 'next/link';
import Image from 'next/image';
import alecLogoDark from '../../../public/The_Logo/alec_logo_dark.png';
import Paragraph from '../reusable-components/Paragraph';

const COLUMNS = [
  {
    title: 'Recruitment',
    links: [
      ['Candidates', '/candidates'],
      ['Clients', '/clients'],
      ['Agencies', '/agencies'],
      ['Job Orders', '/job-orders'],
      ['Batches', '/batches'],
      ['Documents', '/documents']
    ]
  },
  {
    title: 'Processing',
    links: [
      ['Medical', '/medical'],
      ['Country Processing', '/country-processing'],
      ['Visa', '/visa'],
      ['Training', '/training'],
      ['BMET', '/bmet'],
      ['Ticket & Travel', '/travel']
    ]
  },
  {
    title: 'Operations',
    links: [
      ['Dashboard', '/dashboard'],
      ['Deployment', '/deployment'],
      ['Issues', '/issues'],
      ['Tasks', '/tasks'],
      ['Reports', '/reports'],
      ['Audit Log', '/audit-log']
    ]
  }
] as const;

// TODO: replace with the company's real contact details and social URLs
const CONTACT = {
  address: 'ALEC Manpower, Dhaka, Bangladesh',
  email: 'support@alecmanpower.com'
};

export default function Footer() {
  return (
    <footer className='bg-[#0B1F3A] text-slate-300'>
      {/* Amber rule echoes the logo underline */}
      <div className='h-1 bg-[#F2A900]' />

      <div className='container mx-auto px-4 pt-12 grid grid-cols-2 lg:grid-cols-6 gap-10'>
        {/* Brand */}
        <div className='col-span-2'>
          <Link href='/' aria-label='ALEC Manpower home'>
            <Image
              src={alecLogoDark}
              alt='ALEC Manpower'
              className='h-14 w-auto mb-5'
            />
          </Link>

          <Paragraph className='text-sm text-slate-300 max-w-sm'>
            Recruitment-to-deployment management. One master record for every
            candidate, from first CV to joining the client.
          </Paragraph>

          <div className='flex items-start gap-2 mt-5'>
            <MdLocationOn className='text-[#F2A900] mt-0.5 shrink-0' />
            <Paragraph className='text-sm text-slate-300'>{CONTACT.address}</Paragraph>
          </div>
          <div className='flex items-center gap-2 mt-2'>
            <MdEmail className='text-[#F2A900] shrink-0' />
            <a href={`mailto:${CONTACT.email}`} className='text-sm hover:text-white'>
              {CONTACT.email}
            </a>
          </div>

          <div className='flex gap-3 mt-5'>
            {[
              [FaLinkedinIn, 'LinkedIn'],
              [FaFacebookF, 'Facebook'],
              [FaGlobe, 'Website']
            ].map(([Icon, label], i) => {
              const I = Icon as IconType;
              return (
                <Link
                  key={i}
                  href='#'
                  aria-label={label as string}
                  className='bg-white/10 hover:bg-[#F2A900] hover:text-[#0B1F3A] p-2.5 rounded-full text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2A900]'
                >
                  <I />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Link columns */}
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <div className='text-base font-semibold mb-4 text-white'>{col.title}</div>
            <ul className='space-y-2 text-sm'>
              {col.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className='hover:text-[#F2A900] transition-colors'>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Access strip (replaces the newsletter block, which does not fit an internal ERP) */}
      <div className='container mx-auto mt-12 px-4'>
        <div className='rounded-xl bg-white/[0.06] border border-white/15 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div>
            <h2 className='text-lg font-semibold text-white'>Need access to the system?</h2>
            <p className='text-sm text-slate-300 mt-1'>
              Accounts are created by a Super Admin and limited to your department&apos;s role.
            </p>
          </div>
          <div className='flex gap-3'>
            <Link
              href='/login'
              className='bg-[#F2A900] text-[#0B1F3A] px-5 py-2.5 rounded-lg font-semibold hover:bg-[#ffbd2e] transition-colors'
            >
              Sign in
            </Link>
            <a
              href={`mailto:${CONTACT.email}?subject=ALEC%20ERP%20access%20request`}
              className='border border-white/30 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-white/10 transition-colors'
            >
              Request access
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className='container mx-auto mt-10 border-t border-white/15 py-5 px-4 flex flex-col md:flex-row justify-between items-center gap-3'>
        <Paragraph className='text-sm text-slate-400'>
          © {new Date().getFullYear()} ALEC Manpower. Built by FIT InfoTech. All rights reserved.
        </Paragraph>

        <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-sm'>
          <span className='flex items-center gap-1 text-emerald-400'>
            <MdLock /> Authorized personnel only
          </span>
          <span aria-hidden className='text-slate-600'>|</span>
          <Link href='/privacy-policy' className='hover:text-[#F2A900]'>Privacy Policy</Link>
          <span aria-hidden className='text-slate-600'>|</span>
          <Link href='/terms' className='hover:text-[#F2A900]'>Terms of Service</Link>
          <span aria-hidden className='text-slate-600'>|</span>
          <Link href='/accessibility' className='hover:text-[#F2A900]'>Accessibility</Link>
          <span aria-hidden className='text-slate-600'>|</span>
          <Link href='/cookie-policy' className='hover:text-[#F2A900]'>Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
}