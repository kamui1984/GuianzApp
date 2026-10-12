-- ==============================================================================
-- MIGRACIÓN DE BASE DE DATOS: TÉRMINOS, CONDICIONES Y EVIDENCIA LEGAL DE RESERVAS
-- Sistema GuianzApp — Cumplimiento Ley 1480/2011, Ley 2068/2020 y Ley 300/1996
-- ==============================================================================

-- 1. EXTENSIÓN DE TABLA: perfiles (Aceptación de Términos y Habeas Data)
ALTER TABLE public.perfiles
ADD COLUMN IF NOT EXISTS terminos_aceptados BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fecha_aceptacion_terminos TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS version_terminos VARCHAR(20) DEFAULT 'v1.0-co';

COMMENT ON COLUMN public.perfiles.terminos_aceptados IS 'Indica aceptación explícita de T&C y política de datos según Ley 1581 de 2012';
COMMENT ON COLUMN public.perfiles.version_terminos IS 'Versión contractual aceptada (ej: v1.0-co)';

-- 2. EXTENSIÓN DE TABLAS: paquetes_tours y paquetes (Condiciones Estructuradas)
ALTER TABLE public.paquetes_tours
ADD COLUMN IF NOT EXISTS que_no_incluye TEXT NULL,
ADD COLUMN IF NOT EXISTS declaracion_responsabilidad BOOLEAN DEFAULT TRUE;

ALTER TABLE public.paquetes
ADD COLUMN IF NOT EXISTS que_incluye TEXT NULL,
ADD COLUMN IF NOT EXISTS que_no_incluye TEXT NULL,
ADD COLUMN IF NOT EXISTS punto_encuentro TEXT NULL,
ADD COLUMN IF NOT EXISTS declaracion_responsabilidad BOOLEAN DEFAULT TRUE;

-- 3. TABLA: reservas (Registro Legal, Trazabilidad y Cadena de Custodia)
CREATE TABLE IF NOT EXISTS public.reservas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_reserva VARCHAR(30) NOT NULL UNIQUE,
    id_paquete TEXT NOT NULL,
    id_agencia UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_agencia VARCHAR(200) NOT NULL,
    rnt_agencia VARCHAR(50) NOT NULL,
    
    -- Turista / Contratante
    id_turista UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    nombre_titular VARCHAR(200) NOT NULL,
    correo_contacto VARCHAR(200) NOT NULL,
    telefono_contacto VARCHAR(50) NULL,
    
    -- Parámetros del Servicio
    fecha_reserva DATE NOT NULL,
    hora_reserva VARCHAR(20) NOT NULL,
    cantidad_personas INT NOT NULL DEFAULT 1,
    precio_total NUMERIC(12,2) NOT NULL DEFAULT 0,
    duracion VARCHAR(50) NOT NULL DEFAULT '3.5 horas',
    titulo_paquete VARCHAR(200) NOT NULL,
    
    -- Guía Profesional Asignado por la Agencia
    id_guia_asignado TEXT NULL,
    nombre_guia_asignado VARCHAR(200) NULL,
    rnt_guia VARCHAR(50) NULL,
    fecha_asignacion_guia TIMESTAMPTZ NULL,
    
    -- Estados y Trazabilidad Contractual
    estado VARCHAR(50) NOT NULL DEFAULT 'en espera de confirmacion', -- 'en espera de confirmacion', 'confirmada', 'cancelada'
    aceptacion_terminos_turista BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_aceptacion_terminos TIMESTAMPTZ DEFAULT NOW(),
    version_terminos VARCHAR(20) NOT NULL DEFAULT 'v1.0-co',
    
    -- Snapshot Inmutable de Condiciones al Momento de Reservar
    condiciones_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Registro Cronológico de Auditoría / Historial de Evidencias
    historial_evidencias JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para Búsqueda Rápida y Auditorías
CREATE INDEX IF NOT EXISTS idx_reservas_agencia ON public.reservas(id_agencia);
CREATE INDEX IF NOT EXISTS idx_reservas_guia ON public.reservas(id_guia_asignado);
CREATE INDEX IF NOT EXISTS idx_reservas_turista ON public.reservas(id_turista);
CREATE INDEX IF NOT EXISTS idx_reservas_codigo ON public.reservas(codigo_reserva);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON public.reservas(estado);

-- ==============================================================================
-- 4. POLÍTICAS DE ACCESO (Row Level Security - RLS)
-- ==============================================================================
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Agencias pueden ver sus propias reservas
CREATE POLICY "Agencias pueden ver sus reservas"
ON public.reservas FOR SELECT
USING (auth.uid() = id_agencia);

-- Agencias pueden actualizar (confirmar o asignar guía) sus reservas
CREATE POLICY "Agencias pueden gestionar sus reservas"
ON public.reservas FOR UPDATE
USING (auth.uid() = id_agencia);

-- Turistas pueden ver las reservas realizadas con su cuenta
CREATE POLICY "Turistas pueden ver sus reservas"
ON public.reservas FOR SELECT
USING (auth.uid() = id_turista);
