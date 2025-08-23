import { AlertCircle, AlertTriangle, Info, Server, WifiOff, CheckCircle } from 'lucide-react';
import { ApiError } from '@/types/api.types';

interface ErrorDisplayProps {
  error: ApiError | string;
  className?: string;
  showSuggestions?: boolean;
  variant?: 'default' | 'compact' | 'inline';
}

export function ErrorDisplay({
  error,
  className = '',
  showSuggestions = true,
  variant = 'default'
}: ErrorDisplayProps) {
  // Handle simple string errors
  const errorData: ApiError = typeof error === 'string'
    ? {
        message: error,
        user_message: error,
        code: 'GENERIC_ERROR',
        category: 'server' as const,
        details: undefined,
        suggestions: []
      }
    : error;

  const getErrorIcon = (category: ApiError['category']) => {
    switch (category) {
      case 'auth':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'validation':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'not_found':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'conflict':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'server':
        return <Server className="h-5 w-5 text-red-600" />;
      case 'network':
        return <WifiOff className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getErrorColors = (category: ApiError['category']) => {
    switch (category) {
      case 'auth':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'validation':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'not_found':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'conflict':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'server':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'network':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const getCategoryTitle = (category: ApiError['category']) => {
    switch (category) {
      case 'auth':
        return 'Authentication Required';
      case 'validation':
        return 'Input Error';
      case 'not_found':
        return 'Not Found';
      case 'conflict':
        return 'Conflict';
      case 'server':
        return 'Server Error';
      case 'network':
        return 'Connection Error';
      default:
        return 'Error';
    }
  };

  if (variant === 'inline') {
    return (
      <div className={`flex items-center text-sm ${className}`}>
        {getErrorIcon(errorData.category)}
        <span className="ml-2">{errorData.user_message}</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`rounded-md border p-3 ${getErrorColors(errorData.category)} ${className}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getErrorIcon(errorData.category)}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{errorData.user_message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`rounded-lg border p-4 ${getErrorColors(errorData.category)} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getErrorIcon(errorData.category)}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-semibold">
            {getCategoryTitle(errorData.category)}
          </h3>
          <p className="mt-1 text-sm">
            {errorData.user_message}
          </p>

          {/* Display suggestions if available and enabled */}
          {showSuggestions && errorData.suggestions && errorData.suggestions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium opacity-80 mb-2">Suggestions:</p>
              <ul className="text-xs space-y-1 opacity-75">
                {errorData.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Debug information in development */}
          {process.env.NODE_ENV === 'development' && errorData.details && (
            <details className="mt-3">
              <summary className="text-xs font-medium opacity-60 cursor-pointer hover:opacity-80">
                Debug Details
              </summary>
              <pre className="text-xs mt-2 p-2 bg-black/10 rounded border overflow-auto">
                {JSON.stringify(errorData.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
