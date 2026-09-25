import { createClient } from "@supabase/supabase-js";
import project from "../../config/supabase.public.json";
// Overrides must be supplied together to avoid mixing projects.
const override = import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const url = override ? import.meta.env.VITE_SUPABASE_URL : project.url;
const key = override ? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY : project.publishableKey;
export const configurationError =
  !url || !key
    ? "Para cambiar de proyecto, configurá VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY juntas en .env.local."
    : null;
export const supabase = configurationError ? null : createClient(url, key);
