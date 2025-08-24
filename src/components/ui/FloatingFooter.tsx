// components/ui/FloatingFooter.tsx
import { createPortal } from 'react-dom';

type Props = {
  leftLabel: string;
  onLeft: () => void;
  rightLabel?: string;
  onRight?: () => void;
  rightDisabled?: boolean;
  className?: string; // pour variantes de couleur (amber, etc.)
  maxWidth?: string; // ex: "max-w-6xl"
};

export default function FloatingFooter({
  leftLabel,
  onLeft,
  rightLabel,
  onRight,
  rightDisabled,
  className,
  maxWidth = 'max-w-6xl',
}: Props) {
  const FOOTER_H = 88;
  const footerPadBottom = `max(env(safe-area-inset-bottom, 16px), 16px)`;

  const node = (
    <div
      className='fixed left-0 right-0 bottom-0 z-[9999]'
      style={{ paddingBottom: footerPadBottom }}
    >
      <div className={`mx-auto w-full ${maxWidth} px-6`}>
        <div
          className={`rounded-2xl border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-lg
                      flex items-center justify-between gap-3 px-4 ${className || ''}`}
          style={{ height: FOOTER_H, willChange: 'transform' }}
        >
          <button
            type='button'
            onClick={onLeft}
            className='px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-lg transition'
          >
            {leftLabel}
          </button>

          {rightLabel ? (
            <button
              type='button'
              onClick={!rightDisabled ? onRight : undefined}
              disabled={rightDisabled}
              className={`px-12 py-4 font-bold rounded-xl text-lg shadow-lg transition
                          ${
                            rightDisabled
                              ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
                              : 'bg-myconfort-green hover:bg-myconfort-green/90 text-white'
                          }`}
            >
              {rightLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );

  return typeof window !== 'undefined'
    ? createPortal(node, document.body)
    : node;
}
