/**
 * Database definitions for Supabase PostgreSQL tables.
 * Used for type-safe database queries.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          slug: string;
          title: string;
          short_description: string;
          overview: string | null;
          category: string;
          featured: boolean;
          status: string;
          thumbnail_url: string | null;
          demo_url: string | null;
          github_url: string | null;
          github_repo_id: number | null;
          github_repo_full_name: string | null;
          github_stars: number;
          github_forks: number;
          github_primary_language: string | null;
          github_topics: Json;
          github_last_pushed_at: string | null;
          github_synced_at: string | null;
          visible: boolean;
          sort_order: number;
          features: Json;
          technical_details: Json;
          challenges_decisions: Json;
          hero_media: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          short_description: string;
          overview?: string | null;
          category: string;
          featured?: boolean;
          status?: string;
          thumbnail_url?: string | null;
          demo_url?: string | null;
          github_url?: string | null;
          github_repo_id?: number | null;
          github_repo_full_name?: string | null;
          github_stars?: number;
          github_forks?: number;
          github_primary_language?: string | null;
          github_topics?: Json;
          github_last_pushed_at?: string | null;
          github_synced_at?: string | null;
          visible?: boolean;
          sort_order?: number;
          features?: Json;
          technical_details?: Json;
          challenges_decisions?: Json;
          hero_media?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          short_description?: string;
          overview?: string | null;
          category?: string;
          featured?: boolean;
          status?: string;
          thumbnail_url?: string | null;
          demo_url?: string | null;
          github_url?: string | null;
          github_repo_id?: number | null;
          github_repo_full_name?: string | null;
          github_stars?: number;
          github_forks?: number;
          github_primary_language?: string | null;
          github_topics?: Json;
          github_last_pushed_at?: string | null;
          github_synced_at?: string | null;
          visible?: boolean;
          sort_order?: number;
          features?: Json;
          technical_details?: Json;
          challenges_decisions?: Json;
          hero_media?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_images: {
        Row: {
          id: string;
          project_id: string;
          storage_path: string;
          alt_text: string | null;
          caption: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          storage_path: string;
          alt_text?: string | null;
          caption?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          storage_path?: string;
          alt_text?: string | null;
          caption?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      technologies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          category?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      project_technologies: {
        Row: {
          project_id: string;
          technology_id: string;
          sort_order: number;
        };
        Insert: {
          project_id: string;
          technology_id: string;
          sort_order?: number;
        };
        Update: {
          project_id?: string;
          technology_id?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "project_technologies_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_technologies_technology_id_fkey";
            columns: ["technology_id"];
            isOneToOne: false;
            referencedRelation: "technologies";
            referencedColumns: ["id"];
          }
        ];
      };
      experience: {
        Row: {
          id: string;
          role_title: string;
          company_name: string;
          location: string;
          timeframe: string;
          start_date: string | null;
          end_date: string | null;
          is_current: boolean;
          summary: string;
          achievements: Json;
          technologies: Json;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          role_title: string;
          company_name: string;
          location?: string;
          timeframe: string;
          start_date?: string | null;
          end_date?: string | null;
          is_current?: boolean;
          summary: string;
          achievements?: Json;
          technologies?: Json;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role_title?: string;
          company_name?: string;
          location?: string;
          timeframe?: string;
          start_date?: string | null;
          end_date?: string | null;
          is_current?: boolean;
          summary?: string;
          achievements?: Json;
          technologies?: Json;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      skills: {
        Row: {
          id: string;
          name: string;
          category_name: string;
          focus: string;
          context: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category_name: string;
          focus: string;
          context: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category_name?: string;
          focus?: string;
          context?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      links: {
        Row: {
          id: string;
          title: string;
          category: string;
          handle: string;
          url: string;
          description: string;
          type: string;
          verified: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category: string;
          handle: string;
          url: string;
          description: string;
          type?: string;
          verified?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          category?: string;
          handle?: string;
          url?: string;
          description?: string;
          type?: string;
          verified?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      github_repositories: {
        Row: {
          id: number;
          name: string;
          full_name: string;
          owner_login: string;
          html_url: string;
          description: string | null;
          homepage: string | null;
          language: string | null;
          topics: Json;
          stars_count: number;
          forks_count: number;
          open_issues_count: number;
          default_branch: string;
          is_private: boolean;
          is_archived: boolean;
          pushed_at: string | null;
          created_at_github: string | null;
          updated_at_github: string | null;
          synced_at: string;
          project_id: string | null;
          visible: boolean;
        };
        Insert: {
          id: number;
          name: string;
          full_name: string;
          owner_login: string;
          html_url: string;
          description?: string | null;
          homepage?: string | null;
          language?: string | null;
          topics?: Json;
          stars_count?: number;
          forks_count?: number;
          open_issues_count?: number;
          default_branch?: string;
          is_private?: boolean;
          is_archived?: boolean;
          pushed_at?: string | null;
          created_at_github?: string | null;
          updated_at_github?: string | null;
          synced_at?: string;
          project_id?: string | null;
          visible?: boolean;
        };
        Update: {
          id?: number;
          name?: string;
          full_name?: string;
          owner_login?: string;
          html_url?: string;
          description?: string | null;
          homepage?: string | null;
          language?: string | null;
          topics?: Json;
          stars_count?: number;
          forks_count?: number;
          open_issues_count?: number;
          default_branch?: string;
          is_private?: boolean;
          is_archived?: boolean;
          pushed_at?: string | null;
          created_at_github?: string | null;
          updated_at_github?: string | null;
          synced_at?: string;
          project_id?: string | null;
          visible?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "github_repositories_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
