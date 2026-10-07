import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';
import Image from 'next/image';
import alecLogoDark from '../../../public/The_Logo/alec_logo_dark.png';
import { SNAPSHOT } from '@/utils/constant/data';

const BARS = [
  ['Registered', SNAPSHOT.totalCandidates],
  ['Selected', SNAPSHOT.selected],
  ['Medically fit', SNAPSHOT.medicallyFit],
  ['Training completed', SNAPSHOT.trainingCompleted],
  ['Visa stamped', SNAPSHOT.visaStamped],
  ['Flown', SNAPSHOT.flown]
] as const;

export default function HomeHero() {
  return (
    <section
      className='relative overflow-hidden bg-[#0B1F3A] text-white'
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
        backgroundSize: '48px 48px'
      }}
    >
      <div className='container mx-auto px-4 py-16 md:py-24 grid gap-12 lg:grid-cols-[1.15fr_1fr] items-center'>
        <div>
          <Image
            src={alecLogoDark}
            alt='ALEC Manpower'
            priority
            className='h-14 w-auto mb-10'
          />

          <h1 className='text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight font-[family-name:var(--font-display)]'>
            One candidate. One record. From recruitment to deployment.
          </h1>

          <p className='mt-6 max-w-xl text-lg text-slate-300 leading-relaxed'>
            ALEC Manpower ERP replaces the spreadsheets that track every worker
            through selection, medical, visa, training, BMET, ticketing and
            departure, so every team works from the same live picture.
          </p>

          <div className='mt-9 flex flex-wrap gap-3'>
            <Link
              href='/dashboard'
              className='inline-flex items-center gap-2 rounded-lg bg-[#F2A900] px-6 py-3 font-semibold text-[#0B1F3A] hover:bg-[#ffbd2e] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F2A900]/50 transition-colors'
            >
              Open dashboard <FaArrowRight className='text-sm' />
            </Link>
            <Link
              href='/candidates'
              className='inline-flex items-center rounded-lg border border-white/30 px-6 py-3 font-semibold hover:bg-white/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 transition-colors'
            >
              Search a candidate
            </Link>
          </div>
        </div>

        {/* Live-style snapshot */}
        <div className='rounded-2xl bg-white/[0.06] border border-white/15 p-6 md:p-8 backdrop-blur'>
          <div className='flex items-baseline justify-between gap-4 mb-6'>
            <h2 className='text-lg font-semibold'>Where 6,404 candidates stand</h2>
            <span className='text-xs text-slate-400 text-right'>
              Snapshot: {SNAPSHOT.label}
            </span>
          </div>

          <ul className='space-y-4'>
            {BARS.map(([label, value]) => (
              <li key={label}>
                <div className='flex justify-between text-sm mb-1.5'>
                  <span className='text-slate-300'>{label}</span>
                  <span className='font-semibold tabular-nums'>
                    {value.toLocaleString()}
                  </span>
                </div>
                <div
                  className='h-2 rounded-full bg-white/10 overflow-hidden'
                  role='img'
                  aria-label={`${label}: ${value} of ${SNAPSHOT.totalCandidates}`}
                >
                  <div
                    className={`h-full rounded-full ${
                      label === 'Flown' ? 'bg-[#F2A900]' : 'bg-sky-400'
                    }`}
                    style={{ width: `${(value / SNAPSHOT.totalCandidates) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>

          <p className='mt-6 text-xs text-slate-400'>
            {SNAPSHOT.cancelled} cancelled · {SNAPSHOT.medicallyUnfit} medically
            unfit · {SNAPSHOT.flightMissed} flights missed
          </p>
        </div>
      </div>
    </section>
  );
}