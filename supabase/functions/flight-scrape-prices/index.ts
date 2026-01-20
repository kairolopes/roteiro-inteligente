const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Headers para simular navegador real
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

interface SiteConfig {
  id: string;
  name: string;
  color: string;
  buildUrl: (origin: string, dest: string, date: string) => string;
}

const formatDateForSite = (date: string, format: 'ymd' | 'dmy' | 'iso') => {
  // date comes as YYMMDD (e.g., 260227)
  const year = '20' + date.substring(0, 2);
  const month = date.substring(2, 4);
  const day = date.substring(4, 6);
  
  switch (format) {
    case 'ymd':
      return `${year}-${month}-${day}`;
    case 'dmy':
      return `${day}/${month}/${year}`;
    case 'iso':
      return `${year}${month}${day}`;
    default:
      return date;
  }
};

const SITES: SiteConfig[] = [
  {
    id: 'skyscanner',
    name: 'Skyscanner',
    color: '#00a698',
    buildUrl: (origin, dest, date) => {
      const formattedDate = formatDateForSite(date, 'iso');
      return `https://www.skyscanner.com.br/transporte/passagens-aereas/${origin.toLowerCase()}/${dest.toLowerCase()}/${formattedDate}/`;
    },
  },
  {
    id: '123milhas',
    name: '123Milhas',
    color: '#00b140',
    buildUrl: (origin, dest, date) => {
      const formattedDate = formatDateForSite(date, 'ymd');
      return `https://123milhas.com/v2/busca?de=${origin}&para=${dest}&ida=${formattedDate}&adultos=1&criancas=0&bebes=0&classe=EC&is_498498=false`;
    },
  },
  {
    id: 'kayak',
    name: 'Kayak',
    color: '#ff690f',
    buildUrl: (origin, dest, date) => {
      const formattedDate = formatDateForSite(date, 'ymd');
      return `https://www.kayak.com.br/flights/${origin}-${dest}/${formattedDate}?sort=price_a`;
    },
  },
  {
    id: 'google',
    name: 'Google Flights',
    color: '#4285f4',
    buildUrl: (origin, dest, date) => {
      const formattedDate = formatDateForSite(date, 'ymd');
      return `https://www.google.com/travel/flights/search?tfs=CBwQAhoeEgoyMDI1LTAyLTI3agcIARID${origin}cgcIARID${dest}&hl=pt-BR&curr=BRL`;
    },
  },
  {
    id: 'decolar',
    name: 'Decolar',
    color: '#7b2d8e',
    buildUrl: (origin, dest, date) => {
      const formattedDate = formatDateForSite(date, 'ymd');
      return `https://www.decolar.com/shop/flights/results/oneway/${origin}/${dest}/${formattedDate}/1/0/0/NA/NA/NA/NA/NA`;
    },
  },
  {
    id: 'momondo',
    name: 'Momondo',
    color: '#e91e63',
    buildUrl: (origin, dest, date) => {
      const formattedDate = formatDateForSite(date, 'ymd');
      return `https://www.momondo.com.br/flight-search/${origin}-${dest}/${formattedDate}?sort=price_a`;
    },
  },
];

interface ScrapedResult {
  site: string;
  name: string;
  color: string;
  price: number | null;
  url: string;
  scrapedAt: string;
  error?: string;
}

async function scrapePrice(site: SiteConfig, origin: string, dest: string, date: string): Promise<ScrapedResult> {
  const url = site.buildUrl(origin, dest, date);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const response = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: 'follow',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`${site.name}: HTTP ${response.status}`);
      return {
        site: site.id,
        name: site.name,
        color: site.color,
        price: null,
        url,
        scrapedAt: new Date().toISOString(),
        error: `HTTP ${response.status}`,
      };
    }
    
    const html = await response.text();
    
    // Múltiplos padrões de regex para capturar preços em diferentes formatos
    const pricePatterns = [
      /R\$\s?([\d]{1,3}(?:\.[\d]{3})*(?:,[\d]{2})?)/g,  // R$ 1.234,56
      /BRL\s?([\d]{1,3}(?:\.[\d]{3})*(?:,[\d]{2})?)/g,  // BRL 1.234,56
      /"price":\s*([\d]+(?:\.[\d]+)?)/g,                 // JSON: "price": 1234.56
      /data-price="([\d]+(?:\.[\d]+)?)"/g,              // data-price="1234.56"
      /class="[^"]*price[^"]*"[^>]*>([\d.,]+)/gi,       // class="price">1234,56
    ];
    
    const allPrices: number[] = [];
    
    for (const pattern of pricePatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          // Normalizar o preço para número
          let priceStr = match[1];
          // Se tem ponto como separador de milhar e vírgula como decimal
          if (priceStr.includes('.') && priceStr.includes(',')) {
            priceStr = priceStr.replace(/\./g, '').replace(',', '.');
          } else if (priceStr.includes(',') && !priceStr.includes('.')) {
            // Só vírgula como decimal
            priceStr = priceStr.replace(',', '.');
          }
          
          const price = parseFloat(priceStr);
          
          // Filtrar preços válidos (entre R$100 e R$50.000)
          if (!isNaN(price) && price >= 100 && price <= 50000) {
            allPrices.push(price);
          }
        }
      }
    }
    
    if (allPrices.length > 0) {
      const lowestPrice = Math.min(...allPrices);
      console.log(`${site.name}: Found ${allPrices.length} prices, lowest: R$ ${lowestPrice}`);
      
      return {
        site: site.id,
        name: site.name,
        color: site.color,
        price: lowestPrice,
        url,
        scrapedAt: new Date().toISOString(),
      };
    }
    
    console.log(`${site.name}: No prices found in HTML (${html.length} chars)`);
    return {
      site: site.id,
      name: site.name,
      color: site.color,
      price: null,
      url,
      scrapedAt: new Date().toISOString(),
      error: 'Preço não encontrado',
    };
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
    console.log(`${site.name}: Error - ${errorMessage}`);
    
    return {
      site: site.id,
      name: site.name,
      color: site.color,
      price: null,
      url: site.buildUrl(origin, dest, date),
      scrapedAt: new Date().toISOString(),
      error: errorMessage.includes('abort') ? 'Timeout' : errorMessage,
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const origin = url.searchParams.get('origin')?.toUpperCase();
    const dest = url.searchParams.get('dest')?.toUpperCase();
    const date = url.searchParams.get('date');

    if (!origin || !dest || !date) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: origin, dest, date' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Scraping prices for ${origin} -> ${dest} on ${date}`);

    // Buscar preços de todos os sites em paralelo
    const results = await Promise.all(
      SITES.map(site => scrapePrice(site, origin, dest, date))
    );

    // Ordenar por preço (menores primeiro, null por último)
    const sortedResults = results.sort((a, b) => {
      if (a.price === null && b.price === null) return 0;
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return a.price - b.price;
    });

    const successCount = results.filter(r => r.price !== null).length;
    console.log(`Scraping complete: ${successCount}/${results.length} sites returned prices`);

    return new Response(
      JSON.stringify({
        success: true,
        origin,
        dest,
        date,
        prices: sortedResults,
        scrapedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Scraping error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to scrape prices', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
