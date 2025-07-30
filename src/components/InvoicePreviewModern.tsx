import { forwardRef } from 'react';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';
import { ConditionsGenerales } from './ConditionsGenerales';

interface InvoicePreviewModernProps {
  invoice: Invoice;
  className?: string;
}

export const InvoicePreviewModern = forwardRef<HTMLDivElement, InvoicePreviewModernProps>(({ 
  invoice, 
  className = "" 
}, ref) => {
  // Calculer le total TTC
  const totalTTC = invoice.products.reduce((sum, product) => {
    return sum + calculateProductTotal(
      product.quantity,
      product.priceTTC,
      product.discount,
      product.discountType === 'percent' ? 'percent' : 'fixed'
    );
  }, 0);

  // Calculer l'acompte et le montant restant
  const acompteAmount = invoice.montantAcompte || 0;
  const montantRestant = totalTTC - acompteAmount;

  // Calculer les totaux pour l'affichage
  const totalHT = totalTTC / (1 + (invoice.taxRate / 100));
  const totalTVA = totalTTC - totalHT;
  const totalDiscount = invoice.products.reduce((sum, product) => {
    const originalTotal = product.priceTTC * product.quantity;
    const discountedTotal = calculateProductTotal(
      product.quantity,
      product.priceTTC,
      product.discount,
      product.discountType === 'percent' ? 'percent' : 'fixed'
    );
    return sum + (originalTotal - discountedTotal);
  }, 0);

  return (      <div 
      ref={ref}
      id="facture-apercu-modern" 
      className={`modern-invoice ${className}`}
      style={{
        fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        lineHeight: 1.4,
        color: '#2D3748',
        background: '#ffffff',
        minHeight: '100vh',
        padding: '0',
        margin: '0'
      }}
    >
      {/* PAGE 1 - FACTURE COMPLÈTE */}
      <div style={{
        maxWidth: '100%',
        margin: '0',
        background: 'white',
        overflow: 'hidden',
        minHeight: '297mm', // A4 height
        pageBreakAfter: 'always',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* HEADER MYCONFORT - VERT ENTREPRISE */}
        <header style={{
          background: '#477A0C',
          color: 'white',
          padding: '20px 30px',
          borderBottom: '3px solid #3a6509',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                margin: '0 0 8px 0',
                letterSpacing: '1px'
              }}>
                MYCONFORT
              </h1>
              <p style={{ 
                fontSize: '14px', 
                margin: '0', 
                color: '#E2E8F0',
                fontWeight: 'normal'
              }}>
                Votre spécialiste literie de qualité
              </p>
            </div>
            
            {invoice.signature && (
              <div style={{
                background: '#F5E6D3',
                padding: '8px 16px',
                border: '2px solid #D4A574',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#2D3748'
              }}>
                <span style={{ color: '#477A0C' }}>✓</span>
                FACTURE SIGNÉE
              </div>
            )}
          </div>
        </header>

        <div style={{ padding: '40px' }}>
          
          {/* INFORMATIONS PRINCIPALES */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '40px',
            marginBottom: '40px'
          }}>
            
            {/* Informations entreprise */}
            <div style={{
              background: '#F2EFE2',
              padding: '24px',
              border: '2px solid #E2E8F0'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                margin: '0 0 16px 0',
                color: '#2D3748'
              }}>
                MYCONFORT
              </h3>
              <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#4A5568' }}>
                <div style={{ marginBottom: '4px' }}>📍 88 Avenue des Ternes</div>
                <div style={{ marginBottom: '4px' }}>75017 Paris, France</div>
                <div style={{ marginBottom: '4px' }}>🏢 SIRET: 824 313 530 00027</div>
                <div style={{ marginBottom: '4px' }}>📞 Tél: 04 68 50 41 45</div>
                <div style={{ marginBottom: '4px' }}>✉️ myconfort@gmail.com</div>
                <div>🌐 https://www.htconfort.com</div>
              </div>
            </div>
            
            {/* Informations facture */}
            <div style={{
              textAlign: 'right'
            }}>
              <div style={{
                background: '#477A0C',
                color: 'white',
                padding: '24px',
                marginBottom: '20px'
              }}>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  margin: '0 0 12px 0'
                }}>
                  FACTURE
                </h2>
                <div style={{ fontSize: '16px' }}>
                  N° {invoice.invoiceNumber}
                </div>
              </div>
              
              <div style={{ fontSize: '14px', color: '#4A5568', lineHeight: '1.8' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                {invoice.eventLocation && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Lieu:</strong> {invoice.eventLocation}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ARTICLE LÉGAL L224-59 - CODE DE LA CONSOMMATION */}
          <div style={{
            marginBottom: '24px',
            background: '#FEF2F2',
            padding: '12px',
            border: '1px solid #EF4444',
            fontSize: '11px'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '6px',
              color: '#B91C1C',
              fontSize: '12px'
            }}>
              ⚖️ INFORMATION LÉGALE - ARTICLE L224-59
            </div>
            
            <div style={{ 
              lineHeight: '1.4',
              color: '#2D3748',
              fontStyle: 'italic'
            }}>
              « Avant la conclusion de tout contrat entre un consommateur et un professionnel à l'occasion d'une foire, d'un salon [...] le professionnel informe le consommateur qu'il ne dispose pas d'un délai de rétractation. »
            </div>
          </div>

          {/* INFORMATIONS CLIENT */}
          <div style={{
            marginBottom: '24px',
            background: '#F2EFE2',
            padding: '20px',
            border: '2px solid #E2E8F0'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              margin: '0 0 20px 0',
              color: '#2D3748',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              👤 INFORMATIONS CLIENT
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px',
              fontSize: '14px'
            }}>
              <div>
                <strong style={{ color: '#2D3748' }}>Nom:</strong>
                <div style={{ marginTop: '2px', color: '#2D3748' }}>{invoice.clientName}</div>
              </div>
              <div>
                <strong style={{ color: '#2D3748' }}>Adresse:</strong>
                <div style={{ marginTop: '2px', color: '#2D3748' }}>{invoice.clientAddress}</div>
              </div>
              <div>
                <strong style={{ color: '#2D3748' }}>Code postal:</strong>
                <div style={{ marginTop: '2px', color: '#2D3748' }}>{invoice.clientPostalCode}</div>
              </div>
              <div>
                <strong style={{ color: '#2D3748' }}>Ville:</strong>
                <div style={{ marginTop: '2px', color: '#2D3748' }}>{invoice.clientCity}</div>
              </div>
              <div>
                <strong style={{ color: '#2D3748' }}>Code porte:</strong>
                <div style={{ marginTop: '2px', color: '#2D3748' }}>{invoice.clientDoorCode || 'Non spécifié'}</div>
              </div>
              <div>
                <strong style={{ color: '#2D3748' }}>Email:</strong>
                <div style={{ marginTop: '2px', color: '#2D3748' }}>{invoice.clientEmail}</div>
              </div>
              <div>
                <strong style={{ color: '#2D3748' }}>Téléphone:</strong>
                <div style={{ marginTop: '2px', color: '#2D3748' }}>{invoice.clientPhone}</div>
              </div>
            </div>
          </div>

          {/* PAIEMENT ET LIVRAISON */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: '#F2EFE2',
              padding: '20px',
              border: '2px solid #E2E8F0'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                margin: '0 0 12px 0',
                color: '#2D3748',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                💳 MODE DE RÈGLEMENT
              </h4>
              <div style={{ fontSize: '14px', color: '#2D3748' }}>
                {invoice.paymentMethod || 'Non spécifié'}
              </div>
            </div>
            
            <div style={{
              background: '#F2EFE2',
              padding: '20px',
              border: '2px solid #E2E8F0'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                margin: '0 0 12px 0',
                color: '#2D3748',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🚚 LIVRAISON
              </h4>
              <div style={{ fontSize: '14px', color: '#2D3748', marginBottom: '8px' }}>
                {invoice.deliveryMethod || 'Non spécifié'}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', fontStyle: 'italic' }}>
                Livraison réalisée au pied de l'immeuble ou au portail
              </div>
            </div>
          </div>

          {/* PRODUITS */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              margin: '0 0 16px 0',
              color: '#2D3748',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🛏️ PRODUITS & TARIFICATION
            </h3>
            
            <div style={{
              overflow: 'hidden',
              border: '2px solid #E2E8F0'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{
                    background: '#477A0C',
                    color: 'white'
                  }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold' }}>Produit</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>Qté</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold' }}>Prix unitaire</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold' }}>Remise</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold' }}>Total TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.products.map((product, index) => {
                    const productTotal = calculateProductTotal(
                      product.quantity,
                      product.priceTTC,
                      product.discount,
                      product.discountType === 'percent' ? 'percent' : 'fixed'
                    );
                    
                    return (
                      <tr key={index} style={{
                        borderBottom: '1px solid #e2e8f0',
                        background: index % 2 === 0 ? '#F8FAFC' : 'white'
                      }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: '500', marginBottom: '4px' }}>{product.name}</div>
                          {product.category && (
                            <div style={{ fontSize: '12px', color: '#6B7280' }}>{product.category}</div>
                          )}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: '500' }}>
                          {product.quantity}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          {formatCurrency(product.priceTTC)}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          {product.discount > 0 ? (
                            <span style={{ color: '#dc2626' }}>
                              -{product.discount}{product.discountType === 'percent' ? '%' : '€'}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>
                          {formatCurrency(productTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SIGNATURE ET TOTAUX */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr auto', 
            gap: '24px',
            marginBottom: '24px',
            alignItems: 'flex-start'
          }}>
            
            {/* Signature */}
            {invoice.signature && (
              <div style={{
                background: '#F0FDF4',
                padding: '24px',
                border: '2px solid #22C55E'
              }}>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  margin: '0 0 16px 0',
                  color: '#15803D',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ✍️ SIGNATURE CLIENT
                </h4>
                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '4px',
                  border: '1px solid #22c55e',
                  textAlign: 'center',
                  minHeight: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={invoice.signature} 
                    alt="Signature électronique" 
                    style={{ maxHeight: '60px', maxWidth: '200px' }} 
                  />
                </div>
                <div style={{
                  textAlign: 'center',
                  marginTop: '12px',
                  fontSize: '14px',
                  color: '#15803d',
                  fontWeight: '500'
                }}>
                  ✓ Signature électronique enregistrée
                </div>
              </div>
            )}

            {/* Totaux */}
            <div style={{
              minWidth: '320px',
              background: 'white',
              border: '2px solid #E2E8F0',
              overflow: 'hidden'
            }}>
              {totalDiscount > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 20px',
                  fontSize: '14px',
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  <span>Sous-total:</span>
                  <span>{formatCurrency(totalTTC + totalDiscount)}</span>
                </div>
              )}
              
              {totalDiscount > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 20px',
                  fontSize: '14px',
                  borderBottom: '1px solid #f1f5f9',
                  color: '#dc2626'
                }}>
                  <span>Remise totale:</span>
                  <span>-{formatCurrency(totalDiscount)}</span>
                </div>
              )}
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 20px',
                fontSize: '14px',
                borderBottom: '1px solid #f1f5f9'
              }}>
                <span>Total HT:</span>
                <span>{formatCurrency(totalHT)}</span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 20px',
                fontSize: '14px',
                borderBottom: '1px solid #f1f5f9'
              }}>
                <span>TVA ({invoice.taxRate}%):</span>
                <span>{formatCurrency(totalTVA)}</span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '16px 20px',
                fontSize: '18px',
                fontWeight: 'bold',
                background: '#477A0C',
                color: 'white'
              }}>
                <span>TOTAL TTC:</span>
                <span>{formatCurrency(totalTTC)}</span>
              </div>
              
              {acompteAmount > 0 && (
                <>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 20px',
                    fontSize: '14px',
                    borderBottom: '1px solid #f1f5f9',
                    background: '#fef3c7'
                  }}>
                    <span>Acompte versé:</span>
                    <span>-{formatCurrency(acompteAmount)}</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    fontSize: '16px',
                    fontWeight: '600',
                    background: '#F55D3E',
                    color: '#2D3748'
                  }}>
                    <span>MONTANT RESTANT:</span>
                    <span>{formatCurrency(montantRestant)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* NOTES */}
          {invoice.invoiceNotes && (
            <div style={{
              background: '#FFFBEB',
              padding: '16px',
              border: '2px solid #F59E0B',
              marginBottom: '20px'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                margin: '0 0 12px 0',
                color: '#92400E',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📝 NOTES
              </h4>
              <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#2D3748' }}>
                {invoice.invoiceNotes}
              </div>
            </div>
          )}

          {/* SECTION RÈGLEMENT ET CHÈQUES À VENIR - CHARTE GRAPHIQUE MYCONFORT */}
          <div style={{
            background: '#F2EFE2',
            padding: '16px',
            border: '2px solid #477A0C',
            marginBottom: '20px'
          }}>
            <h4 style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              margin: '0 0 12px 0',
              color: '#477A0C',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              💰 RÈGLEMENTS ET MODE DE PAIEMENT
            </h4>
            
            <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#14281D' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Adresse pour règlements :</strong> SAV MYCONFORT • 8 rue du Grégal • 66510 Saint-Hippolyte
              </div>
              
              {invoice.paymentMethod && (
                <div style={{ marginBottom: '12px' }}>
                  <strong>Mode de règlement :</strong> {invoice.paymentMethod}
                </div>
              )}
              
              {/* DÉTAIL DES CHÈQUES À VENIR - CHARTE GRAPHIQUE HARMONISÉE */}
              {invoice.nombreChequesAVenir && invoice.nombreChequesAVenir > 0 && (
                <div style={{ 
                  marginTop: '12px',
                  padding: '12px',
                  background: 'white',
                  borderRadius: '6px',
                  border: '2px solid #477A0C'
                }}>
                  <div style={{ 
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#477A0C',
                    marginBottom: '8px',
                    textAlign: 'center'
                  }}>
                    📅 {invoice.nombreChequesAVenir} chèque{invoice.nombreChequesAVenir > 1 ? 's' : ''} à venir
                  </div>
                  
                  {/* CALCULS DÉTAILLÉS AVEC CHARTE GRAPHIQUE */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '12px',
                    marginTop: '12px',
                    fontSize: '13px'
                  }}>
                    {/* ACOMPTE VERSÉ */}
                    <div style={{ 
                      padding: '8px',
                      background: '#F2EFE2',
                      borderRadius: '4px',
                      border: '1px solid #477A0C'
                    }}>
                      <div style={{ fontWeight: 'bold', color: '#477A0C' }}>💰 Acompte versé</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#14281D' }}>
                        {formatCurrency(acompteAmount)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#477A0C' }}>
                        ({((acompteAmount / totalTTC) * 100).toFixed(1)}% du total)
                      </div>
                    </div>
                    
                    {/* RESTE À PERCEVOIR */}
                    <div style={{ 
                      padding: '8px',
                      background: '#F2EFE2',
                      borderRadius: '4px',
                      border: '1px solid #477A0C'
                    }}>
                      <div style={{ fontWeight: 'bold', color: '#477A0C' }}>📋 Reste à percevoir</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#14281D' }}>
                        {formatCurrency(montantRestant)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#477A0C' }}>
                        Réparti sur {invoice.nombreChequesAVenir} chèque{invoice.nombreChequesAVenir > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  
                  {/* MONTANT PAR CHÈQUE - MISE EN ÉVIDENCE AVEC VERT MYCONFORT */}
                  <div style={{ 
                    marginTop: '12px',
                    padding: '10px',
                    background: '#477A0C',
                    borderRadius: '4px',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                      💳 Montant par chèque
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '4px' }}>
                      {formatCurrency(montantRestant / invoice.nombreChequesAVenir)}
                    </div>
                    <div style={{ fontSize: '11px', marginTop: '2px', opacity: 0.9 }}>
                      {formatCurrency(montantRestant)} ÷ {invoice.nombreChequesAVenir} = {formatCurrency(montantRestant / invoice.nombreChequesAVenir)} par chèque
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CONDITIONS GÉNÉRALES */}
          <div style={{
            background: '#F8FAFC',
            padding: '16px',
            border: '2px solid #E2E8F0',
            marginBottom: '20px'
          }}>
            <h4 style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              margin: '0 0 16px 0',
              color: '#2D3748'
            }}>
              📋 CONDITIONS GÉNÉRALES
            </h4>
            <ConditionsGenerales />
          </div>
        </div>

        {/* FOOTER MODERNE */}
        <footer style={{
          background: '#477A0C',
          color: 'white',
          padding: '32px 40px',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            margin: '0 0 12px 0',
            letterSpacing: '-0.025em'
          }}>
            MYCONFORT
          </h3>
          <p style={{ fontSize: '16px', margin: '0 0 16px 0', opacity: 0.9 }}>
            Merci pour votre confiance !
          </p>
          <div style={{ fontSize: '14px', opacity: 0.8, lineHeight: '1.6' }}>
            <div style={{ marginBottom: '4px' }}>Votre spécialiste en matelas et literie de qualité</div>
            <div style={{ marginBottom: '4px' }}>88 Avenue des Ternes, 75017 Paris - Tél: 04 68 50 41 45</div>
            <div>Email: myconfort@gmail.com - SIRET: 824 313 530 00027</div>
          </div>
        </footer>
      </div>
    </div>
  );
});

InvoicePreviewModern.displayName = 'InvoicePreviewModern';

export default InvoicePreviewModern;
