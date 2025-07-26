import React, { useState } from 'react';
import { Users, Package, Building2, Archive, UploadCloud as CloudUpload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface HeaderProps {
  onShowClients: () => void;
  onShowInvoices: () => void;
  onShowProducts: () => void;
  onShowGoogleDrive: () => Promise<void>;
  onScrollToClient?: () => void;
  onScrollToProducts?: () => void;
  invoiceNumber?: string;
  clientName?: string;
  canSendToDrive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onShowClients,
  onShowInvoices,
  onShowProducts,
  onShowGoogleDrive,
  invoiceNumber,
  clientName,
  canSendToDrive = false
}) => {
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [driveStatus, setDriveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleDriveClick = async () => {
    if (!canSendToDrive) {
      return;
    }

    setIsDriveLoading(true);
    setDriveStatus('idle');
    
    try {
      await onShowGoogleDrive();
      setDriveStatus('success');
      setTimeout(() => setDriveStatus('idle'), 3000);
    } catch (error) {
      setDriveStatus('error');
      setTimeout(() => setDriveStatus('idle'), 3000);
    } finally {
      setIsDriveLoading(false);
    }
  };

  const getDriveButtonClass = () => {
    if (!canSendToDrive) {
      return "bg-gray-400 cursor-not-allowed px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md text-white opacity-60";
    }
    
    if (driveStatus === 'success') {
      return "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105 text-white";
    }
    
    if (driveStatus === 'error') {
      return "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105 text-white";
    }
    
    return "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105 text-white";
  };

  const getDriveButtonIcon = () => {
    if (isDriveLoading) {
      return <Loader2 size={18} className="animate-spin" />;
    }
    
    if (driveStatus === 'success') {
      return <CheckCircle size={18} />;
    }
    
    if (driveStatus === 'error') {
      return <AlertCircle size={18} />;
    }
    
    return <CloudUpload size={18} />;
  };

  const getDriveButtonText = () => {
    if (isDriveLoading) {
      return "Envoi...";
    }
    
    if (driveStatus === 'success') {
      return "✅ Envoyé";
    }
    
    if (driveStatus === 'error') {
      return "❌ Erreur";
    }
    
    if (!canSendToDrive) {
      return "📤 Drive";
    }
    
    return "📤 Drive";
  };

  const getDriveButtonTitle = () => {
    if (!canSendToDrive) {
      return "Complétez les champs obligatoires pour envoyer vers Google Drive";
    }
    
    if (isDriveLoading) {
      return "Envoi en cours vers Google Drive...";
    }
    
    if (driveStatus === 'success') {
      return "PDF envoyé avec succès vers Google Drive";
    }
    
    if (driveStatus === 'error') {
      return "Erreur lors de l'envoi vers Google Drive";
    }
    
    const info = [];
    if (invoiceNumber) info.push(`Facture: ${invoiceNumber}`);
    if (clientName) info.push(`Client: ${clientName}`);
    
    return `Envoyer la facture vers Google Drive${info.length > 0 ? ` (${info.join(', ')})` : ''}`;
  };
  return (
    <header className="bg-gradient-to-r from-[#477A0C] to-[#5A8F0F] shadow-xl sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Building2 className="w-6 h-6 text-[#F2EFE2]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#F2EFE2]">
              MYCONFORT
            </h1>
            <p className="text-[#F2EFE2]/80 text-sm font-medium">Facturation professionnelle avec signature électronique</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Actions principales */}
          <button
            onClick={onShowProducts}
            className="bg-[#F2EFE2] hover:bg-white px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105 text-black"
            title="Gérer les produits"
          >
            <Package size={18} />
            <span className="hidden md:inline">Produits</span>
          </button>

          <button
            onClick={onShowInvoices}
            className="bg-[#14281D] hover:bg-[#0F1F15] px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105 text-[#F2EFE2]"
            title="Voir toutes les factures"
          >
            <Archive size={18} />
            <span className="hidden md:inline">Factures</span>
          </button>
          
          <button
            onClick={onShowClients}
            className="bg-[#D68FD6] hover:bg-[#C67FC6] px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105 text-[#14281D]"
            title="Gérer les clients"
          >
            <Users size={18} />
            <span className="hidden md:inline">Clients</span>
          </button>
          
          <button
            onClick={handleDriveClick}
            disabled={!canSendToDrive || isDriveLoading}
            className={getDriveButtonClass()}
            title={getDriveButtonTitle()}
          >
            {getDriveButtonIcon()}
            <span className="hidden md:inline">{getDriveButtonText()}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
