import { COUNTRY_FLOWS } from "@/utils/constant/data";


export default function CountryWorkflow() {
  return (
    <section className='bg-[#0B1F3A] text-white py-16 md:py-24'>
      <div className='container mx-auto px-4'>
        <div className='max-w-3xl'>
          <h2 className='text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)]'>
            Every destination has its own route
          </h2>
          <p className='mt-4 text-lg text-slate-300 leading-relaxed'>
            The UAE needs six steps; Saudi Arabia needs ten. Instead of adding
            columns for each rule, the system runs a configurable workflow per
            country, so a new requirement is a setting, not a software change.
          </p>
        </div>

        <div className='mt-12 space-y-10'>
          {COUNTRY_FLOWS.map((flow) => (
            <div key={flow.country}>
              <h3 className='text-sm font-semibold text-slate-400 mb-4'>
                {flow.country} · {flow.steps.length} steps
              </h3>
              <ol className='flex flex-wrap items-center gap-y-3'>
                {flow.steps.map((step, i) => (
                  <li key={step} className='flex items-center'>
                    <span
                      className={`rounded-md px-4 py-2 text-sm font-medium border ${
                        step === 'Flight'
                          ? 'bg-[#F2A900] text-[#0B1F3A] border-[#F2A900]'
                          : 'bg-white/5 border-white/20'
                      }`}
                    >
                      {step}
                    </span>
                    {i < flow.steps.length - 1 && (
                      <span aria-hidden className='mx-2 h-px w-5 bg-white/30' />
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}