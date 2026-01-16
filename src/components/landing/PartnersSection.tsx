import { motion } from "framer-motion";
import { MapPin, ExternalLink } from "lucide-react";

// Travelpayouts Marker ID
const TRAVELPAYOUTS_MARKER = "489165";

interface FeaturedHotel {
  id: number;
  name: string;
  location: string;
  image: string;
  priceFrom: string;
  partner: "booking" | "hotellook";
  partnerName: string;
  link: string;
}

const featuredHotels: FeaturedHotel[] = [
  {
    id: 1,
    name: "Copacabana Palace",
    location: "Rio de Janeiro, Brasil",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    priceFrom: "R$ 1.200",
    partner: "booking",
    partnerName: "Booking.com",
    link: `https://www.booking.com/searchresults.html?ss=Copacabana+Rio+de+Janeiro&aid=${TRAVELPAYOUTS_MARKER}`,
  },
  {
    id: 2,
    name: "Hotel Fasano",
    location: "São Paulo, Brasil",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    priceFrom: "R$ 980",
    partner: "hotellook",
    partnerName: "Hotellook",
    link: `https://search.hotellook.com/?destination=Sao+Paulo&marker=${TRAVELPAYOUTS_MARKER}`,
  },
  {
    id: 3,
    name: "Pousada dos Sonhos",
    location: "Florianópolis, Brasil",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    priceFrom: "R$ 450",
    partner: "booking",
    partnerName: "Booking.com",
    link: `https://www.booking.com/searchresults.html?ss=Florianopolis&aid=${TRAVELPAYOUTS_MARKER}`,
  },
  {
    id: 4,
    name: "Resort Vista Mar",
    location: "Santorini, Grécia",
    image: "https://images.unsplash.com/photo-1570213489059-0aac6626cade?w=800&q=80",
    priceFrom: "R$ 650",
    partner: "hotellook",
    partnerName: "Hotellook",
    link: `https://search.hotellook.com/?destination=Santorini&marker=${TRAVELPAYOUTS_MARKER}`,
  },
  {
    id: 5,
    name: "Boutique Hotel Charme",
    location: "Paris, França",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    priceFrom: "R$ 520",
    partner: "booking",
    partnerName: "Booking.com",
    link: `https://www.booking.com/searchresults.html?ss=Paris&aid=${TRAVELPAYOUTS_MARKER}`,
  },
  {
    id: 6,
    name: "Pousada Histórica",
    location: "Lisboa, Portugal",
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80",
    priceFrom: "R$ 410",
    partner: "hotellook",
    partnerName: "Hotellook",
    link: `https://search.hotellook.com/?destination=Lisbon&marker=${TRAVELPAYOUTS_MARKER}`,
  },
];

export function PartnersSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            🏨 Hotéis em Destaque
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Hospedagens selecionadas com as melhores ofertas dos nossos parceiros
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredHotels.map((hotel, index) => (
            <motion.a
              key={hotel.id}
              href={hotel.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl bg-background border border-border shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Price Badge */}
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  A partir de {hotel.priceFrom}/noite
                </div>
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {hotel.name}
                </h3>
                <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{hotel.location}</span>
                </div>

                {/* Partner Badge */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Reserve via
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-sm font-medium ${
                        hotel.partner === "booking"
                          ? "text-blue-600"
                          : "text-orange-500"
                      }`}
                    >
                      {hotel.partnerName}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-10"
        >
          * Podemos receber comissões por reservas feitas através destes links
        </motion.p>
      </div>
    </section>
  );
}
