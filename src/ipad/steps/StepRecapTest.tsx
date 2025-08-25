import { useInvoiceWizard } from '../../store/useInvoiceWizard';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function StepRecapTest({ onNext, onPrev }: StepProps) {
  const { invoiceNumber, client, produits } = useInvoiceWizard();

  return (
    <div className="h-full w-full bg-green-100 p-4 flex flex-col">
      <h1 className="text-2xl font-bold text-green-800 mb-4">
        🧪 TEST ÉTAPE 8 - RÉCAPITULATIF
      </h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-4 flex-1">
        <h2 className="text-lg font-semibold mb-3">Informations actuelles :</h2>
        
        <div className="space-y-2">
          <p><strong>Facture :</strong> {invoiceNumber || 'Non définie'}</p>
          <p><strong>Client :</strong> {client?.name || 'Non défini'}</p>
          <p><strong>Nombre de produits :</strong> {produits?.length || 0}</p>
        </div>

        <div className="mt-4 p-3 bg-yellow-100 rounded">
          <p className="text-sm">
            📍 URL actuelle : {window.location.href}
          </p>
          <p className="text-sm">
            🕐 Dernière mise à jour : {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
      
      <div className="flex justify-between bg-white p-4 rounded-lg shadow">
        <button
          onClick={onPrev}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ← Précédent
        </button>
        
        <button
          onClick={onNext}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
