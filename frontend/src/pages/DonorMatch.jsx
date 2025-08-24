import React, { useState } from 'react';
import './DonorMatch.css';

function DonorMatch() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchParams, setSearchParams] = useState({
    blood_group: '',
    location: '',
    urgency: 'normal'
  });
  const [donorData, setDonorData] = useState({
    name: '',
    blood_group: '',
    location: '',
    phone: '',
    email: '',
    age: '',
    weight: '',
    last_donation: ''
  });
  const [searchResults, setSearchResults] = useState(null);
  const [registrationResult, setRegistrationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = [
    { value: 'normal', label: 'Normal', color: 'green' },
    { value: 'urgent', label: 'Urgent', color: 'orange' },
    { value: 'emergency', label: 'Emergency', color: 'red' }
  ];

  const handleSearchInputChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value
    });
  };

  const handleDonorInputChange = (e) => {
    setDonorData({
      ...donorData,
      [e.target.name]: e.target.value
    });
  };

  const searchDonors = async (e) => {
    e.preventDefault();
    
    if (!searchParams.blood_group || !searchParams.location) {
      setError('Please fill in blood group and location');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const queryParams = new URLSearchParams(searchParams);
      const response = await fetch(`http://127.0.0.1:8000/donor-match?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError(`Search failed: ${err.message}. Please try again.`);
      console.error('Donor search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const registerDonor = async (e) => {
    e.preventDefault();
    
    const requiredFields = ['name', 'blood_group', 'location', 'phone'];
    const missingFields = requiredFields.filter(field => !donorData[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);
    setError(null);
    setRegistrationResult(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/donor-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donorData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setRegistrationResult(data);
      
      if (data.success) {
        // Reset form on success
        setDonorData({
          name: '',
          blood_group: '',
          location: '',
          phone: '',
          email: '',
          age: '',
          weight: '',
          last_donation: ''
        });
      }
    } catch (err) {
      setError(`Registration failed: ${err.message}. Please try again.`);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderDonor = (donor, index) => (
    <div key={index} className="donor-card">
      <div className="donor-header">
        <div className="donor-info">
          <h3 className="donor-name">{donor.name}</h3>
          <div className="donor-badges">
            <span className="blood-group-badge">{donor.blood_group}</span>
            {donor.verified && <span className="verified-badge">✓ Verified</span>}
            <span className={`status-badge ${donor.status}`}>
              {donor.status === 'available' ? '🟢 Available' : '🔴 Not Available'}
            </span>
          </div>
        </div>
        <div className="compatibility-score">
          <span className="score-label">Match Score</span>
          <span className="score-value">{donor.compatibility_score}%</span>
        </div>
      </div>

      <div className="donor-details">
        <div className="detail-item">
          <span className="detail-icon">📍</span>
          <span className="detail-text">{donor.location}</span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">📞</span>
          <a href={`tel:${donor.phone}`} className="detail-link">{donor.phone}</a>
        </div>
        {donor.email && (
          <div className="detail-item">
            <span className="detail-icon">✉️</span>
            <a href={`mailto:${donor.email}`} className="detail-link">{donor.email}</a>
          </div>
        )}
        <div className="detail-item">
          <span className="detail-icon">🩸</span>
          <span className="detail-text">{donor.donation_count} donations</span>
        </div>
        {donor.eligible_next && (
          <div className="detail-item">
            <span className="detail-icon">📅</span>
            <span className="detail-text">Next eligible: {donor.eligible_next}</span>
          </div>
        )}
      </div>

      {donor.urgency_context && (
        <div className={`urgency-context ${donor.urgency_context.urgency_level}`}>
          <span className="urgency-icon">
            {donor.urgency_context.urgency_level === 'emergency' ? '🚨' : 
             donor.urgency_context.urgency_level === 'urgent' ? '⚠️' : 'ℹ️'}
          </span>
          <span className="urgency-message">{donor.urgency_context.message}</span>
        </div>
      )}

      <div className="donor-actions">
        <a href={`tel:${donor.phone}`} className="btn btn-primary">
          Call Now
        </a>
        {donor.email && (
          <a href={`mailto:${donor.email}?subject=Blood Donation Request - ${searchParams.blood_group}`} 
             className="btn btn-secondary">
            Send Email
          </a>
        )}
      </div>
    </div>
  );

  const renderSearchResults = () => {
    if (!searchResults) return null;

    return (
      <div className="search-results">
        <div className="results-header">
          <h3>Donor Search Results</h3>
          <div className="search-summary">
            <span>Found {searchResults.donors_found} donor(s) for {searchResults.request.blood_group}</span>
            <span className={`urgency-indicator ${searchResults.request.urgency}`}>
              {searchResults.request.urgency.toUpperCase()}
            </span>
          </div>
        </div>

        {searchResults.compatible_blood_groups && (
          <div className="compatibility-info">
            <h4>Compatible Blood Groups:</h4>
            <div className="compatible-groups">
              {searchResults.compatible_blood_groups.map(group => (
                <span key={group} className="compatible-group">{group}</span>
              ))}
            </div>
          </div>
        )}

        {searchResults.donors && searchResults.donors.length > 0 ? (
          <div className="donors-list">
            {searchResults.donors.map((donor, index) => renderDonor(donor, index))}
          </div>
        ) : (
          <div className="no-donors">
            <div className="no-donors-icon">😔</div>
            <h4>No Donors Found</h4>
            <p>No available donors found for your criteria.</p>
            {searchResults.search_tips && (
              <div className="search-tips">
                <h5>Try these tips:</h5>
                <ul>
                  {searchResults.search_tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {searchResults.emergency_alternatives && (
          <div className="emergency-alternatives">
            <h4>🚨 Emergency Alternatives</h4>
            <div className="alternatives-content">
              <div className="emergency-contacts">
                <h5>Emergency Contacts:</h5>
                {Object.entries(searchResults.emergency_alternatives.emergency_contacts).map(([name, number]) => (
                  <div key={name} className="emergency-contact">
                    <span>{name}:</span>
                    <a href={`tel:${number}`}>{number}</a>
                  </div>
                ))}
              </div>
              <div className="alternative-sources">
                <h5>Alternative Sources:</h5>
                <ul>
                  {searchResults.emergency_alternatives.alternative_sources.map((source, index) => (
                    <li key={index}>{source}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRegistrationResult = () => {
    if (!registrationResult) return null;

    return (
      <div className={`registration-result ${registrationResult.success ? 'success' : 'error'}`}>
        <div className="result-icon">
          {registrationResult.success ? '✅' : '❌'}
        </div>
        <h3>{registrationResult.success ? 'Registration Successful!' : 'Registration Failed'}</h3>
        <p>{registrationResult.message}</p>
        
        {registrationResult.success && registrationResult.donor_info && (
          <div className="donor-info-result">
            <h4>Your Donor ID: {registrationResult.donor_info.id}</h4>
            <p>Name: {registrationResult.donor_info.name}</p>
            <p>Blood Group: {registrationResult.donor_info.blood_group}</p>
            <p>Status: {registrationResult.donor_info.status}</p>
          </div>
        )}
        
        {registrationResult.next_steps && (
          <div className="next-steps">
            <h4>Next Steps:</h4>
            <ul>
              {registrationResult.next_steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="donor-match">
      <div className="container">
        <div className="page-header">
          <h1>Donor Matching</h1>
          <p>Find blood donors and register to help others</p>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            🔍 Find Donors
          </button>
          <button 
            className={`tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            📝 Register as Donor
          </button>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="search-tab">
            <form onSubmit={searchDonors} className="search-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="blood_group">Blood Group Needed *</label>
                  <select
                    id="blood_group"
                    name="blood_group"
                    value={searchParams.blood_group}
                    onChange={handleSearchInputChange}
                    required
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location *</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={searchParams.location}
                    onChange={handleSearchInputChange}
                    placeholder="e.g., Chennai, Tamil Nadu"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="urgency">Urgency Level</label>
                  <select
                    id="urgency"
                    name="urgency"
                    value={searchParams.urgency}
                    onChange={handleSearchInputChange}
                  >
                    {urgencyLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="search-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Searching...
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    Find Donors
                  </>
                )}
              </button>
            </form>

            {renderSearchResults()}
          </div>
        )}

        {activeTab === 'register' && (
          <div className="register-tab">
            <form onSubmit={registerDonor} className="register-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={donorData.name}
                    onChange={handleDonorInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="donor_blood_group">Blood Group *</label>
                  <select
                    id="donor_blood_group"
                    name="blood_group"
                    value={donorData.blood_group}
                    onChange={handleDonorInputChange}
                    required
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="donor_location">Location *</label>
                  <input
                    type="text"
                    id="donor_location"
                    name="location"
                    value={donorData.location}
                    onChange={handleDonorInputChange}
                    placeholder="City, State"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={donorData.phone}
                    onChange={handleDonorInputChange}
                    placeholder="+91-9876543210"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={donorData.email}
                    onChange={handleDonorInputChange}
                    placeholder="your@email.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="age">Age</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={donorData.age}
                    onChange={handleDonorInputChange}
                    min="18"
                    max="65"
                    placeholder="Age (18-65)"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="weight">Weight (kg)</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={donorData.weight}
                    onChange={handleDonorInputChange}
                    min="50"
                    placeholder="Weight (min 50kg)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="last_donation">Last Donation Date</label>
                  <input
                    type="date"
                    id="last_donation"
                    name="last_donation"
                    value={donorData.last_donation}
                    onChange={handleDonorInputChange}
                  />
                </div>
              </div>

              <button type="submit" className="register-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Registering...
                  </>
                ) : (
                  <>
                    <span>📝</span>
                    Register as Donor
                  </>
                )}
              </button>
            </form>

            {renderRegistrationResult()}

            <div className="donor-guidelines">
              <h3>Donor Guidelines</h3>
              <div className="guidelines-grid">
                <div className="guideline-card">
                  <h4>Eligibility Criteria</h4>
                  <ul>
                    <li>Age: 18-65 years</li>
                    <li>Weight: Minimum 50kg</li>
                    <li>Good health condition</li>
                    <li>No recent illness</li>
                  </ul>
                </div>
                <div className="guideline-card">
                  <h4>Donation Frequency</h4>
                  <ul>
                    <li>Every 3 months for whole blood</li>
                    <li>Every 2 weeks for platelets</li>
                    <li>Every 4 weeks for plasma</li>
                    <li>Maintain proper records</li>
                  </ul>
                </div>
                <div className="guideline-card">
                  <h4>Before Donation</h4>
                  <ul>
                    <li>Get adequate sleep</li>
                    <li>Eat iron-rich foods</li>
                    <li>Stay hydrated</li>
                    <li>Avoid alcohol 24hrs prior</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DonorMatch;