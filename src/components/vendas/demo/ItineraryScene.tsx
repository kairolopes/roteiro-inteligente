import { motion } from "framer-motion";
import { MapPin, Camera, Utensils, Landmark, Check, Sparkles } from "lucide-react";

const days = [
  {
    day: 1,
    title: "Chegada & Torre Eiffel",
    activities: [
      { icon: Landmark, name: "Torre Eiffel", time: "14:00" },
      { icon: Utensils, name: "Café de Flore", time: "19:00" },
    ],
  },
  {
    day: 2,
    title: "Arte & Cultura",
    activities: [
      { icon: Camera, name: "Museu do Louvre", time: "09:00" },
      { icon: MapPin, name: "Jardim de Luxemburgo", time: "15:00" },
    ],
  },
];

export function ItineraryScene() {
  return (
    <div className="p-4 h-full flex flex-col">
      {/* Success badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="flex items-center justify-center gap-2 mb-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
          <Check className="h-4 w-4" />
          Roteiro Pronto!
        </div>
      </motion.div>

      {/* Content grid */}
      <div className="flex-1 grid grid-cols-2 gap-3">
        {/* Timeline */}
        <div className="space-y-3">
          {days.map((day, dayIndex) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + dayIndex * 0.3 }}
              className="bg-card/50 rounded-lg p-3 border border-border/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {day.day}
                </div>
                <span className="text-xs font-medium text-foreground truncate">
                  {day.title}
                </span>
              </div>
              <div className="space-y-1.5">
                {day.activities.map((activity, actIndex) => (
                  <motion.div
                    key={activity.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + dayIndex * 0.3 + actIndex * 0.15 }}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <activity.icon className="h-3 w-3 text-primary/70" />
                    <span className="truncate">{activity.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mini map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-muted to-muted/50 rounded-lg border border-border/50 relative overflow-hidden"
        >
          {/* Map background pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/3 w-16 h-0.5 bg-muted-foreground/30 rotate-45" />
            <div className="absolute top-1/2 left-1/4 w-12 h-0.5 bg-muted-foreground/30 -rotate-12" />
            <div className="absolute bottom-1/3 right-1/4 w-14 h-0.5 bg-muted-foreground/30 rotate-30" />
          </div>

          {/* Map pins */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.2, type: "spring" }}
            className="absolute top-1/4 left-1/3"
          >
            <div className="relative">
              <MapPin className="h-5 w-5 text-primary fill-primary" />
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-full bg-primary"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.4, type: "spring" }}
            className="absolute top-1/2 right-1/3"
          >
            <MapPin className="h-5 w-5 text-primary fill-primary" />
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.6, type: "spring" }}
            className="absolute bottom-1/3 left-1/2"
          >
            <MapPin className="h-5 w-5 text-primary fill-primary" />
          </motion.div>

          {/* Paris label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="absolute bottom-2 left-2 right-2 text-center"
          >
            <span className="text-xs font-medium text-foreground bg-background/80 px-2 py-1 rounded">
              🇫🇷 Paris, França
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer CTA hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground"
      >
        <Sparkles className="h-3 w-3 text-primary" />
        <span>Exportar PDF • Compartilhar • Editar</span>
      </motion.div>
    </div>
  );
}
