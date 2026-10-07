import { BEFORE_AFTER } from "@/utils/constant/data";


export default function ProjectPurpose() {
  return (
    <section className='bg-white dark:bg-slate-950 py-16 md:py-24'>
      <div className='container mx-auto px-4'>
        <div className='max-w-3xl'>
          <h2 className='text-3xl md:text-4xl font-bold text-[#0B1F3A] dark:text-white font-[family-name:var(--font-display)]'>
            Built to end the spreadsheet chase
          </h2>
          <p className='mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed'>
            Recruiting and deploying thousands of workers abroad involves many
            teams handing one person from desk to desk. Today that hand-off lives
            in spreadsheets. This system gives each candidate a single master
            record that every team updates and every manager can trust.
          </p>
        </div>

        <div className='mt-12 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800'>
          <div className='hidden md:grid grid-cols-2 bg-slate-100 dark:bg-slate-900 text-sm font-semibold'>
            <div className='px-6 py-3 text-slate-500 dark:text-slate-400'>Today, with spreadsheets</div>
            <div className='px-6 py-3 text-[#0B1F3A] dark:text-[#F2A900] border-l border-slate-200 dark:border-slate-800'>
              With ALEC Manpower ERP
            </div>
          </div>

          {BEFORE_AFTER.map((row, i) => (
            <div
              key={i}
              className='grid md:grid-cols-2 border-t border-slate-200 dark:border-slate-800 first:border-t-0 md:first:border-t'
            >
              <p className='px-6 py-5 text-slate-500 dark:text-slate-400'>
                <span className='md:hidden block text-xs font-semibold mb-1'>Today</span>
                {row.before}
              </p>
              <p className='px-6 py-5 text-slate-900 dark:text-slate-100 bg-amber-50/60 dark:bg-slate-900/60 md:border-l border-slate-200 dark:border-slate-800'>
                <span className='md:hidden block text-xs font-semibold mb-1 text-[#B37A00]'>With ALEC ERP</span>
                {row.after}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}