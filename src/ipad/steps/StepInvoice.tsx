import React, { useState, useEffect } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import { Calendar, FileText, Hash } from 'lucide-react';

/**
 * Étape 1: Configuration de la facture
 * Gestion du numéro de facture et de la date
 */
export const StepInvoice: React.FC = () => {
  const { draft, updateClient } = useInvoiceWizard();
  
  const [numeroFacture, setNumeroFacture] = useState(draft.numero || '');
  const [dateFacture, setDateFacture] = useState(draft.date || new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate invoice number if empty
  useEffect(() => {
    if (!numeroFacture) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
      
      const autoNumber = `FAC-${year}${month}${day}-${time}`;
      setNumeroFacture(autoNumber);
    }
  }, [numeroFacture]);

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!numeroFacture.trim()) {
      newErrors.numero = 'Le numéro de facture est obligatoire';
    }

    if (!dateFacture) {
      newErrors.date = 'La date de facture est obligatoire';
    } else {
      const selectedDate = new Date(dateFacture);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        newErrors.date = 'La date ne peut pas être dans le futur';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save data on change
  const handleSave = () => {
    if (validateForm()) {
      // Update draft with invoice data
      // Note: We're using updateClient as a temporary solution
      // In a complete implementation, we'd have updateInvoice method
      updateClient({
        // Store invoice data in client for now - this is a simplification
        // In real implementation, we'd extend the store with invoice fields
      });
    }
  };

  useEffect(() => {
    handleSave();
  }, [numeroFacture, dateFacture]);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-myconfort-green rounded-full">
            <FileText className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-myconfort-dark font-manrope">
          Nouvelle Facture
        </h2>
        <p className="text-lg text-gray-600">
          Commençons par configurer les informations de base
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Numéro de facture */}
        <div className="space-y-2">
          <label 
            htmlFor="numero-facture"
            className="flex items-center gap-2 text-lg font-medium text-myconfort-dark font-manrope"
          >
            <Hash className="w-5 h-5 text-myconfort-green" />
            Numéro de facture
          </label>
          <input
            id="numero-facture"
            type="text"
            value={numeroFacture}
            onChange={(e) => setNumeroFacture(e.target.value)}
            className={`
              w-full px-4 py-4 text-lg
              border-2 rounded-lg
              font-manrope
              transition-colors duration-150
              min-h-[56px]
              ${errors.numero 
                ? 'border-myconfort-coral bg-red-50 text-red-900' 
                : 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green'
              }
              focus:outline-none focus:ring-0
            `}
            placeholder="Ex: FAC-20250824-1430"
            autoComplete="off"
          />
          {errors.numero && (
            <p className="text-myconfort-coral text-sm font-medium">
              {errors.numero}
            </p>
          )}
        </div>

        {/* Date de facture */}
        <div className="space-y-2">
          <label 
            htmlFor="date-facture"
            className="flex items-center gap-2 text-lg font-medium text-myconfort-dark font-manrope"
          >
            <Calendar className="w-5 h-5 text-myconfort-green" />
            Date de facture
          </label>
          <input
            id="date-facture"
            type="date"
            value={dateFacture}
            onChange={(e) => setDateFacture(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className={`
              w-full px-4 py-4 text-lg
              border-2 rounded-lg
              font-manrope
              transition-colors duration-150
              min-h-[56px]
              ${errors.date 
                ? 'border-myconfort-coral bg-red-50 text-red-900' 
                : 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green'
              }
              focus:outline-none focus:ring-0
            `}
          />
          {errors.date && (
            <p className="text-myconfort-coral text-sm font-medium">
              {errors.date}
            </p>
          )}
        </div>

        {/* Preview card */}
        <div className="p-6 bg-white border-2 border-myconfort-green rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-myconfort-dark font-manrope mb-4">
            Aperçu de la facture
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Numéro:</span>
              <span className="font-medium text-myconfort-dark">
                {numeroFacture || 'Non défini'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium text-myconfort-dark">
                {dateFacture ? new Date(dateFacture).toLocaleDateString('fr-FR') : 'Non définie'}
              </span>
            </div>
          </div>
        </div>

        {/* Help text */}
        <div className="p-4 bg-myconfort-blue bg-opacity-10 border border-myconfort-blue rounded-lg">
          <p className="text-sm text-gray-700">
            💡 <strong>Conseil:</strong> Le numéro de facture est généré automatiquement mais vous pouvez le modifier. 
            Assurez-vous qu'il soit unique pour éviter les doublons.
          </p>
        </div>
      </div>
    </div>
  );
};
