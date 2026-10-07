'use client';

import { CANDIDATE_360, SCENARIOS } from '@/utils/constant/data';
import { useState } from 'react';


const TONE: Record<string, string> = {
  ok: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  wait: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  bad: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  idle: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
};

export default function Candidate360() {
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[1].id);
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];

  return (
    <section className='bg-white dark:bg-slate-950 py-16 md:py-24'>
      <div className='container mx-auto px-4 grid gap-12 lg:grid-cols-2 items-start'>
        <div>
          <h2 className='text-3xl md:text-4xl font-bold text-[#0B1F3A] dark:text-white font-[family-name:var(--font-display)]'>
            Candidate 360°: everything on one screen
          </h2>
          <p className='mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed'>
            Search by passport, candidate code, name, mobile, visa number or
            ticket PNR and the whole lifecycle opens, with every document,
            open issue and status change in one place.
          </p>

          <ul className='mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-slate-700 dark:text-slate-300'>
            {CANDIDATE_360.map((item) => (
              <li key={item} className='flex gap-2 items-start text-sm'>
                <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F2A900]' />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Status engine demo */}
        <div className='rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-6 md:p-8'>
          <h3 className='text-xl font-semibold text-[#0B1F3A] dark:text-white'>
            Status is calculated, not typed
          </h3>
          <p className='mt-2 text-sm text-slate-600 dark:text-slate-400'>
            The overall status follows the component records. Try a scenario:
          </p>

          <div className='mt-4 flex flex-wrap gap-2' role='group' aria-label='Scenario'>
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => setScenarioId(s.id)}
                aria-pressed={s.id === scenarioId}
                className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F2A900]/60 ${
                  s.id === scenarioId
                    ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-[#F2A900] dark:text-[#0B1F3A] dark:border-[#F2A900]'
                    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <dl className='mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3'>
            {scenario.parts.map(([name, value, tone]) => (
              <div key={name} className='rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3'>
                <dt className='text-xs text-slate-500 dark:text-slate-400'>{name}</dt>
                <dd className={`mt-1 inline-block rounded px-2 py-0.5 text-sm font-medium ${TONE[tone]}`}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <div className='mt-5 flex items-center justify-between gap-3 rounded-lg bg-[#0B1F3A] text-white px-4 py-3'>
            <span className='text-sm text-slate-300'>Overall</span>
            <span aria-live='polite' className='font-semibold text-right'>
              {scenario.overall}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}