import React from 'react';
import { X, Printer, Eye } from 'lucide-react';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

interface SimplePDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
}

export const SimplePDFPreviewModal: React.FC<SimplePDFPreviewModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  if (!isOpen) return null;

  const calculateTotal = () => {
    return invoice.products.reduce(
      (sum, product) =>
        sum +
        calculateProductTotal(
          product.quantity,
          product.priceTTC,
          product.discount,
          product.discountType
        ),
      0
    );
  };

  const total = calculateTotal();

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex justify-between items-center p-4 border-b bg-gray-50'>
          <h2 className='text-xl font-bold text-gray-800 flex items-center'>
            <Eye className='w-5 h-5 mr-2' />
            Aperçu Facture {invoice.invoiceNumber}
          </h2>
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => window.print()}
              className='bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded flex items-center space-x-1'
            >
              <Printer className='w-4 h-4' />
              <span>Imprimer</span>
            </button>
            <button
              onClick={onClose}
              className='bg-gray-500 hover:bg-gray-600 text-white p-2 rounded'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='overflow-auto max-h-[calc(90vh-80px)] p-6'>
          <div className='bg-white shadow-lg rounded-lg overflow-hidden max-w-[210mm] mx-auto'>
            {/* Header Facture */}
            <div className='bg-gradient-to-r from-[#477A0C] to-[#5A8F0F] text-white p-6'>
              <div className='flex justify-between items-center'>
                <div>
                  <h1 className='text-3xl font-bold'>MYCONFORT</h1>
                  <p className='text-sm opacity-90'>
                    Facturation professionnelle avec signature électronique
                  </p>
                </div>
                {invoice.signature && (
                  <div className='bg-green-500 px-4 py-2 rounded-full text-sm font-bold'>
                    ✓ SIGNÉE
                  </div>
                )}
              </div>
            </div>

            {/* Informations principales */}
            <div className='p-6'>
              <div className='grid grid-cols-2 gap-6 mb-6'>
                {/* Infos entreprise */}
                <div>
                  <h3 className='text-lg font-bold text-[#477A0C] mb-3'>
                    MYCONFORT
                  </h3>
                  <div className='text-sm text-gray-600 space-y-1'>
                    <p>88, avenue des Ternes</p>
                    <p>75017 Paris</p>
                    <p>SIRET: 824 313 530 00027</p>
                    <p>Tél: 06 61 48 60 23</p>
                    <p>Email: htconfort@gmail.com</p>
                    <p>https://www.htconfort.com</p>
                  </div>
                </div>

                {/* Infos facture */}
                <div className='text-right'>
                  <div className='space-y-2'>
                    <div>
                      <strong>N° Facture:</strong> {invoice.invoiceNumber}
                    </div>
                    <div>
                      <strong>Date:</strong>{' '}
                      {new Date(invoice.invoiceDate).toLocaleDateString(
                        'fr-FR'
                      )}
                    </div>
                    {invoice.eventLocation && (
                      <div>
                        <strong>Lieu:</strong> {invoice.eventLocation}
                      </div>
                    )}
                    {invoice.advisorName && (
                      <div>
                        <strong>Conseiller:</strong> {invoice.advisorName}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations client */}
              <div className='bg-[#477A0C] text-white p-3 mb-4'>
                <h3 className='font-bold text-center'>INFORMATIONS CLIENT</h3>
              </div>
              <div className='bg-gray-50 p-4 rounded mb-6'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p>
                      <strong>{invoice.clientName}</strong>
                    </p>
                    <p>{invoice.clientAddress}</p>
                    <p>
                      {invoice.clientPostalCode} {invoice.clientCity}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Tél:</strong> {invoice.clientPhone}
                    </p>
                    <p>
                      <strong>Email:</strong> {invoice.clientEmail}
                    </p>
                    {invoice.clientDoorCode && (
                      <p>
                        <strong>Code porte:</strong> {invoice.clientDoorCode}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Produits */}
              <div className='mb-6'>
                <div className='bg-[#477A0C] text-white p-3 mb-2'>
                  <h3 className='font-bold text-center'>DÉTAIL DES PRODUITS</h3>
                </div>
                <table className='w-full border-collapse border border-gray-300'>
                  <thead>
                    <tr className='bg-gray-100'>
                      <th className='border border-gray-300 p-2 text-left'>
                        Produit
                      </th>
                      <th className='border border-gray-300 p-2 text-center'>
                        Qté
                      </th>
                      <th className='border border-gray-300 p-2 text-right'>
                        Prix TTC
                      </th>
                      <th className='border border-gray-300 p-2 text-right'>
                        Remise
                      </th>
                      <th className='border border-gray-300 p-2 text-right'>
                        Total TTC
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.products.map((product, index) => {
                      const productTotal = calculateProductTotal(
                        product.quantity,
                        product.priceTTC,
                        product.discount,
                        product.discountType
                      );
                      return (
                        <tr key={index}>
                          <td className='border border-gray-300 p-2'>
                            {product.name}
                          </td>
                          <td className='border border-gray-300 p-2 text-center'>
                            {product.quantity}
                          </td>
                          <td className='border border-gray-300 p-2 text-right'>
                            {formatCurrency(product.priceTTC)}
                          </td>
                          <td className='border border-gray-300 p-2 text-right'>
                            {product.discount > 0
                              ? product.discountType === 'percent'
                                ? `-${product.discount}%`
                                : `-${formatCurrency(product.discount)}`
                              : '-'}
                          </td>
                          <td className='border border-gray-300 p-2 text-right font-bold'>
                            {formatCurrency(productTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totaux */}
              <div className='text-right space-y-2 mb-6'>
                <div className='text-lg'>
                  <strong>
                    TOTAL HT:{' '}
                    {formatCurrency(total / (1 + invoice.taxRate / 100))}
                  </strong>
                </div>
                <div className='text-lg'>
                  <strong>
                    TVA ({invoice.taxRate}%):{' '}
                    {formatCurrency(
                      total - total / (1 + invoice.taxRate / 100)
                    )}
                  </strong>
                </div>
                <div className='text-2xl font-bold text-[#477A0C] border-t-2 border-[#477A0C] pt-2'>
                  TOTAL TTC: {formatCurrency(total)}
                </div>
                {invoice.montantAcompte > 0 && (
                  <div className='text-lg text-orange-600 mt-2'>
                    <p>
                      Acompte versé: {formatCurrency(invoice.montantAcompte)}
                    </p>
                    <p className='font-bold'>
                      Reste à payer:{' '}
                      {formatCurrency(total - invoice.montantAcompte)}
                    </p>
                  </div>
                )}
              </div>

              {/* Informations paiement et livraison */}
              {(invoice.paymentMethod || invoice.deliveryMethod) && (
                <div className='grid grid-cols-2 gap-4 mb-6'>
                  {invoice.paymentMethod && (
                    <div>
                      <h4 className='font-bold text-[#477A0C] mb-2'>
                        PAIEMENT
                      </h4>
                      <p>{invoice.paymentMethod}</p>
                    </div>
                  )}
                  {invoice.deliveryMethod && (
                    <div>
                      <h4 className='font-bold text-[#477A0C] mb-2'>
                        LIVRAISON
                      </h4>
                      <p>{invoice.deliveryMethod}</p>
                      {invoice.deliveryNotes && (
                        <p className='text-sm text-gray-600'>
                          {invoice.deliveryNotes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {invoice.invoiceNotes && (
                <div className='mb-6'>
                  <h4 className='font-bold text-[#477A0C] mb-2'>NOTES</h4>
                  <p className='text-sm bg-gray-50 p-3 rounded'>
                    {invoice.invoiceNotes}
                  </p>
                </div>
              )}

              {/* Signature */}
              {invoice.signature && (
                <div className='text-center mt-6 p-4 bg-green-50 rounded'>
                  <p className='font-bold text-green-800'>
                    ✅ Facture signée électroniquement
                  </p>
                  {invoice.signatureDate && (
                    <p className='text-sm text-green-600'>
                      Signée le{' '}
                      {new Date(invoice.signatureDate).toLocaleDateString(
                        'fr-FR'
                      )}{' '}
                      à{' '}
                      {new Date(invoice.signatureDate).toLocaleTimeString(
                        'fr-FR'
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
