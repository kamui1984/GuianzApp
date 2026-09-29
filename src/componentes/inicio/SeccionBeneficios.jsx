import React from 'react';
import { ShieldCheck, Users, Clock, Award, Sparkles, CheckCircle2 } from 'lucide-react';

const BENEFICIOS = [
  {
    icono: <ShieldCheck size={28} color="var(--color-dorado)" />,
    titulo: 'Prestadores 100% Verificados',
    descripcion: 'Cada agencia y guía registrado cuenta con Registro Nacional de Turismo (RNT) validado por nuestro equipo.'
  },
  {
    icono: <Award size={28} color="var(--color-primario)" />,
    titulo: 'Guías Profesionales Locales',
    descripcion: 'Conoce Bogotá a través de historiadores, naturalistas y expertos apasionados por la cultura capitalina.'
  },
  {
    icono: <Clock size={28} color="var(--color-secundario)" />,
    titulo: 'Reserva Rápida y Transparente',
    descripcion: 'Consulta disponibilidad en tiempo real, políticas de cancelación claras y contacto directo sin intermediarios opacos.'
  },
  {
    icono: <Sparkles size={28} color="var(--color-acento-bogota)" />,
    titulo: 'Experiencias a tu Medida',
    descripcion: 'Desde recorridos coloniales en La Candelaria hasta caminatas ecológicas en los Cerros Orientales y Chicaque.'
  }
];

export const SeccionBeneficios = () => {
  return (
    <section
      id="beneficios"
      style={{
        padding: '4rem 0',
        borderTop: '1px solid var(--borde-sutil)',
        borderBottom: '1px solid var(--borde-sutil)'
      }}
    >
      <div className="contenedor">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-primario)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            ¿Por qué elegir GuianzApp?
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--texto-principal)', marginTop: '0.25rem', marginBottom: '0.75rem' }}>
            Turismo formal, seguro y memorable
          </h2>
          <p style={{ color: 'var(--texto-secundario)', fontSize: '0.95rem' }}>
            Conectamos a viajeros con la oferta turística formal de Bogotá para garantizar experiencias con los más altos estándares de calidad.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {BENEFICIOS.map((b, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--borde-sutil)',
                borderRadius: 'var(--radio-medio)',
                padding: '1.75rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: '0 2px 8px rgba(30, 41, 51, 0.04)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(23, 74, 91, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(30, 41, 51, 0.04)';
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-primario-claro)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {b.icono}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--texto-principal)' }}>{b.titulo}</h3>
              <p style={{ color: 'var(--texto-secundario)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                {b.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
