import React, { useState } from 'react';
import { Modal } from './Modal';
import { ShieldCheck, FileText, CheckCircle2, AlertTriangle, Scale, ExternalLink } from 'lucide-react';

export const ModalTerminosCondiciones = ({ abierto, alCerrar, rolInicial = 'general' }) => {
  const [seccionActiva, setSeccionActiva] = useState(rolInicial || 'general');

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo="Términos y Condiciones de Uso — GuianzApp"
      anchoMaximo="780px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Cabecera Informativa con Marco Legal Colombiano */}
        <div
          style={{
            backgroundColor: 'var(--color-primario-claro)',
            border: '1px solid rgba(23, 74, 91, 0.2)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem'
          }}
        >
          <Scale size={24} color="var(--color-primario)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4
              style={{
                margin: '0 0 0.25rem 0',
                fontSize: '0.98rem',
                fontWeight: 800,
                color: 'var(--color-primario)'
              }}
            >
              Marco Normativo Aplicable en la República de Colombia
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: '0.84rem',
                color: 'var(--texto-secundario)',
                lineHeight: 1.5
              }}
            >
              El presente instrumento regula el acceso y uso de la plataforma tecnológica <strong>GuianzApp</strong> en estricto cumplimiento del <strong>Artículo 53 de la Ley 1480 de 2011</strong> (Estatuto del Consumidor), la <strong>Ley 2068 de 2020</strong> (Ley General de Turismo), la <strong>Ley 300 de 1996</strong> y la <strong>Ley 1581 de 2012</strong> (Protección de Datos Personales).
            </p>
          </div>
        </div>

        {/* Pestañas de Navegación del Documento */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--borde-sutil)',
            paddingBottom: '0.5rem',
            overflowX: 'auto'
          }}
        >
          <button
            type="button"
            onClick={() => setSeccionActiva('general')}
            className={`boton boton-pequeno ${seccionActiva === 'general' ? 'boton-primario' : 'boton-contorno'}`}
            style={{ whiteSpace: 'nowrap' }}
          >
            1. Rol de GuianzApp
          </button>
          <button
            type="button"
            onClick={() => setSeccionActiva('turistas')}
            className={`boton boton-pequeno ${seccionActiva === 'turistas' ? 'boton-primario' : 'boton-contorno'}`}
            style={{ whiteSpace: 'nowrap' }}
          >
            2. Turista ↔ Agencia
          </button>
          <button
            type="button"
            onClick={() => setSeccionActiva('guias')}
            className={`boton boton-pequeno ${seccionActiva === 'guias' ? 'boton-primario' : 'boton-contorno'}`}
            style={{ whiteSpace: 'nowrap' }}
          >
            3. Agencia ↔ Guía
          </button>
          <button
            type="button"
            onClick={() => setSeccionActiva('exoneracion')}
            className={`boton boton-pequeno ${seccionActiva === 'exoneracion' ? 'boton-primario' : 'boton-contorno'}`}
            style={{ whiteSpace: 'nowrap' }}
          >
            4. Indemnidad & PQRS
          </button>
        </div>

        {/* Contenido Dinámico por Pestaña */}
        <div
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            paddingRight: '0.5rem',
            fontSize: '0.88rem',
            lineHeight: 1.65,
            color: 'var(--texto-principal)'
          }}
        >
          {seccionActiva === 'general' && (
            <div>
              <h4 style={{ color: 'var(--color-primario)', fontWeight: 800, marginTop: 0 }}>
                1. Naturaleza Jurídica y Rol de la Plataforma
              </h4>
              <p>
                <strong>1.1. Plataforma Tecnológica de Intermediación:</strong> GuianzApp opera exclusivamente como un portal tecnológico de software y canal digital de contacto en los términos del <strong>Artículo 53 de la Ley 1480 de 2011</strong>. Su propósito es facilitar la visibilidad, reserva y coordinación entre usuarios turistas y prestadores de servicios turísticos formalmente inscritos ante las autoridades colombianas.
              </p>
              <p>
                <strong>1.2. No Prestación Directa:</strong> GuianzApp <strong>NO es una agencia de viajes operadora</strong>, transportador turístico, guía de turismo, ni emisor directo de servicios hoteleros o recreativos. GuianzApp no presta directamente los recorridos, no administra el transporte físico ni ejerce subordinación laboral sobre el personal operativo en territorio.
              </p>
              <p>
                <strong>1.3. Control y Exigencia de RNT:</strong> En cumplimiento del <strong>Artículo 38 de la Ley 2068 de 2020</strong>, GuianzApp exige y valida que toda agencia u operador turístico cuente con su número de <strong>Registro Nacional de Turismo (RNT)</strong> vigente. Asimismo, se verifica la tarjeta profesional y RNT para los guías de turismo certificados.
              </p>
            </div>
          )}

          {seccionActiva === 'turistas' && (
            <div>
              <h4 style={{ color: 'var(--color-primario)', fontWeight: 800, marginTop: 0 }}>
                2. Relación Jurídica 1: Turista ↔ Agencia Prestadora
              </h4>
              <p>
                <strong>2.1. Contrato Directo de Prestación de Servicios:</strong> Cuando el Turista selecciona y confirma una reserva a través de GuianzApp, el contrato de prestación de servicios turísticos se perfecciona <strong>directa y exclusivamente entre el Turista y la Agencia Operadora</strong> identificada en la reserva con su respectivo RNT.
              </p>
              <p>
                <strong>2.2. Responsabilidad de la Información:</strong> La Agencia Operadora es la única y exclusiva responsable de:
              </p>
              <ul>
                <li>Definir con total precisión y veracidad <strong>qué incluye</strong> y <strong>qué no incluye</strong> la experiencia.</li>
                <li>Fijar los precios, puntos de encuentro, duración y horarios de salida.</li>
                <li>Establecer las políticas de cancelación, cambios, reembolsos y reprogramación del tour.</li>
                <li>Verificar los requisitos físicos, de edad o de indumentaria requeridos para el recorrido.</li>
                <li>Garantizar las pólizas obligatorias de asistencia médica y responsabilidad civil exigidas por el Ministerio de Comercio, Industria y Turismo.</li>
              </ul>
              <p>
                <strong>2.3. Prohibición de Información Engañosa:</strong> Las agencias tienen prohibido atribuir a GuianzApp la garantía o prestación directa de sus servicios. Cualquier publicidad o descripción defectuosa será imputable exclusivamente a la agencia publicadora según los artículos 23 y 29 del Estatuto del Consumidor.
              </p>
            </div>
          )}

          {seccionActiva === 'guias' && (
            <div>
              <h4 style={{ color: 'var(--color-primario)', fontWeight: 800, marginTop: 0 }}>
                3. Relación Jurídica 2: Agencia Operadora ↔ Guía Turístico
              </h4>
              <p>
                <strong>3.1. Autonomía Profesional del Guía:</strong> Los Guías Turísticos registrados en GuianzApp ejercen su actividad de manera independiente y autónoma, en virtud de su matrícula o tarjeta profesional expedida por el Consejo Profesional de Guías de Turismo y su RNT activo (Ley 300 de 1996 y Ley 1558 de 2012).
              </p>
              <p>
                <strong>3.2. Asignación y Prestación del Servicio:</strong> Cuando una Agencia asigna a un Guía para un tour reservado:
              </p>
              <ul>
                <li>El Guía acepta prestar el servicio bajo las condiciones temáticas, horarias y remunerativas acordadas con la Agencia.</li>
                <li>No se genera vínculo laboral de ninguna naturaleza entre el Guía y GuianzApp.</li>
                <li>La coordinación logística, punto de encuentro y pago de honorarios profesionales corresponde íntegramente al acuerdo entre la Agencia y el Guía.</li>
              </ul>
              <p>
                <strong>3.3. Trazabilidad de Asignación:</strong> GuianzApp registrará en el sistema de evidencias la fecha, hora y datos del guía asignado, garantizando que el turista conozca con anterioridad a la salida quién será el profesional a cargo del guiado.
              </p>
            </div>
          )}

          {seccionActiva === 'exoneracion' && (
            <div>
              <h4 style={{ color: 'var(--color-primario)', fontWeight: 800, marginTop: 0 }}>
                4. Indemnidad, Exoneración de Responsabilidad y PQRS
              </h4>
              <p>
                <strong>4.1. Cláusula de Indemnidad a favor de GuianzApp:</strong> Las agencias y los guías se comprometen a mantener plenamente indemne a GuianzApp, sus directores, socios y colaboradores frente a cualquier queja, reclamo judicial, demanda de responsabilidad civil contractual o extracontractual, investigación administrativa ante la Superintendencia de Industria y Comercio (SIC) o contingencias derivadas de la ejecución del servicio turístico, accidentes personales, pérdidas materiales o eventos de caso fortuito o fuerza mayor.
              </p>
              <p>
                <strong>4.2. Derecho de Retracto y Reversión de Pagos:</strong> En caso de adquisiciones electrónicas, el Turista podrá ejercer su derecho de retracto en los términos del <strong>Artículo 47 de la Ley 1480 de 2011</strong> (dentro de los 5 días hábiles siguientes, siempre que el servicio no deba ejecutarse antes de dicho término). Para reversión de pagos aplican las causales expresas del <strong>Decreto 587 de 2016</strong>.
              </p>
              <p>
                <strong>4.3. Atención de Peticiones, Quejas y Reclamos (PQRS):</strong> GuianzApp dispone del canal oficial <code>contacto@guianzapp.co</code> para canalizar PQRS y notificar de manera inmediata a la agencia prestadora correspondiente.
              </p>
            </div>
          )}
        </div>

        {/* Pie del Modal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--borde-sutil)',
            paddingTop: '0.85rem'
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>
            Versión vigente: <strong>v1.0-co (Legislación Colombiana)</strong>
          </span>
          <button type="button" onClick={alCerrar} className="boton boton-primario">
            Entendido y Conforme
          </button>
        </div>
      </div>
    </Modal>
  );
};
