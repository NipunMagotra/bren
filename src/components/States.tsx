import React from 'react';
import { AlertCircle, FolderSearch, RefreshCw } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading dataset...", 
  subtext
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-cyan-400 animate-spin mb-4" />
      <p className="text-sm font-medium text-zinc-200">{message}</p>
      {subtext && <p className="text-xs text-zinc-500 mt-1">{subtext}</p>}
    </div>
  );
};

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="p-6 my-6 rounded-lg bg-zinc-900/50 border border-zinc-800 text-center max-w-md mx-auto">
      <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2.5" />
      <h3 className="text-sm font-semibold text-white">Unable to load data</h3>
      <p className="text-xs text-zinc-400 mt-1 mb-4 break-words">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
};

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No results found",
  description = "No items match your active filters or search terms.",
  actionText = "Reset filters",
  onAction
}) => {
  return (
    <div className="p-8 my-6 rounded-lg bg-zinc-900/30 border border-zinc-800 text-center max-w-sm mx-auto">
      <FolderSearch className="w-8 h-8 text-zinc-600 mx-auto mb-2.5" />
      <h3 className="text-sm font-medium text-zinc-200">{title}</h3>
      <p className="text-xs text-zinc-500 mt-1 mb-4">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          {actionText}
        </button>
      )}
    </div>
  );
};
