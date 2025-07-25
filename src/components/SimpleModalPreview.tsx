import React from 'react';
import { X, Printer } from 'lucide-react';
import { Invoice } from '../types';
import { InvoicePreviewSimple } from './InvoicePreviewSimple';

interface SimpleModalPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
}

export const SimpleModalPreview: React.FC<SimpleModalPreviewProps> = ({
  isOpen,
  onClose,
  invoice
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header simple */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            Aperçu - {invoice.invoiceNumber}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              title="Imprimer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer</span>
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content avec scroll */}
        <div className="overflow-auto max-h-[calc(95vh-80px)] p-6 bg-gray-50">
          <InvoicePreviewSimple invoice={invoice} />
        </div>
      </div>
    </div>
  );
};
