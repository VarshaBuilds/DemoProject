import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          role: 'guest' | 'user' | 'admin';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          role?: 'guest' | 'user' | 'admin';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          role?: 'guest' | 'user' | 'admin';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          title: string;
          description: string;
          tags: string[];
          author_id: string;
          accepted_answer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          tags?: string[];
          author_id: string;
          accepted_answer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          tags?: string[];
          author_id?: string;
          accepted_answer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      answers: {
        Row: {
          id: string;
          question_id: string;
          content: string;
          author_id: string;
          is_accepted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          content: string;
          author_id: string;
          is_accepted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          content?: string;
          author_id?: string;
          is_accepted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          user_id: string;
          answer_id: string;
          vote_type: 'up' | 'down';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          answer_id: string;
          vote_type: 'up' | 'down';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          answer_id?: string;
          vote_type?: 'up' | 'down';
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          message: string;
          question_id: string | null;
          answer_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          message: string;
          question_id?: string | null;
          answer_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          message?: string;
          question_id?: string | null;
          answer_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
  };
}