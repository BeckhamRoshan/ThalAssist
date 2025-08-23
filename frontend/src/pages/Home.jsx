import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const features = [
    {
      title: "Blood Bank Search",
      description: "Find blood banks and check real-time availability across India",
      icon: "🏥",
      link: "/blood-availability",
      color: "red"
    },
    {
      title: "Donor Matching", 
      description: "Connect with verified blood donors in your area",
      icon: "🤝",
      link: "/donor-match",
      color: "blue"
    },
    {
      title: "AI Assistant",
      description: "Get instant answers about thalassemia care and treatment",
      icon: "🤖",
      link: "/chatbot",
      color: "green"
    }
  ];

  const stats = [
    { number: "1000+", label: "Blood Banks Connected" },
    { number: "500+", label: "Registered Donors" },
    { number: "24/7", label: "Available Support" },
    { number: "100%", label: "Free Service" }
  ];

  const emergencySteps = [
    {
      step: "1",
      title: "Emergency Call",
      description: "Call 108 for immediate medical emergency"
    },
    {
      step: "2", 
      title: "Blood Search",
      description: "Use our blood bank search for urgent blood needs"
    },
    {
      step: "3",
      title: "Contact Donors",
      description: "Reach out to registered donors in your area"
    },
    {
      step: "4",
      title: "Hospital Visit",
      description: "Visit nearest hospital with blood bank facility"
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            ThalAssist+ 
            <span className="hero-subtitle">Your Thalassemia Care Companion</span>
          </h1>
          <p className="hero-description">
            Comprehensive support for thalassemia patients and families. 
            Find blood banks, connect with donors, and get expert guidance - all in one place.
          </p>
          <div className="hero-buttons">
            <Link to="/blood-availability" className="btn btn-primary">
              Find Blood Banks
            </Link>
            <Link to="/chatbot" className="btn btn-secondary">
              Ask AI Assistant
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="blood-drop">
            <span>🩸</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <Link 
                to={feature.link} 
                key={index}
                className={`feature-card ${feature.color}`}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <span className="feature-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <h2 className="section-title">Making a Difference</h2>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Section */}
      <section className="emergency">
        <div className="container">
          <h2 className="section-title emergency-title">
            <span className="emergency-icon">🚨</span>
            Emergency Blood Need?
          </h2>
          <p className="emergency-subtitle">
            Follow these steps for urgent blood requirements
          </p>
          <div className="emergency-steps">
            {emergencySteps.map((item, index) => (
              <div key={index} className="emergency-step">
                <div className="step-number">{item.step}</div>
                <div className="step-content">
                  <h3 className="step-title">{item.title}</h3>
                  <p className="step-description">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="emergency-contacts">
            <h3>Emergency Contacts</h3>
            <div className="contact-grid">
              <div className="contact-item">
                <strong>National Emergency:</strong> 108
              </div>
              <div className="contact-item">
                <strong>Blood Helpline:</strong> 1910
              </div>
              <div className="contact-item">
                <strong>Red Cross:</strong> 011-23711551
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Thalassemia Section */}
      <section className="about-thalassemia">
        <div className="container">
          <h2 className="section-title">Understanding Thalassemia</h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                Thalassemia is an inherited blood disorder that affects the body's ability 
                to produce hemoglobin and red blood cells. People with thalassemia need 
                regular blood transfusions and specialized care.
              </p>
              <p>
                ThalAssist+ is here to make this journey easier by connecting patients 
                with blood banks, donors, and providing reliable information about 
                treatment and care.
              </p>
            </div>
            <div className="about-features">
              <div className="about-feature">
                <span className="feature-emoji">💉</span>
                <span>Regular Transfusions</span>
              </div>
              <div className="about-feature">
                <span className="feature-emoji">🏥</span>
                <span>Specialized Care</span>
              </div>
              <div className="about-feature">
                <span className="feature-emoji">👥</span>
                <span>Community Support</span>
              </div>
              <div className="about-feature">
                <span className="feature-emoji">📚</span>
                <span>Expert Guidance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <div className="container">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-description">
            Join thousands of patients and families who trust ThalAssist+ for their care needs.
          </p>
          <div className="cta-buttons">
            <Link to="/blood-availability" className="btn btn-primary">
              Find Blood Now
            </Link>
            <Link to="/donor-match" className="btn btn-outline">
              Become a Donor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;