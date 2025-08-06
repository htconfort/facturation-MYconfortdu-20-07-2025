import { useState } from 'react';

// Types pour les statuts de livraison
export type DeliveryStatus = 'pending' | 'delivered' | 'to_deliver' | 'cancelled';

// Interface pour les produits avec statuts
export interface ProductWithDeliveryStatus {
  nom: string;
  quantite: number;
  prix_ttc: number;
  total_ttc: number;
  categorie: string;
  remise: number;
  type_remise: 'percent' | 'fixed';
  statut_livraison: DeliveryStatus;
  emporte?: boolean | string;
}

// Styles intégrés
const styles = {
  container: {
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f5f7fa',
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '40px',
    padding: '30px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  title: {
    color: '#2c3e50',
    fontSize: '2.5rem',
    marginBottom: '10px',
    fontWeight: '700'
  },
  subtitle: {
    color: '#6c757d',
    fontSize: '1.1rem',
    margin: '0'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '16px',
    fontWeight: '500',
    fontSize: '0.85rem',
    border: '1px solid'
  },
  selector: {
    padding: '8px 12px',
    border: '2px solid',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    minWidth: '150px'
  },
  productItem: {
    background: 'white',
    borderRadius: '8px',
    padding: '15px',
    border: '1px solid #e9ecef',
    marginBottom: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px'
  },
  section: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  }
};

