import React from 'react';
import { Invoice } from '../types';

interface InvoicePreviewSimpleProps {
  invoice: Invoice;
  className?: string;
}

export const InvoicePreviewSimple: React.FC<InvoicePreviewSimpleProps> = ({ invoice, className }) => (
  <div
    className={`bg-white max-w-[700px] m-auto shadow-md rounded-xl p-8 border border-gray-300 font-sans ${className || ''}`}
    style={{ minWidth: 320 }}
  >
    <div className="text-2xl font-bold mb-2">Facture n°{invoice.invoiceNumber}</div>
    <div className="text-gray-700 text-sm mb-4">{invoice.invoiceDate} • {invoice.eventLocation}</div>

    <div className="mb-6">
      <div className="font-semibold">Client</div>
      <div>{invoice.clientName}</div>
      <div>{invoice.clientAddress}</div>
      <div>{invoice.clientPostalCode} {invoice.clientCity}</div>
      <div>{invoice.clientEmail}</div>
      <div>{invoice.clientPhone}</div>
    </div>

    <div className="mb-6">
      <div className="font-semibold">Produits</div>
      <table className="w-full text-sm border mt-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Produit</th>
            <th className="border px-2 py-1">Qté</th>
            <th className="border px-2 py-1">Prix HT</th>
            <th className="border px-2 py-1">Total TTC</th>
          </tr>
        </thead>
        <tbody>
          {invoice.products.map((p, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">{p.name}</td>
              <td className="border px-2 py-1 text-center">{p.quantity}</td>
              <td className="border px-2 py-1 text-right">{p.priceHT} €</td>
              <td className="border px-2 py-1 text-right">{p.totalTTC} €</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="mt-6">
      <div className="flex justify-between font-bold text-lg">
        <span>Total HT :</span>
        <span>{invoice.montantHT} €</span>
      </div>
      <div className="flex justify-between text-sm text-gray-700">
        <span>TVA ({invoice.taxRate}%) :</span>
        <span>{invoice.montantTVA} €</span>
      </div>
      <div className="flex justify-between font-bold text-xl mt-1">
        <span>Total TTC :</span>
        <span>{invoice.montantTTC} €</span>
      </div>
      {invoice.montantAcompte > 0 && (
        <div className="flex justify-between text-sm text-blue-700 mt-2">
          <span>Acompte :</span>
          <span>-{invoice.montantAcompte} €</span>
        </div>
      )}
      <div className="flex justify-between font-semibold mt-2">
        <span>Reste à payer :</span>
        <span>{invoice.montantRestant} €</span>
      </div>
    </div>

    {invoice.invoiceNotes && (
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
        <span className="font-semibold">Note : </span>{invoice.invoiceNotes}
      </div>
    )}

    <div className="text-xs text-gray-500 mt-8">Conseiller : {invoice.advisorName}</div>
  </div>
);
