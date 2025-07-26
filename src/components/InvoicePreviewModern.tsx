import React from 'react';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';
import { ConditionsGenerales } from './ConditionsGenerales';

interface InvoicePreviewModernProps {
  invoice: Invoice;
  className?: string;
}

export const InvoicePreviewModern: React.FC<InvoicePreviewModernProps> = ({ 
  invoice, 
  className = "" 
}) => {
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

  return (
    <div 
      id="facture-apercu-modern" 
      className={`modern-invoice ${className}`}
      style={{
        fontFamily: "'Arial', sans-serif",
        lineHeight: 1.3,
        color: '#14281D',
        fontSize: '12px',
        background: 'white',
        minHeight: '100vh'
      }}
    >
      {/* PAGE 1: FACTURE CONDENSÉE */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        padding: '15mm',
        pageBreakAfter: 'always'
      }}>
        {/* Header moderne compact - Optimisé noir et blanc */}
        <div style={{
          background: '#477A0C',
          color: 'white',
          padding: '12px 15px',
          textAlign: 'center',
          marginBottom: '15px',
          border: '2px solid #000000'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 'bold',
            letterSpacing: '1px'
          }}>🌿 MYCONFORT</h1>
          <h2 style={{
            margin: '3px 0 0 0',
            fontSize: '14px',
            fontWeight: 'normal'
          }}>Facture {invoice.invoiceNumber}</h2>
        </div>

        {/* Informations compactes en deux colonnes - Encadrées noir et blanc */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          marginBottom: '15px'
        }}>
          <div style={{
            background: 'white',
            padding: '10px 12px',
            border: '2px solid #000000',
            fontSize: '14px'
          }}>
            <h3 style={{
              color: '#000000',
              fontSize: '14px',
              margin: '0 0 6px 0',
              borderBottom: '2px solid #000000',
              paddingBottom: '2px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.3px'
            }}>📋 Détails Facture</h3>
            <p style={{ margin: '2px 0' }}><strong>N°:</strong> {invoice.invoiceNumber}</p>
            <p style={{ margin: '2px 0' }}><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</p>
            {invoice.eventLocation && <p style={{ margin: '2px 0' }}><strong>📍 Lieu:</strong> {invoice.eventLocation}</p>}
            {invoice.advisorName && <p style={{ margin: '2px 0' }}><strong>👤 Conseiller:</strong> {invoice.advisorName}</p>}
            {invoice.clientHousingType && <p style={{ margin: '2px 0' }}><strong>🏠 Logement:</strong> {invoice.clientHousingType}</p>}
          </div>
          
          <div style={{
            background: 'white',
            padding: '10px 12px',
            border: '2px solid #000000',
            fontSize: '14px'
          }}>
            <h3 style={{
              color: '#000000',
              fontSize: '14px',
              margin: '0 0 6px 0',
              borderBottom: '2px solid #000000',
              paddingBottom: '2px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.3px'
            }}>👤 Informations Client</h3>
            <p style={{ margin: '2px 0' }}><strong>{invoice.clientName}</strong></p>
            <p style={{ margin: '2px 0' }}>📍 {invoice.clientAddress}</p>
            <p style={{ margin: '2px 0' }}>{invoice.clientPostalCode} {invoice.clientCity}</p>
            {invoice.clientDoorCode && <p style={{ margin: '2px 0' }}>🚪 Code: {invoice.clientDoorCode}</p>}
            <p style={{ margin: '2px 0' }}>📞 {invoice.clientPhone}</p>
            <p style={{ margin: '2px 0' }}>✉️ {invoice.clientEmail}</p>
          </div>
        </div>

        {/* Tableau produits compact - Encadré noir et blanc */}
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          margin: '15px 0',
          border: '2px solid #000000',
          flexShrink: 0
        }}>
          <thead>
            <tr>
              <th style={{
                background: '#477A0C',
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.2px',
                border: '1px solid #000000'
              }}>Désignation</th>
              <th style={{
                background: '#477A0C',
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.2px',
                border: '1px solid #000000'
              }}>Qté</th>
              <th style={{
                background: '#477A0C',
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.2px',
                border: '1px solid #000000'
              }}>P.U. TTC</th>
              <th style={{
                background: '#477A0C',
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.2px',
                border: '1px solid #000000'
              }}>Remise</th>
              <th style={{
                background: '#477A0C',
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.2px',
                border: '1px solid #000000'
              }}>Total TTC</th>
            </tr>
          </thead>
          <tbody>
            {invoice.products.map((product, index) => (
              <tr key={index} style={{
                backgroundColor: index % 2 === 0 ? 'white' : '#f8f8f8'
              }}>
                <td style={{ 
                  padding: '6px 4px', 
                  textAlign: 'left', 
                  fontSize: '14px',
                  border: '1px solid #000000'
                }}>
                  <strong>{product.name}</strong>
                </td>
                <td style={{ 
                  padding: '6px 4px', 
                  textAlign: 'center', 
                  fontSize: '14px',
                  border: '1px solid #000000'
                }}>
                  {product.quantity}
                </td>
                <td style={{ 
                  padding: '6px 4px', 
                  textAlign: 'center', 
                  fontSize: '14px',
                  border: '1px solid #000000'
                }}>
                  {formatCurrency(product.priceTTC)}
                </td>
                <td style={{ 
                  padding: '6px 4px', 
                  textAlign: 'center', 
                  fontSize: '14px',
                  border: '1px solid #000000'
                }}>
                  {product.discount > 0 ? (
                    <span style={{ 
                      color: '#000000', 
                      fontWeight: 'bold',
                      backgroundColor: '#e0e0e0',
                      padding: '1px 4px',
                      fontSize: '13px'
                    }}>
                      -{product.discount}{product.discountType === 'percent' ? '%' : '€'}
                    </span>
                  ) : (
                    <span style={{ color: '#666', fontSize: '13px' }}>-</span>
                  )}
                </td>
                <td style={{ 
                  padding: '6px 4px', 
                  textAlign: 'center', 
                  fontWeight: 'bold', 
                  fontSize: '14px',
                  border: '1px solid #000000'
                }}>
                  <div>
                    {formatCurrency(calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType))}
                  </div>
                  {product.discount > 0 && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#000000',
                      fontWeight: 'normal',
                      marginTop: '1px'
                    }}>
                      (-{product.discountType === 'percent' ? product.discount + '%' : formatCurrency(product.discount)})
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* SECTION COMPACTE: Mode de règlement, Acompte et Remarques - Encadrées */}
        <div style={{
          marginTop: '15px',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '10px',
          marginBottom: '15px'
        }}>
          
          {/* Mode de règlement */}
          {invoice.paymentMethod && (
            <div style={{
              padding: '8px 12px',
              background: 'white',
              border: '2px solid #000000'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#14281D' }}>
                  💳 Mode de règlement:
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#000000',
                  fontWeight: 'bold',
                  background: '#f0f0f0',
                  padding: '2px 6px',
                  border: '1px solid #000000'
                }}>
                  {invoice.paymentMethod}
                </div>
              </div>
            </div>
          )}

          {/* Acompte */}
          {acompteAmount > 0 && (
            <div style={{
              padding: '8px 12px',
              background: 'white',
              border: '2px solid #000000'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#14281D' }}>
                  💰 Acompte versé:
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#000000',
                  fontWeight: 'bold'
                }}>
                  {formatCurrency(acompteAmount)} 
                  <span style={{ fontSize: '10px', marginLeft: '3px' }}>
                    ({((acompteAmount / totalTTC) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Remarques compactes */}
          <div style={{
            padding: '8px 12px',
            background: 'white',
            border: '2px solid #000000'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#14281D', marginBottom: '6px' }}>
              📝 Remarques et règlements:
            </div>
            
            {/* Notes facture et livraison sur une ligne */}
            {(invoice.invoiceNotes || invoice.deliveryNotes) && (
              <div style={{ 
                fontSize: '12px', 
                color: '#14281D',
                lineHeight: 1.3,
                marginBottom: '6px'
              }}>
                {invoice.invoiceNotes && (
                  <span><strong>Notes:</strong> {invoice.invoiceNotes.length > 50 ? invoice.invoiceNotes.substring(0, 50) + '...' : invoice.invoiceNotes}</span>
                )}
                {invoice.invoiceNotes && invoice.deliveryNotes && ' • '}
                {invoice.deliveryNotes && (
                  <span><strong>Livraison:</strong> {invoice.deliveryNotes.length > 30 ? invoice.deliveryNotes.substring(0, 30) + '...' : invoice.deliveryNotes}</span>
                )}
              </div>
            )}
            
            {/* Adresse règlement avec chèques à venir */}
            <div style={{
              padding: '6px 8px',
              background: '#f8f8f8',
              border: '1px solid #000000',
              fontSize: '12px',
              lineHeight: 1.2
            }}>
              <div style={{ marginBottom: '3px' }}>
                <strong style={{ color: '#000000' }}>💰 Règlements à:</strong> SAV MYCONFORT • 8 rue du Grégal • 66510 Saint-Hippolyte
              </div>
              {invoice.nombreChequesAVenir && invoice.nombreChequesAVenir > 0 && (
                <div style={{ 
                  color: '#000000', 
                  fontWeight: 'bold',
                  fontSize: '12px',
                  marginTop: '2px',
                  padding: '2px 4px',
                  background: '#e0e0e0',
                  border: '1px solid #000000',
                  display: 'inline-block'
                }}>
                  📅 {invoice.nombreChequesAVenir} chèque{invoice.nombreChequesAVenir > 1 ? 's' : ''} à venir
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TOTAUX COMPACTS - Encadrés */}
        <div style={{
          marginTop: '15px',
          padding: '10px 12px',
          background: 'white',
          border: '2px solid #000000',
          marginBottom: '15px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '6px',
            alignItems: 'center',
            fontSize: '11px'
          }}>
            <div style={{ fontWeight: 'bold', color: '#14281D' }}>Sous-total HT:</div>
            <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#000000' }}>
              {formatCurrency(totalHT)}
            </div>
            
            <div style={{ fontWeight: 'bold', color: '#14281D' }}>TVA ({invoice.taxRate || 20}%):</div>
            <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#000000' }}>
              {formatCurrency(totalTVA)}
            </div>
            
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '14px', 
              color: '#000000',
              borderTop: '2px solid #000000',
              paddingTop: '4px',
              marginTop: '4px'
            }}>TOTAL TTC:</div>
            <div style={{ 
              textAlign: 'right', 
              fontWeight: 'bold', 
              fontSize: '14px', 
              color: '#000000',
              borderTop: '2px solid #000000',
              paddingTop: '4px',
              marginTop: '4px'
            }}>
              {formatCurrency(totalTTC)}
            </div>
            
            {acompteAmount > 0 && (
              <>
                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: '12px', 
                  color: '#000000',
                  borderTop: '1px solid #000000',
                  paddingTop: '4px',
                  marginTop: '4px'
                }}>Reste à payer:</div>
                <div style={{ 
                  textAlign: 'right', 
                  fontWeight: 'bold', 
                  fontSize: '12px', 
                  color: '#000000',
                  borderTop: '1px solid #000000',
                  paddingTop: '4px',
                  marginTop: '4px'
                }}>
                  {formatCurrency(montantRestant)}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Signature compacte - Police 16px avec encadrement */}
        {invoice.signature && (
          <div style={{
            background: 'white',
            border: '2px solid #000000',
            padding: '8px 10px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>✅ Facture signée électroniquement</p>
              <p style={{ fontSize: '14px', margin: '2px 0 0 0', lineHeight: 1.2 }}>
                Signée le {new Date(invoice.signatureDate || invoice.invoiceDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div style={{
              background: 'white',
              border: '2px solid #000000',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '160px',
              maxWidth: '200px',
              height: '80px'
            }}>
              <img 
                src={invoice.signature} 
                alt="Signature" 
                style={{ 
                  maxHeight: '70px', 
                  maxWidth: '190px',
                  objectFit: 'contain'
                }} 
              />
            </div>
          </div>
        )}

        {/* Article de loi compact */}
        <div style={{
          background: '#F55D3E',
          color: 'white',
          padding: '8px 10px',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '9px',
          borderRadius: '4px',
          marginBottom: '10px',
          lineHeight: 1.2
        }}>
          ⚠️ IMPORTANT : PAS DE DROIT DE RÉTRACTATION POUR ACHAT EN FOIRE/SALON.
        </div>

        {/* Footer compact */}
        <div style={{
          textAlign: 'center',
          color: '#080F0F',
          fontSize: '9px',
          borderTop: '1px solid #477A0C',
          paddingTop: '8px',
          marginTop: 'auto',
          lineHeight: 1.2
        }}>
          <p style={{ margin: '1px 0', fontSize: '11px' }}><strong style={{ color: '#477A0C' }}>🌿 MYCONFORT</strong></p>
          <p style={{ margin: '1px 0' }}>88 Avenue des Ternes, 75017 Paris • 📞 04 68 50 41 45 • ✉️ myconfort66@gmail.com</p>
          <p style={{ margin: '1px 0' }}>SIRET: 824 313 530 00027 • Spécialiste confort et bien-être</p>
        </div>
      </div>

      {/* PAGE 2: CONDITIONS GÉNÉRALES SÉPARÉES */}
      <div style={{
        padding: '15mm',
        minHeight: '100vh',
        background: 'white',
        pageBreakBefore: 'always'
      }}>
        <div style={{
          background: '#477A0C',
          color: 'white',
          padding: '20px',
          textAlign: 'center',
          borderRadius: '6px',
          marginBottom: '25px'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>📜 Conditions Générales de Vente</h1>
        </div>
        
        <div style={{
          background: '#F55D3E',
          color: 'white',
          padding: '12px',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '12px',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          ⚠️ IMPORTANT : LE CONSOMMATEUR NE BÉNÉFICIE PAS D'UN DROIT DE RÉTRACTATION POUR UN ACHAT EFFECTUÉ DANS UNE FOIRE OU DANS UN SALON.
        </div>
        
        <div style={{
          fontSize: '12px',
          lineHeight: 1.4,
          columns: 2,
          columnGap: '20px',
          columnRule: '1px solid #477A0C'
        }}>
          <ConditionsGenerales />
        </div>
        
        <div style={{
          textAlign: 'center',
          marginTop: '25px',
          fontSize: '11px',
          fontStyle: 'italic',
          color: '#080F0F',
          borderTop: '2px solid #477A0C',
          paddingTop: '15px'
        }}>
          <p style={{ margin: '2px 0' }}>📧 Contact: myconfort66@gmail.com</p>
          <p style={{ margin: '2px 0' }}>Les présentes Conditions Générales de Vente ont été mises à jour le 23 août 2024</p>
          <p style={{ margin: '2px 0' }}>Version informatique générée automatiquement – 2024 • Format A4 – Usage Commercial Professionnel</p>
        </div>
      </div>
    </div>
  );
};
