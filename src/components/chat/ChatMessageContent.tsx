import { useMemo } from "react";
import BlurredDaysOverlay from "./BlurredDaysOverlay";

interface ChatMessageContentProps {
  content: string;
  freeDays: number;
  isLoggedIn: boolean;
  hasSubscription: boolean;
  onLogin: () => void;
  onSubscribe: () => void;
}

// Patterns to detect day mentions in Sofia's response
const DAY_PATTERNS = [
  /\*?\*?Dia\s+(\d+)\*?\*?/gi,
  /📍\s*\*?\*?Dia\s+(\d+)/gi,
  /📅\s*\*?\*?Dia\s+(\d+)/gi,
  /🗓️?\s*\*?\*?Dia\s+(\d+)/gi,
];

const ChatMessageContent = ({
  content,
  freeDays,
  isLoggedIn,
  hasSubscription,
  onLogin,
  onSubscribe,
}: ChatMessageContentProps) => {
  // If user has subscription, show everything
  if (hasSubscription) {
    return (
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {content}
      </div>
    );
  }

  // Find all day mentions and their positions
  const { visibleContent, blurredContent, totalDays } = useMemo(() => {
    let maxDay = 0;
    let cutoffIndex = content.length;
    let foundCutoff = false;

    // Find all day mentions
    for (const pattern of DAY_PATTERNS) {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      while ((match = regex.exec(content)) !== null) {
        const dayNum = parseInt(match[1], 10);
        if (dayNum > maxDay) maxDay = dayNum;
        
        // Find where day 3 (or freeDays + 1) starts
        if (!foundCutoff && dayNum > freeDays) {
          // Look for the start of this day's section (usually starts with emoji or newline before)
          let sectionStart = match.index;
          // Go back to find the start of the line or section
          while (sectionStart > 0 && content[sectionStart - 1] !== '\n') {
            sectionStart--;
          }
          cutoffIndex = sectionStart;
          foundCutoff = true;
        }
      }
    }

    // If no days found or only free days, show everything
    if (maxDay <= freeDays) {
      return {
        visibleContent: content,
        blurredContent: "",
        totalDays: maxDay,
      };
    }

    return {
      visibleContent: content.substring(0, cutoffIndex).trim(),
      blurredContent: content.substring(cutoffIndex).trim(),
      totalDays: maxDay,
    };
  }, [content, freeDays]);

  // No days to blur
  if (!blurredContent || totalDays <= freeDays) {
    return (
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {content}
      </div>
    );
  }

  return (
    <div className="text-sm leading-relaxed">
      {/* Visible days */}
      <div className="whitespace-pre-wrap">
        {visibleContent}
      </div>

      {/* Blurred days overlay */}
      <BlurredDaysOverlay
        totalDays={totalDays}
        freeDays={freeDays}
        onLogin={onLogin}
        onSubscribe={onSubscribe}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
};

export default ChatMessageContent;
