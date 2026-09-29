import React from 'react';
import { ShieldCheck, MapPin, Mail, Phone, Heart } from 'lucide-react';

export const PiePagina = () => {
  return (
    <footer
      style={{
        backgroundColor: '#12303B',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        marginTop: 'auto',
        paddingTop: '3.5rem',
        paddingBottom: '2rem',
        color: '#F7F4EC'
      }}
    >
      <div className="contenedor">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem'
          }}
        >
          {/* Columna 1: Marca & Misión */}
          <div>
            <div
              style={{
                fontFamily: 'var(--fuente-titulos)',
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#FFFFFF',
                marginBottom: '0.75rem'
              }}
            >
              GuianzApp
            </div>
            <p style={{ color: '#D8DEE0', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Plataforma tecnológica para la coordinación de la oferta turística formal de Bogotá: agencias, guías profesionales y turistas conectados con RNT.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFD480', fontSize: '0.85rem', fontWeight: 700 }}>
              <ShieldCheck size={18} />
              <span>Operación con RNT Certificado</span>
            </div>
          </div>

          {/* Columna 2: Zonas de Bogotá */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem' }}>
              Destinos Destacados
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', padding: 0 }}>
              <li><span style={{ color: '#D8DEE0' }}>La Candelaria & Centro Histórico</span></li>
              <li><span style={{ color: '#D8DEE0' }}>Monserrate & Cerros Orientales</span></li>
              <li><span style={{ color: '#D8DEE0' }}>Distrito Graffiti en Puente Aranda</span></li>
              <li><span style={{ color: '#D8DEE0' }}>Usaquén Colonial & Gastronomía</span></li>
              <li><span style={{ color: '#D8DEE0' }}>Senderos y Bosques de Niebla</span></li>
            </ul>
          </div>

          {/* Columna 3: Legalidad y Seguridad */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem' }}>
              Turismo Responsable
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: '#D8DEE0', padding: 0 }}>
              <li>Registro Nacional de Turismo (Ley 300 de 1996)</li>
              <li>Verificación de Tarjetas Profesionales</li>
              <li>Políticas de Cancelación Transparentes</li>
              <li>Protección al Consumidor Turístico</li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem' }}>
              Atención y Soporte
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: '#D8DEE0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="var(--color-dorado)" />
                <span>Bogotá D.C., Colombia</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="var(--color-dorado)" />
                <span>contacto@guianzapp.co</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="var(--color-dorado)" />
                <span>Línea de soporte turístico distrital</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra Inferior */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.85rem',
            color: '#A0B0B8'
          }}
        >
          <div>
            © {new Date().getFullYear()} GuianzApp · Bogotá se conecta. Tú la descubres.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ cursor: 'pointer' }}>Términos del Servicio</span>
            <span style={{ cursor: 'pointer' }}>Privacidad y Datos</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
