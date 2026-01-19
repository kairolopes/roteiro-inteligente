import { useEffect } from 'react';

const STORAGE_KEY = 'app_build_time';

export function useVersionCheck() {
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch(`/version.json?t=${Date.now()}`, {
          cache: 'no-store'
        });
        const data = await response.json();
        
        // Pegar timestamp do último build conhecido
        const lastKnownBuild = localStorage.getItem(STORAGE_KEY);
        const remoteBuildTime = String(data.buildTime || data.timestamp);
        
        if (lastKnownBuild === null) {
          // Primeira visita - salvar timestamp atual
          localStorage.setItem(STORAGE_KEY, remoteBuildTime);
          return;
        }
        
        if (lastKnownBuild !== remoteBuildTime) {
          console.log('Nova versão detectada. Atualizando...');
          // Atualizar storage ANTES do reload para evitar loop
          localStorage.setItem(STORAGE_KEY, remoteBuildTime);
          
          // Limpar caches
          if ('caches' in window) {
            const names = await caches.keys();
            await Promise.all(names.map(name => caches.delete(name)));
          }
          
          // Reload com force refresh
          window.location.reload();
        }
      } catch (error) {
        console.log('Erro ao verificar versão:', error);
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
