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

  return (
    <div 
      id="facture-apercu-modern" 
      className={`modern-invoice ${className}`}
      style={{
        fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        lineHeight: 1.6,
        color: '#2D3748',
        background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
        minHeight: '100vh',
        padding: '20px'
      }}
    >
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        
        {/* HEADER MODERNE */}
        <header style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '40px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                margin: '0 0 8px 0',
                letterSpacing: '-0.025em'
              }}>
                MyCoNfort
              </h1>
              <p style={{ 
                fontSize: '16px', 
                margin: '0', 
                opacity: 0.9,
                fontWeight: '400'
              }}>
                Facturation professionnelle avec signature électronique
              </p>
            </div>
            
            {invoice.signature && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                padding: '12px 24px',
                borderRadius: '25px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ color: '#10B981' }}>✓</span>
                SIGNÉE
              </div>
            )}
          </div>
          
          {/* Pattern décoratif */}
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            opacity: 0.3
          }}></div>
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
              background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                margin: '0 0 16px 0',
                color: '#2D3748'
              }}>
                MyCoNfort
              </h3>
              <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#4A5568' }}>
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '24px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  margin: '0 0 12px 0'
                }}>
                  FACTURE
                </h2>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>
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

          {/* INFORMATIONS CLIENT */}
          <div style={{
            marginBottom: '40px',
            background: 'linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%)',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #81e6d9'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              margin: '0 0 20px 0',
              color: '#234e52',
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
                <strong style={{ color: '#234e52' }}>Nom:</strong>
                <div style={{ marginTop: '2px', color: '#2D3748' }}>{invoice.clientName}</div>
              </div>
              <div>
                <strong style={{ color: '#234e52' }}>Adresse:</strong>
                <div style={{ marginTop: '2px', color: '#2D3748' }}>{invoice.clientAddress}</div>
              </div>
              <div>
                <strong style={{ color: '#234e52' }}>Code postal:</strong>
                <div style={{ marginTop: '2px', color: '#2D3748' }}>{invoice.clientPostalCode}</div>
              </div>
              <div>
                <strong style={{ color: '#234e52' }}>Ville:</strong>
                <div style={{ marginTop: '2px', color: '#2D3748' }}>{invoice.clientCity}</div>
              </div>
              <div>
                <strong style={{ color: '#234e52' }}>Code porte:</strong>
                <div style={{ marginTop: '2px', color: '#2D3748' }}>{invoice.clientDoorCode || 'Non spécifié'}</div>
              </div>
              <div>
                <strong style={{ color: '#234e52' }}>Email:</strong>
                <div style={{ marginTop: '2px', color: '#2D3748' }}>{invoice.clientEmail}</div>
              </div>
              <div>
                <strong style={{ color: '#234e52' }}>Téléphone:</strong>
                <div style={{ marginTop: '2px', color: '#2D3748' }}>{invoice.clientPhone}</div>
              </div>
            </div>
          </div>

          {/* PAIEMENT ET LIVRAISON */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '20px',
            marginBottom: '40px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #fef5e7 0%, #fed7aa 100%)',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #f59e0b'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                margin: '0 0 12px 0',
                color: '#92400e',
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
              background: 'linear-gradient(135deg, #f0f9ff 0%, #bae6fd 100%)',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #0ea5e9'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                margin: '0 0 12px 0',
                color: '#0c4a6e',
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
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              margin: '0 0 24px 0',
              color: '#2D3748',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🛏️ PRODUITS & TARIFICATION
            </h3>
            
            <div style={{
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.08)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Produit</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>Qté</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>Prix unitaire</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>Remise</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>Total TTC</th>
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
                        background: index % 2 === 0 ? '#f8fafc' : 'white'
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
            gap: '40px',
            marginBottom: '40px',
            alignItems: 'flex-start'
          }}>
            
            {/* Signature */}
            {invoice.signature && (
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)',
                padding: '24px',
                borderRadius: '8px',
                border: '2px solid #22c55e'
              }}>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  margin: '0 0 16px 0',
                  color: '#15803d',
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
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
                fontWeight: '700',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                    background: '#f59e0b',
                    color: 'white'
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
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #f59e0b',
              marginBottom: '40px'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                margin: '0 0 12px 0',
                color: '#92400e',
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

          {/* CONDITIONS GÉNÉRALES */}
          <div style={{
            background: '#f8fafc',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            marginBottom: '40px'
          }}>
            <h4 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
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
          background: 'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)',
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
            MyCoNfort
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
};

export default InvoicePreviewModern;
