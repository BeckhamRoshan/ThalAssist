import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  const importantNumbers = [
    { name: 'Emergency Services', number: '108' },
    { name: 'Blood Helpline', number: '1910' },
    { name: 'Red Cross', number: '011-23711551' },
    { name: 'NBTC', number: '011-23061462' }
  ];

  const quickLinks = [
    { name: 'Blood Banks', path: '/blood-availability' },
    { name: 'Find Donors', path: '/donor-match' },
    { name: 'AI Assistant', path: '/chatbot' },
    { name: 'Home', path: '/' }
  ];

  const resources = [
    { name: 'Thalassemia Foundation', url: 'https://www.thalassemia.org.in' },
    { name: 'eRaktKosh Portal', url: 'https://eraktkosh.mohfw.gov.in' },
    { name: 'Indian Red Cross', url: 'https://indianredcross.org' },
    { name: 'NBTC', url: 'https://nbtc.gov.in' }
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <h3>ThalAssist+</h3>
              <p>Your comprehensive companion for thalassemia care and support.</p>
            </div>
            <div className="footer-mission">
              <p>
                Empowering thalassemia patients and families with accessible healthcare 
                resources, blood bank connections, and expert guidance.
              </p>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.path}>{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h4>Emergency Numbers</h4>
            <div className="emergency-numbers">
              {importantNumbers.map((contact, index) => (
                <div key={index} className="emergency-contact">
                  <span className="contact-name">{contact.name}:</span>
                  <a href={`tel:${contact.number}`} className="contact-number">
                    {contact.number}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="footer-section">
            <h4>Resources</h4>
            <ul className="footer-links">
              {resources.map((resource, index) => (
                <li key={index}>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    {resource.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-features">
          <div className="feature-highlight">
            <h4>🏥 Blood Bank Network</h4>
            <p>Connected to 1000+ blood banks across India for real-time availability</p>
          </div>
          <div className="feature-highlight">
            <h4>🤝 Donor Community</h4>
            <p>500+ verified donors ready to help in times of need</p>
          </div>
          <div className="feature-highlight">
            <h4>🤖 AI Assistant</h4>
            <p>24/7 support for thalassemia care guidance and information</p>
          </div>
          <div className="feature-highlight">
            <h4>🆓 Free Service</h4>
            <p>Completely free platform dedicated to serving the community</p>
          </div>
        </div>

        <div className="footer-disclaimer">
          <div className="disclaimer-content">
            <h4>⚠️ Important Disclaimer</h4>
            <p>
              ThalAssist+ provides general information and connects users with healthcare resources. 
              This platform is not a substitute for professional medical advice, diagnosis, or treatment. 
              Always consult qualified healthcare providers for medical decisions. In emergencies, 
              call 108 immediately.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; {currentYear} ThalAssist+. Built with ❤️ for the thalassemia community.</p>
            </div>
            <div className="tech-info">
              <p>Hackathon Project | 24 Hours Build</p>
            </div>
            <div className="social-message">
              <p>🌟 Together, we make a difference in thalassemia care</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;