const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const rutaDirectorioData = path.join(__dirname, '..', 'data');
const rutaArchivoCorreos = path.join(rutaDirectorioData, 'correos_enviados.json');

if (!fs.existsSync(rutaDirectorioData)) {
  fs.mkdirSync(rutaDirectorioData, { recursive: true });
}

const registrarCorreoLocal = (registro) => {
  try {
    let lista = [];
    if (fs.existsSync(rutaArchivoCorreos)) {
      lista = JSON.parse(fs.readFileSync(rutaArchivoCorreos, 'utf8') || '[]');
    }
    lista.unshift(registro);
    fs.writeFileSync(rutaArchivoCorreos, JSON.stringify(lista.slice(0, 100), null, 2), 'utf8');
  } catch (err) {
    console.warn('No se pudo registrar correo en correos_enviados.json:', err.message);
  }
};

/**
 * Obtener transporte configurado para envío de correos.
 */
const obtenerTransporte = () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  return null;
};

/**
 * Plantilla base con identidad corporativa de GuianzApp (#174A5B y #C6A15B).
 */
const generarPlantillaHtml = ({ titulo, subtitulo, contenidoHtml, pieHtml }) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F7F4EC; margin: 0; padding: 24px; color: #1E2933; }
      .contenedor { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #D8D2C4; box-shadow: 0 4px 16px rgba(23,74,91,0.06); }
      .cabecera { background: linear-gradient(135deg, #174A5B 0%, #1F5D50 100%); padding: 32px 28px; text-align: center; color: #FFFFFF; }
      .logo { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin: 0; color: #FFFFFF; }
      .logo-sub { color: #FFE8A3; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
      .cuerpo { padding: 32px 28px; line-height: 1.6; font-size: 15px; color: #1E2933; }
      .tarjeta-info { background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; margin: 20px 0; }
      .boton { display: inline-block; background-color: #174A5B; color: #FFFFFF !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-top: 18px; }
      .pie { background-color: #F7F4EC; padding: 20px 28px; text-align: center; font-size: 12px; color: #64727A; border-top: 1px solid #D8D2C4; }
    </style>
  </head>
  <body>
    <div class="contenedor">
      <div class="cabecera">
        <h1 class="logo">GuianzApp</h1>
        <div class="logo-sub">Bogotá · Turismo Certificado RNT</div>
      </div>
      <div class="cuerpo">
        <h2 style="color: #174A5B; font-size: 20px; margin-top: 0;">${titulo}</h2>
        ${subtitulo ? `<p style="color: #53626C; font-size: 14px; margin-bottom: 20px;">${subtitulo}</p>` : ''}
        ${contenidoHtml}
      </div>
      <div class="pie">
        ${pieHtml || 'GuianzApp — Plataforma Tecnológica para el Turismo Formal en Bogotá · Cumplimiento Ley 300 de 1996 y Ley 2068 de 2020.'}
      </div>
    </div>
  </body>
  </html>
  `;
};

/**
 * 1. Remitir correo al administrador cuando se recibe una solicitud de registro.
 */
const notificarRegistroAlAdministrador = async ({ tipo, nombre, correo, numeroRnt, detalles }) => {
  const destinatario = process.env.ADMIN_EMAIL || 'admin@guianzapp.bogotapp.com';
  const remitente = process.env.CORREO_REMITENTE || '"GuianzApp Notificaciones" <no-reply@guianzapp.bogotapp.com>';
  const tipoPrestador = tipo === 'agencia' ? 'Agencia de Viajes' : 'Guía Profesional de Turismo';
  const fechaTexto = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });

  const contenidoHtml = `
    <p>Se ha recibido una nueva solicitud de registro de prestador de servicios turísticos en la plataforma GuianzApp que requiere verificación documental:</p>
    
    <div class="tarjeta-info">
      <p style="margin: 4px 0;"><strong>Tipo de Prestador:</strong> ${tipoPrestador}</p>
      <p style="margin: 4px 0;"><strong>Nombre / Razón Social:</strong> ${nombre}</p>
      <p style="margin: 4px 0;"><strong>Correo de Contacto:</strong> ${correo}</p>
      <p style="margin: 4px 0;"><strong>Registro Nacional de Turismo (RNT):</strong> ${numeroRnt || 'Adjunto para validación'}</p>
      <p style="margin: 4px 0;"><strong>Fecha y Hora de Solicitud:</strong> ${fechaTexto}</p>
    </div>

    <p>Por favor ingresa al <strong>Panel de Administración</strong> para revisar los documentos adjuntos y aprobar, solicitar ajustes o rechazar la solicitud.</p>

    <div style="text-align: center;">
      <a href="https://guianzapp.bogotapp.com/#panel-admin" class="boton">Revisar Solicitud en el Panel Admin</a>
    </div>
  `;

  const html = generarPlantillaHtml({
    titulo: `🔔 Nueva Solicitud de Registro: ${tipoPrestador}`,
    subtitulo: `Prestador registrado: ${nombre}`,
    contenidoHtml
  });

  const registroAuditoria = {
    id: `email-${Date.now()}`,
    fecha: new Date().toISOString(),
    destinatario,
    tipoDestinatario: 'administrador',
    asunto: `🔔 [GuianzApp] Nueva solicitud de registro de ${tipoPrestador}: ${nombre}`,
    datos: { tipo, nombre, correo, numeroRnt }
  };

  try {
    const transporte = obtenerTransporte();
    if (transporte) {
      await transporte.sendMail({
        from: remitente,
        to: destinatario,
        subject: registroAuditoria.asunto,
        html
      });
      registroAuditoria.estado = 'enviado';
    } else {
      console.log(`[SIMULACIÓN CORREO ADMIN] Para: ${destinatario} | Asunto: ${registroAuditoria.asunto}`);
      registroAuditoria.estado = 'simulado_sin_smtp';
    }
  } catch (err) {
    console.error('Error al enviar correo al administrador:', err.message);
    registroAuditoria.estado = 'error';
    registroAuditoria.error = err.message;
  }

  registrarCorreoLocal(registroAuditoria);
};

/**
 * 2. Remitir correo al operador (agencia/guía) cuando el administrador realiza cualquier acción sobre su perfil.
 */
const notificarOperadorAccionAdmin = async ({ correo, nombre, rol, accion, motivo, detalles }) => {
  if (!correo) return;

  const remitente = process.env.CORREO_REMITENTE || '"GuianzApp Notificaciones" <no-reply@guianzapp.bogotapp.com>';
  const tipoPrestador = rol === 'guia' ? 'Guía de Turismo' : 'Agencia de Viajes';
  const fechaTexto = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });

  let titulo = '';
  let asunto = '';
  let mensajePrincipal = '';
  let llamadaAccion = '';

  switch (accion) {
    case 'aprobado':
      asunto = '🎉 ¡Tu cuenta en GuianzApp ha sido Aprobada y Activada!';
      titulo = '¡Bienvenido(a) a GuianzApp!';
      mensajePrincipal = `
        <p style="color: #1F5D50; font-weight: 700; font-size: 16px;">¡Excelente noticia! Tu documentación y RNT han sido verificados y aprobados con éxito.</p>
        <p>A partir de este momento tu cuenta como <strong>${tipoPrestador}</strong> se encuentra 100% activa. Ya puedes publicar tus paquetes turísticos, habilitar cupos de salidas y gestionar reservas de turistas en Bogotá.</p>
      `;
      llamadaAccion = '<a href="https://guianzapp.bogotapp.com/" class="boton">Ingresar a mi Panel</a>';
      break;

    case 'solicitud_correccion':
      asunto = '📋 Acción requerida: Ajuste en la documentación de tu cuenta GuianzApp';
      titulo = 'Revisión de Documentación';
      mensajePrincipal = `
        <p>El Administrador del sistema ha revisado tu solicitud de registro y requiere que realices un ajuste o corrección en los documentos cargados:</p>
        <div class="tarjeta-info" style="border-left: 4px solid #C6A15B;">
          <strong>Detalle de la observación:</strong>
          <p style="margin: 8px 0 0; color: #1E2933;">${motivo || 'Por favor actualiza o reenvía el documento del Registro Nacional de Turismo (RNT) o Tarjeta Profesional asegurando que sea legible.'}</p>
        </div>
        <p>No es necesario que crees una cuenta nueva. Puedes ingresar a la plataforma y re-cargar el documento requerido directamente.</p>
      `;
      llamadaAccion = '<a href="https://guianzapp.bogotapp.com/" class="boton" style="background-color: #C6A15B; color: #1E2933 !important;">Subsanar Documentos Ahora</a>';
      break;

    case 'rechazado':
      asunto = '⚠️ Novedad sobre tu solicitud de registro en GuianzApp';
      titulo = 'Estado de Solicitud de Registro';
      mensajePrincipal = `
        <p>Te informamos que tu solicitud de registro como <strong>${tipoPrestador}</strong> no ha sido aprobada en esta oportunidad.</p>
        <div class="tarjeta-info" style="border-left: 4px solid #A64040;">
          <strong>Motivo indicado por la administración:</strong>
          <p style="margin: 8px 0 0; color: #1E2933;">${motivo || 'Los soportes documentales no cumplen con los requerimientos legales vigentes (RNT o Tarjeta Profesional).'}</p>
        </div>
        <p>Si consideras que se trata de un error o cuentas con el documento subsanado, puedes contactar al equipo de soporte de GuianzApp.</p>
      `;
      llamadaAccion = '<a href="https://guianzapp.bogotapp.com/" class="boton">Contactar a Soporte</a>';
      break;

    case 'suspendido':
      asunto = '⚠️ Notificación sobre el estado de tu cuenta en GuianzApp';
      titulo = 'Suspensión Preventiva de Cuenta';
      mensajePrincipal = `
        <p>Tu cuenta de <strong>${tipoPrestador}</strong> ha sido suspendida de manera preventiva por el Administrador.</p>
        <div class="tarjeta-info" style="border-left: 4px solid #A64040;">
          <strong>Motivo:</strong>
          <p style="margin: 8px 0 0; color: #1E2933;">${motivo || 'Pendiente de aclaración de inconformidad o vencimiento de RNT.'}</p>
        </div>
      `;
      break;

    case 'reactivado':
      asunto = '✅ Tu cuenta en GuianzApp ha sido Reactivada';
      titulo = 'Cuenta Reactivada';
      mensajePrincipal = `
        <p>Tu cuenta de <strong>${tipoPrestador}</strong> ha sido reactivada satisfactoriamente. Todos tus servicios y disponibilidad vuelven a estar visibles en la plataforma.</p>
      `;
      llamadaAccion = '<a href="https://guianzapp.bogotapp.com/" class="boton">Ir a GuianzApp</a>';
      break;

    default:
      asunto = '🔔 Actualización en tu perfil de GuianzApp';
      titulo = 'Novedad en tu Cuenta';
      mensajePrincipal = `<p>El Administrador ha actualizado el estado de tu cuenta: <strong>${accion}</strong>.</p>`;
  }

  const contenidoHtml = `
    <p>Estimado(a) <strong>${nombre}</strong>,</p>
    ${mensajePrincipal}
    <p style="font-size: 13px; color: #64727A; margin-top: 20px;">Fecha de actualización: ${fechaTexto}</p>
    <div style="text-align: center; margin: 24px 0;">
      ${llamadaAccion}
    </div>
  `;

  const html = generarPlantillaHtml({
    titulo,
    subtitulo: `Gestión de cuenta: ${nombre} (${tipoPrestador})`,
    contenidoHtml
  });

  const registroAuditoria = {
    id: `email-${Date.now()}`,
    fecha: new Date().toISOString(),
    destinatario: correo,
    tipoDestinatario: 'operador',
    asunto,
    datos: { nombre, rol, accion, motivo }
  };

  try {
    const transporte = obtenerTransporte();
    if (transporte) {
      await transporte.sendMail({
        from: remitente,
        to: correo,
        subject: asunto,
        html
      });
      registroAuditoria.estado = 'enviado';
    } else {
      console.log(`[SIMULACIÓN CORREO OPERADOR] Para: ${correo} | Asunto: ${asunto}`);
      registroAuditoria.estado = 'simulado_sin_smtp';
    }
  } catch (err) {
    console.error(`Error al enviar correo a ${correo}:`, err.message);
    registroAuditoria.estado = 'error';
    registroAuditoria.error = err.message;
  }

  registrarCorreoLocal(registroAuditoria);
};

module.exports = {
  notificarRegistroAlAdministrador,
  notificarOperadorAccionAdmin
};
