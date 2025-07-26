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
        {/* Header moderne compact */}
        <div style={{
          background: '#477A0C',
          color: 'white',
          padding: '12px 15px',
          textAlign: 'center',
          marginBottom: '15px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(71, 122, 12, 0.3)'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 'bold',
            letterSpacing: '1px'
          }}>🌿 MYCONFORT</h1>
          <h2 style={{
            margin: '3px 0 0 0',
            fontSize: '14px',
            fontWeight: 'normal',
            opacity: 0.9
          }}>Facture {invoice.invoiceNumber}</h2>
        </div>

        {/* Informations compactes en deux colonnes */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          marginBottom: '15px'
        }}>
          <div style={{
            background: '#F2EFE2',
            padding: '10px 12px',
            borderRadius: '4px',
            borderLeft: '3px solid #477A0C',
            fontSize: '12px'
          }}>
            <h3 style={{
              color: '#477A0C',
              fontSize: '13px',
              margin: '0 0 6px 0',
              borderBottom: '1px solid #477A0C',
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
            background: '#F2EFE2',
            padding: '10px 12px',
            borderRadius: '4px',
            borderLeft: '3px solid #477A0C',
            fontSize: '12px'
          }}>
            <h3 style={{
              color: '#477A0C',
              fontSize: '13px',
              margin: '0 0 6px 0',
              borderBottom: '1px solid #477A0C',
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

        {/* Tableau produits compact */}
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          margin: '15px 0',
          borderRadius: '4px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(71, 122, 12, 0.2)',
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
                letterSpacing: '0.2px'
              }}>Désignation</th>
              <th style={{
                background: '#477A0C',
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.2px'
              }}>Qté</th>
              <th style={{
                background: '#477A0C',
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.2px'
              }}>P.U. TTC</th>
              <th style={{
                background: '#477A0C',
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.2px'
              }}>Remise</th>
              <th style={{
                background: '#477A0C',
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.2px'
              }}>Total TTC</th>
            </tr>
          </thead>
          <tbody>
            {invoice.products.map((product, index) => (
              <tr key={index} style={{
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: index % 2 === 0 ? 'white' : '#F2EFE2'
              }}>
                <td style={{ padding: '6px 4px', textAlign: 'left', fontSize: '14px' }}>
                  <strong>{product.name}</strong>
                </td>
                <td style={{ padding: '6px 4px', textAlign: 'center', fontSize: '14px' }}>
                  {product.quantity}
                </td>
                <td style={{ padding: '6px 4px', textAlign: 'center', fontSize: '14px' }}>
                  {formatCurrency(product.priceTTC)}
                </td>
                <td style={{ padding: '6px 4px', textAlign: 'center', fontSize: '14px' }}>
                  {product.discount > 0 ? (
                    <span style={{ 
                      color: '#F55D3E', 
                      fontWeight: 'bold',
                      backgroundColor: '#ffe6e6',
                      padding: '1px 4px',
                      borderRadius: '2px',
                      fontSize: '13px'
                    }}>
                      -{product.discount}{product.discountType === 'percent' ? '%' : '€'}
                    </span>
                  ) : (
                    <span style={{ color: '#666', fontSize: '13px' }}>-</span>
                  )}
                </td>
                <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                  <div>
                    {formatCurrency(calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType))}
                  </div>
                  {product.discount > 0 && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#F55D3E',
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

        {/* SECTION COMPACTE: Mode de règlement, Acompte et Remarques */}
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
              background: '#E8F5E8',
              borderRadius: '4px',
              borderLeft: '3px solid #477A0C'
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
                  color: '#477A0C',
                  fontWeight: 'bold',
                  background: 'white',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  border: '1px solid #477A0C'
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
              background: '#FFF4E6',
              borderRadius: '4px',
              borderLeft: '3px solid #FF8C00'
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
                  color: '#FF8C00',
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
            background: '#F0F8FF',
            borderRadius: '4px',
            borderLeft: '3px solid #4A90E2'
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
              background: '#E8F4FD',
              borderRadius: '3px',
              fontSize: '12px',
              lineHeight: 1.2
            }}>
              <div style={{ marginBottom: '3px' }}>
                <strong style={{ color: '#2C5530' }}>💰 Règlements à:</strong> SAV MYCONFORT • 8 rue du Grégal • 66510 Saint-Hippolyte
              </div>
              {invoice.nombreChequesAVenir && invoice.nombreChequesAVenir > 0 && (
                <div style={{ 
                  color: '#2C5530', 
                  fontWeight: 'bold',
                  fontSize: '12px',
                  marginTop: '2px',
                  padding: '2px 4px',
                  background: '#d4edda',
                  borderRadius: '2px',
                  display: 'inline-block'
                }}>
                  📅 {invoice.nombreChequesAVenir} chèque{invoice.nombreChequesAVenir > 1 ? 's' : ''} à venir
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TOTAUX COMPACTS */}
        <div style={{
          marginTop: '15px',
          padding: '10px 12px',
          background: '#F2EFE2',
          borderRadius: '4px',
          borderLeft: '3px solid #477A0C',
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
            <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#477A0C' }}>
              {formatCurrency(totalHT)}
            </div>
            
            <div style={{ fontWeight: 'bold', color: '#14281D' }}>TVA ({invoice.taxRate || 20}%):</div>
            <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#477A0C' }}>
              {formatCurrency(totalTVA)}
            </div>
            
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '14px', 
              color: '#477A0C',
              borderTop: '1px solid #477A0C',
              paddingTop: '4px',
              marginTop: '4px'
            }}>TOTAL TTC:</div>
            <div style={{ 
              textAlign: 'right', 
              fontWeight: 'bold', 
              fontSize: '14px', 
              color: '#477A0C',
              borderTop: '1px solid #477A0C',
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
                  color: '#F55D3E',
                  borderTop: '1px solid #F55D3E',
                  paddingTop: '4px',
                  marginTop: '4px'
                }}>Reste à payer:</div>
                <div style={{ 
                  textAlign: 'right', 
                  fontWeight: 'bold', 
                  fontSize: '12px', 
                  color: '#F55D3E',
                  borderTop: '1px solid #F55D3E',
                  paddingTop: '4px',
                  marginTop: '4px'
                }}>
                  {formatCurrency(montantRestant)}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Signature compacte */}
        {invoice.signature && (
          <div style={{
            background: '#d4edda',
            borderLeft: '3px solid #477A0C',
            borderRadius: '4px',
            padding: '8px 10px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '12px' }}>✅ Facture signée électroniquement</p>
              <p style={{ fontSize: '10px', margin: '2px 0 0 0', lineHeight: 1.2 }}>
                Signée le {new Date(invoice.signatureDate || invoice.invoiceDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div style={{
              background: 'white',
              border: '1px solid #477A0C',
              borderRadius: '3px',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '60px',
              maxWidth: '80px',
              height: '30px'
            }}>
              <img 
                src={invoice.signature} 
                alt="Signature" 
                style={{ 
                  maxHeight: '25px', 
                  maxWidth: '75px',
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
