import React from 'react';
import { Printer } from 'lucide-react';

export const EmailSender: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]">
      <h2 className="text-xl font-bold text-[#F2EFE2] mb-4 flex items-center justify-center">
        <Printer className="mr-3 text-xl" />
        <span className="bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold">
          ACTIONS
        </span>
      </h2>
      
      <div className="bg-[#F2EFE2] rounded-lg p-6">
        {/* Legal Notice */}
        <div className="text-center mb-6">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow">
            <strong>⛔ Article L224-59 du Code de la consommation</strong><br />
            « Avant la conclusion de tout contrat entre un consommateur et un professionnel à l'occasion d'une foire, d'un salon […] le professionnel informe le consommateur qu'il ne dispose pas d'un délai de rétractation. »
          </div>
        </div>

        {/* Action Principale */}
        <div className="flex justify-center items-center mt-6 pt-6 border-t border-gray-300">
          <button
            onClick={handlePrint}
            className="px-8 py-4 rounded-xl flex items-center space-x-3 font-bold shadow-lg transform transition-all hover:scale-105 bg-green-600 hover:bg-green-700 text-white min-w-[200px] justify-center"
          >
            <Printer className="w-6 h-6" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
