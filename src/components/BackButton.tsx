import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  /** Custom label for the button */
  label?: string;
  /** Custom action instead of default navigation */
  onBack?: () => void;
  /** Custom className for styling */
  className?: string;
  /** Whether to show the arrow icon */
  showIcon?: boolean;
}

/**
 * Back button component for secondary pages
 * Optimized for iPad touch targets with 56px minimum height
 */
export const BackButton: React.FC<BackButtonProps> = ({
  label = 'Retour',
  onBack,
  className = '',
  showIcon = true,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`
        flex items-center gap-3 px-4 py-3 min-h-[56px]
        text-lg font-medium text-myconfort-dark
        bg-white border border-gray-200 rounded-lg
        hover:bg-gray-50 active:bg-gray-100
        transition-colors duration-150
        touch-manipulation
        ${className}
      `}
      type='button'
      aria-label={`${label} à la page précédente`}
    >
      {showIcon && (
        <ArrowLeft size={24} className='text-myconfort-green flex-shrink-0' />
      )}
      <span className='font-manrope'>{label}</span>
    </button>
  );
};
