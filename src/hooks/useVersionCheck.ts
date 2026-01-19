import { useEffect } from 'react';

const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

export function useVersionCheck() {
  useEffect(() => {
    const checkVersion = async () => {
      try {
        // Buscar version.json com cache-busting
        const response = await fetch(`/version.json?t=${Date.now()}`, {
          cache: 'no-store'
        });
        const data = await response.json();
        
        // Se versão remota for diferente, forçar reload
        if (data.version !== APP_VERSION) {
          console.log(`Nova versão disponível: ${data.version}. Atualizando...`);
          // Limpar caches e recarregar
          if ('caches' in window) {
            const names = await caches.keys();
            await Promise.all(names.map(name => caches.delete(name)));
          }
          window.location.reload();
        }
      } catch (error) {
        console.log('Erro ao verificar versão:', error);
      }
    };

    // Verificar ao carregar
    checkVersion();
    
    // Verificar a cada 5 minutos
    const interval = setInterval(checkVersion, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
}
