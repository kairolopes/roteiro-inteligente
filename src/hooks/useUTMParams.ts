import { useEffect, useState } from 'react';

interface UTMParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

export function useUTMParams(): UTMParams {
  const [params, setParams] = useState<UTMParams>({
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    const utmData: UTMParams = {
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
    };

    // Salvar no sessionStorage para persistir durante a sessão
    if (utmData.utm_source || utmData.utm_medium || utmData.utm_campaign) {
      sessionStorage.setItem('utm_params', JSON.stringify(utmData));
    }

    // Recuperar do sessionStorage se não houver na URL
    const stored = sessionStorage.getItem('utm_params');
    if (stored && !utmData.utm_source && !utmData.utm_medium && !utmData.utm_campaign) {
      setParams(JSON.parse(stored));
    } else {
      setParams(utmData);
    }
  }, []);

  return params;
}
