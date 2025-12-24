import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import GlobalErrorBoundary from '@/components/common/GlobalErrorBoundary';
import { Web3Provider } from '@/components/web3/Web3Provider';
import { PagesContent } from '@/pages';

function App() {
  return (
    <React.StrictMode>
      <GlobalErrorBoundary>
        <Web3Provider>
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <PagesContent />
            </BrowserRouter>
          </Suspense>
        </Web3Provider>
      </GlobalErrorBoundary>
    </React.StrictMode>
  );
}

export default App;
