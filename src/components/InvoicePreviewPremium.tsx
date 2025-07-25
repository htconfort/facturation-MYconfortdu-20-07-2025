import React from 'react';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';
import { ConditionsGenerales } from './ConditionsGenerales';

interface InvoicePreviewPremiumProps {
  invoice: Invoice;
  className?: string;
}

export const InvoicePreviewPremium: React.FC<InvoicePreviewPremiumProps> = ({ 
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
      id="facture-apercu-premium" 
      className={`premium-invoice ${className}`}
      style={{
        fontFamily: "'SF Pro Display', 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
        lineHeight: 1.7,
        color: '#1a202c',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        padding: '40px 20px'
      }}
    >
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        boxShadow: '0 40px 80px rgba(0, 0, 0, 0.15), 0 20px 40px rgba(0, 0, 0, 0.10)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        
        {/* HEADER ULTRA PREMIUM */}
        <header style={{
          background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #4a5568 100%)',
          color: 'white',
          padding: '60px 50px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          {/* Patterns décoratifs */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: `
              radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)
            `,
            animation: 'float 20s ease-in-out infinite'
          }}></div>
          
          <div style={{ 
            position: 'relative', 
            zIndex: 2,
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>  
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '20px',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                }}>
                  <span style={{ fontSize: '24px', fontWeight: '700' }}>MC</span>
                </div>
                <div>
                  <h1 style={{ 
                    fontSize: '36px', 
                    fontWeight: '800', 
                    margin: '0',
                    letterSpacing: '-0.04em',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    MyCoNfort
                  </h1>
                </div>
              </div>
              <p style={{ 
                fontSize: '18px', 
                margin: '0', 
                opacity: 0.8,
                fontWeight: '400',
                letterSpacing: '0.01em'
              }}>
                Excellence & Innovation en Literie
              </p>
            </div>
            
            {invoice.signature && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                backdropFilter: 'blur(10px)',
                padding: '16px 32px',
                borderRadius: '50px',
                border: '2px solid rgba(16, 185, 129, 0.3)',
                fontSize: '16px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#10b981'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: '#10b981',
                  borderRadius: '50%',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
                }}></div>
                DOCUMENT SIGNÉ
              </div>
            )}
          </div>
        </header>

        <div style={{ padding: '50px' }}>
          
          {/* INFORMATIONS PRINCIPALES - Design Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr', 
            gap: '40px',
            marginBottom: '50px'
          }}>
            
            {/* Informations entreprise */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              padding: '40px',
              borderRadius: '20px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                borderRadius: '50%',
                filter: 'blur(40px)'
              }}></div>
              
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                margin: '0 0 24px 0',
                color: '#1a202c',
                position: 'relative',
                zIndex: 2
              }}>
                MyCoNfort
              </h3>
              <div style={{ fontSize: '16px', lineHeight: '2', color: '#4a5568', position: 'relative', zIndex: 2 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '8px',
                  padding: '8px 0'
                }}>
                  <span style={{ 
                    fontSize: '18px', 
                    marginRight: '12px',
                    width: '24px',
                    textAlign: 'center'
                  }}>🏢</span>
                  <span>88 Avenue des Ternes, 75017 Paris</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '8px',
                  padding: '8px 0'
                }}>
                  <span style={{ 
                    fontSize: '18px', 
                    marginRight: '12px',
                    width: '24px',
                    textAlign: 'center'
                  }}>🆔</span>
                  <span>SIRET: 824 313 530 00027</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '8px',
                  padding: '8px 0'
                }}>
                  <span style={{ 
                    fontSize: '18px', 
                    marginRight: '12px',
                    width: '24px',
                    textAlign: 'center'
                  }}>📞</span>
                  <span>04 68 50 41 45</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '8px',
                  padding: '8px 0'
                }}>
                  <span style={{ 
                    fontSize: '18px', 
                    marginRight: '12px',
                    width: '24px',
                    textAlign: 'center'
                  }}>✉️</span>
                  <span>myconfort@gmail.com</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '8px 0'
                }}>
                  <span style={{ 
                    fontSize: '18px', 
                    marginRight: '12px',
                    width: '24px',
                    textAlign: 'center'
                  }}>🌐</span>
                  <span>htconfort.com</span>
                </div>
              </div>
            </div>
            
            {/* Informations facture */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '40px',
              borderRadius: '20px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                opacity: 0.3
              }}></div>
              
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h2 style={{ 
                  fontSize: '32px', 
                  fontWeight: '800', 
                  margin: '0 0 20px 0',
                  letterSpacing: '-0.02em'
                }}>
                  FACTURE
                </h2>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>
                    N° {invoice.invoiceNumber}
                  </div>
                </div>
                
                <div style={{ fontSize: '16px', opacity: 0.9, lineHeight: '1.8' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Date:</strong>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  {invoice.eventLocation && (
                    <>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Lieu:</strong>
                      </div>
                      <div>{invoice.eventLocation}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* INFORMATIONS CLIENT - Style Premium */}
          <div style={{
            marginBottom: '50px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
            padding: '40px',
            borderRadius: '20px',
            border: '2px solid rgba(16, 185, 129, 0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
              borderRadius: '50%'
            }}></div>
            
            <h3 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              margin: '0 0 30px 0',
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px'
              }}>👤</span>
              INFORMATIONS CLIENT
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '24px',
              fontSize: '16px'
            }}>
              {[
                { label: 'Nom', value: invoice.clientName, icon: '👤' },
                { label: 'Adresse', value: invoice.clientAddress, icon: '🏠' },
                { label: 'Code postal', value: invoice.clientPostalCode, icon: '📮' },
                { label: 'Ville', value: invoice.clientCity, icon: '🏙️' },
                { label: 'Code porte', value: invoice.clientDoorCode || 'Non spécifié', icon: '🚪' },
                { label: 'Email', value: invoice.clientEmail, icon: '✉️' },
                { label: 'Téléphone', value: invoice.clientPhone, icon: '📞' }
              ].map((item, index) => (
                <div key={index} style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(16, 185, 129, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '18px', marginRight: '8px' }}>{item.icon}</span>
                    <strong style={{ color: '#047857' }}>{item.label}:</strong>
                  </div>
                  <div style={{ color: '#1a202c', fontWeight: '500' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PRODUITS - Table Premium */}
          <div style={{ marginBottom: '50px' }}>
            <h3 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              margin: '0 0 30px 0',
              color: '#1a202c',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px'
              }}>🛏️</span>
              PRODUITS & SERVICES
            </h3>
            
            <div style={{
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(148, 163, 184, 0.2)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
                    color: 'white'
                  }}>
                    <th style={{ padding: '24px', textAlign: 'left', fontWeight: '700', fontSize: '16px' }}>Produit</th>
                    <th style={{ padding: '24px', textAlign: 'center', fontWeight: '700', fontSize: '16px' }}>Qté</th>
                    <th style={{ padding: '24px', textAlign: 'right', fontWeight: '700', fontSize: '16px' }}>Prix unitaire</th>
                    <th style={{ padding: '24px', textAlign: 'right', fontWeight: '700', fontSize: '16px' }}>Remise</th>
                    <th style={{ padding: '24px', textAlign: 'right', fontWeight: '700', fontSize: '16px' }}>Total TTC</th>
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
                        borderBottom: index < invoice.products.length - 1 ? '1px solid rgba(148, 163, 184, 0.1)' : 'none',
                        background: index % 2 === 0 ? '#ffffff' : 'rgba(248, 250, 252, 0.5)',
                        transition: 'all 0.2s ease'
                      }}>
                        <td style={{ padding: '24px' }}>
                          <div style={{ fontWeight: '600', marginBottom: '6px', fontSize: '16px', color: '#1a202c' }}>
                            {product.name}
                          </div>
                          {product.category && (
                            <div style={{ 
                              fontSize: '14px', 
                              color: '#6b7280',
                              padding: '4px 12px',
                              background: 'rgba(107, 114, 128, 0.1)',
                              borderRadius: '20px',
                              display: 'inline-block'
                            }}>
                              {product.category}
                            </div>
                          )}
                        </td>
                        <td style={{ 
                          padding: '24px', 
                          textAlign: 'center', 
                          fontWeight: '600',
                          fontSize: '16px'
                        }}>
                          <span style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontWeight: '700'
                          }}>
                            {product.quantity}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '24px', 
                          textAlign: 'right',
                          fontSize: '16px',
                          fontWeight: '500' 
                        }}>
                          {formatCurrency(product.priceTTC)}
                        </td>
                        <td style={{ padding: '24px', textAlign: 'right', fontSize: '16px' }}>
                          {product.discount > 0 ? (
                            <span style={{ 
                              color: '#dc2626',
                              fontWeight: '600',
                              background: 'rgba(220, 38, 38, 0.1)',
                              padding: '4px 12px',
                              borderRadius: '20px'
                            }}>
                              -{product.discount}{product.discountType === 'percent' ? '%' : '€'}
                            </span>
                          ) : (
                            <span style={{ color: '#9ca3af' }}>—</span>
                          )}
                        </td>
                        <td style={{ 
                          padding: '24px', 
                          textAlign: 'right', 
                          fontWeight: '700',
                          fontSize: '18px',
                          color: '#1a202c'
                        }}>
                          {formatCurrency(productTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SIGNATURE ET TOTAUX - Layout Premium */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr auto', 
            gap: '50px',
            marginBottom: '50px',
            alignItems: 'flex-start'
          }}>
            
            {/* Signature */}
            {invoice.signature && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                padding: '40px',
                borderRadius: '20px',
                border: '2px solid rgba(16, 185, 129, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  width: '100px',
                  height: '100px',
                  background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
                  borderRadius: '50%'
                }}></div>
                
                <h4 style={{ 
                  fontSize: '20px', 
                  fontWeight: '700', 
                  margin: '0 0 24px 0',
                  color: '#047857',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px'
                  }}>✍️</span>
                  SIGNATURE ÉLECTRONIQUE
                </h4>
                <div style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '2px dashed rgba(16, 185, 129, 0.3)',
                  textAlign: 'center',
                  minHeight: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.05)'
                }}>
                  <img 
                    src={invoice.signature} 
                    alt="Signature électronique" 
                    style={{ maxHeight: '80px', maxWidth: '250px' }} 
                  />
                </div>
                <div style={{
                  textAlign: 'center',
                  marginTop: '16px',
                  fontSize: '16px',
                  color: '#047857',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: '#10b981',
                    borderRadius: '50%',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
                  }}></div>
                  Document signé électroniquement
                </div>
              </div>
            )}

            {/* Totaux Premium */}
            <div style={{
              minWidth: '380px',
              background: 'white',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(148, 163, 184, 0.2)'
            }}>
              {[
                ...(totalDiscount > 0 ? [
                  { label: 'Sous-total', value: formatCurrency(totalTTC + totalDiscount), color: '#4a5568' },
                  { label: 'Remise totale', value: `-${formatCurrency(totalDiscount)}`, color: '#dc2626', bg: 'rgba(220, 38, 38, 0.05)' }
                ] : []),
                { label: 'Total HT', value: formatCurrency(totalHT), color: '#4a5568' },
                { label: `TVA (${invoice.taxRate}%)`, value: formatCurrency(totalTVA), color: '#4a5568' }
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '20px 30px',
                  fontSize: '16px',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                  background: item.bg || 'transparent',
                  color: item.color
                }}>
                  <span style={{ fontWeight: '500' }}>{item.label}:</span>
                  <span style={{ fontWeight: '600' }}>{item.value}</span>
                </div>
              ))}
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '24px 30px',
                fontSize: '24px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
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
                    padding: '20px 30px',
                    fontSize: '16px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#92400e',
                    borderBottom: '1px solid rgba(245, 158, 11, 0.2)'
                  }}>
                    <span style={{ fontWeight: '500' }}>Acompte versé:</span>
                    <span style={{ fontWeight: '700' }}>-{formatCurrency(acompteAmount)}</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '24px 30px',
                    fontSize: '20px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%)',
              padding: '40px',
              borderRadius: '20px',
              border: '2px solid rgba(245, 158, 11, 0.2)',
              marginBottom: '50px'
            }}>
              <h4 style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                margin: '0 0 20px 0',
                color: '#92400e',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '18px'
                }}>📝</span>
                NOTES COMPLÉMENTAIRES
              </h4>
              <div style={{ 
                fontSize: '16px', 
                lineHeight: '1.8', 
                color: '#1a202c',
                background: 'rgba(255, 255, 255, 0.7)',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}>
                {invoice.invoiceNotes}
              </div>
            </div>
          )}

          {/* CONDITIONS GÉNÉRALES */}
          <div style={{
            background: 'rgba(248, 250, 252, 0.8)',
            padding: '40px',
            borderRadius: '20px',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            marginBottom: '50px'
          }}>
            <h4 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              margin: '0 0 24px 0',
              color: '#1a202c',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px'
              }}>📋</span>
              CONDITIONS GÉNÉRALES
            </h4>
            <div style={{ 
              background: 'white',
              padding: '30px',
              borderRadius: '12px',
              border: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
              <ConditionsGenerales />
            </div>
          </div>
        </div>

        {/* FOOTER PREMIUM */}
        <footer style={{
          background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #4a5568 100%)',
          color: 'white',
          padding: '50px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: `
              radial-gradient(circle at 30% 20%, rgba(255,255,255,0.05) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)
            `
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 style={{ 
              fontSize: '32px', 
              fontWeight: '800', 
              margin: '0 0 16px 0',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              MyCoNfort
            </h3>
            <p style={{ fontSize: '20px', margin: '0 0 24px 0', opacity: 0.9, fontWeight: '500' }}>
              Merci pour votre confiance !
            </p>
            <div style={{ fontSize: '16px', opacity: 0.8, lineHeight: '2' }}>
              <div style={{ marginBottom: '8px', fontWeight: '500' }}>🏆 Votre spécialiste en matelas et literie de qualité</div>
              <div style={{ marginBottom: '8px' }}>📍 88 Avenue des Ternes, 75017 Paris • 📞 04 68 50 41 45</div>
              <div>✉️ myconfort@gmail.com • 🆔 SIRET: 824 313 530 00027</div>
            </div>
          </div>
        </footer>
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
      `}</style>
    </div>
  );
};

export default InvoicePreviewPremium;
