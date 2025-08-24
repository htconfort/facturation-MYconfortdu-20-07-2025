import { StepsNavigator } from '../navigation/StepsNavigator';
import { useInvoiceWizard } from '../store/useInvoiceWizard';
import { BackButton } from '../components/BackButton';

export default function WizardPage() {
  const { getCurrentStepIndex, steps, goNext, goPrev } = useInvoiceWizard();
  const currentStepIndex = getCurrentStepIndex();
  const label = steps[currentStepIndex] || 'step';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <BackButton />
            <h1 className="text-xl font-semibold text-gray-900">
              Assistant de Facturation
            </h1>
            <div className="w-16" /> {/* Spacer for balance */}
          </div>
        </div>
      </div>

      {/* Navigation des étapes */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StepsNavigator />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="h-full w-full p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-myconfort-dark/70">Gesture: swipe gauche/droite</span>
            </div>

            <section className="flex-1 rounded-2xl bg-white shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-myconfort-dark capitalize">{label}</h2>
              <p className="mt-2 text-myconfort-dark/70">
                Écran placeholder pour "{label}".
              </p>
            </section>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={goPrev}
                className="px-4 py-2 rounded-xl bg-myconfort-blue/20 hover:bg-myconfort-blue/30"
              >
                Précédent
              </button>
              <button
                type="button"
                onClick={goNext}
                className="px-4 py-2 rounded-xl bg-myconfort-green text-white hover:opacity-90"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
