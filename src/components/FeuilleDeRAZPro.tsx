// =============================================
// MyConfort – Exemple d'intégration du système de sessions RAZ
// Objectif : Montrer comment utiliser le nouveau système sans erreurs "2"
// =============================================

import React from 'react';
import { useSession } from '../hooks/useSession';
import { 
  addEventSafe, 
  updateSessionSafe, 
  closeSessionSafe, 
  clearSession,
  tryAddEvent,
  getSessionStatus,
  debugSession
} from '../services/sessionService';
import { SessionCodes } from '../types/session';

/**
 * Composant exemple pour la feuille de RAZ
 * Remplace l'ancien système qui causait l'erreur "update session" et retours "2"
 */
export function FeuilleDeRAZPro() {
  const { session, refresh } = useSession();

  /**
   * Enregistrer une vente - Version robuste qui évite les erreurs
   */
  const enregistrerVente = (saleData: any) => {
    console.log('📝 Tentative d\'enregistrement vente:', saleData);
    
    const result = tryAddEvent({ 
      type: 'sale', 
      payload: saleData 
    });
    
    if (result.code !== SessionCodes.OK) {
      console.error('[RAZ] Erreur enregistrement vente:', result.message);
      alert(`Erreur enregistrement vente: ${result.message || 'inconnue'}`);
      return false;
    }
    
    console.log('✅ Vente enregistrée avec succès');
    refresh(); // Synchronise l'UI
    return true;
  };

  /**
   * Mettre à jour les informations de l'événement
   */
  const majInfosEvenement = (eventName: string) => {
    const result = updateSessionSafe(prev => ({ 
      ...prev, 
      eventName 
    }));
    
    if (!result.ok) {
      console.error('[RAZ] Erreur MAJ session:', result.error);
      alert(`Erreur mise à jour session: ${result.error}`);
      return false;
    }
    
    console.log('✅ Informations événement mises à jour');
    return true;
  };

  /**
   * Ajouter une note à la session
   */
  const ajouterNote = (note: string) => {
    const result = addEventSafe({
      type: 'note',
      payload: { content: note }
    });
    
    if (!result.ok) {
      console.error('[RAZ] Erreur ajout note:', result.error);
      alert(`Erreur ajout note: ${result.error}`);
      return false;
    }
    
    refresh();
    return true;
  };

  /**
   * Clôturer la session
   */
  const cloturer = () => {
    const result = closeSessionSafe();
    
    if (!result.ok) {
      console.error('[RAZ] Erreur fermeture:', result.error);
      alert(`Erreur fermeture session: ${result.error}`);
      return false;
    }
    
    console.log('🔒 Session clôturée avec succès');
    alert('Session clôturée avec succès');
    return true;
  };

  /**
   * Vérifier l'état de la session
   */
  const verifierSession = () => {
    const status = getSessionStatus();
    console.log('📊 État session:', status);
    alert(`État: ${status.code} - ${status.message || 'OK'}`);
  };

  /**
   * Actions de test pour valider le système
   */
  const testsDeValidation = () => {
    console.group('🧪 Tests de validation RAZ');
    
    // Test 1: Vente simple
    enregistrerVente({ 
      totalTTC: 123.45, 
      items: 3, 
      paymentMethod: 'Carte Bleue' 
    });
    
    // Test 2: Note
    ajouterNote('Test du nouveau système RAZ');
    
    // Test 3: Vérification
    verifierSession();
    
    console.groupEnd();
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('fr-FR');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        🧾 Feuille de RAZ - Système Robuste
      </h1>
      
      {/* Informations de session */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">📋 Session actuelle</h2>
        {session ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>ID:</strong> {session.id}</div>
            <div><strong>Statut:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                session.status === 'open' ? 'bg-green-100 text-green-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {session.status}
              </span>
            </div>
            <div><strong>Ouverte:</strong> {formatDate(session.openedAt)}</div>
            <div><strong>Événement:</strong> {session.eventName || '—'}</div>
            <div><strong>Événements:</strong> {session.events.length}</div>
            {session.closedAt && (
              <div><strong>Fermée:</strong> {formatDate(session.closedAt)}</div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Aucune session active</p>
        )}
      </div>

      {/* Actions principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button 
          onClick={() => {
            const eventName = prompt('Nom de la manifestation ?') || '';
            if (eventName) majInfosEvenement(eventName);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          📝 Nom événement
        </button>
        
        <button 
          onClick={() => enregistrerVente({ 
            totalTTC: 123.45, 
            items: 3,
            timestamp: new Date().toISOString()
          })}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          💰 Vente test
        </button>
        
        <button 
          onClick={() => {
            const note = prompt('Note à ajouter ?') || '';
            if (note) ajouterNote(note);
          }}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        >
          📝 Ajouter note
        </button>
        
        <button 
          onClick={cloturer}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          🔒 Clôturer
        </button>
      </div>

      {/* Actions de diagnostic */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button 
          onClick={verifierSession}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
        >
          🔍 Vérifier
        </button>
        
        <button 
          onClick={debugSession}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          🐛 Debug
        </button>
        
        <button 
          onClick={testsDeValidation}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded"
        >
          🧪 Tests
        </button>
        
        <button 
          onClick={() => {
            if (confirm('Effacer complètement la session ?')) {
              clearSession();
              refresh();
            }
          }}
          className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded"
        >
          🗑️ RAZ complet
        </button>
      </div>

      {/* Historique des événements */}
      {session && session.events.length > 0 && (
        <div className="bg-white border rounded-lg">
          <h3 className="text-lg font-semibold p-4 border-b">
            📚 Historique des événements ({session.events.length})
          </h3>
          <div className="max-h-64 overflow-y-auto">
            {session.events.slice(-10).reverse().map((event) => (
              <div key={event.id} className="p-3 border-b last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      event.type === 'sale' ? 'bg-green-100 text-green-800' :
                      event.type === 'note' ? 'bg-yellow-100 text-yellow-800' :
                      event.type === 'open' ? 'bg-blue-100 text-blue-800' :
                      event.type === 'close' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.type}
                    </span>
                    {event.payload && (
                      <div className="mt-1 text-sm text-gray-600">
                        {JSON.stringify(event.payload, null, 2)}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(event.at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h4 className="font-semibold text-green-800 mb-2">✅ Améliorations apportées :</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Plus d'erreur "update session" grâce à <code>updateSessionSafe</code></li>
          <li>• Plus de retours "2" non-exploités grâce aux codes explicites</li>
          <li>• Synchronisation automatique entre composants et onglets</li>
          <li>• Gestion d'erreurs robuste avec messages explicites</li>
          <li>• Session automatiquement ouverte si nécessaire</li>
        </ul>
      </div>
    </div>
  );
}

export default FeuilleDeRAZPro;
