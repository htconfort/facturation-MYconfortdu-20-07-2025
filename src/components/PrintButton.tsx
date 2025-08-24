import { useRef } from 'react';

export default function PrintButton() {
  const printing = useRef(false);

  const handlePrint = () => {
    if (printing.current) return;
    printing.current = true;

    // ⚠️ Doit être appelé depuis un geste utilisateur (onClick)
    window.requestAnimationFrame(() => {
      window.print();
      // petit délai pour éviter doubles clics
      setTimeout(() => {
        printing.current = false;
      }, 800);
    });
  };

  return (
    <button
      onClick={handlePrint}
      className='rounded-2xl px-4 py-2 bg-[#477A0C] text-white font-medium hover:bg-[#5A8F0F] transition-colors'
    >
      🖨️ Imprimer
    </button>
  );
}
