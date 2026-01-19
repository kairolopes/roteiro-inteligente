import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Users, Heart, Baby, Dog, Cat, PawPrint, Check, X } from "lucide-react";
import { QuizOption } from "../QuizOption";
import { QuizAnswers } from "@/types/quiz";

const companions = [
  {
    id: "solo",
    icon: User,
    title: "Sozinho(a)",
    description: "Viagem solo para autoconhecimento",
  },
  {
    id: "couple",
    icon: Heart,
    title: "Casal",
    description: "Viagem romântica a dois",
  },
  {
    id: "friends",
    icon: Users,
    title: "Amigos",
    description: "Grupo de amigos",
  },
  {
    id: "family",
    icon: Users,
    title: "Família",
    description: "Viajando com parentes",
  },
];

const petOptions = [
  { id: "dog", icon: Dog, label: "Sim, cachorro" },
  { id: "cat", icon: Cat, label: "Sim, gato" },
  { id: "other", icon: PawPrint, label: "Sim, outro animal" },
  { id: "none", icon: X, label: "Não" },
];

const dietary = [
  { id: "none", emoji: "✅", label: "Nenhuma" },
  { id: "vegetarian", emoji: "🥬", label: "Vegetariano" },
  { id: "vegan", emoji: "🌱", label: "Vegano" },
  { id: "gluten-free", emoji: "🌾", label: "Sem Glúten" },
  { id: "lactose-free", emoji: "🥛", label: "Sem Lactose" },
  { id: "kosher", emoji: "✡️", label: "Kosher" },
  { id: "halal", emoji: "☪️", label: "Halal" },
];

const mobility = [
  { id: "none", emoji: "🚶", label: "Sem restrições" },
  { id: "limited", emoji: "🦯", label: "Mobilidade reduzida" },
  { id: "wheelchair", emoji: "♿", label: "Cadeira de rodas" },
];

interface TravelWithStepProps {
  answers: QuizAnswers;
  onUpdate: (key: keyof QuizAnswers, value: any) => void;
}

export function TravelWithStep({ answers, onUpdate }: TravelWithStepProps) {
  const hasRomanticStyle = answers.travelStyle === "romantic";
  const hasFamilyStyle = answers.travelStyle === "family";
  const hasSoloStyle = answers.travelStyle === "solo" || answers.travelStyle === "backpacker";

  // Pre-selecionar companhia baseada no estilo de viagem
  useEffect(() => {
    if (hasRomanticStyle && answers.travelWith !== "couple") {
      onUpdate("travelWith", "couple");
    } else if (hasFamilyStyle && !answers.travelWith) {
      onUpdate("travelWith", "family");
    } else if (hasSoloStyle && !answers.travelWith) {
      onUpdate("travelWith", "solo");
    }
  }, [hasRomanticStyle, hasFamilyStyle, hasSoloStyle]);

  // Filtrar opções de companhia conforme o estilo escolhido
  const filteredCompanions = useMemo(() => {
    if (hasRomanticStyle) {
      return companions.filter(c => c.id === "couple");
    }
    if (hasFamilyStyle) {
      return companions.filter(c => c.id === "family");
    }
    if (hasSoloStyle) {
      return companions.filter(c => c.id === "solo");
    }
    return companions;
  }, [hasRomanticStyle, hasFamilyStyle, hasSoloStyle]);

  // Determinar mensagem informativa quando há apenas uma opção
  const inferredMessage = useMemo(() => {
    if (hasRomanticStyle) {
      return { style: "romântica", companion: "Viagem em Casal" };
    }
    if (hasSoloStyle) {
      return { style: "solo", companion: "Viagem Sozinho(a)" };
    }
    if (hasFamilyStyle) {
      return { style: "em família", companion: "Viagem em Família" };
    }
    return null;
  }, [hasRomanticStyle, hasSoloStyle, hasFamilyStyle]);

  const showChildrenQuestion = answers.travelWith === "friends" || answers.travelWith === "family";

  const toggleDietary = (id: string) => {
    if (id === "none") {
      onUpdate("dietary", ["none"]);
      return;
    }
    
    let current = answers.dietary.filter((d) => d !== "none");
    if (current.includes(id)) {
      current = current.filter((d) => d !== id);
    } else {
      current = [...current, id];
    }
    onUpdate("dietary", current.length > 0 ? current : []);
  };

  const handleCompanionSelect = (id: string) => {
    onUpdate("travelWith", id);
    if (id !== "friends" && id !== "family") {
      onUpdate("hasChildren", false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-10"
    >
      {/* Travel companion */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold mb-3">
            Com quem você vai <span className="text-primary">viajar</span>?
          </h2>
        </div>

        {/* Se há apenas uma opção inferida do estilo, mostrar mensagem informativa */}
        {inferredMessage && filteredCompanions.length === 1 ? (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Como você escolheu viagem <span className="text-primary font-medium">{inferredMessage.style}</span>, 
              entendemos que é uma viagem adequada!
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl border-2 border-primary bg-primary/10">
              {(() => {
                const Icon = filteredCompanions[0]?.icon;
                return Icon ? <Icon className="w-6 h-6 text-primary" /> : null;
              })()}
              <span className="font-semibold text-lg">{inferredMessage.companion}</span>
              <Check className="w-5 h-5 text-primary" />
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredCompanions.map((companion) => (
              <QuizOption
                key={companion.id}
                icon={companion.icon}
                title={companion.title}
                description={companion.description}
                selected={answers.travelWith === companion.id}
                onClick={() => handleCompanionSelect(companion.id)}
                variant="compact"
              />
            ))}
          </div>
        )}
      </div>

      {/* Children question - Conditional */}
      <AnimatePresence>
        {showChildrenQuestion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">
                Terá <span className="text-primary">crianças</span> no grupo?
              </h3>
            </div>

            <div className="flex justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onUpdate("hasChildren", true)}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border text-sm font-medium transition-all ${
                  answers.hasChildren
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <Baby className="w-5 h-5" />
                <span>Sim</span>
                {answers.hasChildren && <Check className="w-4 h-4 ml-1" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onUpdate("hasChildren", false)}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border text-sm font-medium transition-all ${
                  !answers.hasChildren
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <X className="w-5 h-5" />
                <span>Não</span>
                {!answers.hasChildren && <Check className="w-4 h-4 ml-1" />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pet question - Universal */}
      <div>
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">
            Vai viajar com <span className="text-primary">pet</span>?
          </h3>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {petOptions.map((option) => {
            const Icon = option.icon;
            return (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onUpdate("hasPet", option.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  answers.hasPet === option.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{option.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Dietary restrictions */}
      <div>
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Restrições alimentares?</h3>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {dietary.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleDietary(item.id)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm transition-all ${
                answers.dietary.includes(item.id)
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Mobility */}
      <div>
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Mobilidade</h3>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {mobility.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onUpdate("mobility", item.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm transition-all ${
                answers.mobility === item.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
