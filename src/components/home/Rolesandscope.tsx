import { ROLES } from "@/utils/constant/data";


const IN_SCOPE = [
  'Candidates and passports',
  'Clients, agencies and job orders',
  'Recruitment, interview and selection',
  'Documents and verification',
  'Medical and country processing',
  'Visa, training and BMET',
  'Ticket, flight and deployment',
  'Issues, tasks and notifications',
  'Dashboards, reports and audit'
];
const OUT_OF_SCOPE = ['Accounts', 'Finance', 'Invoicing', 'Revenue and expense', 'Profit and loss'];

export default function RolesAndScope() {
  return (
    <section className='bg-slate-50 dark:bg-slate-900 py-16 md:py-24'>
      <div className='container mx-auto px-4 grid gap-14 lg:grid-cols-2'>
        <div>
          <h2 className='text-3xl font-bold text-[#0B1F3A] dark:text-white font-[family-name:var(--font-display)]'>
            The right access for each team
          </h2>
          <p className='mt-3 text-slate-600 dark:text-slate-300'>
            Role-based permissions keep each department in its own queue, with
            read-only views for management.
          </p>
          <dl className='mt-6 divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800'>
            {ROLES.map(([role, access]) => (
              <div key={role} className='grid sm:grid-cols-[180px_1fr] gap-1 sm:gap-4 py-3'>
                <dt className='font-semibold text-slate-900 dark:text-white'>{role}</dt>
                <dd className='text-sm text-slate-600 dark:text-slate-400'>{access}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h2 className='text-3xl font-bold text-[#0B1F3A] dark:text-white font-[family-name:var(--font-display)]'>
            What Version 1 covers
          </h2>
          <p className='mt-3 text-slate-600 dark:text-slate-300'>
            Version 1 focuses on operations, from first CV to the client
            receiving the worker.
          </p>
          <ul className='mt-6 space-y-2'>
            {IN_SCOPE.map((item) => (
              <li key={item} className='flex gap-3 text-slate-800 dark:text-slate-200'>
                <span aria-hidden className='text-emerald-600 font-bold'>✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className='mt-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-5'>
            <h3 className='font-semibold text-slate-900 dark:text-white'>Planned for later</h3>
            <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
              {OUT_OF_SCOPE.join(', ')}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}