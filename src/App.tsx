import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CreatePlanPage } from './pages/CreatePlanPage';
import { PlanDetailPage } from './pages/PlanDetailPage';
import { StatsPage } from './pages/StatsPage';
import { BottomNav } from './components/BottomNav';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 pb-20 print:bg-white print:pb-0">
      <main className="flex-1 max-w-md w-full mx-auto bg-slate-50 min-h-screen shadow-none print:shadow-none print:max-w-none">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreatePlanPage />} />
          <Route path="/plan/:id" element={<PlanDetailPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/profile" element={<div className="p-6 text-center text-gray-500 mt-20">敬请期待...</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
