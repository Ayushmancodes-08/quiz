// Supabase Database Types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          display_name: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          display_name: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          created_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          author_id: string
          title: string
          topic: string
          difficulty: 'easy' | 'medium' | 'hard'
          questions: Json
          created_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          topic: string
          difficulty: 'easy' | 'medium' | 'hard'
          questions: Json
          created_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          topic?: string
          difficulty?: 'easy' | 'medium' | 'hard'
          questions?: Json
          created_at?: string
        }
      }
      quiz_attempts: {
        Row: {
          id: string
          quiz_id: string
          quiz_title: string
          user_id: string
          user_name: string
          student_name: string
          registration_number: string
          author_id: string
          answers: Json
          score: number
          started_at: string
          completed_at: string
          violations: number
          is_flagged: boolean
          created_at: string
        }
        Insert: {
          id: string
          quiz_id: string
          quiz_title: string
          user_id: string
          user_name: string
          student_name: string
          registration_number: string
          author_id: string
          answers: Json
          score: number
          started_at: string
          completed_at: string
          violations: number
          is_flagged: boolean
          created_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          quiz_title?: string
          user_id?: string
          user_name?: string
          student_name?: string
          registration_number?: string
          author_id?: string
          answers?: Json
          score?: number
          started_at?: string
          completed_at?: string
          violations?: number
          is_flagged?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
