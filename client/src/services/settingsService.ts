import { supabase } from "@/supabase/client";
import type { NotificationSettings } from "@/types";

export const settingsService = {
  async getNotifications(userId: string): Promise<NotificationSettings | null> {
    const { data, error } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) return null;
    return data as NotificationSettings;
  },

  async upsertNotifications(
    userId: string,
    settings: Partial<Omit<NotificationSettings, "id" | "user_id">>
  ): Promise<void> {
    const { error } = await supabase
      .from("notification_settings")
      .upsert({ user_id: userId, ...settings });

    if (error) throw error;
  },
};
