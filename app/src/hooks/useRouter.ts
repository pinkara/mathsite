import { useState, useCallback } from 'react';
import type { Route, RouterState } from '@/types';

export function useRouter() {
  const [state, setState] = useState<RouterState>({ route: 'home' });
  const [navigationKey, setNavigationKey] = useState(0);

  const router = useCallback((route: Route, params?: RouterState['params']) => {
    setState({ route, params });
    setNavigationKey((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    setState({ route: 'home' });
    setNavigationKey((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { state, router, goBack, navigationKey };
}
