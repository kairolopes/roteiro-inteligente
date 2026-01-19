import { supabase } from "@/integrations/supabase/client";

interface TrackClickParams {
  partnerId: string;
  partnerName: string;
  category: "flights" | "hotels" | "tours";
  component: string;
  destination?: string;
  origin?: string;
}

// Generate or retrieve session ID for anonymous tracking
const getSessionId = (): string => {
  const key = "affiliate_session_id";
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
};

export const trackAffiliateClick = async ({
  partnerId,
  partnerName,
  category,
  component,
  destination,
  origin,
}: TrackClickParams): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const sessionId = getSessionId();

    await supabase.from("affiliate_clicks").insert({
      partner_id: partnerId,
      partner_name: partnerName,
      category,
      component,
      destination,
      origin,
      user_id: user?.id || null,
      session_id: sessionId,
    });
  } catch (error) {
    // Silent fail - don't interrupt user flow for analytics
    console.warn("Failed to track affiliate click:", error);
  }
};

// Hook for components that need to track clicks
export const useAffiliateTracking = () => {
  const track = (params: TrackClickParams) => {
    // Fire and forget - don't await
    trackAffiliateClick(params);
  };

  return { trackClick: track };
};
