import React from 'react';
import { Building2, Compass, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';

export const SeccionPrestadores = ({ alRegistrarPrestador }) => {
  return (
    <section id="para-prestadores" style={{ padding: '4.5rem 0' }}>
      <div className="contenedor">
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 2.5rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-primario)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Únete a la Red Oficial de Bogotá
          </span>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--texto-principal)', marginTop: '0.25rem', marginBottom: '0.75rem' }}>
            ¿Eres una Agencia o un Guía Certificado?
          </h2>
          <p style={{ color: 'var(--texto-secundario)', fontSize: '0.95rem' }}>
            Impulsa tus experiencias, digitaliza tu disponibilidad horaria y conecta con miles de viajeros nacionales e internacionales.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Tarjeta para Agencias */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--borde-sutil)',
              borderRadius: 'var(--radio-grande)',
              padding: '2.25rem',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 16px rgba(30, 41, 51, 0.05)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-dorado-claro)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-dorado)'
                }}
              >
                <Building2 size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--texto-principal)' }}>Para Agencias de Viajes</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-dorado)', fontWeight: 700 }}>Operadoras con RNT</span>
              </div>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', flex: 1, fontSize: '0.9rem', color: 'var(--texto-secundario)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} color="var(--color-secundario)" />
                <span>Publica tus paquetes turísticos con galerías de fotos.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} color="var(--color-secundario)" />
                <span>Contrata y asigna guías profesionales certificados.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} color="var(--color-secundario)" />
                <span>Gestión centralizada de reservas e itinerarios.</span>
              </li>
            </ul>

            <button
              onClick={() => alRegistrarPrestador('agencia')}
              className="boton boton-dorado"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              <span>Registrar mi Agencia</span>
              <ArrowRight size={17} />
            </button>
          </div>

          {/* Tarjeta para Guías */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--borde-sutil)',
              borderRadius: 'var(--radio-grande)',
              padding: '2.25rem',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 16px rgba(30, 41, 51, 0.05)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-primario-claro)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primario)'
                }}
              >
                <Compass size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--texto-principal)' }}>Para Guías de Turismo</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-primario)', fontWeight: 700 }}>Profesionales Titulados</span>
              </div>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', flex: 1, fontSize: '0.9rem', color: 'var(--texto-secundario)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} color="var(--color-secundario)" />
                <span>Perfil verificado con especialidades, idiomas y RNT.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} color="var(--color-secundario)" />
                <span>Control total de tu disponibilidad y agenda de recorridos.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} color="var(--color-secundario)" />
                <span>Recibe asignaciones directas de agencias aliadas.</span>
              </li>
            </ul>

            <button
              onClick={() => alRegistrarPrestador('guia')}
              className="boton boton-primario"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              <span>Registrarme como Guía</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
