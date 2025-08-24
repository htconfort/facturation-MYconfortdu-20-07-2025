import StepsNavigator from '../navigation/StepsNavigator';
import { useInvoiceWizard } from '../store/useInvoiceWizard';
import { BackButton } from '../components/BackButton';

export default function WizardPage() {
  const { getCurrentStepIndex, steps, goNext, goPrev } = useInvoiceWizard();
  const currentStepIndex = getCurrentStepIndex();
  const label = steps[currentStepIndex] || 'step';

  return (
    <StepsNavigator>
      <div className='h-full w-full p-6 flex flex-col gap-6'>
        <div className='flex items-center justify-between'>
          <BackButton />
          <span className='text-sm text-myconfort-dark/70'>
            Gesture: swipe gauche/droite
          </span>
        </div>

        <section className='flex-1 rounded-2xl bg-white shadow-sm border p-6'>
          <h2 className='text-2xl font-semibold text-myconfort-dark capitalize'>
            {label}
          </h2>
          <p className='mt-2 text-myconfort-dark/70'>
            Écran placeholder pour "{label}".
          </p>
        </section>

        <div className='flex items-center justify-between'>
          <button
            type='button'
            onClick={goPrev}
            className='px-4 py-2 rounded-xl bg-myconfort-blue/20 hover:bg-myconfort-blue/30'
          >
            Précédent
          </button>
          <button
            type='button'
            onClick={goNext}
            className='px-4 py-2 rounded-xl bg-myconfort-green text-white hover:opacity-90'
          >
            Suivant
          </button>
        </div>
      </div>
    </StepsNavigator>
  );
}
