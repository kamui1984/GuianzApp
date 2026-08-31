-- Ejecutar en Supabase si packages.status debe conservar el estado draft del MVP.
-- approval_status ya existe porque fue creado con el esquema inicial.
do $$
begin
  if not exists (
    select 1
    from pg_enum
    where enumtypid = 'public.approval_status'::regtype
      and enumlabel = 'draft'
  ) then
    alter type public.approval_status add value 'draft';
  end if;
end
$$;

-- Campos adicionales recomendados para el perfil de guías.
alter table public.profiles
  add column if not exists full_name text,
  add column if not exists specialties text,
  add column if not exists languages text,
  add column if not exists professional_card_path text;

-- Tabla de disponibilidad del guía.
create table if not exists public.guide_availability (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references public.profiles(id) on delete cascade,
  available_date date not null,
  start_time text,
  end_time text,
  is_available boolean default true,
  notes text,
  created_at timestamptz default now()
);

-- Tabla de asignación de guías a agencias / paquetes.
create table if not exists public.agency_guide_assignments (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.profiles(id) on delete cascade,
  guide_id uuid not null references public.profiles(id) on delete cascade,
  package_id uuid null,
  status text not null default 'pending',
  created_at timestamptz default now()
);

-- Crear estos buckets desde Storage > New bucket en el dashboard:
-- rnt-documents (privado)
-- package-files (privado)
-- guide-documents (privado)

-- Reglas de ejemplo para RLS (deben revisarse y ajustarse por negocio real):
-- alter table public.profiles enable row level security;
-- create policy "Usuarios ven su propio perfil o admin" on public.profiles
--   for select using (auth.uid() = id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
--
-- alter table public.guide_availability enable row level security;
-- create policy "Guías gestionan su disponibilidad" on public.guide_availability
--   for all using (auth.uid() = guide_id) with check (auth.uid() = guide_id);

-- Crear perfil de administrador con el UID del usuario Auth
INSERT INTO public.profiles (id, role, status, agency_name, created_at)
VALUES (
  'e3d7ff29-a0f3-441d-b82b-270d90a69ab3',
  'admin',
  'approved',
  'Administración GuianzApp',
  now()
)
ON CONFLICT (id) DO UPDATE
SET role = EXCLUDED.role,
    status = EXCLUDED.status,
    agency_name = EXCLUDED.agency_name;

-- Verifica que quedó habilitado
SELECT id, role, status, agency_name
FROM public.profiles
WHERE id = 'e3d7ff29-a0f3-441d-b82b-270d90a69ab3';
