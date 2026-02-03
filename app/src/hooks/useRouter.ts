import { useState, useCallback } from 'react';
import type { Route, RouterState } from '@/types';

export function useRouter() {
  const [state, setState] = useState<RouterState>({ route: 'home' });

  const router = useCallback((route: Route, params?: RouterState['params']) => {
    setState({ route, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    setState({ route: 'home' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { state, router, goBack };
}
