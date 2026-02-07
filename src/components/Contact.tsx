import React from 'react';
import SatelliteSvg from '../assets/astronomy-satellite-space-svgrepo-com.svg?react'; // Import the satellite SVG as a component

const Contact: React.FC = () => {
  return (
    <section id="contact" className="contact-section">
      <div className="section-container">
        <h2 className="section-title">Contact Me</h2>
        <SatelliteSvg className="contact-satellite-img" /> {/* Use the satellite SVG component */}
        <form className="contact-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Name</label>
            <input type="text" className="form-input" id="name" />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email address</label>
            <input type="email" className="form-input" id="email" />
          </div>
          <div className="form-group">
            <label htmlFor="message" className="form-label">Message</label>
            <textarea className="form-textarea" id="message" rows={5}></textarea>
          </div>
          <button type="submit" className="btn-custom">Send Message</button>
        </form>
      </div>
    </section>
  );
};

export default Contact;