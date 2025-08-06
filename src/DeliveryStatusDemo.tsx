import { useState } from 'react';
import { 
  ProductsWithStatusSection, 
  useProductsWithDeliveryStatus,
  StatusBadge,
  DeliveryStatusSelector,
  ProductWithDeliveryStatus,
  DeliveryStatus
} from './components/delivery';

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
    statut_livraison: 'pending',
    emporte: 'En attente'
  },
  {
    nom: 'Sommier tapissier 160x200',
    quantite: 1,
    prix_ttc: 299.99,
    total_ttc: 299.99,
    categorie: 'Literie',
    remise: 10,
    type_remise: 'percent',
    statut_livraison: 'delivered',
    emporte: 'Emporté'
  },
  {
    nom: 'Oreiller ergonomique',
    quantite: 2,
    prix_ttc: 49.99,
    total_ttc: 99.98,
    categorie: 'Accessoires',
    remise: 0,
    type_remise: 'fixed',
    statut_livraison: 'to_deliver',
    emporte: 'À livrer'
  },
  {
    nom: 'Protège matelas imperméable',
    quantite: 1,
    prix_ttc: 39.99,
    total_ttc: 39.99,
    categorie: 'Accessoires',
    remise: 5,
    type_remise: 'fixed',
    statut_livraison: 'cancelled',
    emporte: 'Annulé'
  }
];

function DeliveryStatusDemo() {
  const { 
    products, 
    setProducts, 
    statusCounts, 
    totalProducts 
  } = useProductsWithDeliveryStatus(demoProducts);

  const [selectedProduct, setSelectedProduct] = useState<ProductWithDeliveryStatus>(products[0]);
  const [selectedStatus, setSelectedStatus] = useState<DeliveryStatus>('pending');

  const handleProductsChange = (updatedProducts: ProductWithDeliveryStatus[]) => {
    setProducts(updatedProducts);
  };

  const handleStatusChange = (index: number, status: DeliveryStatus) => {
    console.log(`Changement statut produit ${index}: ${status}`);
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f5f7fa',
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          padding: '30px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ 
            color: '#2c3e50', 
            fontSize: '2.5rem', 
            marginBottom: '10px',
            fontWeight: '700'
          }}>
            🚚 Démo Composants Statut Livraison
          </h1>
          <p style={{ 
            color: '#6c757d', 
            fontSize: '1.1rem',
            margin: '0'
          }}>
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
              {totalProducts}
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
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
            🏷️ Démo StatusBadge (toutes tailles)
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {(['small', 'medium', 'large'] as const).map(size => (
              <div key={size} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <strong style={{ minWidth: '80px', color: '#495057' }}>
                  {size.charAt(0).toUpperCase() + size.slice(1)}:
                </strong>
                <StatusBadge status="pending" size={size} />
                <StatusBadge status="delivered" size={size} />
                <StatusBadge status="to_deliver" size={size} />
                <StatusBadge status="cancelled" size={size} />
              </div>
            ))}
          </div>
        </div>

        {/* Démo du sélecteur */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
            🎛️ Démo DeliveryStatusSelector
          </h2>
          
          <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h4 style={{ color: '#495057', marginBottom: '15px' }}>
                Sélecteur interactif :
              </h4>
              <DeliveryStatusSelector
                product={selectedProduct}
                productIndex={0}
                onStatusChange={(_, status) => {
                  setSelectedStatus(status);
                  setSelectedProduct({
                    ...selectedProduct,
                    statut_livraison: status
                  });
                }}
              />
            </div>
            
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h4 style={{ color: '#495057', marginBottom: '15px' }}>
                Sélecteur désactivé :
              </h4>
              <DeliveryStatusSelector
                product={selectedProduct}
                productIndex={1}
                onStatusChange={handleStatusChange}
                disabled={true}
              />
            </div>
          </div>
          
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px' 
          }}>
            <strong>Statut sélectionné :</strong> 
            <StatusBadge status={selectedStatus} size="medium" />
          </div>
        </div>

        {/* Section principale avec tous les produits */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h2 style={{ margin: '0', fontSize: '1.5rem' }}>
              📦 Section Complète - ProductsWithStatusSection
            </h2>
          </div>
          
          <div style={{ padding: '20px' }}>
            <ProductsWithStatusSection
              products={products}
              onProductsChange={handleProductsChange}
              readonly={false}
            />
          </div>
        </div>

        {/* Version en lecture seule */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          marginTop: '30px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            color: 'white',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h2 style={{ margin: '0', fontSize: '1.5rem' }}>
              👁️ Version Lecture Seule (readonly=true)
            </h2>
          </div>
          
          <div style={{ padding: '20px' }}>
            <ProductsWithStatusSection
              products={products}
              onProductsChange={handleProductsChange}
              readonly={true}
            />
          </div>
        </div>

        {/* Footer avec infos */}
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

export default DeliveryStatusDemo;
