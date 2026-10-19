'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('../../App'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen bg-[#fafbfc] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
    </div>
  )
});

export default function CompliancePage() {
  return <App />;
}
