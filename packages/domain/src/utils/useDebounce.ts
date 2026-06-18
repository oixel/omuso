import { useState, useEffect } from 'react';

// Place debounced parameter as the depency in a useEffect to debounce the useEffect by delay (ms)
export function useDebounce<T>(value: T, delay = 1000) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // Prevent premature firing
  }, [value, delay]);

  return debounced;
}
