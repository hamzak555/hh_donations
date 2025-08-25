import React from 'react';
import { TestSupabaseContainers } from '@/test-supabase-containers';

const DiagnosticPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Diagnostic</h1>
      <p>Diagnostic tools and information.</p>
      <TestSupabaseContainers />
    </div>
  );
};

export default DiagnosticPage;