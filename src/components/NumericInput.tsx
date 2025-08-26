import { useState, useEffect, useCallback } from 'react';

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
  const [internalValue, setInternalValue] = useState(String(value || '0'));

  // Synchroniser avec la valeur externe
  useEffect(() => {
    setInternalValue(String(value || '0'));
  }, [value]);

  const normalize = useCallback((s: string): string => {
    // Remplacer virgule par point
    let v = s.replace(',', '.');
    
    // Enlever les zéros en tête (sauf si c'est juste "0" ou "0.")
    v = v.replace(/^0+(?=\d)/, '');
    
    // Limiter à un seul point décimal
    const parts = v.split('.');
    if (parts.length > 2) {
      v = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Si vide, remettre "0"
    if (v === '' || v === '.') v = '0';
    
    return v;
  }, []);

  const applyConstraints = useCallback((val: string): string => {
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    
    let constrainedNum = num;
    if (min !== undefined && constrainedNum < min) constrainedNum = min;
    if (max !== undefined && constrainedNum > max) constrainedNum = max;
    
    return constrainedNum !== num ? String(constrainedNum) : val;
  }, [min, max]);

  const handleBeforeInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const nativeEvent = (e as any).nativeEvent as InputEvent;
    const target = e.currentTarget;
    const data = nativeEvent.data || '';
    
    // Si on tape un chiffre et que le champ contient juste "0"
    if (
      nativeEvent.inputType.startsWith('insert') &&
      /^[0-9.,]$/.test(data) &&
      target.value === '0'
    ) {
      e.preventDefault();
      const normalized = normalize(data);
      const constrained = applyConstraints(normalized);
      setInternalValue(constrained);
      onChange(constrained);
    }
  }, [normalize, applyConstraints, onChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const normalized = normalize(rawValue);
    const constrained = applyConstraints(normalized);
    
    setInternalValue(constrained);
    onChange(constrained);
  }, [normalize, applyConstraints, onChange]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // Sélectionner tout le texte au focus pour faciliter la saisie
    e.target.select();
  }, []);

  return (
    <input
      type="text"
      inputMode="decimal"
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
