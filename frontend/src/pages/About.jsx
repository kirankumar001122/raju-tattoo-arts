import React from 'react';
import { ShieldCheck, Award, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import tattooDesignImg from '../assets/images/tattoo-design.jpg';
import customTattooImg from '../assets/images/custom-tattoo.jpg';

const About = () => {
  return (
    <div className="section-padding" style={{ paddingTop: '120px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 className="section-title">ABOUT <span className="text-gold">RAJU TATTOO ARTS</span></h1>
          <p className="section-subtitle">
            A premier custom tattoo studio committed to original artistry, pristine sterilization, and memorable client experiences.
          </p>
        </div>

        {/* Studio Philosophy */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'center',
          marginBottom: '80px'
        }}>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>
              OUR STUDIO <span className="text-gold">PHILOSOPHY</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.7 }}>
              At Raju Tattoo Arts, we believe that tattoos are more than mere decoration—they are physical markers of personal journeys, memories, values, and individuality.
            </p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.7 }}>
              We refrain from mass-producing cookie-cutter flash art. Every client undergoes a thoughtful consultation to craft a piece that flows naturally with their body ergonomics and personal story.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={18} className="text-gold" /> Custom artwork tailored individually for every client
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={18} className="text-gold" /> Hospital-grade single-use sterile equipment
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={18} className="text-gold" /> Comprehensive post-tattoo healing & aftercare guidance
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden', height: '380px' }}>
            <img
              src={tattooDesignImg}
              alt="Studio interior"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Lead Artist Profile */}
        <div className="card" style={{ padding: '40px', marginBottom: '80px', borderColor: 'var(--border-gold)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px',
            alignItems: 'center'
          }}>
            <div style={{ height: '320px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <img
                src={customTattooImg}
                alt="Lead Artist Raju"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--accent-gold)',
                fontWeight: 700,
                fontSize: '0.85rem',
                marginBottom: '10px'
              }}>
                <Award size={16} /> FOUNDER & MASTER ARTIST
              </div>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '16px' }}>RAJU SHARMA</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.7 }}>
                With over 10 years of professional tattooing experience, Raju specializes in photorealistic black-and-grey portraits, intricate traditional mandalas, and custom full-body sleeves.
              </p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.7 }}>
                "My mission is simple: to make every client feel relaxed, respected, and thoroughly impressed with the artwork they carry for the rest of their lives."
              </p>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div>
                  <h4 className="text-gold" style={{ fontSize: '1.4rem' }}>10+ Yrs</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mastery</span>
                </div>
                <div>
                  <h4 className="text-gold" style={{ fontSize: '1.4rem' }}>Custom</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Specialization</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Safety & Hygiene Practices */}
        <div>
          <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '12px' }}>
            SAFETY & <span className="text-gold">HYGIENE PROTOCOLS</span>
          </h2>
          <p className="section-subtitle" style={{ marginBottom: '40px' }}>
            Your health and safety are non-negotiable. We follow stringent sterile studio standards.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            <div className="card">
              <ShieldCheck className="text-gold" size={32} style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Single-Use Needles</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                100% pre-sterilized needles opened directly in front of the client prior to every session.
              </p>
            </div>

            <div className="card">
              <Sparkles className="text-gold" size={32} style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Autoclave Sterilization</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Medical-grade autoclaving for non-disposable grip elements, regularly tested for microbiological purity.
              </p>
            </div>

            <div className="card">
              <Heart className="text-gold" size={32} style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Certified Premium Inks</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                EU-compliant, non-toxic, vegan-friendly tattoo pigments ensuring rich color vibrancy and skin safety.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
