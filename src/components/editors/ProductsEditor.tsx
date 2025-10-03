import React, { useState, useEffect } from 'react';
import { WizardSheet } from '../WizardSheet';
import { Trash2, Plus } from 'lucide-react';

export interface ProductForm {
  name: string;
  price: number;
  quantity: number;
  category: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
}

interface Props {
  isOpen: boolean;
  initial: ProductForm[];
  onCancel: () => void;
  onSave: (products: ProductForm[]) => void;
}

export const ProductsEditor: React.FC<Props> = ({
  isOpen,
  initial,
  onCancel,
  onSave,
}) => {
  const [products, setProducts] = useState<ProductForm[]>(initial);

  useEffect(() => {
    setProducts(initial.length > 0 ? initial : [createEmptyProduct()]);
  }, [initial, isOpen]);

  const createEmptyProduct = (): ProductForm => ({
    name: '',
    price: 0,
    quantity: 1,
    category: 'Climatisation',
    discount: 0,
    discountType: 'percentage',
  });

  const addProduct = () => {
    setProducts([...products, createEmptyProduct()]);
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const updateProduct = (index: number, updates: Partial<ProductForm>) => {
    setProducts(
      products.map((product, i) =>
        i === index ? { ...product, ...updates } : product
      )
    );
  };

  const calculateTotal = () => {
    return products.reduce((total, product) => {
      const subtotal = product.price * product.quantity;
      const discountAmount =
        product.discountType === 'percentage'
          ? subtotal * (product.discount / 100)
          : product.discount;
      return total + (subtotal - discountAmount);
    }, 0);
  };

  const handleSave = () => {
    // Filtrer les produits vides
    const validProducts = products.filter(p => p.name.trim() && p.price > 0);
    if (validProducts.length === 0) {
      alert('Ajoutez au moins un produit valide');
      return;
    }
    onSave(validProducts);
  };

  return (
    <WizardSheet
      isOpen={isOpen}
      title='🛒 Produits — Édition plein écran'
      onClose={onCancel}
      onSave={handleSave}
      saveLabel='Enregistrer'
    >
      <div className='space-y-6'>
        {/* Liste des produits */}
        {products.map((product, index) => (
          <div key={index} className='bg-gray-50 rounded-lg p-4 space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='font-medium text-gray-700'>
                Produit {index + 1}
              </span>
              {products.length > 1 && (
                <button
                  onClick={() => removeProduct(index)}
                  className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <label className='flex flex-col gap-2'>
                <span className='text-sm font-medium text-gray-700'>
                  Nom du produit *
                </span>
                <input
                  className='border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent'
                  value={product.name}
                  onChange={e => updateProduct(index, { name: e.target.value })}
                  placeholder='Ex: Matelas Bambou 90x200'
                />
              </label>

              <label className='flex flex-col gap-2'>
                <span className='text-sm font-medium text-gray-700'>
                  Catégorie
                </span>
                <select
                  className='border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent'
                  value={product.category}
                  onChange={e =>
                    updateProduct(index, { category: e.target.value })
                  }
                >
                  <option value='Matelas'>Matelas</option>
                  <option value='Oreiller'>Oreiller</option>
                  <option value='Couette'>Couette</option>
                  <option value='Maintenance'>Maintenance</option>
                  <option value='Installation'>Installation</option>
                  <option value='Autre'>Autre</option>
                </select>
              </label>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <label className='flex flex-col gap-2'>
                <span className='text-sm font-medium text-gray-700'>
                  Prix unitaire HT *
                </span>
                <input
                  className='border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent'
                  type='number'
                  min='0'
                  step='0.01'
                  value={product.price}
                  onChange={e =>
                    updateProduct(index, {
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder='0.00'
                />
              </label>

              <label className='flex flex-col gap-2'>
                <span className='text-sm font-medium text-gray-700'>
                  Quantité *
                </span>
                <input
                  className='border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent'
                  type='number'
                  min='1'
                  value={product.quantity}
                  onChange={e =>
                    updateProduct(index, {
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </label>

              <div className='flex flex-col gap-2'>
                <span className='text-sm font-medium text-gray-700'>
                  Sous-total HT
                </span>
                <div className='border border-gray-200 rounded-lg px-4 py-3 bg-gray-100 text-base'>
                  {(product.price * product.quantity).toFixed(2)} €
                </div>
              </div>
            </div>

            {/* Remise */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <label className='flex flex-col gap-2'>
                <span className='text-sm font-medium text-gray-700'>
                  Remise
                </span>
                <input
                  className='border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent'
                  type='number'
                  min='0'
                  step='0.01'
                  value={product.discount}
                  onChange={e =>
                    updateProduct(index, {
                      discount: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder='0'
                />
              </label>

              <label className='flex flex-col gap-2'>
                <span className='text-sm font-medium text-gray-700'>
                  Type de remise
                </span>
                <select
                  className='border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent'
                  value={product.discountType}
                  onChange={e =>
                    updateProduct(index, {
                      discountType: e.target.value as 'percentage' | 'fixed',
                    })
                  }
                >
                  <option value='percentage'>Pourcentage (%)</option>
                  <option value='fixed'>Montant fixe (€)</option>
                </select>
              </label>
            </div>

            {/* Récapitulatif ligne */}
            {product.discount > 0 && (
              <div className='text-sm text-gray-600 bg-white p-3 rounded border'>
                <div>
                  Sous-total : {(product.price * product.quantity).toFixed(2)} €
                </div>
                <div>
                  Remise : -
                  {product.discountType === 'percentage'
                    ? `${product.discount}% (${(product.price * product.quantity * (product.discount / 100)).toFixed(2)} €)`
                    : `${product.discount.toFixed(2)} €`}
                </div>
                <div className='font-medium text-[#477A0C]'>
                  Total ligne :{' '}
                  {(
                    product.price * product.quantity -
                    (product.discountType === 'percentage'
                      ? product.price *
                        product.quantity *
                        (product.discount / 100)
                      : product.discount)
                  ).toFixed(2)}{' '}
                  € HT
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Bouton ajouter produit */}
        <button
          onClick={addProduct}
          className='w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#477A0C] hover:text-[#477A0C] transition-colors'
        >
          <Plus size={20} />
          Ajouter un produit
        </button>

        {/* Total général */}
        <div className='bg-[#477A0C] text-white p-4 rounded-lg'>
          <div className='text-lg font-bold'>
            Total HT : {calculateTotal().toFixed(2)} €
          </div>
          <div className='text-sm opacity-90'>
            TVA 20% : {(calculateTotal() * 0.2).toFixed(2)} €
          </div>
          <div className='text-xl font-bold'>
            Total TTC : {(calculateTotal() * 1.2).toFixed(2)} €
          </div>
        </div>

        {/* Aide iPad */}
        <div className='text-xs text-gray-500 p-3 bg-gray-50 rounded-lg'>
          <span className='font-medium'>💡 Astuce iPad :</span> Touchez les
          champs pour les modifier. Utilisez le bouton + pour ajouter des
          produits et la corbeille pour les supprimer.
        </div>
      </div>
    </WizardSheet>
  );
};
