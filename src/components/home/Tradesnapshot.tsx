import { SNAPSHOT, TRADE_SUMMARY } from "@/utils/constant/data";


export default function TradeSnapshot() {
  const max = Math.max(...TRADE_SUMMARY.map((t) => t.selected));

  return (
    <section className='bg-white dark:bg-slate-950 py-16 md:py-24'>
      <div className='container mx-auto px-4'>
        <div className='max-w-3xl'>
          <h2 className='text-3xl md:text-4xl font-bold text-[#0B1F3A] dark:text-white font-[family-name:var(--font-display)]'>
            Managers see the numbers behind every number
          </h2>
          <p className='mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed'>
            Dashboards for management, clients, agencies, trades and daily
            operations. Every figure opens the filtered list of candidates
            behind it. Here is the current trade view from the ALEC 2026 sheet.
          </p>
        </div>

        <div className='mt-10 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800'>
          <table className='w-full min-w-[560px] text-sm'>
            <caption className='sr-only'>Selected, visa stamped and flown candidates by trade</caption>
            <thead className='bg-slate-100 dark:bg-slate-900 text-left text-slate-600 dark:text-slate-400'>
              <tr>
                <th className='px-5 py-3 font-semibold'>Trade</th>
                <th className='px-5 py-3 font-semibold w-1/3'>Selected</th>
                <th className='px-5 py-3 font-semibold text-right'>Visa stamped</th>
                <th className='px-5 py-3 font-semibold text-right'>Flown</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-200 dark:divide-slate-800'>
              {TRADE_SUMMARY.map((t) => (
                <tr key={t.trade} className='text-slate-800 dark:text-slate-200'>
                  <td className='px-5 py-3 font-medium'>{t.trade}</td>
                  <td className='px-5 py-3'>
                    <div className='flex items-center gap-3'>
                      <div className='h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden'>
                        <div className='h-full rounded-full bg-[#0B1F3A] dark:bg-sky-400' style={{ width: `${(t.selected / max) * 100}%` }} />
                      </div>
                      <span className='w-12 text-right tabular-nums'>{t.selected.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className='px-5 py-3 text-right tabular-nums'>{t.visa.toLocaleString()}</td>
                  <td className='px-5 py-3 text-right tabular-nums font-semibold'>{t.flown.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className='mt-4 text-sm text-slate-500 dark:text-slate-400'>
          Totals across all trades: {SNAPSHOT.selected.toLocaleString()} selected, {SNAPSHOT.visaStamped.toLocaleString()} visas
          stamped, {SNAPSHOT.flown.toLocaleString()} flown. Figures are a snapshot and will be replaced by live data.
        </p>
      </div>
    </section>
  );
}