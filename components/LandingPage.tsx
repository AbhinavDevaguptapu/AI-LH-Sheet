import React, { useState, useEffect } from 'react';
import { getSubsheetNames } from '../services/sheetService';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';

interface LandingPageProps {
  onEmployeeSelect: (employee: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEmployeeSelect }) => {
  const [employees, setEmployees] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const names = await getSubsheetNames();
        setEmployees(names);
        if (names.length > 0) {
          setSelectedEmployee(names[0]);
        }
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : 'An unknown error occurred while fetching employee data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmployee(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmployee) {
      onEmployeeSelect(selectedEmployee);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl dark:bg-slate-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Learning Hours Analysis</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Select an employee to begin the analysis.</p>
        </div>

        {isLoading && (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        )}

        {error && (
            <ErrorDisplay message={error} onRetry={() => window.location.reload()} />
        )}

        {!isLoading && !error && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label htmlFor="employee-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Employee Name</label>
              <select
                id="employee-select"
                value={selectedEmployee}
                onChange={handleSelectChange}
                className="block w-full px-4 py-3 text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
              >
                {employees.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={!selectedEmployee}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed dark:focus:ring-offset-slate-800"
            >
              Get Analysis
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
