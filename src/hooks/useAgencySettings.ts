import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface AgencySettings {
  id: string;
  user_id: string;
  agency_name: string | null;
  agency_phone: string | null;
  agency_email: string | null;
  agency_website: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
}

export function useAgencySettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AgencySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setSettings(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("agency_settings" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching agency settings:", error);
      } else {
        setSettings(data as AgencySettings | null);
      }
    } catch (err) {
      console.error("Error in fetchSettings:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = useCallback(async (updates: Partial<AgencySettings>) => {
    if (!user) return false;

    try {
      if (settings) {
        const { error } = await supabase
          .from("agency_settings" as any)
          .update(updates as any)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("agency_settings" as any)
          .insert({ ...updates, user_id: user.id } as any);
        if (error) throw error;
      }
      await fetchSettings();
      return true;
    } catch (err) {
      console.error("Error saving agency settings:", err);
      return false;
    }
  }, [user, settings, fetchSettings]);

  const uploadLogo = useCallback(async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("agency-assets")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("agency-assets")
        .getPublicUrl(filePath);

      const logoUrl = urlData.publicUrl;
      await saveSettings({ logo_url: logoUrl });
      return logoUrl;
    } catch (err) {
      console.error("Error uploading logo:", err);
      return null;
    }
  }, [user, saveSettings]);

  return { settings, isLoading, saveSettings, uploadLogo, refetch: fetchSettings };
}
