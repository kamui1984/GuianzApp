const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const urlSupabase = process.env.SUPABASE_URL;
const claveAnonima = process.env.SUPABASE_ANON_KEY;
const claveServicio = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!urlSupabase || !claveAnonima || !claveServicio) {
  throw new Error('Configura SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY en el archivo .env');
}

// Cliente público para autenticación y operaciones estándar
const clienteSupabaseAuth = createClient(urlSupabase, claveAnonima);

// Cliente administrador con privilegios de rol de servicio (bypasea RLS cuando sea requerido)
const clienteSupabaseAdmin = createClient(urlSupabase, claveServicio);

module.exports = {
  clienteSupabaseAuth,
  clienteSupabaseAdmin
};
