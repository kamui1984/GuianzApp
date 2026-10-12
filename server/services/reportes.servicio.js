const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { clienteSupabaseAdmin } = require('../config/supabase');

const rutaDirectorioData = path.join(__dirname, '..', 'data');
const rutaArchivoReportes = path.join(rutaDirectorioData, 'reportes_reclamaciones.json');

if (!fs.existsSync(rutaDirectorioData)) {
  fs.mkdirSync(rutaDirectorioData, { recursive: true });
}

// Casos semilla representativos para demostración inmediata y pruebas
const CASOS_SEMILLA = [
  {
    id: 'rep-seed-1',
    codigo_caso: '#REC-000101',
    tipo_reportante: 'turista',
    id_reportante: 'turista-demostracion-1',
    nombre_reportante: 'Andrea Pinzón Gómez',
    correo_reportante: 'andrea.pinzon@gmail.com',
    rol_afectado: 'agencia',
    nombre_afectado: 'Explora Cerros Bogotá',
    id_afectado: 'agencia-explora-cerros',
    codigo_reserva: '#RES-000012',
    titulo_tour: 'Sendero de los Cerros Orientales & Mirador Monserrate',
    motivo_categoria: 'incumplimiento_horario',
    motivo_legible: 'Retraso de más de 45 minutos en punto de encuentro',
    descripcion: 'Llegamos a las 7:45 am al punto de encuentro acordado en la estación Funicular. La salida estaba programada a las 8:00 am pero el grupo no partió hasta las 8:50 am sin aviso previo por chat.',
    evidencias: ['https://images.unsplash.com/photo-1589561084283-930aa7b1ce50?auto=format&fit=crop&w=400&q=80'],
    estado: 'en_revision', // 'recibido', 'en_revision', 'resuelto', 'cerrado'
    prioridad: 'media',
    acciones_tomadas: 'Se notificó a Explora Cerros Bogotá solicitando informe de la operación de la salida. La agencia reportó cierre vial temporal en la Av. Circunvalar.',
    responsable_remitido: 'Coordinador Operativo Explora Cerros Bogotá',
    resolucion_final: '',
    historial_seguimiento: [
      {
        fecha: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
        autor: 'Andrea Pinzón Gómez',
        evento: 'Reclamación interpuesta por el turista a través del portal de GuianzApp.'
      },
      {
        fecha: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
        autor: 'Administrador GuianzApp',
        evento: 'Caso admitido a revisión formal. Se solicitó explicación y trazabilidad a la agencia.'
      }
    ],
    creado_en: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    actualizado_en: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString()
  },
  {
    id: 'rep-seed-2',
    codigo_caso: '#REC-000102',
    tipo_reportante: 'guia',
    id_reportante: 'guia-demostracion-2',
    nombre_reportante: 'Carlos Mendoza Ruiz',
    correo_reportante: 'carlos.mendoza@guianzapp.co',
    rol_afectado: 'agencia',
    nombre_afectado: 'Bogotá Andando S.A.S.',
    id_afectado: 'agencia-bogota-andando',
    codigo_reserva: '#RES-000019',
    titulo_tour: 'Bogotá Colonial & Secretos de La Candelaria',
    motivo_categoria: 'cambio_unilateral_itinerario',
    motivo_legible: 'Ampliación de grupo por encima del cupo acordado',
    descripcion: 'La orden de servicio indicaba un aforo máximo de 10 turistas para guianza de patrimonio. Al iniciar el recorrido se sumaron 5 personas adicionales sin haber sido concertado previamente con el guía.',
    evidencias: [],
    estado: 'recibido',
    prioridad: 'alta',
    acciones_tomadas: 'Pendiente de comunicación con el representante legal de la agencia.',
    responsable_remitido: 'Administración GuianzApp',
    resolucion_final: '',
    historial_seguimiento: [
      {
        fecha: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        autor: 'Carlos Mendoza Ruiz',
        evento: 'Reporte ingresado por el guía profesional de turismo.'
      }
    ],
    creado_en: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    actualizado_en: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: 'rep-seed-3',
    codigo_caso: '#REC-000098',
    tipo_reportante: 'turista',
    id_reportante: 'turista-demostracion-3',
    nombre_reportante: 'Felipe Restrepo',
    correo_reportante: 'felipe.restrepo@outlook.com',
    rol_afectado: 'agencia',
    nombre_afectado: 'Muros Vivos Travel',
    id_afectado: 'agencia-muros-vivos',
    codigo_reserva: '#RES-000008',
    titulo_tour: 'Distrito Graffiti & Arte Urbano Capitalino',
    motivo_categoria: 'fuerza_mayor',
    motivo_legible: 'Cancelación por lluvias torrenciales y reprogramación',
    descripcion: 'El tour no pudo culminar en Puente Aranda debido a una tormenta eléctrica.',
    evidencias: [],
    estado: 'resuelto',
    prioridad: 'baja',
    acciones_tomadas: 'La agencia acordó con el turista reprogramación para el domingo siguiente y entrega de souvenir artístico.',
    responsable_remitido: 'Muros Vivos Travel y Turista',
    resolucion_final: 'Ambas partes firmaron acuerdo de reprogramación satisfactoria del servicio.',
    historial_seguimiento: [
      {
        fecha: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        autor: 'Felipe Restrepo',
        evento: 'Reporte inicial presentado.'
      },
      {
        fecha: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        autor: 'Administrador GuianzApp',
        evento: 'Mediación facilitada en plataforma.'
      },
      {
        fecha: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        autor: 'Administrador GuianzApp',
        evento: 'Caso cerrado con conformidad expresa del turista.'
      }
    ],
    creado_en: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    actualizado_en: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];

const leerReportesLocal = () => {
  try {
    if (fs.existsSync(rutaArchivoReportes)) {
      const contenido = fs.readFileSync(rutaArchivoReportes, 'utf8');
      const datos = JSON.parse(contenido || '[]');
      if (Array.isArray(datos) && datos.length > 0) return datos;
    }
  } catch (error) {
    console.warn('Error al leer reportes_reclamaciones.json:', error.message);
  }
  guardarReportesLocal(CASOS_SEMILLA);
  return CASOS_SEMILLA;
};

const guardarReportesLocal = (lista) => {
  try {
    fs.writeFileSync(rutaArchivoReportes, JSON.stringify(lista, null, 2), 'utf8');
  } catch (error) {
    console.warn('Error al guardar en reportes_reclamaciones.json:', error.message);
  }
};

class ReportesServicio {
  async listarReportes({ estado = 'todos', motivo = 'todos', busqueda = '', prioridad = 'todos' } = {}) {
    let lista = [];
    try {
      const { data, error } = await clienteSupabaseAdmin
        .from('reportes_reclamaciones')
        .select('*')
        .order('actualizado_en', { ascending: false });

      if (!error && data && data.length > 0) {
        lista = data;
      } else {
        lista = leerReportesLocal();
      }
    } catch (e) {
      lista = leerReportesLocal();
    }

    if (!lista || lista.length === 0) {
      lista = leerReportesLocal();
    }

    const busquedaNorm = (busqueda || '').toLowerCase().trim();

    return lista.filter((rep) => {
      if (estado !== 'todos' && rep.estado !== estado) return false;
      if (motivo !== 'todos' && rep.motivo_categoria !== motivo) return false;
      if (prioridad !== 'todos' && rep.prioridad !== prioridad) return false;

      if (busquedaNorm) {
        const texto = `${rep.codigo_caso || ''} ${rep.nombre_reportante || ''} ${rep.nombre_afectado || ''} ${rep.codigo_reserva || ''} ${rep.descripcion || ''} ${rep.motivo_legible || ''}`.toLowerCase();
        if (!texto.includes(busquedaNorm)) return false;
      }

      return true;
    });
  }

  async obtenerReportePorId(id) {
    const lista = leerReportesLocal();
    return lista.find((r) => r.id === id || r.codigo_caso === id) || null;
  }

  async crearReporte(datos, usuario = {}) {
    const lista = leerReportesLocal();
    const consecutivo = String(lista.length + 1).padStart(6, '0');
    const codigoCaso = `#REC-${consecutivo}`;
    const ahoraIso = new Date().toISOString();

    const nuevoReporte = {
      id: crypto.randomUUID(),
      codigo_caso: codigoCaso,
      tipo_reportante: datos.tipoReportante || usuario.rol || 'turista',
      id_reportante: usuario.id || null,
      nombre_reportante: datos.nombreReportante || usuario.nombreCompleto || 'Usuario de GuianzApp',
      correo_reportante: datos.correoReportante || usuario.email || 'contacto@guianzapp.co',
      rol_afectado: datos.rolAfectado || 'agencia',
      nombre_afectado: datos.nombreAfectado || 'Prestador Turístico',
      id_afectado: datos.idAfectado || null,
      codigo_reserva: datos.codigoReserva || null,
      titulo_tour: datos.tituloTour || 'Tour en Bogotá',
      motivo_categoria: datos.motivoCategoria || 'otro',
      motivo_legible: datos.motivoLegible || datos.motivoCategoria || 'Reporte de servicio',
      descripcion: datos.descripcion || '',
      evidencias: Array.isArray(datos.evidencias) ? datos.evidencias : [],
      estado: 'recibido',
      prioridad: datos.prioridad || 'media',
      acciones_tomadas: 'Reclamación registrada en GuianzApp. Asignada para revisión administrativa.',
      responsable_remitido: 'Administración GuianzApp',
      resolucion_final: '',
      historial_seguimiento: [
        {
          fecha: ahoraIso,
          autor: datos.nombreReportante || 'Usuario',
          evento: 'Caso radicado formalmente en la plataforma.'
        }
      ],
      creado_en: ahoraIso,
      actualizado_en: ahoraIso
    };

    lista.unshift(nuevoReporte);
    guardarReportesLocal(lista);

    try {
      await clienteSupabaseAdmin.from('reportes_reclamaciones').insert(nuevoReporte);
    } catch (e) {
      // Fallback
    }

    return nuevoReporte;
  }

  async actualizarSeguimiento(id, { estado, accionesTomadas, responsableRemitido, resolucionFinal, notaAdmin, adminInfo }) {
    const lista = leerReportesLocal();
    const indice = lista.findIndex((r) => r.id === id || r.codigo_caso === id);

    if (indice === -1) {
      throw new Error('No se encontró el reporte especificado.');
    }

    const reporte = { ...lista[indice] };
    const ahoraIso = new Date().toISOString();
    const historial = Array.isArray(reporte.historial_seguimiento) ? [...reporte.historial_seguimiento] : [];

    if (estado && estado !== reporte.estado) {
      historial.push({
        fecha: ahoraIso,
        autor: adminInfo?.nombre || 'Administrador GuianzApp',
        evento: `Cambio de estado administrativo: de "${reporte.estado}" a "${estado}".`
      });
      reporte.estado = estado;
    }

    if (notaAdmin) {
      historial.push({
        fecha: ahoraIso,
        autor: adminInfo?.nombre || 'Administrador GuianzApp',
        evento: `Nota administrativa: ${notaAdmin}`
      });
    }

    if (accionesTomadas) reporte.acciones_tomadas = accionesTomadas;
    if (responsableRemitido) reporte.responsable_remitido = responsableRemitido;
    if (resolucionFinal) reporte.resolucion_final = resolucionFinal;
    reporte.actualizado_en = ahoraIso;
    reporte.historial_seguimiento = historial;

    lista[indice] = reporte;
    guardarReportesLocal(lista);

    try {
      await clienteSupabaseAdmin
        .from('reportes_reclamaciones')
        .update({
          estado: reporte.estado,
          acciones_tomadas: reporte.acciones_tomadas,
          responsable_remitido: reporte.responsable_remitido,
          resolucion_final: reporte.resolucion_final,
          historial_seguimiento: reporte.historial_seguimiento,
          actualizado_en: ahoraIso
        })
        .or(`id.eq.${id},codigo_caso.eq.${id}`);
    } catch (e) {
      // Fallback
    }

    return reporte;
  }
}

module.exports = new ReportesServicio();
