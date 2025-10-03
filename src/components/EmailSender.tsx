import React, { useState, useEffect } from 'react';
import { Mail, Send, UploadCloud, Loader } from 'lucide-react';
import { Invoice } from '../types';
import { PDFService } from '../services/pdfService';

interface EmailSenderProps {
  invoice: Invoice;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onShowConfig: () => void;
}

export const EmailSender: React.FC<EmailSenderProps> = ({
  invoice,
  onSuccess,
  onError,
  onShowConfig,
}) => {
  const [recipientEmail, setRecipientEmail] = useState(
    invoice.clientEmail || ''
  );
  const [subject, setSubject] = useState(
    `Votre facture MYCONFORT - ${invoice.invoiceNumber}`
  );
  const [message, setMessage] = useState(() => {
    const baseMessage = `Bonjour ${invoice.clientName},\n\nVeuillez trouver ci-joint votre facture MYCONFORT n°${invoice.invoiceNumber}.`;
    
    // Ajouter l'adresse des chèques si nécessaire
    if (invoice.nombreChequesAVenir && invoice.nombreChequesAVenir > 0) {
      return baseMessage + `\n\n📮 Vos chèques sont à envoyer à l'adresse suivante :\nMyconfort\n8, rue du Grégal\n66510 Saint-Hippolyte\n\nCordialement,\nL'équipe MYCONFORT`;
    }
    
    return baseMessage + `\n\nCordialement,\nL'équipe MYCONFORT`;
  });
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setRecipientEmail(invoice.clientEmail || '');
    setSubject(`Votre facture MYCONFORT - ${invoice.invoiceNumber}`);
    
    const baseMessage = `Bonjour ${invoice.clientName},\n\nVeuillez trouver ci-joint votre facture MYCONFORT n°${invoice.invoiceNumber}.`;
    
    // Ajouter l'adresse des chèques si nécessaire
    if (invoice.nombreChequesAVenir && invoice.nombreChequesAVenir > 0) {
      setMessage(baseMessage + `\n\n📮 Vos chèques sont à envoyer à l'adresse suivante :\nMyconfort\n8, rue du Grégal\n66510 Saint-Hippolyte\n\nCordialement,\nL'équipe MYCONFORT`);
    } else {
      setMessage(baseMessage + `\n\nCordialement,\nL'équipe MYCONFORT`);
    }
  }, [invoice]);

  const handleSendEmail = async () => {
    if (!recipientEmail || !subject || !message) {
      onError(
        "Veuillez remplir tous les champs de l'email (destinataire, sujet, message)."
      );
      return;
    }

    setIsSending(true);
    try {
      // Générer le PDF avec notre service unifié
      const pdfBlob = await PDFService.generateInvoicePDF(invoice);

      // Convertir le PDF en base64 pour l'envoi
      const reader = new FileReader();
      const pdfBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Extraire seulement la partie base64 (après la virgule)
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('Erreur conversion PDF'));
        reader.readAsDataURL(pdfBlob);
      });

      // Envoyer via N8N (même logique que dans StepRecap)
      const { N8nWebhookService } = await import(
        '../services/n8nWebhookService'
      );
      const result = await N8nWebhookService.sendInvoiceToN8n(
        invoice,
        pdfBase64
      );

      setIsSending(false);

      if (result.success) {
        onSuccess(
          '✅ Facture envoyée par email et sauvegardée sur Drive avec succès'
        );
      } else {
        onError(`❌ Erreur lors de l'envoi: ${result.message}`);
      }
    } catch (error: any) {
      setIsSending(false);
      onError(`Erreur lors de l'envoi: ${error.message || 'Erreur inconnue'}`);
    }
  };

  return (
    <div className='bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]'>
      <h2 className='text-xl font-bold text-[#F2EFE2] mb-4 flex items-center justify-center'>
        <Mail className='mr-3 text-xl' />
        <span className='bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold'>
          COMMUNICATION & ACTIONS
        </span>
      </h2>

      <div className='bg-[#F2EFE2] rounded-lg p-6'>
        {/* Legal Notice */}
        <div className='text-center mb-6'>
          <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow'>
            <strong>⛔ Article L224-59 du Code de la consommation</strong>
            <br />« Avant la conclusion de tout contrat entre un consommateur et
            un professionnel à l'occasion d\'une foire, d'un salon […] le
            professionnel informe le consommateur qu\'il ne dispose pas d'un
            délai de rétractation. »
          </div>
        </div>

        {/* Email Sending Form */}
        <div className='space-y-4 mb-6'>
          <h3 className='text-lg font-semibold text-gray-800 flex items-center'>
            <Send className='mr-2 w-5 h-5 text-blue-600' /> Envoyer la facture
            par Email
          </h3>
          <div>
            <label className='block text-gray-700 text-sm font-bold mb-1'>
              Destinataire Email
            </label>
            <input
              type='email'
              value={recipientEmail}
              onChange={e => setRecipientEmail(e.target.value)}
              className='w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-black font-bold'
              placeholder='client@example.com'
            />
          </div>
          <div>
            <label className='block text-gray-700 text-sm font-bold mb-1'>
              Sujet
            </label>
            <input
              type='text'
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className='w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-black font-bold'
              placeholder="Sujet de l'email"
            />
          </div>
          <div>
            <label className='block text-gray-700 text-sm font-bold mb-1'>
              Message
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              className='w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-black font-bold'
              placeholder='Votre message ici...'
            />
          </div>
          <button
            onClick={handleSendEmail}
            disabled={isSending || !recipientEmail || !subject || !message}
            className={`w-full px-6 py-3 rounded-xl flex items-center justify-center space-x-3 font-bold shadow-lg transform transition-all hover:scale-105 disabled:hover:scale-100 ${
              isSending || !recipientEmail || !subject || !message
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSending ? (
              <>
                <Loader className='w-5 h-5 animate-spin' />
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <Send className='w-5 h-5' />
                <span>Envoyer la facture par Email</span>
              </>
            )}
          </button>
        </div>

        {/* Configuration Buttons */}
        <div className='flex flex-col md:flex-row justify-around items-center space-y-4 md:space-y-0 md:space-x-4 mt-6 pt-6 border-t border-gray-300'>
          {/* EmailJS config button removed as config is hardcoded in SeparatePdfEmailService */}
          {/* <button
            onClick={onShowEmailJSConfig}
            className="px-6 py-3 rounded-xl flex items-center space-x-3 font-bold shadow-lg transform transition-all hover:scale-105 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Settings className="w-5 h-5" />
            <span>Configurer EmailJS</span>
          </button> */}
          <button
            onClick={onShowConfig} // This opens Google Drive config as per App.tsx
            className='px-6 py-3 rounded-xl flex items-center space-x-3 font-bold shadow-lg transform transition-all hover:scale-105 bg-indigo-600 hover:bg-indigo-700 text-white'
          >
            <UploadCloud className='w-5 h-5' />
            <span>Configurer Google Drive</span>
          </button>
        </div>
      </div>
    </div>
  );
};
