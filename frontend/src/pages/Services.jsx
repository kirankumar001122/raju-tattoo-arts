import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Check } from 'lucide-react';

import tattooDesignImg from '../assets/images/tattoo-design.jpg';
import customTattooImg from '../assets/images/custom-tattoo.jpg';
import tattooRemovalImg from '../assets/images/tattoo-removal.jpg';
import coverUpImg from '../assets/images/cover-up-tattoo.jpg';
import piercingImg from '../assets/images/piercing.jpg';
import consultationImg from '../assets/images/consultation.jpg';
import aftercareImg from '../assets/images/aftercare.jpg';

const Services = () => {
  const servicesList = [
    {
      id: 'tattoo-design',
      name: 'Tattoo Design & Tattooing',
      price: 'Starting from ₹300',
      description: 'Professional execution of custom flash art, crisp lettering, geometric shapes, and traditional tattoos with high precision linework.',
      image: tattooDesignImg,
      features: ['Crisp linework & shading', 'Pre-sterilized single-use equipment', 'Custom placement preview']
    },
    {
      id: 'custom-tattoos',
      name: 'Custom Tattoos',
      price: 'Starting from ₹600',
      description: 'One-of-a-kind bespoke tattoo designs created from scratch according to your personal story, body ergonomics, and aesthetic preference.',
      image: customTattooImg,
      features: ['1-on-1 Artist digital drafting', 'Custom body placement stencil', 'Exclusive original artwork']
    },
    {
      id: 'tattoo-removal',
      name: 'Tattoo Removal',
      price: 'Starting from ₹1,800 / session',
      description: 'Professional tattoo removal consultation and treatment guidance tailored to your tattoo and skin requirements.',
      image: tattooRemovalImg,
      features: ['Targeted laser consultation', 'Skin assessment & care protocol', 'Suitable for partial cover-up preparation']
    },
    {
      id: 'tattoo-coverups',
      name: 'Tattoo Cover-ups',
      price: 'Starting from ₹1,200',
      description: 'Transform unwanted or faded legacy tattoos into vibrant new artwork using specialized color blending and shading techniques.',
      image: coverUpImg,
      features: ['Old ink camouflage design', 'Creative flow integration', 'Assessment consultation']
    },
    {
      id: 'piercings',
      name: 'Piercings',
      price: 'Starting from ₹800',
      description: 'Body and ear piercings performed using implant-grade titanium jewelry and sterile needle procedures in a clean studio environment.',
      image: piercingImg,
      features: ['Implant-grade titanium jewelry', 'Single-use hollow needles', 'Hygiene-focused procedure']
    },
    {
      id: 'tattoo-consultation',
      name: 'Tattoo Consultation',
      price: 'Starting from ₹300',
      description: 'Sit down with master artist Raju to discuss ideas, body placement, estimated session hours, sizing, and pricing transparency.',
      image: consultationImg,
      features: ['1-on-1 Artist discussion', 'Transparent price estimate', 'Artist guidance on ink placement']
    },
    {
      id: 'aftercare-guidance',
      name: 'Aftercare Guidance',
      price: 'Starting from ₹500',
      description: 'Comprehensive healing kits, protective dermal wraps, and step-by-step instructions for proper tattoo care during recovery.',
      image: aftercareImg,
      features: ['Protective dermal wrap applied', 'Step-by-step aftercare instructions', 'Soothing healing balm guidance']
    }
  ];

  return (
    <div className="section-padding" style={{ paddingTop: '120px' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 className="section-title">OUR STUDIO <span className="text-gold">SERVICES</span></h1>
          <p className="section-subtitle">
            Explore our comprehensive range of tattoo, piercing, cover-up, and removal services executed with master precision.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '32px'
        }}>
          {servicesList.map((service) => (
            <div key={service.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Image */}
                <div style={{ height: '220px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '20px' }}>
                  <img
                    src={service.image}
                    alt={service.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Price Badge */}
                <div style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(201, 162, 39, 0.12)',
                  border: '1px solid var(--border-gold)',
                  color: 'var(--accent-gold)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  marginBottom: '12px'
                }}>
                  {service.price}
                </div>

                <h3 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>{service.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '20px', lineHeight: 1.6 }}>
                  {service.description}
                </p>

                <ul style={{ listStyle: 'none', marginBottom: '24px' }}>
                  {service.features.map((feat, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '0.88rem', marginBottom: '8px' }}>
                      <Check size={16} className="text-gold" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to={`/booking?service=${encodeURIComponent(service.name)}`}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Calendar size={18} /> Book Appointment
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
