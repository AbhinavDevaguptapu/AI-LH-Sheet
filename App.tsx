
import React, { useState, useEffect, useCallback } from 'react';
import { getSheetData } from './services/sheetService';
import { analyzeTask } from './services/geminiService';
import { Task, AnalysisStatus } from './types';
import Header from './components/Header';
import TaskCard from './components/TaskCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import { PermissionsGuide } from './components/PermissionsGuide';
import { CheckCircleIcon, ExclamationTriangleIcon } from './components/icons';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showPermissionsGuide, setShowPermissionsGuide] = useState<boolean>(false);
  const [processingMessage, setProcessingMessage] = useState<string>('');
  
  const processTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setShowPermissionsGuide(false);
      setTasks([]); 
      setProcessingMessage('Fetching tasks from Google Sheet...');
      
      const rawTasks = await getSheetData();
      const initialTasks: Task[] = rawTasks.map((text, index) => ({
        id: index,
        rawText: text,
        analysis: null,
        status: AnalysisStatus.PENDING,
      }));
      setTasks(initialTasks);

      if (initialTasks.length === 0) {
          setIsLoading(false);
          setProcessingMessage('');
          setError('No tasks found in the Google Sheet. Please ensure the sheet has data and the correct columns are present.');
          return;
      }

      for (let i = 0; i < initialTasks.length; i++) {
        setProcessingMessage(`Analyzing task ${i + 1} of ${initialTasks.length}...`);
        
        const analyzeWithDelay = async () => {
            try {
                const analysis = await analyzeTask(initialTasks[i].rawText);
                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.id === initialTasks[i].id ? { ...task, analysis, status: AnalysisStatus.COMPLETED } : task
                    )
                );
            } catch (e) {
                 console.error(`Failed to analyze task ${initialTasks[i].id}:`, e);
                 setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.id === initialTasks[i].id ? { ...task, status: AnalysisStatus.FAILED } : task
                    )
                );
            }
        };
        
        await analyzeWithDelay();
        if (i < initialTasks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500)); // 0.5s delay between API calls
        }
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes("Permission Denied (403)")) {
        setShowPermissionsGuide(true);
        setError(e.message);
      } else {
        console.error(e);
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
      setProcessingMessage('');
    }
  }, []);

  useEffect(() => {
    processTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const analyzedCount = tasks.filter(t => t.status === AnalysisStatus.COMPLETED).length;
  const failedCount = tasks.filter(t => t.status === AnalysisStatus.FAILED).length;
  const totalCount = tasks.length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {showPermissionsGuide && (
            <PermissionsGuide onRetry={processTasks} message={error} />
        )}

        {isLoading && !showPermissionsGuide && totalCount === 0 && (
           <div className="flex flex-col items-center justify-center h-64">
             <LoadingSpinner />
             <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">{processingMessage || 'Initializing...'}</p>
           </div>
        )}
        
        {error && !showPermissionsGuide && (
            <ErrorDisplay message={error} onRetry={processTasks} />
        )}

        {!error && !showPermissionsGuide && tasks.length > 0 && (
           <>
             <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md mb-6 border border-slate-200 dark:border-slate-700 animate-fade-in">
                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">Analysis Progress</h2>
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
                 {isLoading && (
                    <div className="mt-4">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${totalCount > 0 ? (analyzedCount + failedCount) / totalCount * 100 : 0}%` }}></div>
                        </div>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{processingMessage}</p>
                    </div>
                )}
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task, index) => (
                    <div key={task.id} className="animate-slide-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                        <TaskCard task={task} />
                    </div>
                ))}
            </div>
           </>
        )}
      </main>
    </div>
  );
};

export default App;
