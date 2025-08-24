import React from 'react';
import { BackButton } from '../components/BackButton';

interface SecondaryPageLayoutProps {
  /** Page title displayed in header */
  title: string;
  /** Page content */
  children: React.ReactNode;
  /** Custom back button label */
  backLabel?: string;
  /** Custom back action */
  onBack?: () => void;
  /** Additional header content */
  headerContent?: React.ReactNode;
  /** Custom className for the layout */
  className?: string;
  /** Whether to show the back button */
  showBackButton?: boolean;
}

/**
 * Layout component for secondary pages (overlay/modal style)
 * Optimized for iPad landscape with slide-in animation
 */
export const SecondaryPageLayout: React.FC<SecondaryPageLayoutProps> = ({
  title,
  children,
  backLabel,
  onBack,
  headerContent,
  className = '',
  showBackButton = true,
}) => {
  return (
    <div
      className={`
      fixed inset-0 z-50 bg-white
      flex flex-col
      animate-slide-in-right
      ${className}
    `}
    >
      {/* Header with back button */}
      <header
        className='
        flex items-center justify-between gap-4
        px-6 py-4 min-h-[80px]
        bg-white border-b border-gray-200
        shadow-sm
      '
      >
        <div className='flex items-center gap-4'>
          {showBackButton && (
            <BackButton
              label={backLabel}
              onBack={onBack}
              className='flex-shrink-0'
            />
          )}

          <h1
            className='
            text-2xl font-bold text-myconfort-dark font-manrope
            truncate
          '
          >
            {title}
          </h1>
        </div>

        {headerContent && <div className='flex-shrink-0'>{headerContent}</div>}
      </header>

      {/* Scrollable content area */}
      <main
        className='
        flex-1 overflow-y-auto
        bg-myconfort-cream
        p-6
      '
      >
        <div className='max-w-4xl mx-auto'>{children}</div>
      </main>
    </div>
  );
};
