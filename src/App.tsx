import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainApp from './MainApp';
import IpadWizard from './ipad/IpadWizard';
import WizardPage from './pages/WizardPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import WizardDemo from './pages/WizardDemo';
import DebugFooter from './pages/DebugFooter';

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path='/' element={<MainApp />} />
        <Route path='/wizard' element={<WizardPage />} />
        <Route path='/wizard/:step' element={<WizardPage />} />
        <Route path='/ipad' element={<IpadWizard />} />
        <Route path='/wizard-demo' element={<WizardDemo />} />
        <Route path='/payment/success' element={<PaymentSuccess />} />
        <Route path='/payment/cancel' element={<PaymentCancel />} />
        <Route path='/debug-footer' element={<DebugFooter />} />
      </Routes>
    </BrowserRouter>
  );
}
