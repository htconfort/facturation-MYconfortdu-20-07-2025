import React from 'react';
import { Invoice } from '../types';
import {
  formatCurrency,
  calculateHT,
  calculateProductTotal,
} from '../utils/calculations';

interface InvoicePDFProps {
  invoice: Invoice;
  isPreview?: boolean;
}

export const InvoicePDF = React.forwardRef<HTMLDivElement, InvoicePDFProps>(
  ({ invoice, isPreview = false }, ref) => {
    const totals = React.useMemo(() => {
      const subtotal = invoice.products.reduce((sum, product) => {
        return (
          sum +
          product.quantity * calculateHT(product.priceTTC, invoice.taxRate)
        );
      }, 0);

      const totalWithTax = invoice.products.reduce((sum, product) => {
        return (
          sum +
          calculateProductTotal(
            product.quantity,
            product.priceTTC,
            product.discount,
            product.discountType
          )
        );
      }, 0);

      const totalDiscount = invoice.products.reduce((sum, product) => {
        const originalTotal = product.priceTTC * product.quantity;
        const discountedTotal = calculateProductTotal(
          product.quantity,
          product.priceTTC,
          product.discount,
          product.discountType
        );
        return sum + (originalTotal - discountedTotal);
      }, 0);

      return {
        subtotal,
        totalWithTax,
        totalDiscount,
        taxAmount: totalWithTax - totalWithTax / (1 + invoice.taxRate / 100),
      };
    }, [invoice.products, invoice.taxRate]);

    const containerClass = isPreview
      ? 'max-w-4xl mx-auto bg-white shadow-2xl'
      : 'w-full bg-white';

    return (
      <div
        ref={ref}
        className={containerClass}
        style={{
          fontFamily: 'Inter, sans-serif',
          color: '#080F0F',
          fontSize: '11px',
          lineHeight: '1.3',
        }}
      >
        {/* Bordure supérieure verte */}
        <div className='h-0.5 bg-[#477A0C]'></div>

        {/* En-tête de la facture */}
        <div className='p-4 border-b-2 border-[#477A0C]'>
          {/* Le logo a été retiré comme demandé */}

          <div className='flex justify-between items-start'>
            {/* Informations entreprise */}
            <div className='flex-1'>
              <div className='text-center'>
                {' '}
                {/* Ajout de text-center */}
                <img
                  src='/HT-Confort_Full_Green.svg'
                  alt='HT-Confort Logo'
                  className='company-logo'
                  style={{
                    maxWidth: '200px',
                    maxHeight: '100px',
                    margin: '0 auto 10px auto',
                    display: 'block',
                  }}
                />
                <p
                  className='text-2xl font-caveat'
                  style={{
                    color: '#477A0C',
                    fontStyle: 'italic',
                    fontWeight: '500',
                    margin: '0 0 15px 0',
                  }}
                >
                  Quand on dort bien, on vit bien
                </p>
                <h1 className='text-6xl font-black text-[#477A0C] tracking-tight'>
                  {' '}
                  {/* Taille de police augmentée à text-6xl */}
                  MYCONFORT
                </h1>
              </div>

              <div
                className='text-sm space-y-0.5 mt-3'
                style={{ color: '#080F0F' }}
              >
                {' '}
                {/* Changé de text-xs à text-sm */}
                <p
                  className='font-semibold text-base'
                  style={{ color: '#080F0F' }}
                >
                  MYCONFORT
                </p>{' '}
                {/* Changé de text-sm à text-base */}
                <p className='font-semibold'>88 Avenue des Ternes</p>
                <p>75017 Paris, France</p>
                <p>SIRET: 824 313 530 00027</p>
                <p>Tél: 04 68 50 41 45</p>
                <p>Email: myconfort@gmail.com</p>
                <p>Site web: https://www.htconfort.com</p>
              </div>
            </div>

            {/* Informations facture */}
            <div className='text-right'>
              <div className='bg-[#477A0C] text-[#F2EFE2] px-4 py-2 rounded-lg mb-3'>
                <h2 className='text-xl font-bold'>FACTURE</h2>{' '}
                {/* Changé de text-lg à text-xl */}
              </div>

              <div className='space-y-1 text-xs'>
                <div className='flex justify-between items-center min-w-[150px]'>
                  <span className='font-semibold' style={{ color: '#080F0F' }}>
                    N° Facture:
                  </span>
                  <span className='font-bold text-sm text-[#477A0C]'>
                    {invoice.invoiceNumber}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='font-semibold' style={{ color: '#080F0F' }}>
                    Date:
                  </span>
                  <span className='font-semibold' style={{ color: '#080F0F' }}>
                    {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {invoice.eventLocation && (
                  <div className='flex justify-between items-center'>
                    <span
                      className='font-semibold'
                      style={{ color: '#080F0F' }}
                    >
                      Lieu:
                    </span>
                    <span
                      className='font-semibold'
                      style={{ color: '#080F0F' }}
                    >
                      {invoice.eventLocation}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Informations client - CORRIGÉ */}
        <div className='p-4 border-b border-gray-200'>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <h3 className='text-sm font-bold text-[#477A0C] mb-2 border-b border-[#477A0C] pb-1'>
                FACTURER À
              </h3>
              <div className='space-y-1' style={{ fontSize: '12px' }}>
                <p
                  className='font-bold'
                  style={{ color: '#080F0F', fontSize: '14px' }}
                >
                  {invoice.clientName}
                </p>
                <p style={{ color: '#080F0F', wordBreak: 'break-word' }}>
                  {invoice.clientAddress}
                </p>
                <p style={{ color: '#080F0F' }}>
                  {invoice.clientPostalCode} {invoice.clientCity}
                </p>
                {invoice.clientSiret && (
                  <p style={{ color: '#080F0F' }}>
                    SIRET: {invoice.clientSiret}
                  </p>
                )}
                <div className='pt-1 space-y-0.5'>
                  <p style={{ color: '#080F0F', wordBreak: 'break-word' }}>
                    <span className='font-semibold'>Tél:</span>{' '}
                    {invoice.clientPhone}
                  </p>
                  <p style={{ color: '#080F0F', wordBreak: 'break-word' }}>
                    <span className='font-semibold'>Email:</span>{' '}
                    {invoice.clientEmail}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <h3 className='text-sm font-bold text-[#477A0C] mb-2 border-b border-[#477A0C] pb-1'>
                INFORMATIONS COMPLÉMENTAIRES
              </h3>
              <div className='space-y-1' style={{ fontSize: '12px' }}>
                {invoice.clientHousingType && (
                  <p style={{ color: '#080F0F' }}>
                    <span className='font-semibold'>Type de logement:</span>{' '}
                    {invoice.clientHousingType}
                  </p>
                )}
                {invoice.clientDoorCode && (
                  <p style={{ color: '#080F0F' }}>
                    <span className='font-semibold'>Code d'accès:</span>{' '}
                    {invoice.clientDoorCode}
                  </p>
                )}
                {invoice.deliveryMethod && (
                  <p style={{ color: '#080F0F' }}>
                    <span className='font-semibold'>Livraison:</span>{' '}
                    {invoice.deliveryMethod}
                  </p>
                )}
                {invoice.advisorName && (
                  <p style={{ color: '#080F0F' }}>
                    <span className='font-semibold'>Conseiller:</span>{' '}
                    {invoice.advisorName}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des produits - CORRIGÉ */}
        <div className='p-4'>
          <h3 className='text-sm font-bold text-[#477A0C] mb-3 border-b border-[#477A0C] pb-1'>
            DÉTAIL DES PRODUITS
          </h3>

          <div className='overflow-x-auto'>
            <table className='w-full border-collapse border border-gray-300 rounded-lg overflow-hidden'>
              <thead>
                <tr className='bg-[#477A0C] text-[#F2EFE2]'>
                  <th
                    style={{ width: '40%' }}
                    className='border border-gray-300 px-2 py-2 text-left font-bold text-xs'
                  >
                    DÉSIGNATION
                  </th>
                  <th
                    style={{ width: '8%' }}
                    className='border border-gray-300 px-1 py-2 text-center font-bold text-xs'
                  >
                    QTÉ
                  </th>
                  <th
                    style={{ width: '13%' }}
                    className='border border-gray-300 px-1 py-2 text-right font-bold text-xs'
                  >
                    PU HT
                  </th>
                  <th
                    style={{ width: '13%' }}
                    className='border border-gray-300 px-1 py-2 text-right font-bold text-xs'
                  >
                    PU TTC
                  </th>
                  <th
                    style={{ width: '13%' }}
                    className='border border-gray-300 px-1 py-2 text-right font-bold text-xs'
                  >
                    REMISE
                  </th>
                  <th
                    style={{ width: '13%' }}
                    className='border border-gray-300 px-1 py-2 text-right font-bold text-xs'
                  >
                    TOTAL TTC
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.products.map((product, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className='border border-gray-300 px-2 py-2'>
                      <div
                        className='font-semibold'
                        style={{ color: '#080F0F' }}
                      >
                        {product.name}
                      </div>
                      {product.category && (
                        <div
                          className='text-xs mt-0.5'
                          style={{ color: '#080F0F', fontSize: '10px' }}
                        >
                          {product.category}
                        </div>
                      )}
                    </td>
                    <td
                      className='border border-gray-300 px-1 py-2 text-center font-semibold text-xs'
                      style={{ color: '#080F0F' }}
                    >
                      {product.quantity}
                    </td>
                    <td
                      className='border border-gray-300 px-1 py-2 text-right text-xs'
                      style={{ color: '#080F0F' }}
                    >
                      {formatCurrency(
                        calculateHT(product.priceTTC, invoice.taxRate)
                      )}
                    </td>
                    <td
                      className='border border-gray-300 px-1 py-2 text-right font-semibold text-xs'
                      style={{ color: '#080F0F' }}
                    >
                      {formatCurrency(product.priceTTC)}
                    </td>
                    <td className='border border-gray-300 px-1 py-2 text-right text-xs'>
                      {product.discount > 0 ? (
                        <span className='text-red-600 font-semibold'>
                          -
                          {product.discountType === 'percent'
                            ? `${product.discount}%`
                            : formatCurrency(product.discount)}
                        </span>
                      ) : (
                        <span style={{ color: '#080F0F' }}>-</span>
                      )}
                    </td>
                    <td
                      className='border border-gray-300 px-1 py-2 text-right font-bold text-xs'
                      style={{ color: '#080F0F' }}
                    >
                      {formatCurrency(
                        calculateProductTotal(
                          product.quantity,
                          product.priceTTC,
                          product.discount,
                          product.discountType
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mention légale Article L224‑59 */}
          <div className='mt-4'>
            <div
              className='font-bold text-xs mb-0.5'
              style={{ color: '#080F0F' }}
            >
              ⚖️ Article L224‑59 du Code de la consommation
            </div>
            <div
              className='text-xs font-bold leading-tight'
              style={{ color: '#080F0F', fontSize: '10px' }}
            >
              « Avant la conclusion de tout contrat entre un consommateur et un
              professionnel à l'occasion d'une foire, d'un salon […] le
              professionnel informe le consommateur qu'il ne dispose pas d'un
              délai de rétractation. »
            </div>
          </div>

          {/* Totaux avec gestion acompte */}
          <div className='mt-4 flex justify-end'>
            <div className='w-full max-w-md'>
              <div className='bg-gray-50 border border-gray-200 rounded-lg p-3'>
                <div className='space-y-1'>
                  <div className='flex justify-between text-xs'>
                    <span
                      className='font-semibold'
                      style={{ color: '#080F0F' }}
                    >
                      Montant HT:
                    </span>
                    <span
                      className='font-semibold'
                      style={{ color: '#080F0F' }}
                    >
                      {formatCurrency(totals.subtotal)}
                    </span>
                  </div>
                  <div className='flex justify-between text-xs'>
                    <span
                      className='font-semibold'
                      style={{ color: '#080F0F' }}
                    >
                      TVA ({invoice.taxRate}%):
                    </span>
                    <span
                      className='font-semibold'
                      style={{ color: '#080F0F' }}
                    >
                      {formatCurrency(totals.taxAmount)}
                    </span>
                  </div>
                  {totals.totalDiscount > 0 && (
                    <div className='flex justify-between text-xs text-red-600'>
                      <span className='font-semibold'>Remise totale:</span>
                      <span className='font-semibold'>
                        -{formatCurrency(totals.totalDiscount)}
                      </span>
                    </div>
                  )}
                  <div className='border-t border-gray-300 pt-1'>
                    {(() => {
                      const hasAcompte =
                        invoice.montantAcompte && invoice.montantAcompte > 0;
                      const hasChequesAVenir =
                        invoice.nombreChequesAVenir &&
                        invoice.nombreChequesAVenir > 0;
                      const isPaymentMethodCash = [
                        'espèces',
                        'carte bleue',
                        'carte bancaire',
                        'virement',
                      ].includes(invoice.paymentMethod?.toLowerCase() || '');

                      const isFullyPaid =
                        isPaymentMethodCash && !hasAcompte && !hasChequesAVenir;

                      return (
                        <div className='flex justify-between text-sm font-bold'>
                          <span style={{ color: '#080F0F' }}>
                            {isFullyPaid ? 'MONTANT PAYÉ:' : 'TOTAL TTC:'}
                          </span>
                          <span className='text-[#477A0C]'>
                            {formatCurrency(totals.totalWithTax)}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Conditions générales de vente */}
                  <div className='border-t border-gray-300 pt-2 mt-2'>
                    <div className='flex items-center space-x-2 text-xs'>
                      <span className='text-green-600 font-bold'>✅</span>
                      <span
                        className='font-semibold'
                        style={{ color: '#080F0F' }}
                      >
                        J'ai lu et j'accepte les conditions générales de vente *
                      </span>
                    </div>
                  </div>

                  {/* Gestion acompte */}
                  {invoice.montantAcompte > 0 && (
                    <>
                      <div className='border-t border-gray-300 pt-1'>
                        <div className='flex justify-between text-xs'>
                          <span
                            className='font-semibold'
                            style={{ color: '#080F0F' }}
                          >
                            Acompte versé:
                          </span>
                          <span className='font-semibold text-blue-600'>
                            {formatCurrency(invoice.montantAcompte)}
                          </span>
                        </div>
                      </div>
                      <div className='bg-orange-50 border border-orange-200 rounded p-2'>
                        <div className='flex justify-between text-sm font-bold text-orange-600'>
                          <span>RESTE À PAYER:</span>
                          <span>
                            {formatCurrency(
                              totals.totalWithTax - invoice.montantAcompte
                            )}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Signature si présente */}
          {invoice.isSigned && (
            <div className='mt-4 flex justify-end'>
              <div className='border border-gray-300 rounded p-2 w-48'>
                <h4 className='text-[#477A0C] font-bold text-xs mb-1 text-center'>
                  SIGNATURE CLIENT
                </h4>
                {invoice.signature ? (
                  <div className='h-12 flex items-center justify-center'>
                    <img
                      src={invoice.signature}
                      alt='Signature'
                      className='max-h-full max-w-full'
                    />
                  </div>
                ) : (
                  <div className='h-12 flex items-center justify-center text-xs text-gray-600 italic'>
                    Document signé électroniquement
                  </div>
                )}
                <p
                  className='text-xs text-center mt-1'
                  style={{ color: '#080F0F', fontSize: '10px' }}
                >
                  Signé le {new Date().toLocaleDateString('fr-FR')} à{' '}
                  {new Date().toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Informations de paiement et notes */}
        <div className='p-4 border-t border-gray-200 bg-gray-50'>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <h3 className='text-sm font-bold text-[#477A0C] mb-2'>
                MODALITÉS DE PAIEMENT
              </h3>
              <div className='space-y-1 text-xs'>
                {invoice.paymentMethod && (
                  <p style={{ color: '#080F0F' }}>
                    <span className='font-semibold'>Mode de règlement:</span>{' '}
                    {invoice.paymentMethod}
                  </p>
                )}

                {/* Affichage des chèques à venir */}
                {invoice.nombreChequesAVenir &&
                  invoice.nombreChequesAVenir > 0 && (
                    <div className='bg-blue-50 border border-blue-200 rounded p-2 mt-2'>
                      <p className='font-semibold text-blue-800'>
                        Chèques à venir:
                      </p>
                      <p className='text-blue-700'>
                        {invoice.nombreChequesAVenir} chèque
                        {invoice.nombreChequesAVenir > 1 ? 's' : ''} à venir
                      </p>
                      {(() => {
                        const montantApresAcompte =
                          totals.totalWithTax - (invoice.montantAcompte || 0);
                        const montantParCheque =
                          montantApresAcompte / invoice.nombreChequesAVenir;

                        if (montantApresAcompte > 0) {
                          return (
                            <p className='text-blue-700'>
                              Montant par chèque:{' '}
                              <span className='font-bold'>
                                {formatCurrency(montantParCheque)}
                              </span>
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}

                <div className='bg-white p-2 rounded border mt-2'>
                  <p className='text-xs' style={{ color: '#080F0F' }}>
                    Si vous devez envoyer des règlements par chèque. Voici
                    l'adresse : SAV htconfort 8 rue du gregal 66510 st hippolyte
                    0661486023
                  </p>
                </div>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              {invoice.invoiceNotes && (
                <>
                  <h3 className='text-sm font-bold text-[#477A0C] mb-2'>
                    REMARQUES
                  </h3>
                  <div className='text-xs bg-white p-2 rounded border'>
                    <p style={{ color: '#080F0F' }}>{invoice.invoiceNotes}</p>
                  </div>
                </>
              )}

              {invoice.deliveryNotes && (
                <>
                  <h3 className='text-sm font-bold text-[#477A0C] mb-2 mt-3'>
                    LIVRAISON
                  </h3>
                  <div className='text-xs bg-white p-2 rounded border'>
                    <p style={{ color: '#080F0F' }}>{invoice.deliveryNotes}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className='p-4 border-t-2 border-[#477A0C] bg-[#477A0C] text-[#F2EFE2] print:page-break-after'>
          <div className='text-center'>
            <div className='flex items-center justify-center mb-2'>
              <span className='text-lg mr-2'>🌸</span>
              <span className='text-lg font-bold'>MYCONFORT</span>
            </div>
            <p className='font-bold text-sm mb-1'>Merci de votre confiance !</p>
            <p className='text-sm opacity-90'>
              Votre spécialiste en matelas et literie de qualité
            </p>
            <div className='mt-4 text-xs opacity-75'>
              <p>
                TVA non applicable, art. 293 B du CGI - RCS Paris 824 313 530
              </p>
            </div>
          </div>
        </div>

        {/* DEUXIÈME PAGE - CONDITIONS GÉNÉRALES DE VENTE */}
        <div
          className='hidden print:block print:page-break-before'
          style={{
            fontFamily: 'Inter, sans-serif',
            color: '#080F0F',
            fontSize: '11px',
            lineHeight: '1.4',
          }}
        >
          {/* En-tête de la deuxième page */}
          <div className='p-4 border-b-2 border-[#477A0C] bg-[#477A0C] text-[#F2EFE2] text-center'>
            <h1 className='text-xl font-bold'>CONDITIONS GÉNÉRALES DE VENTE</h1>
            <p className='text-sm mt-1'>
              MYCONFORT - 88 Avenue des Ternes, 75017 Paris
            </p>
          </div>

          {/* Contenu des conditions générales */}
          <div className='p-4 space-y-3'>
            <div>
              <h3 className='font-bold text-[#477A0C] mb-1'>
                Art. 1 - Livraison
              </h3>
              <p className='text-justify'>
                Une fois la commande expédiée, vous serez contacté par SMS ou
                mail pour programmer la livraison en fonction de vos
                disponibilités (à la journée ou demi-journée). Le transporteur
                livre le produit au pas de porte ou en bas de l'immeuble.
                Veuillez vérifier que les dimensions du produit permettent son
                passage dans les escaliers, couloirs et portes. Aucun service
                d'installation ou de reprise de l'ancienne literie n'est prévu.
              </p>
            </div>

            <div>
              <h3 className='font-bold text-[#477A0C] mb-1'>
                Art. 2 - Délais de Livraison
              </h3>
              <p className='text-justify'>
                Les délais de livraison sont donnés à titre indicatif et ne
                constituent pas un engagement ferme. En cas de retard, aucune
                indemnité ou annulation ne sera acceptée, notamment en cas de
                force majeure. Nous déclinons toute responsabilité en cas de
                délai dépassé.
              </p>
            </div>

            <div>
              <h3 className='font-bold text-[#477A0C] mb-1'>
                Art. 3 - Risques de Transport
              </h3>
              <p className='text-justify'>
                Les marchandises voyagent aux risques du destinataire. En cas
                d'avarie ou de perte, il appartient au client de faire les
                réserves nécessaires obligatoire sur le bordereau du
                transporteur. En cas de non-respect de cette obligation on ne
                peut pas se retourner contre le transporteur.
              </p>
            </div>

            <div>
              <h3 className='font-bold text-[#477A0C] mb-1'>
                Art. 4 - Acceptation des Conditions
              </h3>
              <p className='text-justify'>
                Toute livraison implique l'acceptation des présentes conditions.
                Le transporteur livre à l'adresse indiquée sans monter les
                étages. Le client est responsable de vérifier et d'accepter les
                marchandises lors de la livraison.
              </p>
            </div>

            <div>
              <h3 className='font-bold text-[#477A0C] mb-1'>
                Art. 5 - Réclamations
              </h3>
              <p className='text-justify'>
                Les réclamations concernant la qualité des marchandises doivent
                être formulées par écrit dans les huit jours suivant la
                livraison, par lettre recommandée avec accusé de réception.
              </p>
            </div>

            <div>
              <h3 className='font-bold text-[#477A0C] mb-1'>
                Art. 6 - Retours
              </h3>
              <p className='text-justify'>
                Aucun retour de marchandises ne sera accepté sans notre accord
                écrit préalable. Cet accord n'implique aucune reconnaissance.
              </p>
            </div>

            <div>
              <h3 className='font-bold text-[#477A0C] mb-1'>
                Art. 7 - Tailles des Matelas
              </h3>
              <p className='text-justify'>
                Les dimensions des matelas peuvent varier de +/- 5 cm en raison
                de la thermosensibilité des mousses viscoélastiques. Les tailles
                standards sont données à titre indicatif et ne constituent pas
                une obligation contractuelle. Les matelas sur mesure doivent
                inclure les spécifications exactes du cadre de lit.
              </p>
            </div>

            <div>
              <h3 className='font-bold text-[#477A0C] mb-1'>
                Art. 8 - Odeur des Matériaux
              </h3>
              <p className='text-justify'>
                Les mousses viscoélastiques naturelles (à base d'huile de ricin)
                et les matériaux de conditionnement peuvent émettre une légère
                odeur qui disparaît après déballage. Cela ne constitue pas un
                défaut.
              </p>
            </div>

            <div>
              <h3 className='font-bold text-[#477A0C] mb-1'>
                Art. 9 - Règlements et Remises
              </h3>
              <p className='text-justify'>
                Sauf accord express, aucun rabais ou escompte ne sera appliqué
                pour paiement comptant. La garantie couvre les mousses, mais pas
                les textiles et accessoires.
              </p>
            </div>

            <div>
              <h3 className='font-bold text-[#477A0C] mb-1'>
                Art. 10 - Paiement
              </h3>
              <p className='text-justify'>
                Les factures sont payables par chèque, virement, carte bancaire
                ou espèce à réception.
              </p>
            </div>

            <div>
              <h3 className='font-bold text-[#477A0C] mb-1'>
                Art. 11 - Pénalités de Retard
              </h3>
              <p className='text-justify'>
                En cas de non-paiement, une majoration de 10% avec un minimum de
                300 € sera appliquée, sans préjudice des intérêts de retard.
                Nous nous réservons le droit de résilier la vente sans
                sommation.
              </p>
            </div>

            <div>
              <h3 className='font-bold text-[#477A0C] mb-1'>
                Art. 12 - Exigibilité en Cas de Non-Paiement
              </h3>
              <p className='text-justify'>
                Le non-paiement d'une échéance rend immédiatement exigible le
                solde de toutes les échéances à venir.
              </p>
            </div>

            <div>
              <h3 className='font-bold text-[#477A0C] mb-1'>
                Art. 13 - Livraison Incomplète ou Non-Conforme
              </h3>
              <p className='text-justify'>
                En cas de livraison endommagée ou non conforme, mentionnez-le
                sur le bon de livraison et refusez le produit. Si l'erreur est
                constatée après le départ du transporteur, contactez-us sous 72h
                ouvrables.
              </p>
            </div>

            <div>
              <h3 className='font-bold text-[#477A0C] mb-1'>
                Art. 14 - Litiges
              </h3>
              <p className='text-justify'>
                Tout litige sera de la compétence exclusive du Tribunal de
                Commerce de Perpignan ou du tribunal compétent du prestataire.
              </p>
            </div>

            <div>
              <h3 className='font-bold text-[#477A0C] mb-1'>
                Art. 15 - Horaires de Livraison
              </h3>
              <p className='text-justify'>
                Les livraisons sont effectuées du lundi au vendredi (hors jours
                fériés). Une personne majeure doit être présente à l'adresse
                lors de la livraison. Toute modification d'adresse après
                commande doit être signalée immédiatement à
                myconfort66@gmail.com.
              </p>
            </div>
          </div>

          {/* Pied de page de la deuxième page */}
          <div className='mt-6 p-4 border-t-2 border-[#477A0C] bg-[#477A0C] text-[#F2EFE2] text-center'>
            <div className='flex items-center justify-center mb-2'>
              <span className='text-lg mr-2'>🌸</span>
              <span className='text-lg font-bold'>MYCONFORT</span>
            </div>
            <p className='text-sm'>
              88 Avenue des Ternes, 75017 Paris - Tél: 04 68 50 41 45
            </p>
            <p className='text-sm'>
              Email: myconfort@gmail.com - SIRET: 824 313 530 00027
            </p>
          </div>
        </div>
      </div>
    );
  }
);
