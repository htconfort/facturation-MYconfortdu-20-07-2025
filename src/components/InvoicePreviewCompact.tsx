import React from "react";
import { Invoice } from "../types";
import { formatCurrency, calculateProductTotal } from "../utils/calculations";
import { ConditionsGenerales } from "./ConditionsGenerales";

interface InvoicePreviewCompactProps {
  invoice: Invoice;
  className?: string;
}

/**
 * Aperçu React professionnel de la facture, conforme à l'image de référence.
 * Affiche exactement le même format que la facture du 27 septembre 2025.
 */
export const InvoicePreviewCompact: React.FC<InvoicePreviewCompactProps> = ({ invoice, className = "" }) => {
  // Helpers
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" });

  // Calculs des totaux
  const totalTTC = invoice.products.reduce((sum, product) => {
    return sum + calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType);
  }, 0);

  const totalHT = totalTTC / (1 + (invoice.taxRate / 100));
  const totalTVA = totalTTC - totalHT;

  const totalDiscount = invoice.products.reduce((sum, product) => {
    const originalTotal = product.priceTTC * product.quantity;
    const discountedTotal = calculateProductTotal(
      product.quantity,
      product.priceTTC,
      product.discount,
      product.discountType === 'percentage' ? 'percent' : 'fixed'
    );
    return sum + (originalTotal - discountedTotal);
  }, 0);

  // Styles inline (pour isolation)
  const styles = {
    container: {
      fontFamily: "Arial, sans-serif",
      background: "#fff",
      padding: 20,
      maxWidth: 800,
      margin: "0 auto",
      fontSize: 13,
      color: "#111",
      border: "1px solid #f0f0f0",
      borderRadius: 8,
      boxShadow: "0 2px 8px #eee",
      position: "relative",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 15,
      borderBottom: "2px solid #e5e5e5",
      paddingBottom: 12,
      paddingTop: 10,
    },
    logoContainer: {
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      top: 5,
      zIndex: 10,
    },
    logo: {
      height: 40,
      width: "auto",
    },
    title: {
      fontSize: 24,
      color: "#222",
      fontWeight: "bold",
      textAlign: "center",
      letterSpacing: "2px",
      marginTop: 5,
      marginBottom: 0,
    },
    companyInfo: {
      fontSize: 13,
      lineHeight: 1.5,
      color: "#222",
    },
    clientInfo: {
      fontSize: 13,
      lineHeight: 1.5,
      color: "#222",
      textAlign: "left",
    },
    sectionTitle: {
      fontWeight: "bold",
      marginTop: 18,
      marginBottom: 6,
      fontSize: 15,
      color: "#222",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: 10,
      marginBottom: 6,
      fontSize: 12,
    },
    th: {
      background: "#8dbf4b",
      color: "#fff",
      textAlign: "left",
      padding: "6px",
      border: "1px solid #e3e3e3",
      fontWeight: "bold",
    },
    td: {
      background: "#f9f9f9",
      padding: "6px",
      border: "1px solid #e3e3e3",
      color: "#222",
    },
    totalRow: {
      fontWeight: "bold",
      fontSize: 15,
      background: "#fff",
    },
    remise: {
      color: "#7abd3f",
      fontWeight: "bold",
      fontSize: 14,
      textAlign: "right",
      marginTop: 2,
    },
    signature: {
      marginTop: 16,
      marginBottom: 8,
      minHeight: 40,
      border: "1px dashed #ccc",
      borderRadius: 4,
      display: "inline-block",
      padding: 6,
      background: "#fff",
    },
    cgv: {
      color: "#7abd3f",
      fontWeight: "bold",
      fontSize: 15,
      marginTop: 22,
      marginBottom: 4,
      letterSpacing: "1px",
    },
    legal: {
      fontSize: 13,
      color: "#222",
      marginTop: 4,
      fontWeight: "bold",
      letterSpacing: "1px",
    },
    note: {
      fontSize: 12,
      color: "#444",
      fontStyle: "italic",
      marginTop: 2,
    },
  };

  return (
    <div style={styles.container} className={className}>
      {/* HEADER */}
      <div style={styles.header}>
        {/* LOGO AU CENTRE */}
        <div style={styles.logoContainer}>
          <img src="/HT-Confort_Full_Green.png" alt="HT Confort" style={styles.logo} />
        </div>
        <div>
          <div style={styles.companyInfo}>
            <strong>MYCONFORT</strong>
            <br />
            88 avenue des Ternes<br />
            75017 Paris<br />
            Tél : +33 6 61 48 60 23<br />
            Email : htconfort@gmail.com<br />
            Web : htconfort.com<br />
            SIRET : 824 313 530 00027<br />
            IBAN : FR76 1660 7000 1708 1216 3980 964<br />
            BIC : CCBPFRPPPPG<br />
          </div>
        </div>
        <div style={styles.clientInfo}>
          <strong>Client</strong>
          <br />
          {invoice.clientName}<br />
          {invoice.clientAddress}<br />
          {invoice.clientPostalCode} {invoice.clientCity}<br />
          Tél : {invoice.clientPhone}<br />
          Email : {invoice.clientEmail}
        </div>
      </div>

      {/* FACTURE TITLE */}
      <div style={styles.title}>FACTURE</div>
      <div style={{ marginTop: 3, marginBottom: 8, fontSize: 14 }}>
        <strong>Facture n° : {invoice.invoiceNumber}</strong>
        <br />
        Date : {formatDate(invoice.invoiceDate)}
      </div>

      {/* TABLEAU PRODUITS */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Désignation</th>
            <th style={styles.th}>Qté</th>
            <th style={styles.th}>PU TTC</th>
            <th style={styles.th}>Remise</th>
            <th style={styles.th}>Total TTC</th>
          </tr>
        </thead>
        <tbody>
          {invoice.products?.map((prod, idx) => {
            const totalProduct = calculateProductTotal(prod.quantity, prod.priceTTC, prod.discount, prod.discountType);
            const discountText = prod.discount > 0 ? 
              (prod.discountType === 'percentage' ? `${prod.discount}%` : `${formatCurrency(prod.discount)}`) : '-';
            
            return (
              <tr key={idx}>
                <td style={styles.td}>{prod.name}</td>
                <td style={styles.td}>{prod.quantity}</td>
                <td style={styles.td}>{formatCurrency(prod.priceTTC)}</td>
                <td style={styles.td}>{discountText}</td>
                <td style={styles.td}>{formatCurrency(totalProduct)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* TOTALS */}
      <div style={{ textAlign: "right", marginTop: 6 }}>
        <div style={styles.totalRow}>Total HT&nbsp;&nbsp;&nbsp;{formatCurrency(totalHT)}</div>
        <div style={styles.totalRow}>TVA 20%&nbsp;&nbsp;&nbsp;{formatCurrency(totalTVA)}</div>
        <div style={styles.totalRow}>Total TTC&nbsp;&nbsp;&nbsp;{formatCurrency(totalTTC)}</div>
        {totalDiscount > 0 && (
          <div style={styles.remise}>
            Remise totale appliquée&nbsp;&nbsp;&nbsp;- {formatCurrency(totalDiscount)}
          </div>
        )}
      </div>

      {/* MODE DE REGLEMENT */}
      <div style={styles.sectionTitle}>Mode de règlement</div>
      <div>{invoice.paymentMethod || 'Chèque à venir'}</div>
      <div style={{ fontWeight: "bold", fontSize: 13, marginTop: 6, marginBottom: 4 }}>
        Merci pour votre confiance
      </div>
      <div style={{ fontSize: 12, marginTop: 0, marginBottom: 4 }}>
        Paiement par virement : IBAN FR76 1660 7000 1708 1216 3980 964 — BIC CCBPFRPPPPG. Indiquez le n° de facture {invoice.invoiceNumber} en référence.
      </div>

      {/* SIGNATURE */}
      <div style={styles.sectionTitle}>Signature client :</div>
      <div style={styles.signature}>
        {invoice.signature ? (
          <img src={invoice.signature} alt="Signature client" style={{ maxHeight: 35, maxWidth: 180 }} />
        ) : (
          <span style={{ color: "#666", fontStyle: "italic" }}>Signature requise</span>
        )}
      </div>
      <div style={{ fontSize: 12, marginTop: 2, marginBottom: 3 }}>
        Signé le {formatDate(invoice.signatureDate || invoice.invoiceDate)}
      </div>

      {/* CGV & LEGAL */}
      <div style={styles.cgv}>
        Conditions générales de vente acceptées par le client
      </div>
      <div style={styles.legal}>
        INFORMATION LÉGALE - ARTICLE L224-59
      </div>
      <div style={styles.note}>
        « Avant la conclusion de tout contrat entre un consommateur et un professionnel à l'occasion d'une foire, d'un salon [...] le professionnel informe le consommateur qu'il ne dispose pas d'un délai de rétractation. »
      </div>

      {/* DEUXIÈME PAGE - CONDITIONS GÉNÉRALES */}
      <div style={{ 
        pageBreakBefore: "always", 
        marginTop: 20,
        paddingTop: 15,
        borderTop: "2px solid #e5e5e5"
      }}>
        <ConditionsGenerales />
      </div>
    </div>
  );
};