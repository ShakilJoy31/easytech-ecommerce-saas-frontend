'use client';

import { LIFECYCLE } from '@/utils/constant/data';
import { useState } from 'react';

export default function LifecyclePipeline() {
  const [activeId, setActiveId] = useState(LIFECYCLE[0].id);
  const activeIndex = LIFECYCLE.findIndex((s) => s.id === activeId);
  const active = LIFECYCLE[activeIndex];

  return (
    <section className='bg-slate-50 dark:bg-slate-900 py-16 md:py-24'>
      <div className='container mx-auto px-4'>
        <div className='max-w-3xl'>
          <h2 className='text-3xl md:text-4xl font-bold text-[#0B1F3A] dark:text-white font-[family-name:var(--font-display)]'>
            The journey every worker takes
          </h2>
          <p className='mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed'>
            A client places a job order, a batch is formed, and each candidate
            moves through these stages until the client confirms they have
            joined. Select a stage to see who owns it and which statuses it
            tracks.
          </p>
        </div>

        {/* Stage rail */}
        <div className='mt-10 overflow-x-auto pb-2'>
          <ol className='flex min-w-max md:min-w-0 md:grid md:grid-cols-10 gap-1' role='tablist' aria-label='Lifecycle stages'>
            {LIFECYCLE.map((stage, i) => {
              const isActive = stage.id === activeId;
              const isPast = i < activeIndex;
              return (
                <li key={stage.id} className='flex-1'>
                  <button
                    role='tab'
                    aria-selected={isActive}
                    onClick={() => setActiveId(stage.id)}
                    className='group w-full text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F2A900]/60 rounded-md'
                  >
                    <div
                      className={`h-2 rounded-full transition-colors ${
                        isActive
                          ? 'bg-[#F2A900]'
                          : isPast
                          ? 'bg-[#0B1F3A] dark:bg-sky-400'
                          : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    />
                    <div
                      className={`mt-3 px-1 pr-3 text-sm leading-snug w-28 md:w-auto ${
                        isActive
                          ? 'font-semibold text-[#0B1F3A] dark:text-white'
                          : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                      }`}
                    >
                      {stage.name}
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Detail */}
        <div
          role='tabpanel'
          className='mt-8 grid gap-8 md:grid-cols-[1.2fr_1fr] rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 md:p-8'
        >
          <div>
            <h3 className='text-2xl font-semibold text-[#0B1F3A] dark:text-white'>
              {active.name}
            </h3>
            <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
              Owned by the {active.team}
            </p>
            <p className='mt-4 text-slate-700 dark:text-slate-300 leading-relaxed'>
              {active.summary}
            </p>
          </div>
          <div>
            <h4 className='text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3'>
              Statuses tracked
            </h4>
            <ul className='flex flex-wrap gap-2'>
              {active.statuses.map((s) => (
                <li
                  key={s}
                  className='rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-sm text-slate-800 dark:text-slate-200'
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}