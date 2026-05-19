export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          avatar_url: string | null;
          bio: string | null;
          language: string;
          theme: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          language?: string;
          theme?: string;
        };
        Update: {
          name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          language?: string;
          theme?: string;
          updated_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
        };
        Update: {
          name?: string;
          color?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          subject_id: string | null;
          subject_name: string;
          priority: "Alta" | "Média" | "Baixa";
          status: "Não iniciada" | "Em Andamento" | "Concluída" | "Passou do Prazo";
          progress: number;
          due_date: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
          notes: string | null;
          link: string | null;
          sector: string | null;
          origin: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          subject_id?: string | null;
          subject_name: string;
          priority?: "Alta" | "Média" | "Baixa";
          status?: "Não iniciada" | "Em Andamento" | "Concluída" | "Passou do Prazo";
          progress?: number;
          due_date?: string | null;
          notes?: string | null;
          link?: string | null;
          sector?: string | null;
          origin?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          subject_id?: string | null;
          subject_name?: string;
          priority?: "Alta" | "Média" | "Baixa";
          status?: "Não iniciada" | "Em Andamento" | "Concluída" | "Passou do Prazo";
          progress?: number;
          due_date?: string | null;
          updated_at?: string;
          completed_at?: string | null;
          notes?: string | null;
          link?: string | null;
          sector?: string | null;
          origin?: string | null;
        };
      };
      imports: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_size: number | null;
          imported_count: number;
          file_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          file_size?: number | null;
          imported_count: number;
          file_type: string;
        };
        Update: Record<string, never>;
      };
      notification_settings: {
        Row: {
          id: string;
          user_id: string;
          notify_3_days: boolean;
          notify_2_days: boolean;
          notify_1_day: boolean;
          sound_enabled: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          notify_3_days?: boolean;
          notify_2_days?: boolean;
          notify_1_day?: boolean;
          sound_enabled?: boolean;
        };
        Update: {
          notify_3_days?: boolean;
          notify_2_days?: boolean;
          notify_1_day?: boolean;
          sound_enabled?: boolean;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
