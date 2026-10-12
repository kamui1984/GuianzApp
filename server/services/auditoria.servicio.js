const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { clienteSupabaseAdmin } = require('../config/supabase');

const rutaDirectorioData = path.join(__dirname, '..', 'data');
const rutaArchivoAuditoria = path.join(rutaDirectorioData, 'auditoria_admin.json');

if (!fs.existsSync(rutaDirectorioData)) {
  fs.mkdirSync(rutaDirectorioData, { recursive: true });
}

// Datos semilla iniciales para dar contexto y trazabilidad inmediata
const SEMILLAS_AUDITORIA = [
  {
    id: 'aud-seed-1',
    admin_id: 'admin-sistema-master',
    admin_nombre: 'Administrador GuianzApp',
    admin_email: 'admin@guianzapp.co',
    accion: 'aprobar_prestador',
    entidad_tipo: 'prestador',
    entidad_id: 'agencia-bogota-andando',
    entidad_nombre: 'Bogotá Andando S.A.S.',
    motivo: 'Certificado RNT 48920 verificado ante plataforma MinCIT con vigencia 2026.',
    detalles: { rol: 'agencia', rnt: '48920', resolucion: 'Cumple requisitos legales' },
    creado_en: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 'aud-seed-2',
    admin_id: 'admin-sistema-master',
    admin_nombre: 'Administrador GuianzApp',
    admin_email: 'admin@guianzapp.co',
    accion: 'aprobar_prestador',
    entidad_tipo: 'prestador',
    entidad_id: 'guia-carlos-mendoza',
    entidad_nombre: 'Carlos Mendoza Ruiz',
    motivo: 'Tarjeta Profesional TP-0842 expedida por Consejo Profesional de Guías validada.',
    detalles: { rol: 'guia', tarjeta: 'TP-0842', especialidades: ['Historia', 'Centro'] },
    creado_en: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: 'aud-seed-3',
    admin_id: 'admin-sistema-master',
    admin_nombre: 'Administrador GuianzApp',
    admin_email: 'admin@guianzapp.co',
    accion: 'crear_especialidad',
    entidad_tipo: 'especialidad',
    entidad_id: 'esp-bogota-graffiti',
    entidad_nombre: 'Distrito Graffiti & Arte Urbano',
    motivo: 'Incorporación al catálogo transversal solicitado por prestadores de Puente Aranda.',
    detalles: { categoria_macro: 'Historia, Patrimonio y Cultura Urbana' },
    creado_en: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
  }
];

const leerAuditoriaLocal = () => {
  try {
    if (fs.existsSync(rutaArchivoAuditoria)) {
      const contenido = fs.readFileSync(rutaArchivoAuditoria, 'utf8');
      const datos = JSON.parse(contenido || '[]');
      if (Array.isArray(datos) && datos.length > 0) return datos;
    }
  } catch (error) {
    console.warn('Error al leer auditoria_admin.json:', error.message);
  }
  // Guardar semillas iniciales si está vacío
  guardarAuditoriaLocal(SEMILLAS_AUDITORIA);
  return SEMILLAS_AUDITORIA;
};

const guardarAuditoriaLocal = (lista) => {
  try {
    fs.writeFileSync(rutaArchivoAuditoria, JSON.stringify(lista, null, 2), 'utf8');
  } catch (error) {
    console.warn('Error al guardar en auditoria_admin.json:', error.message);
  }
};

class AuditoriaServicio {
  /**
   * Registrar evento administrativo inmutable
   */
  async registrarEvento({
    adminId = null,
    adminNombre = 'Administrador de Sistema',
    adminEmail = null,
    accion,
    entidadTipo,
    entidadId,
    entidadNombre = '',
    motivo = '',
    detalles = {}
  }) {
    const nuevoEvento = {
      id: crypto.randomUUID(),
      admin_id: adminId,
      admin_nombre: adminNombre,
      admin_email: adminEmail,
      accion,
      entidad_tipo: entidadTipo,
      entidad_id: String(entidadId),
      entidad_nombre: entidadNombre,
      motivo: motivo || 'Decisión administrativa registrada en plataforma',
      detalles: detalles || {},
      creado_en: new Date().toISOString()
    };

    // 1. Guardar en JSON local para redundancia inmediata
    const listaActual = leerAuditoriaLocal();
    listaActual.unshift(nuevoEvento);
    guardarAuditoriaLocal(listaActual);

    // 2. Intentar guardar en Supabase si la tabla existe
    try {
      await clienteSupabaseAdmin
        .from('auditoria_admin')
        .insert({
          id: nuevoEvento.id,
          admin_id: nuevoEvento.admin_id,
          admin_nombre: nuevoEvento.admin_nombre,
          admin_email: nuevoEvento.admin_email,
          accion: nuevoEvento.accion,
          entidad_tipo: nuevoEvento.entidad_tipo,
          entidad_id: nuevoEvento.entidad_id,
          entidad_nombre: nuevoEvento.entidad_nombre,
          motivo: nuevoEvento.motivo,
          detalles: nuevoEvento.detalles,
          creado_en: nuevoEvento.creado_en
        });
    } catch (e) {
      // Fallback silencioso si la tabla no está creada aún en Supabase
    }

    return nuevoEvento;
  }

  /**
   * Listar eventos de auditoría con filtros
   */
  async listarEventos({ accion = 'todos', entidadTipo = 'todos', busqueda = '', limite = 50 } = {}) {
    let lista = [];

    try {
      const { data, error } = await clienteSupabaseAdmin
        .from('auditoria_admin')
        .select('*')
        .order('creado_en', { ascending: false })
        .limit(limite);

      if (!error && data && data.length > 0) {
        lista = data;
      } else {
        lista = leerAuditoriaLocal();
      }
    } catch (e) {
      lista = leerAuditoriaLocal();
    }

    if (!lista || lista.length === 0) {
      lista = leerAuditoriaLocal();
    }

    const busquedaNorm = (busqueda || '').toLowerCase().trim();

    return lista.filter((evento) => {
      if (accion !== 'todos' && evento.accion !== accion) return false;
      if (entidadTipo !== 'todos' && evento.entidad_tipo !== entidadTipo) return false;

      if (busquedaNorm) {
        const texto = `${evento.admin_nombre || ''} ${evento.entidad_nombre || ''} ${evento.accion || ''} ${evento.motivo || ''} ${evento.entidad_id || ''}`.toLowerCase();
        if (!texto.includes(busquedaNorm)) return false;
      }

      return true;
    });
  }
}

module.exports = new AuditoriaServicio();
