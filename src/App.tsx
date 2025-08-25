import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import MainApp from './MainApp';
import IpadWizard from './ipad/IpadWizard';
import WizardPage from './pages/WizardPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import WizardDemo from './pages/WizardDemo';
import DebugFooter from './pages/DebugFooter';

// Guard pour borner les steps à [1..7]
function StepGuard() {
  const { n } = useParams();
  const num = Number(n);
  const clamped = Number.isFinite(num) ? Math.min(Math.max(num, 1), 7) : 1;
  return <Navigate to={`/wizard/step/${clamped}`} replace />;
}

export default function App() {
  return (
    <div>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path='/' element={<MainApp />} />
          <Route path='/wizard' element={<WizardPage />} />
<<<<<<< HEAD
          <Route path='/wizard/:step' element={<WizardPage />} />
          {/* Empêche l'étape 0/8 et toute étape > 7 */}
          <Route path='/wizard/step/0' element={<Navigate to='/wizard/step/7' replace />} />
          <Route path='/wizard/step/8' element={<Navigate to='/wizard/step/7' replace />} />
          <Route path='/wizard/step/:n' element={<StepGuard />} />
          <Route path='/ipad' element={<IpadWizard />} />
          <Route path='/wizard-demo' element={<WizardDemo />} />
          <Route path='/payment/success' element={<PaymentSuccess />} />
          <Route path='/payment/cancel' element={<PaymentCancel />} />
          <Route path='/debug-footer' element={<DebugFooter />} />
        </Routes>
=======
        <Route path='/wizard/:step' element={<WizardPage />} />
        <Route path='/ipad' element={<IpadWizard />} />
        <Route path='/wizard-demo' element={<WizardDemo />} />
        <Route path='/payment/success' element={<PaymentSuccess />} />
        <Route path='/payment/cancel' element={<PaymentCancel />} />
        <Route path='/debug-footer' element={<DebugFooter />} />
      </Routes>
>>>>>>> 31a86f1 (✨ Ajout bouton Suivant flottant étape Livraison iPad)
    </BrowserRouter>
    </div>
  );
}
