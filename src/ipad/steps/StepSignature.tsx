import SignaturePadView from '../../components/SignaturePadView';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
}

export default function StepSignature({ onNext, onPrev }: StepProps) {
  const { signature, updateSignature } = useInvoiceWizard();

  const handleSigned = (dataUrl: string, timestamp: string) => {
    updateSignature({ dataUrl: dataUrl, timestamp: timestamp });
    onNext(); // Passe à l'étape suivante automatiquement après la signature
  };

  return (
    <div className="w-full h-dvh p-6 flex flex-col gap-6 bg-myconfort-cream">
      <h1 className="text-2xl font-semibold text-myconfort-dark">Signature du client</h1>
      <SignaturePadView
        onSigned={handleSigned}
      />
      {signature?.dataUrl && (
        <div className="mt-2">
          <p className="text-sm text-myconfort-dark/70">Dernier enregistrement : {signature.timestamp}</p>
          <img src={signature.dataUrl} alt="Signature" className="mt-2 max-h-40 rounded-lg border" />
        </div>
      )}
      <div className="mt-auto flex justify-between">
        <button onClick={onPrev} className="px-8 py-4 bg-gray-200 rounded-xl font-bold">Précédent</button>
        {/* Le bouton "Suivant" est désactivé car la signature déclenche l'action */}
        <button disabled className="px-8 py-4 bg-myconfort-green text-white rounded-xl font-bold opacity-50">Suivant</button>
      </div>
    </div>
  );
}
