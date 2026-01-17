import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface UserCredits {
  id: string;
  user_id: string;
  free_itineraries_used: number;
  paid_credits: number;
  chat_messages_used: number;
  chat_messages_reset_at: string;
  subscription_type: "monthly" | "annual" | null;
  subscription_expires_at: string | null;
}

interface UseUserCreditsReturn {
  credits: UserCredits | null;
  isLoading: boolean;
  hasActiveSubscription: boolean;
  canGenerateItinerary: boolean;
  canSendChatMessage: boolean;
  remainingFreeItineraries: number;
  remainingCredits: number;
  remainingChatMessages: number;
  refetch: () => Promise<void>;
  consumeItineraryCredit: () => Promise<boolean>;
  consumeChatMessage: () => Promise<boolean>;
}

const FREE_ITINERARIES_LIMIT = 1;
const FREE_CHAT_MESSAGES_LIMIT = 5;
const MONTHLY_CHAT_MESSAGES_LIMIT = 50;

export function useUserCredits(): UseUserCreditsReturn {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching credits:", error);
      }

      if (data) {
        setCredits(data as UserCredits);
      } else {
        // Create initial credits record if doesn't exist
        const { data: newData, error: insertError } = await supabase
          .from("user_credits")
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating credits:", insertError);
        } else {
          setCredits(newData as UserCredits);
        }
      }
    } catch (err) {
      console.error("Error in fetchCredits:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const hasActiveSubscription = useCallback(() => {
    if (!credits?.subscription_type || !credits?.subscription_expires_at) {
      return false;
    }
    return new Date(credits.subscription_expires_at) > new Date();
  }, [credits]);

  const canGenerateItinerary = useCallback(() => {
    if (!user) return false;
    if (hasActiveSubscription()) return true;
    if (!credits) return true; // First time user, allow free
    if (credits.free_itineraries_used < FREE_ITINERARIES_LIMIT) return true;
    if (credits.paid_credits > 0) return true;
    return false;
  }, [user, credits, hasActiveSubscription]);

  const canSendChatMessage = useCallback(() => {
    if (!user) return false;
    if (hasActiveSubscription()) {
      if (credits?.subscription_type === "annual") return true;
      // Monthly has limit
      return (credits?.chat_messages_used || 0) < MONTHLY_CHAT_MESSAGES_LIMIT;
    }
    if (!credits) return true; // First time user
    return credits.chat_messages_used < FREE_CHAT_MESSAGES_LIMIT;
  }, [user, credits, hasActiveSubscription]);

  const remainingFreeItineraries = credits
    ? Math.max(0, FREE_ITINERARIES_LIMIT - credits.free_itineraries_used)
    : FREE_ITINERARIES_LIMIT;

  const remainingCredits = credits?.paid_credits || 0;

  const remainingChatMessages = useCallback(() => {
    if (!credits) return FREE_CHAT_MESSAGES_LIMIT;
    if (hasActiveSubscription()) {
      if (credits.subscription_type === "annual") return Infinity;
      return Math.max(0, MONTHLY_CHAT_MESSAGES_LIMIT - credits.chat_messages_used);
    }
    return Math.max(0, FREE_CHAT_MESSAGES_LIMIT - credits.chat_messages_used);
  }, [credits, hasActiveSubscription]);

  const consumeItineraryCredit = useCallback(async (): Promise<boolean> => {
    if (!user || !credits) return false;

    // Check subscription first
    if (hasActiveSubscription()) {
      return true; // Unlimited or has monthly credits
    }

    // Check if has free itinerary
    if (credits.free_itineraries_used < FREE_ITINERARIES_LIMIT) {
      const { error } = await supabase
        .from("user_credits")
        .update({
          free_itineraries_used: credits.free_itineraries_used + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error consuming free itinerary:", error);
        return false;
      }

      await fetchCredits();
      return true;
    }

    // Use paid credit
    if (credits.paid_credits > 0) {
      const { error } = await supabase
        .from("user_credits")
        .update({
          paid_credits: credits.paid_credits - 1,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error consuming paid credit:", error);
        return false;
      }

      await fetchCredits();
      return true;
    }

    return false;
  }, [user, credits, hasActiveSubscription, fetchCredits]);

  const consumeChatMessage = useCallback(async (): Promise<boolean> => {
    if (!user || !credits) return true; // Allow if no credits record yet

    // Annual subscribers have unlimited
    if (hasActiveSubscription() && credits.subscription_type === "annual") {
      return true;
    }

    const { error } = await supabase
      .from("user_credits")
      .update({
        chat_messages_used: credits.chat_messages_used + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error consuming chat message:", error);
      return false;
    }

    await fetchCredits();
    return true;
  }, [user, credits, hasActiveSubscription, fetchCredits]);

  return {
    credits,
    isLoading,
    hasActiveSubscription: hasActiveSubscription(),
    canGenerateItinerary: canGenerateItinerary(),
    canSendChatMessage: canSendChatMessage(),
    remainingFreeItineraries,
    remainingCredits,
    remainingChatMessages: remainingChatMessages(),
    refetch: fetchCredits,
    consumeItineraryCredit,
    consumeChatMessage,
  };
}
