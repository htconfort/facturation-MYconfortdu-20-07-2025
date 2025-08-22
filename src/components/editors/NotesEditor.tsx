import React, { useState, useEffect, useRef } from 'react';
import { WizardSheet } from '../WizardSheet';

export interface NotesForm {
  notes: string;
  publicNotes?: string;
  internalNotes?: string;
}

interface Props {
  isOpen: boolean;
  initial: NotesForm;
  onCancel: () => void;
  onSave: (data: NotesForm) => void;
}

export const NotesEditor: React.FC<Props> = ({ 
  isOpen, 
  initial, 
  onCancel, 
  onSave 
}) => {
  const [form, setForm] = useState<NotesForm>(initial);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { 
    setForm(initial); 
  }, [initial, isOpen]);

  // Focus automatique sur la zone de texte
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSave = () => {
    onSave(form);
  };

  return (
    <WizardSheet 
      isOpen={isOpen} 
      title="📝 Notes — Édition plein écran" 
      onClose={onCancel} 
      onSave={handleSave}
      saveLabel="Enregistrer"
    >
      <div className="space-y-6">
        {/* Notes principales */}
        <label className="flex flex-col gap-2">
          <span className="text-lg font-medium text-gray-700">Notes générales</span>
          <textarea 
            ref={textareaRef}
            className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent min-h-[200px] resize-y"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Ajoutez ici toutes les informations importantes sur cette intervention...

Exemples :
• Accès au logement
• Particularités techniques
• Demandes spécifiques du client
• Points d'attention"
          />
          <div className="text-xs text-gray-500">
            {form.notes.length} caractères • Visible sur la facture
          </div>
        </label>

        {/* Notes publiques (facture) */}
        <label className="flex flex-col gap-2">
          <span className="text-lg font-medium text-gray-700">Notes publiques (facture)</span>
          <textarea 
            className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent min-h-[120px] resize-y"
            value={form.publicNotes || ''}
            onChange={e => setForm({ ...form, publicNotes: e.target.value })}
            placeholder="Notes qui apparaîtront sur la facture client...

Exemples :
• Conditions de garantie
• Instructions d'utilisation
• Prochaine maintenance recommandée"
          />
          <div className="text-xs text-gray-500">
            {(form.publicNotes || '').length} caractères • Visible par le client
          </div>
        </label>

        {/* Notes internes */}
        <label className="flex flex-col gap-2">
          <span className="text-lg font-medium text-gray-700">Notes internes (privées)</span>
          <textarea 
            className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent min-h-[120px] resize-y"
            value={form.internalNotes || ''}
            onChange={e => setForm({ ...form, internalNotes: e.target.value })}
            placeholder="Notes internes, non visibles par le client...

Exemples :
• Problèmes rencontrés
• Temps passé
• Matériel utilisé
• Points à retenir pour la prochaine fois"
          />
          <div className="text-xs text-gray-500">
            {(form.internalNotes || '').length} caractères • Usage interne uniquement
          </div>
        </label>

        {/* Aide et modèles */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">💡 Modèles de notes</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <button 
              onClick={() => setForm({ 
                ...form, 
                publicNotes: "Garantie 2 ans pièces et main d'œuvre.\nMaintenance recommandée tous les 6 mois.\nManuel d'utilisation remis au client." 
              })}
              className="block w-full text-left p-2 bg-white rounded hover:bg-blue-50 transition-colors"
            >
              <strong>Garantie standard</strong><br />
              <span className="text-xs">Garantie 2 ans, maintenance, manuel...</span>
            </button>
            
            <button 
              onClick={() => setForm({ 
                ...form, 
                notes: "Intervention réalisée selon les normes en vigueur.\nClient satisfait de la prestation.\nAucun problème particulier signalé." 
              })}
              className="block w-full text-left p-2 bg-white rounded hover:bg-blue-50 transition-colors"
            >
              <strong>Intervention standard</strong><br />
              <span className="text-xs">Notes d'intervention classique...</span>
            </button>
          </div>
        </div>

        {/* Aide iPad */}
        <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
          <span className="font-medium">📱 Aide iPad :</span> Les zones de texte s'agrandissent automatiquement. 
          Utilisez les modèles ci-dessus pour gagner du temps. Les notes publiques apparaîtront sur la facture client.
        </div>
      </div>
    </WizardSheet>
  );
};
