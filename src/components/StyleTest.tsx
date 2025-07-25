import React, { useState } from 'react';
import { InvoicePreview } from './InvoicePreview';
import InvoicePreviewModern from './InvoicePreviewModern';
import InvoicePreviewPremium from './InvoicePreviewPremium';
import { Invoice } from '../types';

interface StyleTestProps {
  invoice: Invoice;
}

export const StyleTest: React.FC<StyleTestProps> = ({ invoice }) => {
  const [currentStyle, setCurrentStyle] = useState<'classic' | 'modern' | 'premium'>('premium');

  return (
    <div className="p-4">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Test des Styles de Facture</h2>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setCurrentStyle('classic')}
            className={`px-4 py-2 rounded ${
              currentStyle === 'classic' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            📄 Classique
          </button>
          <button
            onClick={() => setCurrentStyle('modern')}
            className={`px-4 py-2 rounded ${
              currentStyle === 'modern' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            🎨 Moderne
          </button>
          <button
            onClick={() => setCurrentStyle('premium')}
            className={`px-4 py-2 rounded ${
              currentStyle === 'premium' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            ✨ Premium
          </button>
        </div>
        <p className="mt-2 text-lg font-semibold">
          Style actuel: {currentStyle.toUpperCase()}
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 p-4">
        {currentStyle === 'classic' && (
          <div key="test-classic">
            <h3 className="text-center font-bold mb-4 text-green-600">STYLE CLASSIQUE</h3>
            <InvoicePreview invoice={invoice} />
          </div>
        )}
        {currentStyle === 'modern' && (
          <div key="test-modern">
            <h3 className="text-center font-bold mb-4 text-blue-600">STYLE MODERNE</h3>
            <InvoicePreviewModern invoice={invoice} />
          </div>
        )}
        {currentStyle === 'premium' && (
          <div key="test-premium">
            <h3 className="text-center font-bold mb-4 text-purple-600">STYLE PREMIUM</h3>
            <InvoicePreviewPremium invoice={invoice} />
          </div>
        )}
      </div>
    </div>
  );
};
