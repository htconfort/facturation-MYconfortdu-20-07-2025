import React, { useEffect } from 'react';

interface WizardSheetProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSave?: () => void;
  children: React.ReactNode;
  saveLabel?: string;
}

const isLikelyIpad = () =>
  /iPad|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document; // iPadOS safari "Macintosh"

export const WizardSheet: React.FC<WizardSheetProps> = ({
  isOpen,
  title,
  onClose,
  onSave,
  children,
  saveLabel = 'Valider',
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const fullscreen = isLikelyIpad();

  return (
    <div
      role='dialog'
      aria-modal='true'
      className='fixed inset-0 z-[1000] flex items-stretch justify-center bg-black/30'
    >
      <div
        className={`bg-white shadow-xl flex flex-col w-full ${
          fullscreen ? 'h-full max-w-full' : 'h-[90vh] max-w-3xl'
        } rounded-none md:rounded-xl`}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-4 py-3 border-b bg-white'>
          <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
          <div className='flex gap-2'>
            <button
              className='px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors'
              onClick={onClose}
            >
              Annuler
            </button>
            {onSave && (
              <button
                className='px-4 py-2 rounded-lg bg-[#477A0C] text-white hover:bg-[#3A6A0A] font-medium transition-colors'
                onClick={onSave}
              >
                {saveLabel}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className='p-4 overflow-auto grow'>{children}</div>

        {/* Safe area for iOS */}
        <div className='pb-safe-area-inset-bottom'></div>
      </div>
    </div>
  );
};
