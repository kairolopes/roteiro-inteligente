// Configuração visual e identidade do time de agentes IA.
export type AgentName = "sofia" | "pietra" | "lia" | "bruno";

export interface AgentProfile {
  name: AgentName;
  displayName: string;
  role: string;
  emoji: string;
  /** Tailwind classes para fundo/texto do avatar */
  avatarBg: string;
  avatarText: string;
  /** Tailwind classes para bubble da mensagem */
  bubbleBg: string;
  bubbleText: string;
  accent: string;
}

export const AGENTS: Record<AgentName, AgentProfile> = {
  sofia: {
    name: "sofia",
    displayName: "Sofia",
    role: "Orquestradora",
    emoji: "✨",
    avatarBg: "bg-primary/15",
    avatarText: "text-primary",
    bubbleBg: "bg-primary/10",
    bubbleText: "text-foreground",
    accent: "text-primary",
  },
  pietra: {
    name: "pietra",
    displayName: "Pietra",
    role: "Curadora cultural",
    emoji: "🎭",
    avatarBg: "bg-purple-500/15",
    avatarText: "text-purple-500 dark:text-purple-400",
    bubbleBg: "bg-purple-500/10",
    bubbleText: "text-foreground",
    accent: "text-purple-500 dark:text-purple-400",
  },
  lia: {
    name: "lia",
    displayName: "Lia",
    role: "Local",
    emoji: "🌿",
    avatarBg: "bg-emerald-500/15",
    avatarText: "text-emerald-600 dark:text-emerald-400",
    bubbleBg: "bg-emerald-500/10",
    bubbleText: "text-foreground",
    accent: "text-emerald-600 dark:text-emerald-400",
  },
  bruno: {
    name: "bruno",
    displayName: "Bruno",
    role: "Logística",
    emoji: "🧭",
    avatarBg: "bg-amber-500/15",
    avatarText: "text-amber-600 dark:text-amber-400",
    bubbleBg: "bg-amber-500/10",
    bubbleText: "text-foreground",
    accent: "text-amber-600 dark:text-amber-400",
  },
};
