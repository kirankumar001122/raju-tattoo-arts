import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Award, ArrowRight, Calendar, Star, Compass } from 'lucide-react';

import heroImg from '../assets/images/tattoo-design.jpg';
import galleryDragon from '../assets/images/gallery-dragon.jpg';
import galleryFineline from '../assets/images/gallery-fineline.jpg';
import galleryBlackwork from '../assets/images/gallery-blackwork.jpg';
import galleryTraditional from '../assets/images/gallery-traditional.jpg';
import galleryPortrait from '../assets/images/gallery-portrait.jpg';
import galleryCustom from '../assets/images/gallery-custom.jpg';

const Home = () => {
  const galleryImages = [
    {
      url: galleryDragon,
      title: 'Realism Dragon Sleeve',
      category: 'Custom Sleeve'
    },
    {
      url: galleryFineline,
      title: 'Minimalist Line Art',
      category: 'Fine Line'
    },
    {
      url: galleryBlackwork,
      title: 'Geometric Compass',
      category: 'Blackwork'
    },
    {
      url: galleryTraditional,
      title: 'Japanese Irezumi',
      category: 'Traditional'
    },
    {
      url: galleryPortrait,
      title: 'Portrait Realism',
      category: 'Portrait'
    },
    {
      url: galleryCustom,
      title: 'Floral Custom Art',
      category: 'Custom Art'
    }
  ];

  const servicesPreview = [
    { name: 'Tattoo Design & Tattooing', price: 'From ₹300', desc: 'Bespoke artwork engineered tailored to your vision and body flow.' },
    { name: 'Custom Tattoos', price: 'From ₹600', desc: 'Expert custom tattoo artwork created from scratch.' },
    { name: 'Cover Up Tattoo', price: 'From ₹1,200', desc: 'Expert redesign technique to transform old tattoos into fresh masterpieces.' },
    { name: 'Tattoo Removal', price: 'From ₹1,800', desc: 'Professional tattoo removal consultation and treatment guidance tailored to your needs.' }
  ];

  return (
    <div>
      {/* HERO SECTION */}
      <section style={{
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(to bottom, rgba(11, 11, 11, 0.65), rgba(11, 11, 11, 0.95)), url('${heroImg}') center/cover no-repeat fixed`,
        position: 'relative',
        paddingTop: '80px'
      }}>
        <div className="container" style={{ textAlign: 'center', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(201, 162, 39, 0.15)',
            border: '1px solid var(--border-gold)',
            color: 'var(--accent-gold)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '24px',
            textTransform: 'uppercase'
          }}>
            <Sparkles size={16} /> Premium Tattoo Studio & Custom Body Art
          </div>

          <h1 style={{
            fontSize: 'clamp(2.8rem, 6vw, 4.8rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '20px',
            textTransform: 'uppercase'
          }}>
            YOUR STORY. <span className="text-gold">INKED FOREVER.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            margin: '0 auto 36px auto'
          }}>
            Where passion meets precise artistry. Experience bespoke tattoo design, sterile equipment standards, and world-class craftsmanship by master artist Raju and team.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/booking" className="btn-primary">
              <Calendar size={18} /> BOOK APPOINTMENT
            </Link>
            <Link to="/services" className="btn-secondary">
              Explore Services <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* SHORT INTRO & STATS */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '16px', fontWeight: 700 }}>
                WELCOME TO <span className="text-gold">RAJU TATTOO ARTS</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.7 }}>
                Founded with a vision to revolutionize tattoo craftsmanship, Raju Tattoo Arts is a sanctuary for custom body art expression. We treat every tattoo as an enduring masterpiece.
              </p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.7 }}>
                From intricate single-needle fine lines to full sleeve color realism and cover-ups, our studio enforces single-use sterile equipment for total safety and client satisfaction.
              </p>
              <Link to="/about" className="btn-secondary" style={{ padding: '10px 24px' }}>
                Learn More About Us <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
                <h3 className="text-gold" style={{ fontSize: '2.5rem', fontWeight: 800 }}>10+</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Years Experience</p>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
                <h3 className="text-gold" style={{ fontSize: '2.5rem', fontWeight: 800 }}>100%</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sterile & Safe</p>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
                <h3 className="text-gold" style={{ fontSize: '2.5rem', fontWeight: 800 }}>5,000+</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tattoos Inked (Sample)</p>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
                <h3 className="text-gold" style={{ fontSize: '2.5rem', fontWeight: 800 }}>4.9★</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Client Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED SERVICES PREVIEW */}
      <section className="section-padding" style={{ backgroundColor: '#0D0D0D', borderTop: '1px solid var(--border-dark)', borderBottom: '1px solid var(--border-dark)' }}>
        <div className="container">
          <h2 className="section-title">FEATURED <span className="text-gold">SERVICES</span></h2>
          <p className="section-subtitle">Delivering high-precision custom tattoos and body art with professional aftercare support.</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            {servicesPreview.map((service, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{
                    display: 'inline-flex',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(201, 162, 39, 0.1)',
                    color: 'var(--accent-gold)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    marginBottom: '16px'
                  }}>
                    {service.price}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>{service.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>{service.desc}</p>
                </div>
                <Link to={`/booking?service=${encodeURIComponent(service.name)}`} className="btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
                  Book Now <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/services" className="btn-primary">
              View All 7 Studio Services
            </Link>
          </div>
        </div>
      </section>

      {/* TATTOO GALLERY */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-main)' }}>
        <div className="container">
          <h2 className="section-title">OUR ARTWORK <span className="text-gold">GALLERY</span></h2>
          <p className="section-subtitle">A glimpse into recent custom tattoo projects completed at Raju Tattoo Arts.</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {galleryImages.map((img, i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: '280px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={img.url}
                    alt={img.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '16px 20px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end'
                  }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>{img.title}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>{img.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="section-padding" style={{ backgroundColor: '#0F0F0F', borderTop: '1px solid var(--border-dark)' }}>
        <div className="container">
          <h2 className="section-title">WHY CHOOSE <span className="text-gold">RAJU TATTOO ARTS</span></h2>
          <p className="section-subtitle">We prioritize client comfort, safety, and individual creative expression.</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <ShieldCheck className="text-gold" size={40} style={{ margin: '0 auto 16px auto' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Hospital-Grade Hygiene</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Single-use needles, medical autoclaves, wrapped workstations, and premium certified vegan inks.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <Compass className="text-gold" size={40} style={{ margin: '0 auto 16px auto' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Custom Art Consultation</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Collaborate 1-on-1 with artists to sketch and refine custom designs matching your exact placement.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <Award className="text-gold" size={40} style={{ margin: '0 auto 16px auto' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Master Craftsmanship</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Over a decade of tattoo expertise spanning hyper-realism, traditional, Japanese, and minimalist fine lines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-main)' }}>
        <div className="container">
          <h2 className="section-title">CLIENT <span className="text-gold">TESTIMONIALS</span></h2>
          <p className="section-subtitle">Hear what our clients say about their experience at Raju Tattoo Arts.</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            <div className="card">
              <div style={{ display: 'flex', gap: '4px', color: 'var(--accent-gold)', marginBottom: '12px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="var(--accent-gold)" />)}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '16px' }}>
                "Raju sir transformed my vague idea into an incredible detailed realistic arm sleeve. The studio cleanliness is unmatched!"
              </p>
              <h4 style={{ fontSize: '1rem' }}>- Vikram Sharma (Sample Review)</h4>
            </div>

            <div className="card">
              <div style={{ display: 'flex', gap: '4px', color: 'var(--accent-gold)', marginBottom: '12px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="var(--accent-gold)" />)}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '16px' }}>
                "Got my first minimalist fine-line tattoo here. Pain was minimal, and the aftercare instruction sheet was super helpful."
              </p>
              <h4 style={{ fontSize: '1rem' }}>- Priya Patel (Sample Review)</h4>
            </div>

            <div className="card">
              <div style={{ display: 'flex', gap: '4px', color: 'var(--accent-gold)', marginBottom: '12px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="var(--accent-gold)" />)}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '16px' }}>
                "Amazing cover-up work! You cannot even tell there was an old faded tattoo underneath. Highly recommended."
              </p>
              <h4 style={{ fontSize: '1rem' }}>- Amit Verma (Sample Review)</h4>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING CTA */}
      <section className="section-padding" style={{
        background: `linear-gradient(135deg, rgba(201, 162, 39, 0.15) 0%, rgba(15, 15, 15, 0.95) 100%)`,
        borderTop: '1px solid var(--border-gold)',
        borderBottom: '1px solid var(--border-gold)',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', fontWeight: 800 }}>
            READY TO GET <span className="text-gold">INKED?</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '550px', margin: '0 auto 30px auto', fontSize: '1.05rem' }}>
            Book your consultation or tattoo session online in less than 2 minutes. Our team will verify your slot immediately.
          </p>
          <Link to="/booking" className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.05rem' }}>
            <Calendar size={20} /> BOOK YOUR APPOINTMENT NOW
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
