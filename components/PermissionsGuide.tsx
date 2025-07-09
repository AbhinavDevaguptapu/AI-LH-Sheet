
import React from 'react';
import { ShareIcon, CloudIcon, RefreshIcon } from './icons';

interface PermissionsGuideProps {
  onRetry: () => void;
  message: string | null;
}

export const PermissionsGuide: React.FC<PermissionsGuideProps> = ({ onRetry, message }) => {
  return (
    <div className="bg-orange-50 dark:bg-slate-800 border border-orange-200 dark:border-orange-900 text-slate-800 dark:text-slate-200 p-6 rounded-lg shadow-lg animate-fade-in my-6">
      <div className="flex flex-col md:flex-row">
        <div className="py-1 flex-shrink-0 text-center md:text-left mb-4 md:mb-0 md:mr-6">
          <ShareIcon className="h-10 w-10 text-orange-500 inline-block" />
        </div>
        <div>
          <h3 className="font-bold text-xl mb-2 text-slate-900 dark:text-white">Action Required: Grant Permission</h3>
          <p className="text-sm mb-5 text-slate-600 dark:text-slate-300">
            The application was blocked from accessing your Google Sheet. This is usually due to one of two reasons. Please check both steps below.
          </p>
          
          <div className="space-y-6">
            {/* Step 1: Share Sheet */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 text-center">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white font-bold ring-2 ring-orange-500/50">1</div>
              </div>
              <div className="ml-4">
                <p className="font-semibold text-slate-800 dark:text-slate-100">Make your Sheet public (read-only)</p>
                <ol className="list-decimal list-inside space-y-1 text-sm mt-2 pl-2 text-slate-600 dark:text-slate-400">
                  <li>In your Google Sheet, click the blue <strong className="font-semibold">Share</strong> button.</li>
                  <li>Under <strong className="font-semibold">General access</strong>, change it from "Restricted" to <strong className="font-semibold">Anyone with the link</strong>.</li>
                  <li>Ensure the role on the right is set to <strong className="font-semibold">Viewer</strong>.</li>
                </ol>
              </div>
            </div>

            {/* Step 2: Enable API */}
            <div className="flex items-start">
                <div className="flex-shrink-0 w-8 text-center">
                   <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white font-bold ring-2 ring-orange-500/50">2</div>
                </div>
                <div className="ml-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">Ensure the Google Sheets API is enabled</p>
                     <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">
                        The API key you are using must have the <strong className="font-semibold">Google Sheets API</strong> enabled in its Google Cloud project.
                    </p>
                     <a href="https://console.cloud.google.com/apis/library/sheets.googleapis.com" target="_blank" rel="noopener noreferrer" className="flex items-center mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        <CloudIcon className="w-5 h-5 mr-2" />
                        <span>Go to Google Cloud API Library</span>
                    </a>
                </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-orange-200 dark:border-orange-900/50">
             {message && <p className="text-xs text-center text-red-600 dark:text-red-400 mb-3">{message}</p>}
             <button
              onClick={onRetry}
              className="w-full flex items-center justify-center bg-orange-500 text-white font-bold py-2 px-4 rounded hover:bg-orange-600 transition-colors"
            >
              <RefreshIcon className="w-5 h-5 mr-2" />
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
