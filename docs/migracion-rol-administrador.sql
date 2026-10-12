-- ==============================================================================
-- GUIANZAPP - SCRIPT DE MIGRACIÓN SQL PARA EL ROL ADMINISTRADOR
-- Módulos: Auditoría y Trazabilidad, Reportes y Reclamaciones,
-- Control del Catálogo Transversal de Especialidades y Gestión de Cuentas
-- ==============================================================================

-- 1. TABLA: auditoria_admin (Registro inmutable de decisiones y acciones administrativas)
CREATE TABLE IF NOT EXISTS public.auditoria_admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_nombre VARCHAR(150) NOT NULL DEFAULT 'Administrador de Sistema',
    admin_email VARCHAR(150) NULL,
    accion VARCHAR(80) NOT NULL, -- 'aprobar_prestador', 'rechazar_prestador', 'suspender_prestador', 'reactivar_prestador', 'solicitar_correccion', 'bloquear_usuario', 'reactivar_usuario', 'crear_especialidad', 'actualizar_especialidad', 'cambiar_estado_especialidad', 'atender_reporte'
    entidad_tipo VARCHAR(50) NOT NULL, -- 'prestador', 'usuario', 'especialidad', 'reporte', 'sistema'
    entidad_id VARCHAR(100) NOT NULL,
    entidad_nombre VARCHAR(200) NULL,
    motivo TEXT NULL,
    detalles JSONB DEFAULT '{}'::jsonb,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auditoria_admin_fecha ON public.auditoria_admin(creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_admin_accion ON public.auditoria_admin(accion);
CREATE INDEX IF NOT EXISTS idx_auditoria_admin_entidad ON public.auditoria_admin(entidad_tipo, entidad_id);

COMMENT ON TABLE public.auditoria_admin IS 'Bitácora de auditoría para trazabilidad legal de decisiones administrativas en GuianzApp';

-- 2. TABLA: reportes_reclamaciones (Gestión y mediación de incidencias turísticas)
CREATE TABLE IF NOT EXISTS public.reportes_reclamaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_caso VARCHAR(30) NOT NULL UNIQUE, -- '#REC-000101'
    tipo_reportante VARCHAR(30) NOT NULL, -- 'turista', 'agencia', 'guia'
    id_reportante UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    nombre_reportante VARCHAR(150) NOT NULL,
    correo_reportante VARCHAR(150) NOT NULL,
    rol_afectado VARCHAR(30) NOT NULL, -- 'agencia', 'guia', 'turista'
    nombre_afectado VARCHAR(150) NOT NULL,
    id_afectado VARCHAR(100) NULL,
    codigo_reserva VARCHAR(50) NULL,
    motivo_categoria VARCHAR(100) NOT NULL, -- 'incumplimiento_horario', 'no_presentacion', 'cobro_no_pactado', 'conducta_inapropiada', 'calidad_guianza', 'fuerza_mayor', 'otro'
    descripcion TEXT NOT NULL,
    evidencias TEXT[] DEFAULT '{}',
    estado VARCHAR(30) NOT NULL DEFAULT 'recibido', -- 'recibido', 'en_revision', 'resuelto', 'cerrado'
    prioridad VARCHAR(20) NOT NULL DEFAULT 'media', -- 'baja', 'media', 'alta'
    acciones_tomadas TEXT NULL,
    responsable_remitido VARCHAR(150) NULL,
    resolucion_final TEXT NULL,
    historial_seguimiento JSONB DEFAULT '[]'::jsonb,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reportes_estado ON public.reportes_reclamaciones(estado);
CREATE INDEX IF NOT EXISTS idx_reportes_codigo ON public.reportes_reclamaciones(codigo_caso);
CREATE INDEX IF NOT EXISTS idx_reportes_reserva ON public.reportes_reclamaciones(codigo_reserva);

COMMENT ON TABLE public.reportes_reclamaciones IS 'Reclamaciones y reportes entre usuarios, agencias y guías con trazabilidad administrativa';

-- 3. EXTENSIÓN TABLA especialidades (Garantizar estado activo/inactivo)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'especialidades') THEN
        ALTER TABLE public.especialidades ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;
        ALTER TABLE public.especialidades ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 4. POLÍTICAS RLS (Seguridad a Nivel de Fila)
ALTER TABLE public.auditoria_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes_reclamaciones ENABLE ROW LEVEL SECURITY;

-- Política de auditoría: Solo administradores pueden consultar
CREATE POLICY "Administradores pueden consultar auditoria"
ON public.auditoria_admin FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE public.perfiles.id = auth.uid()
        AND public.perfiles.rol = 'administrador'
    )
);

-- Reportes: Usuarios pueden ver sus propios reportes; administradores pueden ver todos
CREATE POLICY "Usuarios ven sus propios reportes"
ON public.reportes_reclamaciones FOR SELECT
USING (
    auth.uid() = id_reportante
    OR EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE public.perfiles.id = auth.uid()
        AND public.perfiles.rol = 'administrador'
    )
);

CREATE POLICY "Administradores pueden actualizar reportes"
ON public.reportes_reclamaciones FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE public.perfiles.id = auth.uid()
        AND public.perfiles.rol = 'administrador'
    )
);