// Composant StatusBadge simplifié
const StatusBadge = ({ status }: { status: DeliveryStatus }) => {
  const configs = {
    pending: { icon: '⏳', label: 'En attente', color: '#FF9800', bg: '#FFF3E0' },
    delivered: { icon: '✅', label: 'Emporté', color: '#4CAF50', bg: '#E8F5E8' },
    to_deliver: { icon: '📦', label: 'À livrer', color: '#2196F3', bg: '#E3F2FD' },
    cancelled: { icon: '❌', label: 'Annulé', color: '#f44336', bg: '#FFEBEE' }
  };
  
  const config = configs[status];
  
  return (
    <span 
      style={{
        ...styles.badge,
        backgroundColor: config.bg,
        color: config.color,
        borderColor: config.color + '40'
      }}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

// Composant StatusSelector simplifié
const StatusSelector = ({ 
  status, 
  onChange, 
  disabled = false 
}: { 
  status: DeliveryStatus; 
  onChange: (status: DeliveryStatus) => void;
  disabled?: boolean;
}) => {
  const options = [
    { value: 'pending' as DeliveryStatus, label: '⏳ En attente', color: '#FF9800', bg: '#FFF3E0' },
    { value: 'delivered' as DeliveryStatus, label: '✅ Emporté', color: '#4CAF50', bg: '#E8F5E8' },
    { value: 'to_deliver' as DeliveryStatus, label: '📦 À livrer', color: '#2196F3', bg: '#E3F2FD' },
    { value: 'cancelled' as DeliveryStatus, label: '❌ Annulé', color: '#f44336', bg: '#FFEBEE' }
  ];
  
  const currentOption = options.find(opt => opt.value === status) || options[0];
  
  return (
    <div>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
        Statut de livraison :
      </label>
      <select 
        value={status}
        onChange={(e) => onChange(e.target.value as DeliveryStatus)}
        disabled={disabled}
        style={{
          ...styles.selector,
          backgroundColor: currentOption.bg,
          color: currentOption.color,
          borderColor: currentOption.color,
          opacity: disabled ? 0.6 : 1
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Données de démonstration
const demoProducts: ProductWithDeliveryStatus[] = [
  {
    nom: 'Matelas Queen Size Premium',
    quantite: 1,
    prix_ttc: 899.99,
    total_ttc: 899.99,
    categorie: 'Literie',
    remise: 50,
    type_remise: 'fixed',
    statut_livraison: 'pending'
  },
  {
    nom: 'Sommier tapissier 160x200',
    quantite: 1,
    prix_ttc: 299.99,
    total_ttc: 299.99,
    categorie: 'Literie',
    remise: 10,
    type_remise: 'percent',
    statut_livraison: 'delivered'
  },
  {
    nom: 'Oreiller ergonomique',
    quantite: 2,
    prix_ttc: 49.99,
    total_ttc: 99.98,
    categorie: 'Accessoires',
    remise: 0,
    type_remise: 'fixed',
    statut_livraison: 'to_deliver'
  },
  {
    nom: 'Protège matelas imperméable',
    quantite: 1,
    prix_ttc: 39.99,
    total_ttc: 39.99,
    categorie: 'Accessoires',
    remise: 5,
    type_remise: 'fixed',
    statut_livraison: 'cancelled'
  }
];

function SimpleDeliveryDemo() {
  const [products, setProducts] = useState<ProductWithDeliveryStatus[]>(demoProducts);
  const [selectedStatus, setSelectedStatus] = useState<DeliveryStatus>('pending');

  const updateProductStatus = (index: number, newStatus: DeliveryStatus) => {
    const updatedProducts = products.map((product, i) => 
      i === index ? { ...product, statut_livraison: newStatus } : product
    );
    setProducts(updatedProducts);
  };

  const getStatusCounts = () => {
    const counts = { pending: 0, delivered: 0, to_deliver: 0, cancelled: 0 };
    products.forEach(product => {
      counts[product.statut_livraison]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={styles.header}>
          <h1 style={styles.title}>
            🚚 Démo Composants Statut Livraison
          </h1>
          <p style={styles.subtitle}>
            Interface de gestion des statuts de livraison pour MYcomfort
          </p>
        </header>

        {/* Statistiques */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Total Produits</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
              {products.length}
            </div>
          </div>
          
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>En Attente</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FF9800' }}>
              {statusCounts.pending}
            </div>
          </div>
          
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Emportés</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>
              {statusCounts.delivered}
            </div>
          </div>
          
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>À Livrer</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196F3' }}>
              {statusCounts.to_deliver}
            </div>
          </div>
        </div>

        {/* Démo des badges */}
        <div style={styles.section}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
            🏷️ Badges de Statut
          </h2>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <StatusBadge status="pending" />
            <StatusBadge status="delivered" />
            <StatusBadge status="to_deliver" />
            <StatusBadge status="cancelled" />
          </div>
        </div>

        {/* Démo du sélecteur */}
        <div style={styles.section}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
            🎛️ Sélecteur de Statut
          </h2>
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h4 style={{ color: '#495057' }}>Sélecteur interactif :</h4>
              <StatusSelector
                status={selectedStatus}
                onChange={setSelectedStatus}
              />
              <div style={{ marginTop: '15px' }}>
                <strong>Statut sélectionné : </strong>
                <StatusBadge status={selectedStatus} />
              </div>
            </div>
            
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h4 style={{ color: '#495057' }}>Sélecteur désactivé :</h4>
              <StatusSelector
                status="delivered"
                onChange={() => {}}
                disabled={true}
              />
            </div>
          </div>
        </div>

        {/* Liste des produits avec statuts */}
        <div style={styles.section}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
            📦 Produits et Statuts de Livraison
          </h2>
          
          <div>
            {products.map((product, index) => (
              <div key={index} style={styles.productItem}>
                <div style={{ flex: '1' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>
                    {product.nom}
                  </h4>
                  <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                    <span style={{ marginRight: '15px' }}>Qté: {product.quantite}</span>
                    <span style={{ marginRight: '15px' }}>Prix: {product.prix_ttc}€</span>
                    <span style={{ marginRight: '15px' }}>Total: {product.total_ttc}€</span>
                    <span style={{ 
                      backgroundColor: '#e9ecef', 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      fontSize: '0.8rem'
                    }}>
                      {product.categorie}
                    </span>
                  </div>
                </div>
                
                <div style={{ minWidth: '200px' }}>
                  <StatusSelector
                    status={product.statut_livraison}
                    onChange={(newStatus) => updateProductStatus(index, newStatus)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Résumé */}
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StatusBadge status="pending" />
              <span style={{ fontWeight: 'bold' }}>{statusCounts.pending}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StatusBadge status="delivered" />
              <span style={{ fontWeight: 'bold' }}>{statusCounts.delivered}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StatusBadge status="to_deliver" />
              <span style={{ fontWeight: 'bold' }}>{statusCounts.to_deliver}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StatusBadge status="cancelled" />
              <span style={{ fontWeight: 'bold' }}>{statusCounts.cancelled}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#6c757d',
          fontSize: '0.9rem'
        }}>
          <p>🚀 Composants React pour la gestion des statuts de livraison</p>
          <p>💻 Développé avec React + TypeScript + Vite</p>
          <p>🎨 Interface responsive et moderne</p>
        </footer>
      </div>
    </div>
  );
}

export default SimpleDeliveryDemo;
