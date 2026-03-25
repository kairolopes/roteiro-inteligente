import { useEffect } from 'react';

const STORAGE_KEY = 'app_build_time';

export function useVersionCheck() {
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch(`/version.json?t=${Date.now()}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        if (!data?.buildTime && !data?.timestamp) return;
        
        const lastKnownBuild = localStorage.getItem(STORAGE_KEY);
        const remoteBuildTime = String(data.buildTime || data.timestamp);
        
        if (lastKnownBuild === null) {
          localStorage.setItem(STORAGE_KEY, remoteBuildTime);
          return;
        }
        
        if (lastKnownBuild !== remoteBuildTime) {
          console.log('Nova versão detectada. Atualizando...');
          localStorage.setItem(STORAGE_KEY, remoteBuildTime);
          
          if ('caches' in window) {
            try {
              const names = await caches.keys();
              await Promise.all(names.map(name => caches.delete(name)));
            } catch {
              // Ignore cache clearing errors
            }
          }
          
          window.location.reload();
        }
      } catch {
        // Silently ignore - don't break the app
      }
    };

    // Pequeno delay inicial para não bloquear renderização
    const initialTimeout = setTimeout(checkVersion, 2000);
    
    // Verificar a cada 5 minutos
    const interval = setInterval(checkVersion, 5 * 60 * 1000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);
}
