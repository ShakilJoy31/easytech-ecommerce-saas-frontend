import { MODULE_GROUPS } from "@/utils/constant/data";


export default function ModulesOverview() {
  return (
    <section className='bg-slate-50 dark:bg-slate-900 py-16 md:py-24'>
      <div className='container mx-auto px-4'>
        <div className='max-w-3xl'>
          <h2 className='text-3xl md:text-4xl font-bold text-[#0B1F3A] dark:text-white font-[family-name:var(--font-display)]'>
            22 modules, grouped by the work they do
          </h2>
          <p className='mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed'>
            Each team sees its own queue; managers see across all of them.
          </p>
        </div>

        <div className='mt-10 divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800'>
          {MODULE_GROUPS.map((group) => (
            <div key={group.title} className='grid gap-4 md:grid-cols-[220px_1fr] py-6'>
              <div>
                <h3 className='text-lg font-semibold text-[#0B1F3A] dark:text-white'>
                  {group.title}
                </h3>
                <p className='text-sm text-slate-500 dark:text-slate-400 mt-1'>
                  {group.blurb}
                </p>
              </div>
              <ul className='flex flex-wrap gap-2 content-start'>
                {group.items.map((item) => (
                  <li
                    key={item}
                    className='rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-sm text-slate-800 dark:text-slate-200'
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}