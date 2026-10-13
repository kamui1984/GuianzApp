-- ==============================================================================
-- GUIANZAPP - SISTEMA DE CALIFICACIÓN Y EVALUACIÓN SEPARADA DE SERVICIOS
-- Dimensiones independientes: Experiencia del Tour vs Desempeño del Guía
-- ==============================================================================

-- 0. HABILITAR EL VALOR 'turista' EN EL ENUM rol_usuario (Evita error 22P02 al registrar turistas)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'rol_usuario' AND e.enumlabel = 'turista'
    ) THEN
        ALTER TYPE rol_usuario ADD VALUE 'turista';
    END IF;
END $$;

-- 1. TABLA: evaluaciones_servicios (Reseñas con doble dimensión independiente)
CREATE TABLE IF NOT EXISTS public.evaluaciones_servicios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_reserva VARCHAR(100) NOT NULL,
    codigo_reserva VARCHAR(50) NOT NULL,
    id_turista UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    nombre_turista VARCHAR(150) NOT NULL,
    correo_turista VARCHAR(150) NULL,
    
    -- Tour / Paquete Turístico (Oferta de la Agencia)
    id_paquete VARCHAR(100) NOT NULL,
    titulo_paquete VARCHAR(200) NOT NULL,
    id_agencia VARCHAR(100) NOT NULL,
    nombre_agencia VARCHAR(150) NOT NULL,
    
    -- Guía Turístico Asignado
    id_guia VARCHAR(100) NULL,
    nombre_guia VARCHAR(150) NULL,
    
    -- DIMENSIÓN A: Calificación del Tour (1 a 5 estrellas)
    calificacion_tour INT NOT NULL CHECK (calificacion_tour BETWEEN 1 AND 5),
    comentario_tour VARCHAR(500) NULL,
    
    -- DIMENSIÓN B: Calificación del Guía (1 a 5 estrellas)
    calificacion_guia INT NULL CHECK (calificacion_guia BETWEEN 1 AND 5),
    comentario_guia VARCHAR(500) NULL,
    
    -- Derecho de Respuesta Pública
    respuesta_agencia TEXT NULL,
    fecha_respuesta_agencia TIMESTAMPTZ NULL,
    respuesta_guia TEXT NULL,
    fecha_respuesta_guia TIMESTAMPTZ NULL,
    
    -- Moderación Justificada
    reportada_abuso BOOLEAN NOT NULL DEFAULT FALSE,
    motivo_reporte_abuso TEXT NULL,
    estado_moderacion VARCHAR(20) NOT NULL DEFAULT 'visible', -- 'visible', 'en_revision', 'oculta'
    
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW(),
    
    -- Regla: Una única evaluación por reserva completada
    CONSTRAINT uq_evaluacion_por_reserva UNIQUE (id_reserva)
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_evaluaciones_paquete ON public.evaluaciones_servicios(id_paquete);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_guia ON public.evaluaciones_servicios(id_guia);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_agencia ON public.evaluaciones_servicios(id_agencia);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_turista ON public.evaluaciones_servicios(id_turista);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_moderacion ON public.evaluaciones_servicios(estado_moderacion);

COMMENT ON TABLE public.evaluaciones_servicios IS 'Evaluaciones con métricas separadas e independientes para el Tour y para el Guía en GuianzApp';

-- 2. HABILITAR RLS (Row Level Security)
ALTER TABLE public.evaluaciones_servicios ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede consultar reseñas visibles
CREATE POLICY "Reseñas visibles son públicas"
ON public.evaluaciones_servicios FOR SELECT
USING (estado_moderacion = 'visible');

-- Turistas autenticados pueden crear su reseña
CREATE POLICY "Turistas pueden calificar sus reservas"
ON public.evaluaciones_servicios FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Agencias y guías pueden actualizar únicamente su derecho de respuesta
CREATE POLICY "Agencias y guias pueden responder o reportar"
ON public.evaluaciones_servicios FOR UPDATE
USING (auth.uid() IS NOT NULL);
