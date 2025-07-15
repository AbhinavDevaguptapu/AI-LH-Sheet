
import React, { useState } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import AnalysisPage from './components/AnalysisPage';

const App: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const handleEmployeeSelect = (employee: string) => {
    setSelectedEmployee(employee);
  };

  const handleBack = () => {
    setSelectedEmployee(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <Header />
      <main>
        {!selectedEmployee ? (
          <LandingPage onEmployeeSelect={handleEmployeeSelect} />
        ) : (
          <AnalysisPage employee={selectedEmployee} onBack={handleBack} />
        )}
      </main>
    </div>
  );
};

export default App;

