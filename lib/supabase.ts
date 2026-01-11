import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
            professionals: {
                Row: {
                    id: string
                    user_id: string | null
                    name: string
                    email: string
                    specialty: string
                    bio: string | null
                    avatar_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    name: string
                    email: string
                    specialty: string
                    bio?: string | null
                    avatar_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    name?: string
                    email?: string
                    specialty?: string
                    bio?: string | null
                    avatar_url?: string | null
                    created_at?: string
                }
            }
            services: {
                Row: {
                    id: string
                    professional_id: string
                    name: string
                    description: string | null
                    duration_minutes: number
                    price: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    professional_id: string
                    name: string
                    description?: string | null
                    duration_minutes: number
                    price: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    professional_id?: string
                    name?: string
                    description?: string | null
                    duration_minutes?: number
                    price?: number
                    created_at?: string
                }
            }
            appointments: {
                Row: {
                    id: string
                    client_name: string
                    client_email: string
                    client_phone: string | null
                    service_id: string
                    professional_id: string
                    datetime: string
                    status: string
                    payment_status: string
                    cancellation_reason: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    client_name: string
                    client_email: string
                    client_phone?: string | null
                    service_id: string
                    professional_id: string
                    datetime: string
                    status?: string
                    payment_status?: string
                    cancellation_reason?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    client_name?: string
                    client_email?: string
                    client_phone?: string | null
                    service_id?: string
                    professional_id?: string
                    datetime?: string
                    status?: string
                    payment_status?: string
                    cancellation_reason?: string | null
                    created_at?: string
                }
            }
            availability: {
                Row: {
                    id: string
                    professional_id: string
                    day_of_week: number
                    start_time: string
                    end_time: string
                    created_at: string
                }
            }
        }
    }
}