import React from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { ToastType } from '../../types';

interface ToastProps {
  message: string;
  type: ToastType;
  show: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, show, onClose }) => {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${
      show ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
    }`}>
      <div className={`flex items-center space-x-2 px-6 py-4 rounded-lg shadow-xl border-2 max-w-md ${
        type === 'success' 
          ? 'bg-green-50 text-green-800 border-green-200' 
          : type === 'error'
          ? 'bg-red-50 text-red-800 border-red-200'
          : type === 'warning'
          ? 'bg-orange-50 text-orange-800 border-orange-200'
          : 'bg-blue-50 text-blue-800 border-blue-200'
      }`}>
        {type === 'success' ? (
          <CheckCircle className="w-6 h-6 text-green-600" />
        ) : type === 'error' ? (
          <AlertCircle className="w-6 h-6 text-red-600" />
        ) : type === 'warning' ? (
          <AlertTriangle className="w-6 h-6 text-orange-600" />
        ) : (
          <Info className="w-6 h-6 text-blue-600" />
        )}
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};
