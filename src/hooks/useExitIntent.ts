import { useEffect, useState, useCallback } from 'react';

interface ExitIntentOptions {
  threshold?: number;
  eventThrottle?: number;
  onExitIntent?: () => void;
}

export function useExitIntent(options: ExitIntentOptions = {}) {
  const { threshold = 20, eventThrottle = 200, onExitIntent } = options;
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Verificar se já foi mostrado nesta sessão
    const alreadyShown = sessionStorage.getItem('exit_intent_shown');
    if (alreadyShown || hasTriggered) return;

    // Verificar se o mouse saiu pelo topo (intenção de fechar/sair)
    if (e.clientY <= threshold) {
      setShowExitIntent(true);
      setHasTriggered(true);
      sessionStorage.setItem('exit_intent_shown', 'true');
      onExitIntent?.();
    }
  }, [threshold, hasTriggered, onExitIntent]);

  const closeExitIntent = useCallback(() => {
    setShowExitIntent(false);
  }, []);

  const resetExitIntent = useCallback(() => {
    sessionStorage.removeItem('exit_intent_shown');
    setHasTriggered(false);
  }, []);

  useEffect(() => {
    // Throttle para performance
    let timeout: NodeJS.Timeout;
    const throttledHandler = (e: MouseEvent) => {
      if (timeout) return;
      timeout = setTimeout(() => {
        handleMouseLeave(e);
        timeout = undefined as any;
      }, eventThrottle);
    };

    document.addEventListener('mouseleave', throttledHandler);

    return () => {
      document.removeEventListener('mouseleave', throttledHandler);
      if (timeout) clearTimeout(timeout);
    };
  }, [handleMouseLeave, eventThrottle]);

  return {
    showExitIntent,
    closeExitIntent,
    resetExitIntent,
    hasTriggered,
  };
}
