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

-- Crear estos buckets desde Storage > New bucket en el dashboard:
-- rnt-documents (privado)
-- package-files (privado)
