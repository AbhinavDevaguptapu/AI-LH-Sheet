
import React from 'react';
import { ExclamationTriangleIcon } from './icons';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md shadow-md" role="alert">
      <div className="flex">
        <div className="py-1">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-4" />
        </div>
        <div>
          <p className="font-bold">An Error Occurred</p>
          <p className="text-sm">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 bg-red-500 text-white font-bold py-1 px-3 rounded text-xs hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
