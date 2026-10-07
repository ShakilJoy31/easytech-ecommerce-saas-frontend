import Link from 'next/link';

export default function HomeCTA() {
  return (
    <section className='bg-[#F2A900] py-14'>
      <div className='container mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
        <div>
          <h2 className='text-2xl md:text-3xl font-bold text-[#0B1F3A] font-[family-name:var(--font-display)]'>
            Find any candidate in seconds
          </h2>
          <p className='mt-1 text-[#0B1F3A]/80'>
            Search by passport, code, name, mobile, visa number or PNR.
          </p>
        </div>
        <div className='flex gap-3'>
          <Link
            href='/candidates'
            className='rounded-lg bg-[#0B1F3A] px-6 py-3 font-semibold text-white hover:bg-[#13315C] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B1F3A]/40 transition-colors'
          >
            Search candidates
          </Link>
          <Link
            href='/login'
            className='rounded-lg border-2 border-[#0B1F3A] px-6 py-3 font-semibold text-[#0B1F3A] hover:bg-[#0B1F3A]/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0B1F3A]/40 transition-colors'
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}