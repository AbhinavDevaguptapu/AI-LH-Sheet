import React, { useState } from 'react';
import { Task, AnalysisStatus } from '../types';
import { CheckCircleIcon, ExclamationTriangleIcon, DocumentTextIcon, ChevronDownIcon, ChevronUpIcon, SparklesIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

interface TaskCardProps {
  task: Task;
}

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
    const getScoreColor = () => {
        if (score >= 75) return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700';
        if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700';
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700';
    };

    return (
        <div className={`px-3 py-1 text-sm font-bold rounded-full border ${getScoreColor()}`}>
            {score}% Match
        </div>
    );
};

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const { taskData, analysis, status } = task;

  const renderContent = () => {
    switch (status) {
      case AnalysisStatus.PENDING:
      case AnalysisStatus.ANALYZING:
        return (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <LoadingSpinner />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Analyzing...</p>
          </div>
        );
      case AnalysisStatus.FAILED:
        return (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mb-2"/>
            <p className="font-semibold text-red-600 dark:text-red-400">Analysis Failed</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Could not evaluate this task.</p>
          </div>
        );
      case AnalysisStatus.COMPLETED:
        if (!analysis) return null;
        return (
          <div className="p-5">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex-1 pr-2">
                    {taskData.taskFrameworkCategory || 'No Category'}
                </h3>
                <ScoreBadge score={analysis.matchPercentage} />
            </div>

            <div className="mb-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 italic">{analysis.rationale}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg mb-4">
                <h4 className="flex items-center text-xs font-semibold uppercase text-slate-400 dark:text-slate-500 mb-2">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Original Task
                </h4>
                <p className="text-slate-700 dark:text-slate-300 font-medium text-sm">
                    {taskData.task}
                </p>
            </div>

            { (taskData.situation || taskData.behavior || taskData.impact || taskData.action) &&
                <div>
                    <button 
                        onClick={() => setIsDetailsVisible(!isDetailsVisible)}
                        className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none w-full text-left"
                    >
                        <SparklesIcon className="w-4 h-4 mr-2" />
                        {isDetailsVisible ? 'Hide SBI-A Details' : 'Show SBI-A Details'}
                        {isDetailsVisible ? <ChevronUpIcon className="w-4 h-4 ml-auto" /> : <ChevronDownIcon className="w-4 h-4 ml-auto" />}
                    </button>

                    {isDetailsVisible && (
                        <div className="mt-3 pl-6 border-l-2 border-slate-200 dark:border-slate-700 space-y-3 text-sm text-slate-600 dark:text-slate-400 animate-fade-in">
                            {taskData.situation && <div><strong className="font-semibold text-slate-700 dark:text-slate-300">Situation (S):</strong> {taskData.situation}</div>}
                            {taskData.behavior && <div><strong className="font-semibold text-slate-700 dark:text-slate-300">Behavior (B):</strong> {taskData.behavior}</div>}
                            {taskData.impact && <div><strong className="font-semibold text-slate-700 dark:text-slate-300">Impact (I):</strong> {taskData.impact}</div>}
                            {taskData.action && <div><strong className="font-semibold text-slate-700 dark:text-slate-300">Action Item (A):</strong> {taskData.action}</div>}
                        </div>
                    )}
                </div>
            }
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-slate-200 dark:border-slate-700 h-full flex flex-col">
      {renderContent()}
    </div>
  );
};

export default TaskCard;
