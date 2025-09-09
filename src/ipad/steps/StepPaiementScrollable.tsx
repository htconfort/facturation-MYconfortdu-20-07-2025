// StepPaiementScrollable.tsx - Wrapper scroll robuste avec Tailwind
import { ReactNode } from 'react';

interface StepPaiementScrollableProps {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

export default function StepPaiementScrollable({ 
  header, 
  footer, 
  children 
}: StepPaiementScrollableProps) {
  return (
    <div className="w-full h-screen bg-myconfort-cream relative overflow-visible font-manrope">
      
      {/* Header fixe */}
      <div className="absolute top-0 left-0 right-0 z-10 h-20 box-border bg-myconfort-cream border-b border-myconfort-dark/10">
        {header}
      </div>

      {/* Zone de contenu scrollable */}
      <div 
        className="absolute left-0 right-0 px-6 overflow-y-auto overflow-x-hidden box-border"
        style={{
          top: '80px',           // Header height
          bottom: '100px',       // Footer height
          paddingBottom: '120px', // Extra space so content never goes under footer
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        {children}
      </div>

      {/* Footer fixe */}
      <div 
        className="absolute bottom-0 left-0 right-0 z-10 box-border bg-myconfort-cream border-t border-myconfort-dark/10"
        style={{ height: '100px' }}
      >
        {footer}
      </div>
    </div>
  );
}
