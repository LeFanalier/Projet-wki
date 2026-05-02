// js/supabase-config.js
const SUPABASE_URL = 'https://mjsqolvnsxcmmgwtlrsz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nq5yEwJlkmKXz63xOLfPpw_KxC5-7La';

// On change 'const supabase' par 'const supabaseClient'
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);