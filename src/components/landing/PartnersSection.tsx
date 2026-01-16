import { motion } from "framer-motion";
import { ExternalLink, Bed, Plane, Ticket, Car, Shield } from "lucide-react";
import { AFFILIATE_CONFIG } from "@/lib/affiliateLinks";

const categoryIcons = {
  hotels: Bed,
  flights: Plane,
  tours: Ticket,
  carRental: Car,
  insurance: Shield,
};

const categoryLabels: Record<string, string> = {
  hotels: "Hospedagem",
  flights: "Voos",
  tours: "Passeios",
  carRental: "Aluguel de Carros",
  insurance: "Seguro Viagem",
};

// Generic links without context (for landing page)
const genericLinks: Record<string, Record<string, string>> = {
  hotels: {
    hotellook: "https://search.hotellook.com/?marker=604441",
    booking: "https://www.booking.com/",
    airbnb: "https://www.airbnb.com/",
  },
  flights: {
    aviasales: "https://www.aviasales.com/?marker=604441",
    skyscanner: "https://www.skyscanner.com.br/",
    kayak: "https://www.kayak.com.br/",
  },
  tours: {
    getyourguide: "https://www.getyourguide.com/?partner_id=QH8O7AF",
    viator: "https://www.viator.com/",
  },
  carRental: {
    rentalcars: "https://www.rentalcars.com/",
  },
  insurance: {
    travelinsurance: "https://www.worldnomads.com/",
  },
};

export function PartnersSection() {
  // Get only available partners
  const availablePartners = Object.entries(AFFILIATE_CONFIG)
    .map(([category, companies]) => ({
      category,
      companies: companies.filter((c) => c.available),
    }))
    .filter((cat) => cat.companies.length > 0);

  if (availablePartners.length === 0) return null;

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
            Nossos Parceiros
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Reserve com nossos parceiros de confiança e aproveite as melhores ofertas
          </p>
        </motion.div>

        <div className="grid gap-8 md:gap-12">
          {availablePartners.map(({ category, companies }, categoryIndex) => {
            const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
            
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-6">
                  {CategoryIcon && (
                    <CategoryIcon className="w-5 h-5 text-primary" />
                  )}
                  <h3 className="text-lg font-semibold text-foreground">
                    {categoryLabels[category] || category}
                  </h3>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4">
                  {companies.map((company, companyIndex) => {
                    const link = genericLinks[category]?.[company.id] || "#";
                    
                    return (
                      <motion.a
                        key={company.id}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ 
                          duration: 0.3, 
                          delay: categoryIndex * 0.1 + companyIndex * 0.05 
                        }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="group flex items-center gap-2 px-5 py-3 bg-background border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
                      >
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {company.name}
                        </span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
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
