const { z } = require('zod');

/**
 * Middleware para validar datos de entrada (body, query, params) con esquemas Zod.
 * @param {z.ZodSchema} esquema - Esquema Zod a evaluar
 * @param {'body' | 'query' | 'params'} origen - Parte de la petición a validar
 */
const validarEsquema = (esquema, origen = 'body') => (peticion, respuesta, siguiente) => {
  try {
    const datosValidados = esquema.parse(peticion[origen]);
    peticion[origen] = datosValidados;
    siguiente();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const primerError = error.errors[0]?.message || 'Datos de entrada inválidos';
      const erroresDetallados = error.errors.map((err) => ({
        campo: err.path.join('.'),
        mensaje: err.message
      }));
      return respuesta.status(400).json({
        error: primerError,
        detalles: erroresDetallados
      });
    }
    return respuesta.status(400).json({ error: 'Error en la validación de datos' });
  }
};

// Esquemas de validación comunes
const esquemaInicioSesion = z.object({
  email: z.string().email('Ingresa un correo electrónico válido').optional(),
  correo: z.string().email('Ingresa un correo electrónico válido').optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional()
}).refine((datos) => (datos.email || datos.correo) && (datos.password || datos.contrasena), {
  message: 'Debes proporcionar correo electrónico y contraseña.'
});

const esquemaDisponibilidad = z.object({
  fecha: z.string().min(1, 'La fecha es obligatoria').optional(),
  date: z.string().min(1, 'La fecha es obligatoria').optional(),
  horaInicio: z.string().optional(),
  startTime: z.string().optional(),
  horaFin: z.string().optional(),
  endTime: z.string().optional(),
  estaDisponible: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  notas: z.string().optional(),
  notes: z.string().optional()
}).refine((datos) => Boolean(datos.fecha || datos.date), {
  message: 'La fecha es obligatoria.'
});

module.exports = {
  validarEsquema,
  esquemaInicioSesion,
  esquemaDisponibilidad
};
