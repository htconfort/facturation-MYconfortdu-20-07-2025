import { useState, useCallback } from 'react';

export function useWizard<T>(initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [open, setOpen] = useState(false);

  const start = useCallback((next?: Partial<T>) => {
    setValue(prev => ({ ...prev, ...next } as T));
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);
  
  const apply = useCallback((v: T) => { 
    setValue(v); 
    setOpen(false); 
  }, []);

  return { 
    value, 
    setValue, 
    open, 
    start, 
    close, 
    apply 
  };
}
