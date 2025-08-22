import React, { useState } from 'react';
import { Edit3, User, Package, FileText, CreditCard } from 'lucide-react';
import { ClientEditor, ClientForm } from '../components/editors/ClientEditor';
import { ProductsEditor, ProductForm } from '../components/editors/ProductsEditor';
import { NotesEditor, NotesForm } from '../components/editors/NotesEditor';
import { PaymentEditor, PaymentForm } from '../components/editors/PaymentEditor';
import { useWizard } from '../hooks/useWizard';

const WizardDemo: React.FC = () => {
  // États pour les données
  const [invoice, setInvoice] = useState({
    clientName: 'Jean Dupont',
    clientEmail: 'jean.dupont@email.com',
    clientAddress: '123 Rue de la Paix',
    clientPostalCode: '75001',
    clientCity: 'Paris',
    clientPhone: '06 12 34 56 78',
    clientDoorCode: 'A123B',
    clientHousingType: 'Appartement',
    clientSiret: '',
    addressLine2: 'Bâtiment A, 3ème étage',
    notes: 'Intervention de maintenance climatisation',
    publicNotes: 'Garantie 2 ans pièces et main d\'œuvre',
    internalNotes: 'Client très satisfait, RDV maintenance dans 6 mois'
  });

  const [products, setProducts] = useState<ProductForm[]>([
    {
      name: 'Climatisation réversible Samsung',
      price: 1200,
      quantity: 1,
      category: 'Climatisation',
      discount: 10,
      discountType: 'percentage'
    },
    {
      name: 'Installation et mise en service',
      price: 300,
      quantity: 1,
      category: 'Installation',
      discount: 0,
      discountType: 'percentage'
    }
  ]);

  const [payment, setPayment] = useState<PaymentForm>({
    paymentMethod: 'cheque',
    acompte: 300,
    nombreCheques: 3,
    chequeDates: [],
    chequeMontants: [],
    notes: 'Acompte à l\'installation, solde en 3 chèques'
  });

  // Wizards
  const clientWizard = useWizard<ClientForm>({
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail,
    clientAddress: invoice.clientAddress,
    clientPostalCode: invoice.clientPostalCode,
    clientCity: invoice.clientCity,
    clientPhone: invoice.clientPhone,
    clientDoorCode: invoice.clientDoorCode,
    clientHousingType: invoice.clientHousingType,
    clientSiret: invoice.clientSiret,
    addressLine2: invoice.addressLine2,
  });

  const productsWizard = useWizard<ProductForm[]>(products);

  const notesWizard = useWizard<NotesForm>({
    notes: invoice.notes,
    publicNotes: invoice.publicNotes,
    internalNotes: invoice.internalNotes,
  });

  const paymentWizard = useWizard<PaymentForm>(payment);

  // Handlers
  const saveClient = (data: ClientForm) => {
    setInvoice(prev => ({ ...prev, ...data }));
    clientWizard.apply(data);
  };

  const saveProducts = (data: ProductForm[]) => {
    setProducts(data);
    productsWizard.apply(data);
  };

  const saveNotes = (data: NotesForm) => {
    setInvoice(prev => ({ 
      ...prev, 
      notes: data.notes,
      publicNotes: data.publicNotes || '',
      internalNotes: data.internalNotes || '',
    }));
    notesWizard.apply(data);
  };

  const savePayment = (data: PaymentForm) => {
    setPayment(data);
    paymentWizard.apply(data);
  };

  const calculateTotal = () => {
    return products.reduce((total, product) => {
      const subtotal = product.price * product.quantity;
      const discountAmount = product.discountType === 'percentage'
        ? subtotal * (product.discount / 100)
        : product.discount;
      return total + (subtotal - discountAmount);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🎯 iPad Wizard - Démonstration
          </h1>
          <p className="text-gray-600">
            Touchez les blocs ci-dessous pour les éditer en plein écran (optimisé iPad)
          </p>
        </div>

        {/* Bloc Client */}
        <div 
          className="bg-white rounded-lg shadow-sm border p-6 mb-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => clientWizard.start()}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="text-[#477A0C]" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Client</h2>
            </div>
            <Edit3 size={16} className="text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700">{invoice.clientName}</div>
              <div className="text-gray-600">{invoice.clientEmail}</div>
              <div className="text-gray-600">{invoice.clientPhone}</div>
            </div>
            <div>
              <div className="text-gray-600">{invoice.clientAddress}</div>
              {invoice.addressLine2 && (
                <div className="text-gray-600">{invoice.addressLine2}</div>
              )}
              <div className="text-gray-600">{invoice.clientPostalCode} {invoice.clientCity}</div>
            </div>
          </div>
        </div>

        {/* Bloc Produits */}
        <div 
          className="bg-white rounded-lg shadow-sm border p-6 mb-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => productsWizard.start()}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Package className="text-[#477A0C]" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Produits ({products.length})</h2>
            </div>
            <Edit3 size={16} className="text-gray-400" />
          </div>
          
          <div className="space-y-2">
            {products.map((product, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium">{product.name}</span>
                  <span className="text-gray-500 ml-2">x{product.quantity}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{(product.price * product.quantity).toFixed(2)} €</div>
                  {product.discount > 0 && (
                    <div className="text-xs text-gray-500">
                      -{product.discountType === 'percentage' ? `${product.discount}%` : `${product.discount}€`}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Total HT</span>
                <span>{calculateTotal().toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-[#477A0C]">
                <span>Total TTC</span>
                <span>{(calculateTotal() * 1.2).toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bloc Paiement */}
        <div 
          className="bg-white rounded-lg shadow-sm border p-6 mb-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => paymentWizard.start()}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="text-[#477A0C]" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Paiement</h2>
            </div>
            <Edit3 size={16} className="text-gray-400" />
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Mode :</span>
              <span>{payment.paymentMethod === 'cheque' ? '📝 Chèque(s)' : 
                      payment.paymentMethod === 'cash' ? '💸 Espèces' :
                      payment.paymentMethod === 'transfer' ? '🏪 Virement' : '💳 Alma'}</span>
            </div>
            {payment.acompte > 0 && (
              <div className="flex justify-between">
                <span className="font-medium">Acompte :</span>
                <span>{payment.acompte.toFixed(2)} €</span>
              </div>
            )}
            {payment.paymentMethod === 'cheque' && payment.nombreCheques > 0 && (
              <div className="flex justify-between">
                <span className="font-medium">Solde :</span>
                <span>{payment.nombreCheques} chèques</span>
              </div>
            )}
            {payment.notes && (
              <div className="text-gray-600 mt-2">
                <span className="font-medium">Notes :</span> {payment.notes}
              </div>
            )}
          </div>
        </div>

        {/* Bloc Notes */}
        <div 
          className="bg-white rounded-lg shadow-sm border p-6 mb-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => notesWizard.start()}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="text-[#477A0C]" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
            </div>
            <Edit3 size={16} className="text-gray-400" />
          </div>
          
          <div className="space-y-2 text-sm">
            {invoice.notes && (
              <div>
                <span className="font-medium text-gray-700">Générales:</span>
                <p className="text-gray-600 mt-1">{invoice.notes}</p>
              </div>
            )}
            {invoice.publicNotes && (
              <div>
                <span className="font-medium text-gray-700">Publiques:</span>
                <p className="text-gray-600 mt-1">{invoice.publicNotes}</p>
              </div>
            )}
            {invoice.internalNotes && (
              <div>
                <span className="font-medium text-gray-700">Internes:</span>
                <p className="text-gray-600 mt-1">{invoice.internalNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Info iPad */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-blue-800 font-medium mb-1">
            📱 Mode iPad Wizard activé
          </div>
          <div className="text-blue-600 text-sm">
            Sur iPad, les éditeurs s'ouvrent en plein écran pour une saisie confortable. 
            Sur desktop, ils s'ouvrent en modal large.
          </div>
        </div>
      </div>

      {/* Éditeurs */}
      <ClientEditor
        isOpen={clientWizard.open}
        initial={clientWizard.value}
        onCancel={clientWizard.close}
        onSave={saveClient}
      />

      <ProductsEditor
        isOpen={productsWizard.open}
        initial={productsWizard.value}
        onCancel={productsWizard.close}
        onSave={saveProducts}
      />

      <NotesEditor
        isOpen={notesWizard.open}
        initial={notesWizard.value}
        onCancel={notesWizard.close}
        onSave={saveNotes}
      />

      <PaymentEditor
        isOpen={paymentWizard.open}
        initial={paymentWizard.value}
        totalAmount={calculateTotal() * 1.2}
        onCancel={paymentWizard.close}
        onSave={savePayment}
      />
    </div>
  );
};

export default WizardDemo;
