// Script pour initialiser les données de test dans localStorage
// Exécutez ce script dans la console du navigateur ou via Node.js

const testInvoices = [
  {
    invoiceNumber: 'FAC-2025-001',
    invoiceDate: '2025-07-20',
    eventLocation: 'Paris 17ème',
    clientName: 'Jean Dupont',
    clientEmail: 'jean.dupont@email.com',
    clientPhone: '0123456789',
    clientAddress: '123 Rue de la Paix',
    clientPostalCode: '75017',
    clientCity: 'Paris',
    clientHousingType: 'Appartement',
    clientDoorCode: 'A1234',
    clientSiret: '',
    products: [
      {
        name: 'Installation climatisation',
        quantity: 1,
        priceHT: 800,
        priceTTC: 960,
        discount: 0,
        discountType: 'fixed',
        totalHT: 800,
        totalTTC: 960,
        category: 'Installation'
      }
    ],
    montantHT: 800,
    montantTTC: 960,
    montantTVA: 160,
    montantRemise: 0,
    taxRate: 20,
    paymentMethod: 'Carte bancaire',
    montantAcompte: 200,
    montantRestant: 760,
    deliveryMethod: 'Sur site',
    deliveryNotes: 'Installation le matin',
    signature: '',
    isSigned: false,
    invoiceNotes: 'Installation standard',
    advisorName: 'Marc Martin',
    termsAccepted: true,
    createdAt: '2025-07-20T10:00:00.000Z',
    updatedAt: '2025-07-20T10:00:00.000Z'
  },
  {
    invoiceNumber: 'FAC-2025-002',
    invoiceDate: '2025-07-22',
    eventLocation: 'Neuilly-sur-Seine',
    clientName: 'Marie Leblanc',
    clientEmail: 'marie.leblanc@email.com',
    clientPhone: '0987654321',
    clientAddress: '456 Avenue Charles de Gaulle',
    clientPostalCode: '92200',
    clientCity: 'Neuilly-sur-Seine',
    clientHousingType: 'Maison',
    clientDoorCode: '',
    clientSiret: '',
    products: [
      {
        name: 'Maintenance climatisation',
        quantity: 2,
        priceHT: 150,
        priceTTC: 180,
        discount: 10,
        discountType: 'percent',
        totalHT: 270,
        totalTTC: 324,
        category: 'Maintenance'
      }
    ],
    montantHT: 270,
    montantTTC: 324,
    montantTVA: 54,
    montantRemise: 36,
    taxRate: 20,
    paymentMethod: 'Virement',
    montantAcompte: 0,
    montantRestant: 324,
    deliveryMethod: 'Sur site',
    deliveryNotes: 'Maintenance annuelle',
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    isSigned: true,
    signatureDate: '2025-07-22T14:30:00.000Z',
    invoiceNotes: 'Client satisfait',
    advisorName: 'Sophie Dubois',
    termsAccepted: true,
    createdAt: '2025-07-22T09:00:00.000Z',
    updatedAt: '2025-07-22T14:30:00.000Z'
  },
  {
    invoiceNumber: 'FAC-2025-003',
    invoiceDate: '2025-07-25',
    eventLocation: 'Boulogne-Billancourt',
    clientName: 'Pierre Martin',
    clientEmail: 'pierre.martin@email.com',
    clientPhone: '0145678912',
    clientAddress: '789 Rue de Sèvres',
    clientPostalCode: '92100',
    clientCity: 'Boulogne-Billancourt',
    clientHousingType: 'Appartement',
    clientDoorCode: 'B5678',
    clientSiret: '12345678901234',
    products: [
      {
        name: 'Réparation climatisation',
        quantity: 1,
        priceHT: 250,
        priceTTC: 300,
        discount: 0,
        discountType: 'fixed',
        totalHT: 250,
        totalTTC: 300,
        category: 'Réparation'
      },
      {
        name: 'Pièce détachée',
        quantity: 2,
        priceHT: 45,
        priceTTC: 54,
        discount: 5,
        discountType: 'percent',
        totalHT: 85.5,
        totalTTC: 102.6,
        category: 'Pièces'
      }
    ],
    montantHT: 335.5,
    montantTTC: 402.6,
    montantTVA: 67.1,
    montantRemise: 5.4,
    taxRate: 20,
    paymentMethod: 'Espèces',
    montantAcompte: 100,
    montantRestant: 302.6,
    deliveryMethod: 'Sur site',
    deliveryNotes: 'Intervention urgente',
    signature: '',
    isSigned: false,
    invoiceNotes: 'Réparation rapide',
    advisorName: 'Lucie Moreau',
    termsAccepted: true,
    createdAt: '2025-07-25T15:00:00.000Z',
    updatedAt: '2025-07-25T15:00:00.000Z'
  }
];

// Pour exécuter dans la console du navigateur :
console.log('Initialisation des données de test...');
localStorage.setItem('myconfortInvoices', JSON.stringify(testInvoices));
console.log('✅ Données de test créées :', testInvoices.length, 'factures');

// Également créer quelques clients de test
const testClients = [
  {
    id: '1',
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    phone: '0123456789',
    address: '123 Rue de la Paix',
    postalCode: '75017',
    city: 'Paris',
    housingType: 'Appartement',
    doorCode: 'A1234',
    siret: '',
    createdAt: '2025-07-20T10:00:00.000Z'
  },
  {
    id: '2',
    name: 'Marie Leblanc',
    email: 'marie.leblanc@email.com',
    phone: '0987654321',
    address: '456 Avenue Charles de Gaulle',
    postalCode: '92200',
    city: 'Neuilly-sur-Seine',
    housingType: 'Maison',
    doorCode: '',
    siret: '',
    createdAt: '2025-07-22T09:00:00.000Z'
  },
  {
    id: '3',
    name: 'Pierre Martin',
    email: 'pierre.martin@email.com',
    phone: '0145678912',
    address: '789 Rue de Sèvres',
    postalCode: '92100',
    city: 'Boulogne-Billancourt',
    housingType: 'Appartement',
    doorCode: 'B5678',
    siret: '12345678901234',
    createdAt: '2025-07-25T15:00:00.000Z'
  }
];

localStorage.setItem('myconfortClients', JSON.stringify(testClients));
console.log('✅ Clients de test créés :', testClients.length, 'clients');

console.log('🎉 Toutes les données de test ont été initialisées !');
console.log('Rechargez la page pour voir les données.');
