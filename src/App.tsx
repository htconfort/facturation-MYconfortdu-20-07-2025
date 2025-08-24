import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MainApp from './MainApp';
import IpadWizard from './ipad/IpadWizard';
import WizardPage from './pages/WizardPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import WizardDemo from './pages/WizardDemo';

function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">MYconfort</h1>
      <Link to="/wizard" className="inline-block px-4 py-2 rounded-xl bg-myconfort-dark text-white">
        Wizard
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/main' element={<MainApp />} />
        <Route path='/wizard' element={<WizardPage />} />
        <Route path='/wizard/:step' element={<WizardPage />} />
        <Route path='/ipad' element={<IpadWizard />} />
        <Route path='/wizard-demo' element={<WizardDemo />} />
        <Route path='/payment/success' element={<PaymentSuccess />} />
        <Route path='/payment/cancel' element={<PaymentCancel />} />
      </Routes>
    </BrowserRouter>
  );
}
