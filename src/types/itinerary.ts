export interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  coordinates?: [number, number];
  duration: string;
  category: "attraction" | "restaurant" | "transport" | "accommodation" | "activity";
  tips?: string;
  cost?: string;
}

export interface ItineraryDay {
  day: number;
  date: string;
  city: string;
  country: string;
  coordinates: [number, number];
  activities: Activity[];
  highlights: string[];
}

export interface Itinerary {
  id: string;
  title: string;
  summary: string;
  duration: string;
  totalBudget: string;
  destinations: string[];
  days: ItineraryDay[];
  createdAt: string;
}

// Helper to create empty itinerary
export const createEmptyItinerary = (): Itinerary => ({
  id: "",
  title: "Carregando roteiro...",
  summary: "",
  duration: "",
  totalBudget: "",
  destinations: [],
  days: [],
  createdAt: new Date().toISOString(),
});

// Sample itinerary for demonstration
export const sampleItinerary: Itinerary = {
  id: "sample-1",
  title: "Aventura Romântica pela Itália",
  summary: "Uma jornada encantadora por três das cidades mais icônicas da Itália, combinando arte, história, gastronomia e paisagens deslumbrantes.",
  duration: "7 dias",
  totalBudget: "€2.500 - €3.000 por pessoa",
  destinations: ["Roma", "Florença", "Veneza"],
  createdAt: new Date().toISOString(),
  days: [
    {
      day: 1,
      date: "Segunda-feira",
      city: "Roma",
      country: "Itália",
      coordinates: [41.9028, 12.4964],
      highlights: ["Coliseu", "Fórum Romano", "Jantar típico em Trastevere"],
      activities: [
        {
          id: "1-1",
          time: "09:00",
          title: "Check-in no Hotel",
          description: "Chegada ao Hotel Artemide, localizado na Via Nazionale com fácil acesso ao centro histórico.",
          location: "Hotel Artemide, Via Nazionale 22",
          coordinates: [41.9009, 12.4933],
          duration: "1h",
          category: "accommodation",
          cost: "€180/noite"
        },
        {
          id: "1-2",
          time: "10:30",
          title: "Visita ao Coliseu",
          description: "Explore o maior anfiteatro do mundo antigo com tour guiado em português. Inclui acesso à arena e subterrâneos.",
          location: "Piazza del Colosseo",
          coordinates: [41.8902, 12.4922],
          duration: "2h30",
          category: "attraction",
          tips: "Reserve ingressos com antecedência para evitar filas",
          cost: "€25"
        },
        {
          id: "1-3",
          time: "13:00",
          title: "Almoço na Luzzi",
          description: "Trattoria tradicional romana famosa pela cacio e pepe e carbonara autênticas.",
          location: "Via San Giovanni in Laterano 88",
          coordinates: [41.8884, 12.4977],
          duration: "1h30",
          category: "restaurant",
          cost: "€25-35"
        },
        {
          id: "1-4",
          time: "15:00",
          title: "Fórum Romano e Palatino",
          description: "Passeio pelo coração da Roma Antiga, explorando ruínas de templos, basílicas e palácios imperiais.",
          location: "Via della Salara Vecchia 5/6",
          coordinates: [41.8925, 12.4853],
          duration: "2h",
          category: "attraction",
          cost: "Incluído no ingresso do Coliseu"
        },
        {
          id: "1-5",
          time: "19:30",
          title: "Jantar em Trastevere",
          description: "Explore o charmoso bairro de Trastevere e jante no Da Enzo al 29, famoso pela cozinha romana tradicional.",
          location: "Via dei Vascellari 29, Trastevere",
          coordinates: [41.8868, 12.4707],
          duration: "2h",
          category: "restaurant",
          tips: "Chegue cedo, não aceita reservas e forma fila",
          cost: "€35-45"
        }
      ]
    },
    {
      day: 2,
      date: "Terça-feira",
      city: "Roma",
      country: "Itália",
      coordinates: [41.9028, 12.4964],
      highlights: ["Vaticano", "Capela Sistina", "Fontana di Trevi"],
      activities: [
        {
          id: "2-1",
          time: "08:00",
          title: "Museus do Vaticano",
          description: "Visite a maior coleção de arte do mundo, incluindo a Capela Sistina com os afrescos de Michelangelo.",
          location: "Viale Vaticano",
          coordinates: [41.9065, 12.4536],
          duration: "4h",
          category: "attraction",
          tips: "Entrada às 8h para evitar multidões",
          cost: "€20"
        },
        {
          id: "2-2",
          time: "12:30",
          title: "Basílica de São Pedro",
          description: "Explore a maior igreja do mundo e suba à cúpula para vistas panorâmicas de Roma.",
          location: "Piazza San Pietro",
          coordinates: [41.9022, 12.4539],
          duration: "1h30",
          category: "attraction",
          cost: "Gratuito (cúpula €10)"
        },
        {
          id: "2-3",
          time: "14:30",
          title: "Almoço no Borgo",
          description: "Pausa para almoço no tradicional bairro do Borgo, próximo ao Vaticano.",
          location: "Borgo Pio",
          coordinates: [41.9030, 12.4600],
          duration: "1h",
          category: "restaurant",
          cost: "€20-30"
        },
        {
          id: "2-4",
          time: "16:00",
          title: "Piazza Navona",
          description: "Admire as fontes barrocas de Bernini nesta praça elegante, ideal para um gelato.",
          location: "Piazza Navona",
          coordinates: [41.8992, 12.4731],
          duration: "45min",
          category: "attraction",
          cost: "Gratuito"
        },
        {
          id: "2-5",
          time: "17:00",
          title: "Pantheon",
          description: "Visite o templo romano mais bem preservado, agora uma igreja com a maior cúpula de concreto não armado do mundo.",
          location: "Piazza della Rotonda",
          coordinates: [41.8986, 12.4769],
          duration: "45min",
          category: "attraction",
          cost: "€5"
        },
        {
          id: "2-6",
          time: "18:00",
          title: "Fontana di Trevi",
          description: "Jogue uma moeda na fonte mais famosa do mundo para garantir seu retorno a Roma!",
          location: "Piazza di Trevi",
          coordinates: [41.9009, 12.4833],
          duration: "30min",
          category: "attraction",
          tips: "Visite ao entardecer para fotos incríveis",
          cost: "Gratuito"
        }
      ]
    },
    {
      day: 3,
      date: "Quarta-feira",
      city: "Florença",
      country: "Itália",
      coordinates: [43.7696, 11.2558],
      highlights: ["Trem para Florença", "Duomo", "Ponte Vecchio"],
      activities: [
        {
          id: "3-1",
          time: "09:00",
          title: "Trem Roma → Florença",
          description: "Viagem de trem alta velocidade (Frecciarossa) de Roma Termini para Firenze Santa Maria Novella.",
          location: "Roma Termini → Firenze SMN",
          coordinates: [41.9009, 12.5003],
          duration: "1h30",
          category: "transport",
          cost: "€45-60"
        },
        {
          id: "3-2",
          time: "11:00",
          title: "Check-in e Duomo",
          description: "Deixe as malas no hotel e vá direto admirar a Catedral de Santa Maria del Fiore e sua cúpula de Brunelleschi.",
          location: "Piazza del Duomo",
          coordinates: [43.7731, 11.2560],
          duration: "2h",
          category: "attraction",
          tips: "Suba os 463 degraus da cúpula para vistas incríveis",
          cost: "€30 (cúpula + batistério)"
        },
        {
          id: "3-3",
          time: "13:30",
          title: "Almoço no Mercato Centrale",
          description: "Experimente as delícias toscanas neste mercado gastronômico histórico de dois andares.",
          location: "Piazza del Mercato Centrale",
          coordinates: [43.7764, 11.2533],
          duration: "1h",
          category: "restaurant",
          cost: "€15-25"
        },
        {
          id: "3-4",
          time: "15:00",
          title: "Galleria dell'Accademia",
          description: "Veja o David de Michelangelo e outras esculturas renascentistas impressionantes.",
          location: "Via Ricasoli 58/60",
          coordinates: [43.7769, 11.2587],
          duration: "1h30",
          category: "attraction",
          cost: "€16"
        },
        {
          id: "3-5",
          time: "17:00",
          title: "Ponte Vecchio ao Pôr do Sol",
          description: "Caminhe pela ponte medieval mais famosa da Itália, repleta de joalherias desde o século XVI.",
          location: "Ponte Vecchio",
          coordinates: [43.7680, 11.2531],
          duration: "1h",
          category: "attraction",
          cost: "Gratuito"
        },
        {
          id: "3-6",
          time: "20:00",
          title: "Jantar com Bistecca alla Fiorentina",
          description: "Prove o famoso bife florentino no Buca Mario, restaurante tradicional desde 1886.",
          location: "Piazza degli Ottaviani 16r",
          coordinates: [43.7720, 11.2495],
          duration: "2h",
          category: "restaurant",
          cost: "€50-70"
        }
      ]
    },
    {
      day: 4,
      date: "Quinta-feira",
      city: "Florença",
      country: "Itália",
      coordinates: [43.7696, 11.2558],
      highlights: ["Uffizi", "Oltrarno", "Piazzale Michelangelo"],
      activities: [
        {
          id: "4-1",
          time: "08:30",
          title: "Galleria degli Uffizi",
          description: "Explore uma das maiores coleções de arte renascentista do mundo, incluindo obras de Botticelli, Leonardo e Rafael.",
          location: "Piazzale degli Uffizi 6",
          coordinates: [43.7687, 11.2553],
          duration: "3h",
          category: "attraction",
          tips: "Chegue antes da abertura para evitar filas enormes",
          cost: "€20"
        },
        {
          id: "4-2",
          time: "12:00",
          title: "Almoço no Oltrarno",
          description: "Atravesse o Arno e explore o bairro artesanal de Oltrarno. Almoce no Gustapanino.",
          location: "Via dei Michelozzi 13r",
          coordinates: [43.7666, 11.2480],
          duration: "1h",
          category: "restaurant",
          cost: "€10-15"
        },
        {
          id: "4-3",
          time: "14:00",
          title: "Palazzo Pitti e Jardins Boboli",
          description: "Visite o palácio renascentista e passeie pelos jardins italianos mais famosos de Florença.",
          location: "Piazza de' Pitti 1",
          coordinates: [43.7651, 11.2501],
          duration: "2h30",
          category: "attraction",
          cost: "€16"
        },
        {
          id: "4-4",
          time: "17:30",
          title: "Piazzale Michelangelo",
          description: "Suba até este mirante para a vista panorâmica mais espetacular de Florença, especialmente ao pôr do sol.",
          location: "Piazzale Michelangelo",
          coordinates: [43.7629, 11.2650],
          duration: "1h",
          category: "attraction",
          tips: "Leve uma garrafa de vinho para apreciar o pôr do sol",
          cost: "Gratuito"
        },
        {
          id: "4-5",
          time: "20:00",
          title: "Jantar no Santo Spirito",
          description: "Jante na animada Piazza Santo Spirito, coração do Oltrarno, no restaurante Borgo Antico.",
          location: "Piazza Santo Spirito 6r",
          coordinates: [43.7668, 11.2464],
          duration: "2h",
          category: "restaurant",
          cost: "€30-40"
        }
      ]
    },
    {
      day: 5,
      date: "Sexta-feira",
      city: "Veneza",
      country: "Itália",
      coordinates: [45.4408, 12.3155],
      highlights: ["Trem para Veneza", "Praça São Marcos", "Passeio de Gôndola"],
      activities: [
        {
          id: "5-1",
          time: "08:30",
          title: "Trem Florença → Veneza",
          description: "Viagem de trem alta velocidade para a cidade mais romântica do mundo.",
          location: "Firenze SMN → Venezia Santa Lucia",
          coordinates: [43.7764, 11.2479],
          duration: "2h",
          category: "transport",
          cost: "€50-75"
        },
        {
          id: "5-2",
          time: "11:00",
          title: "Chegada e Vaporetto",
          description: "Pegue o vaporetto (barco-ônibus) pela Grande Canal até seu hotel. Uma introdução espetacular à cidade!",
          location: "Estação Santa Lucia → Rialto",
          coordinates: [45.4410, 12.3208],
          duration: "45min",
          category: "transport",
          tips: "Compre um passe de 24h ou 48h para economizar",
          cost: "€25 (24h)"
        },
        {
          id: "5-3",
          time: "12:30",
          title: "Almoço perto do Rialto",
          description: "Experimente os cicchetti (tapas venezianas) nos bares tradicionais perto do Mercado de Rialto.",
          location: "Rialto Mercato",
          coordinates: [45.4387, 12.3358],
          duration: "1h",
          category: "restaurant",
          cost: "€15-25"
        },
        {
          id: "5-4",
          time: "14:00",
          title: "Ponte de Rialto",
          description: "Atravesse a ponte mais antiga sobre o Grande Canal e explore as lojas e vistas.",
          location: "Ponte di Rialto",
          coordinates: [45.4380, 12.3360],
          duration: "30min",
          category: "attraction",
          cost: "Gratuito"
        },
        {
          id: "5-5",
          time: "15:00",
          title: "Praça São Marcos",
          description: "Explore a praça mais famosa de Veneza, com a Basílica, o Campanário e o Palácio Ducal.",
          location: "Piazza San Marco",
          coordinates: [45.4341, 12.3388],
          duration: "2h30",
          category: "attraction",
          tips: "Suba no Campanário para vistas de toda a lagoa",
          cost: "€10 (campanário)"
        },
        {
          id: "5-6",
          time: "18:00",
          title: "Passeio de Gôndola",
          description: "Navegue pelos canais românticos de Veneza ao pôr do sol. Uma experiência inesquecível!",
          location: "Partida próximo à Praça São Marcos",
          coordinates: [45.4340, 12.3380],
          duration: "40min",
          category: "activity",
          tips: "Negocie o preço ou divida com outro casal",
          cost: "€80-100"
        },
        {
          id: "5-7",
          time: "20:00",
          title: "Jantar em Cannaregio",
          description: "Jante no bairro autêntico de Cannaregio, longe das multidões turísticas.",
          location: "Osteria Bea Vita, Cannaregio",
          coordinates: [45.4442, 12.3283],
          duration: "2h",
          category: "restaurant",
          cost: "€35-50"
        }
      ]
    },
    {
      day: 6,
      date: "Sábado",
      city: "Veneza",
      country: "Itália",
      coordinates: [45.4408, 12.3155],
      highlights: ["Murano e Burano", "Dorsoduro", "Aperitivo veneziano"],
      activities: [
        {
          id: "6-1",
          time: "09:00",
          title: "Ilhas de Murano e Burano",
          description: "Visite a ilha dos vidros artesanais (Murano) e a ilha das casas coloridas (Burano).",
          location: "Partida de Fondamente Nove",
          coordinates: [45.4469, 12.3419],
          duration: "4h",
          category: "activity",
          tips: "Vá primeiro a Burano para evitar multidões",
          cost: "€25 (vaporetto)"
        },
        {
          id: "6-2",
          time: "13:30",
          title: "Almoço em Burano",
          description: "Prove o risotto de gò (peixe típico da lagoa) no Ristorante da Romano.",
          location: "Via S. Martino dx 221, Burano",
          coordinates: [45.4853, 12.4170],
          duration: "1h30",
          category: "restaurant",
          cost: "€30-40"
        },
        {
          id: "6-3",
          time: "16:00",
          title: "Gallerie dell'Accademia",
          description: "Explore a maior coleção de arte veneziana, incluindo obras de Bellini, Titian e Tintoretto.",
          location: "Campo della Carità, Dorsoduro",
          coordinates: [45.4314, 12.3282],
          duration: "1h30",
          category: "attraction",
          cost: "€15"
        },
        {
          id: "6-4",
          time: "18:00",
          title: "Aperitivo no Campo Santa Margherita",
          description: "Junte-se aos locais para o tradicional aperitivo veneziano nesta praça animada.",
          location: "Campo Santa Margherita, Dorsoduro",
          coordinates: [45.4332, 12.3232],
          duration: "1h30",
          category: "restaurant",
          tips: "Experimente o Spritz Aperol, inventado aqui no Veneto!",
          cost: "€10-15"
        },
        {
          id: "6-5",
          time: "20:30",
          title: "Jantar de Despedida",
          description: "Jantar especial no Antiche Carampane, um dos melhores restaurantes de frutos do mar de Veneza.",
          location: "Rio Terà de le Carampane 1911",
          coordinates: [45.4390, 12.3320],
          duration: "2h",
          category: "restaurant",
          tips: "Reserva obrigatória!",
          cost: "€60-80"
        }
      ]
    },
    {
      day: 7,
      date: "Domingo",
      city: "Veneza",
      country: "Itália",
      coordinates: [45.4408, 12.3155],
      highlights: ["Última manhã em Veneza", "Partida"],
      activities: [
        {
          id: "7-1",
          time: "08:00",
          title: "Café da manhã veneziano",
          description: "Tome um cappuccino e cornetto em um café tradicional veneziano.",
          location: "Caffè Florian, Praça São Marcos",
          coordinates: [45.4340, 12.3385],
          duration: "1h",
          category: "restaurant",
          tips: "O café mais antigo da Itália, aberto desde 1720",
          cost: "€15-20"
        },
        {
          id: "7-2",
          time: "09:30",
          title: "Passeio final pelos canais",
          description: "Última caminhada pelos canais e vielas secretas de Veneza. Perca-se de propósito!",
          location: "Castello e San Marco",
          coordinates: [45.4354, 12.3462],
          duration: "1h30",
          category: "activity",
          cost: "Gratuito"
        },
        {
          id: "7-3",
          time: "11:30",
          title: "Transfer para o Aeroporto",
          description: "Pegue o Alilaguna (barco) ou táxi aquático para o Aeroporto Marco Polo.",
          location: "Venezia → Aeroporto Marco Polo",
          coordinates: [45.5053, 12.3519],
          duration: "1h",
          category: "transport",
          tips: "Saia com antecedência, Veneza tem transporte imprevisível",
          cost: "€15 (Alilaguna) ou €120 (táxi aquático)"
        }
      ]
    }
  ]
};
