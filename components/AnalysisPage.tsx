import React, { useState, useEffect, useMemo } from 'react';
import { getSheetData, getDates } from '../services/sheetService';
import { analyzeTask } from '../services/geminiService';
import { Task, TaskData, AnalysisStatus } from '../types';
import TaskCard from './TaskCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import { CheckCircleIcon, ExclamationTriangleIcon } from './icons';

interface AnalysisPageProps {
  employee: string;
  onBack: () => void;
}

const AnalysisPage: React.FC<AnalysisPageProps> = ({ employee, onBack }) => {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState<string>('');
  const [hasUserSelectedDate, setHasUserSelectedDate] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setProcessingMessage(`Fetching data for ${employee}...`);

        const [taskData, dateList] = await Promise.all([
          getSheetData(employee),
          getDates(employee),
        ]);

        if (taskData.length === 0) {
          setError("No tasks found for this employee.");
          setIsLoading(false);
          return;
        }

        const initialTasks: Task[] = taskData.map(data => ({
          id: data.id,
          taskData: data,
          analysis: null,
          status: AnalysisStatus.PENDING,
        }));

        setAllTasks(initialTasks);
        setDates(dateList);
        // Do not autoselect the first date
        // if (dateList.length > 0) {
        //   setSelectedDate(dateList[0]);
        // }
        setIsLoading(false);
        setProcessingMessage('');

      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [employee]);

  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return allTasks.filter(task => task.taskData.date === selectedDate);
  }, [allTasks, selectedDate]);

  useEffect(() => {
    const processTasks = async () => {
      if (tasksForSelectedDate.length === 0 || !hasUserSelectedDate) return;

      const pendingTasks = tasksForSelectedDate.filter(t => t.status === AnalysisStatus.PENDING);
      if (pendingTasks.length === 0) return;

      for (let i = 0; i < pendingTasks.length; i++) {
        const taskToProcess = pendingTasks[i];
        setProcessingMessage(`Analyzing task ${i + 1} of ${pendingTasks.length} for ${selectedDate}...`);
        
        setAllTasks(prev => prev.map(t => t.id === taskToProcess.id ? { ...t, status: AnalysisStatus.ANALYZING } : t));

        try {
          const analysis = await analyzeTask(taskToProcess.taskData);
          setAllTasks(prev =>
            prev.map(t =>
              t.id === taskToProcess.id ? { ...t, analysis, status: AnalysisStatus.COMPLETED } : t
            )
          );
        } catch (e) {
          console.error(`Failed to analyze task ${taskToProcess.id}:`, e);
          setAllTasks(prev =>
            prev.map(t =>
              t.id === taskToProcess.id ? { ...t, status: AnalysisStatus.FAILED } : t
            )
          );
        }
        
        if (i < pendingTasks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay between API calls
        }
      }
      setProcessingMessage('');
    };

    processTasks();
  }, [tasksForSelectedDate, hasUserSelectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (date) {
        setHasUserSelectedDate(true);
    } else {
        setHasUserSelectedDate(false);
    }
  };

  const analyzedCount = tasksForSelectedDate.filter(t => t.status === AnalysisStatus.COMPLETED).length;
  const failedCount = tasksForSelectedDate.filter(t => t.status === AnalysisStatus.FAILED).length;
  const totalCount = tasksForSelectedDate.length;
  const isAnalyzing = tasksForSelectedDate.some(t => t.status === AnalysisStatus.ANALYZING) || processingMessage;

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Analysis for {employee}</h1>
                <p className="text-slate-500 dark:text-slate-400">Select a date to view the task analysis.</p>
            </div>
            <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Back to Selection
            </button>
        </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center h-64">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">{processingMessage || 'Initializing...'}</p>
        </div>
      )}

      {error && <ErrorDisplay message={error} onRetry={onBack} />}

      {!isLoading && !error && (
        <>
          <div className="mb-6">
            <label htmlFor="date-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Date</label>
            <select
              id="date-select"
              value={selectedDate}
              onChange={handleDateChange}
              className="block w-full max-w-xs px-4 py-3 text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option value="">-- Select a date --</option>
              {dates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>

          {selectedDate && hasUserSelectedDate && totalCount > 0 && (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md mb-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">Analysis for {selectedDate}</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <CheckCircleIcon className="w-5 h-5 mr-1.5"/>
                  <span>Analyzed: {analyzedCount}/{totalCount}</span>
                </div>
                {failedCount > 0 && (
                  <div className="flex items-center text-red-600 dark:text-red-400">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-1.5"/>
                    <span>Failed: {failedCount}</span>
                  </div>
                )}
              </div>
              {isAnalyzing && (
                <div className="mt-4">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${totalCount > 0 ? (analyzedCount + failedCount) / totalCount * 100 : 0}%` }}></div>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{processingMessage}</p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasksForSelectedDate.map((task, index) => (
              <div key={task.id} className="animate-slide-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <TaskCard task={task} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AnalysisPage;
