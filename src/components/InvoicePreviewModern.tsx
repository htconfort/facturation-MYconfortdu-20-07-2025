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
        fontSize: '11px',
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
        {/* Header moderne */}
        <div style={{
          background: '#477A0C',
          color: 'white',
          padding: '15px 20px',
          textAlign: 'center',
          marginBottom: '20px',
          borderRadius: '6px',
          boxShadow: '0 4px 8px rgba(71, 122, 12, 0.3)'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 'bold',
            letterSpacing: '1px'
          }}>🌿 MYCONFORT</h1>
          <h2 style={{
            margin: '5px 0 0 0',
            fontSize: '16px',
            fontWeight: 'normal',
            opacity: 0.9
          }}>Facture {invoice.invoiceNumber}</h2>
        </div>

        {/* Informations en deux colonnes */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: '#F2EFE2',
            padding: '15px',
            borderRadius: '6px',
            borderLeft: '4px solid #477A0C',
            fontSize: '11px'
          }}>
            <h3 style={{
              color: '#477A0C',
              fontSize: '13px',
              margin: '0 0 10px 0',
              borderBottom: '1px solid #477A0C',
              paddingBottom: '3px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>📋 Détails Facture</h3>
            <p style={{ margin: '3px 0' }}><strong>N°:</strong> {invoice.invoiceNumber}</p>
            <p style={{ margin: '3px 0' }}><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</p>
            {invoice.eventLocation && <p style={{ margin: '3px 0' }}><strong>📍 Lieu:</strong> {invoice.eventLocation}</p>}
            {invoice.advisorName && <p style={{ margin: '3px 0' }}><strong>👤 Conseiller:</strong> {invoice.advisorName}</p>}
            {invoice.clientHousingType && <p style={{ margin: '3px 0' }}><strong>🏠 Logement:</strong> {invoice.clientHousingType}</p>}
          </div>
          
          <div style={{
            background: '#F2EFE2',
            padding: '15px',
            borderRadius: '6px',
            borderLeft: '4px solid #477A0C',
            fontSize: '11px'
          }}>
            <h3 style={{
              color: '#477A0C',
              fontSize: '13px',
              margin: '0 0 10px 0',
              borderBottom: '1px solid #477A0C',
              paddingBottom: '3px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>👤 Informations Client</h3>
            <p style={{ margin: '3px 0' }}><strong>{invoice.clientName}</strong></p>
            <p style={{ margin: '3px 0' }}>📍 {invoice.clientAddress}</p>
            <p style={{ margin: '3px 0' }}>{invoice.clientPostalCode} {invoice.clientCity}</p>
            {invoice.clientDoorCode && <p style={{ margin: '3px 0' }}>🚪 Code: {invoice.clientDoorCode}</p>}
            <p style={{ margin: '3px 0' }}>📞 {invoice.clientPhone}</p>
            <p style={{ margin: '3px 0' }}>✉️ {invoice.clientEmail}</p>
          </div>
        </div>

        {/* Tableau produits */}
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          margin: '20px 0',
          borderRadius: '6px',
          overflow: 'hidden',
          boxShadow: '0 2px 6px rgba(71, 122, 12, 0.2)',
          flexShrink: 0
        }}>
          <thead>
            <tr>
              <th style={{
                background: '#477A0C',
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '8px 6px',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.3px'
              }}>Désignation</th>
              <th style={{
                background: '#477A0C',
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '8px 6px',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.3px'
              }}>Qté</th>
              <th style={{
                background: '#477A0C',
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '8px 6px',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.3px'
              }}>P.U. TTC</th>
              <th style={{
                background: '#477A0C',
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '8px 6px',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.3px'
              }}>Remise</th>
              <th style={{
                background: '#477A0C',
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '8px 6px',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.3px'
              }}>Total TTC</th>
            </tr>
          </thead>
          <tbody>
            {invoice.products.map((product, index) => (
              <tr key={index} style={{
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: index % 2 === 0 ? 'white' : '#F2EFE2'
              }}>
                <td style={{ padding: '8px 6px', textAlign: 'left' }}>
                  <strong>{product.name}</strong>
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                  {product.quantity}
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                  {formatCurrency(product.priceTTC)}
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                  {product.discount > 0 ? (
                    <span style={{ 
                      color: '#F55D3E', 
                      fontWeight: 'bold',
                      backgroundColor: '#ffe6e6',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '10px'
                    }}>
                      -{product.discount}{product.discountType === 'percent' ? '%' : '€'}
                    </span>
                  ) : (
                    <span style={{ color: '#666', fontSize: '10px' }}>-</span>
                  )}
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 'bold' }}>
                  <div>
                    {formatCurrency(calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType))}
                  </div>
                  {product.discount > 0 && (
                    <div style={{ 
                      fontSize: '9px', 
                      color: '#F55D3E',
                      fontWeight: 'normal',
                      marginTop: '2px'
                    }}>
                      (-{product.discountType === 'percent' ? product.discount + '%' : formatCurrency(product.discount)})
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Section totaux */}
        <div style={{
          marginTop: 'auto',
          padding: '15px',
          background: '#F2EFE2',
          borderRadius: '6px',
          borderLeft: '4px solid #477A0C',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '10px',
            alignItems: 'center'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#14281D' }}>Sous-total HT:</div>
            <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '12px', color: '#477A0C' }}>
              {formatCurrency(totalHT)}
            </div>
            
            <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#14281D' }}>TVA ({invoice.taxRate || 20}%):</div>
            <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '12px', color: '#477A0C' }}>
              {formatCurrency(totalTVA)}
            </div>
            
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '18px', 
              color: '#477A0C',
              borderTop: '2px solid #477A0C',
              paddingTop: '8px',
              marginTop: '8px'
            }}>TOTAL TTC:</div>
            <div style={{ 
              textAlign: 'right', 
              fontWeight: 'bold', 
              fontSize: '18px', 
              color: '#477A0C',
              borderTop: '2px solid #477A0C',
              paddingTop: '8px',
              marginTop: '8px'
            }}>
              {formatCurrency(totalTTC)}
            </div>
            
            {acompteAmount > 0 && (
              <>
                <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#14281D' }}>Acompte versé:</div>
                <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '12px', color: '#477A0C' }}>
                  -{formatCurrency(acompteAmount)}
                </div>
                
                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: '16px', 
                  color: '#F55D3E',
                  borderTop: '1px solid #F55D3E',
                  paddingTop: '5px',
                  marginTop: '5px'
                }}>Reste à payer:</div>
                <div style={{ 
                  textAlign: 'right', 
                  fontWeight: 'bold', 
                  fontSize: '16px', 
                  color: '#F55D3E',
                  borderTop: '1px solid #F55D3E',
                  paddingTop: '5px',
                  marginTop: '5px'
                }}>
                  {formatCurrency(montantRestant)}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Signature si présente */}
        {invoice.signature && (
          <div style={{
            background: '#d4edda',
            borderLeft: '4px solid #477A0C',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '15px'
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '11px' }}>✅ Facture signée électroniquement</p>
              <p style={{ fontSize: '9px', margin: '3px 0 0 0', lineHeight: 1.2 }}>
                Cette facture a été signée numériquement par le client le {new Date(invoice.signatureDate || invoice.invoiceDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div style={{
              background: 'white',
              border: '2px solid #477A0C',
              borderRadius: '4px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '80px',
              maxWidth: '120px',
              height: '40px'
            }}>
              <img 
                src={invoice.signature} 
                alt="Signature électronique" 
                style={{ 
                  maxHeight: '30px', 
                  maxWidth: '110px',
                  objectFit: 'contain'
                }} 
              />
            </div>
          </div>
        )}

        {/* Article de loi important */}
        <div style={{
          background: '#F55D3E',
          color: 'white',
          padding: '10px 15px',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '10px',
          borderRadius: '6px',
          marginBottom: '20px',
          lineHeight: 1.3
        }}>
          ⚠️ IMPORTANT : LE CONSOMMATEUR NE BÉNÉFICIE PAS D'UN DROIT DE RÉTRACTATION POUR UN ACHAT EFFECTUÉ DANS UNE FOIRE OU DANS UN SALON.
        </div>

        {/* Footer entreprise */}
        <div style={{
          textAlign: 'center',
          color: '#080F0F',
          fontSize: '10px',
          borderTop: '2px solid #477A0C',
          paddingTop: '15px',
          marginTop: 'auto'
        }}>
          <p style={{ margin: '2px 0', fontSize: '12px' }}><strong style={{ color: '#477A0C' }}>🌿 MYCONFORT</strong></p>
          <p style={{ margin: '2px 0' }}>88 Avenue des Ternes, 75017 Paris • France</p>
          <p style={{ margin: '2px 0' }}>📞 04 68 50 41 45 • ✉️ myconfort66@gmail.com</p>
          <p style={{ margin: '2px 0' }}>SIRET: 824 313 530 00027</p>
          <p style={{ margin: '10px 0 0 0', fontStyle: 'italic' }}>Votre spécialiste en confort et bien-être</p>
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
          fontSize: '10px',
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
          fontSize: '9px',
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
