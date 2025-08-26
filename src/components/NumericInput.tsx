import { useState, useEffect, useCallback } from 'react';
import { toSafeString, normalizeInput } from '../utils/number';

interface NumericInputProps {
  value: number | string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  className?: string;
  step?: string | number;
  disabled?: boolean;
  autoFocus?: boolean;
  'aria-label'?: string;
}

/**
 * Composant d'input numérique optimisé pour iPad
 * - Remplace automatiquement le "0" initial par le premier chiffre tapé
 * - Gère les virgules et points décimaux
 * - Évite les zéros inutiles en début
 * - Optimisé pour la saisie tactile
 */
export default function NumericInput({
  value,
  onChange,
  min,
  max,
  placeholder,
  className = '',
  step = '0.01',
  disabled = false,
  autoFocus = false,
  'aria-label': ariaLabel,
}: NumericInputProps) {
  const [internalValue, setInternalValue] = useState(() => toSafeString(value || '0'));

  // Synchroniser avec la valeur externe
  useEffect(() => {
    setInternalValue(toSafeString(value || '0'));
  }, [value]);

  const applyConstraints = useCallback((val: string): string => {
    const { number } = normalizeInput(val);
    if (number === null) return val;
    
    let constrainedNum = number;
    if (min !== undefined && constrainedNum < min) constrainedNum = min;
    if (max !== undefined && constrainedNum > max) constrainedNum = max;
    
    return constrainedNum !== number ? String(constrainedNum) : val;
  }, [min, max]);

  const handleBeforeInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const nativeEvent = (e as any).nativeEvent as InputEvent;
    const target = e.currentTarget;
    const data = toSafeString(nativeEvent.data || '');
    
    // Si on tape un chiffre et que le champ contient juste "0"
    if (
      nativeEvent.inputType?.startsWith('insert') &&
      /^[0-9.,]$/.test(data) &&
      target.value === '0'
    ) {
      e.preventDefault();
      const { clean } = normalizeInput(data);
      const constrained = applyConstraints(clean);
      setInternalValue(constrained);
      onChange(constrained);
    }
  }, [applyConstraints, onChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = toSafeString(e.target?.value || '');
    
    // Si entrée vide
    if (rawValue === '') {
      setInternalValue('0');
      onChange('0');
      return;
    }

    // Gestion des débuts par . ou ,
    const startsWithDot = rawValue.startsWith('.');
    const startsWithComma = rawValue.startsWith(',');
    if (startsWithDot || startsWithComma) {
      const fixed = `0${startsWithComma ? rawValue.replace(',', '.') : rawValue}`;
      const { number } = normalizeInput(fixed);
      if (number === null) return;
      const finalValue = String(number);
      const constrained = applyConstraints(finalValue);
      setInternalValue(constrained);
      onChange(constrained);
      return;
    }

    const { clean, number } = normalizeInput(rawValue);
    // Accepter entrée intermédiaire comme "12."
    if (number === null && clean !== '') {
      setInternalValue(clean);
      return;
    }
    
    const finalValue = number !== null ? String(number) : clean;
    const constrained = applyConstraints(finalValue);
    setInternalValue(constrained);
    onChange(constrained);
  }, [applyConstraints, onChange]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // Sélectionner tout le texte au focus pour faciliter la saisie
    e.target.select();
  }, []);

  return (
    <input
      type="text"
      inputMode="decimal"
      pattern="[0-9]*[.,]?[0-9]*"
      enterKeyHint="done"
      value={internalValue}
      onChange={handleChange}
      onBeforeInput={handleBeforeInput}
      onFocus={handleFocus}
      placeholder={placeholder}
      className={`
        border-2 rounded-lg px-3 py-2 text-sm font-medium
        focus:ring-1 transition-all
        ${className}
      `.trim()}
      disabled={disabled}
      autoFocus={autoFocus}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      aria-label={ariaLabel}
      step={step}
    />
  );
}
