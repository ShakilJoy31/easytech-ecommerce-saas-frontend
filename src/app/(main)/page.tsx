import { generateDynamicMetadata } from '@/metadata/generateMetadata';
import { Suspense } from 'react';
import HomeHero from '@/components/home/HomeHero';
import ProjectPurpose from '@/components/home/Projectpurpose';
import LifecyclePipeline from '@/components/home/Lifecyclepipeline';
import Candidate360 from '@/components/home/Candidate360';
import CountryWorkflow from '@/components/home/Countryworkflow';
import ModulesOverview from '@/components/home/Modulesoverview';
import TradeSnapshot from '@/components/home/Tradesnapshot';
import RolesAndScope from '@/components/home/Rolesandscope';
import HomeCTA from '@/components/home/Homecta';

export async function generateMetadata() {
  return generateDynamicMetadata({
    title: 'Rahmania Corporation',
    description:
      'One master record for every candidate, from recruitment, medical, visa, training and BMET to ticketing and deployment.',
    keywords: [
      'manpower ERP',
      'recruitment management system',
      'candidate tracking',
      'visa processing',
      'BMET clearance',
      'deployment tracking',
      'ALEC Manpower'
    ]
  });
}

const HomePage = () => {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
          <div className='text-center'>
            <div className='w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
            <p className='text-xl text-gray-600 dark:text-gray-300'>
              Loading Home Page...
            </p>
          </div>
        </div>
      }
    >
      <main>
        <HomeHero />
        <ProjectPurpose />
        <LifecyclePipeline />
        <Candidate360 />
        <CountryWorkflow />
        <ModulesOverview />
        <TradeSnapshot />
        <RolesAndScope />
        <HomeCTA />
      </main>
    </Suspense>
  );
};

export default HomePage;