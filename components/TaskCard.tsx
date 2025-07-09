
import React from 'react';
import { Task, AnalysisStatus } from '../types';
import { CheckCircleIcon, ExclamationTriangleIcon, SparklesIcon, DocumentTextIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

interface TaskCardProps {
  task: Task;
}

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
    const getScoreColor = () => {
        if (score >= 75) return 'bg-status-pass/10 text-status-pass border-status-pass/30';
        if (score >= 50) return 'bg-status-warn/10 text-status-warn border-status-warn/30';
        return 'bg-status-fail/10 text-status-fail border-status-fail/30';
    };

    return (
        <div className={`px-3 py-1 text-sm font-bold rounded-full border ${getScoreColor()}`}>
            {score}% Match
        </div>
    );
};

const StatusDisplay: React.FC<{ status: "Meets criteria" | "Needs improvement" }> = ({ status }) => {
    const isPass = status === "Meets criteria";
    const colorClasses = isPass ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400';
    const Icon = isPass ? CheckCircleIcon : ExclamationTriangleIcon;

    return (
        <div className={`flex items-center text-sm font-semibold ${colorClasses}`}>
            <Icon className="w-4 h-4 mr-1.5" />
            <span>{status}</span>
        </div>
    );
};

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { rawText, analysis, status } = task;

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
            <div className="flex justify-between items-start mb-4">
              <StatusDisplay status={analysis.status} />
              <ScoreBadge score={analysis.matchPercentage} />
            </div>
            <div className="space-y-4">
                <div>
                    <h4 className="flex items-center text-xs font-semibold uppercase text-slate-400 dark:text-slate-500 mb-2">
                        <DocumentTextIcon className="w-4 h-4 mr-2" />
                        Original Task
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{rawText}</p>
                </div>
                 <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div>
                <div>
                    <h4 className="flex items-center text-xs font-semibold uppercase text-slate-400 dark:text-slate-500 mb-2">
                        <SparklesIcon className="w-4 h-4 mr-2 text-blue-500" />
                        AI Rationale
                    </h4>
                    <p className="text-slate-800 dark:text-slate-200 text-sm font-medium">{analysis.rationale}</p>
                </div>
            </div>
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
