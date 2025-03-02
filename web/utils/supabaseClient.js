// web/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

export const getSupabaseClient = () => {
  // This function should only run on the client side
  if (typeof window === 'undefined') {
    return null;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials missing - check your environment variables');
    return null;
  }
  
  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return null;
  }
};
