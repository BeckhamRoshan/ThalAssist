import React, { useState } from 'react';
import './BloodAvailability.css';

function BloodAvailability() {
  const [searchParams, setSearchParams] = useState({
    state: '',
    district: '',
    blood_group: '',
    component: 'Whole Blood'
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const components = ['Whole Blood', 'Red Blood Cells', 'Plasma', 'Platelets', 'Cryoprecipitate'];
  
  const indianStates = [
    'Tamil Nadu', 'Karnataka', 'Kerala', 'Andhra Pradesh', 'Maharashtra', 
    'Delhi', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal'
  ];

  const handleInputChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value
    });
  };

  const searchBloodBanks = async (e) => {
    e.preventDefault();
    
    if (!searchParams.state || !searchParams.district || !searchParams.blood_group) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const queryParams = new URLSearchParams(searchParams);
      const response = await fetch(`http://thalassist-cpbgcyhwb7epe5ev.southcentralus-01.azurewebsites.net/blood-availability?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(`Search failed: ${err.message}. Please try again.`);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderBloodBank = (bank, index) => (
    <div key={index} className="blood-bank-card">
      <div className="bank-header">
        <h3 className="bank-name">{bank.name}</h3>
        {bank.license && <span className="bank-license">License: {bank.license}</span>}
      </div>
      
      <div className="bank-details">
        <div className="detail-item">
          <span className="detail-icon">📍</span>
          <span className="detail-text">{bank.address}</span>
        </div>
        
        {bank.phone && (
          <div className="detail-item">
            <span className="detail-icon">📞</span>
            <a href={`tel:${bank.phone}`} className="detail-link">{bank.phone}</a>
          </div>
        )}
        
        {bank.email && (
          <div className="detail-item">
            <span className="detail-icon">✉️</span>
            <a href={`mailto:${bank.email}`} className="detail-link">{bank.email}</a>
          </div>
        )}
        
        {bank.timings && (
          <div className="detail-item">
            <span className="detail-icon">🕒</span>
            <span className="detail-text">{bank.timings}</span>
          </div>
        )}
      </div>
      
      {bank.components && (
        <div className="bank-components">
          <h4>Available Components:</h4>
          <div className="components-list">
            {bank.components.map((component, idx) => (
              <span key={idx} className="component-tag">{component}</span>
            ))}
          </div>
        </div>
      )}
      
      {bank.availability_status && (
        <div className="availability-status">
          <span className="status-icon">ℹ️</span>
          <span className="status-text">{bank.availability_status}</span>
        </div>
      )}
    </div>
  );

  const renderResults = () => {
    if (!results) return null;

    const primaryResult = results.primary_result;
    
    return (
      <div className="results-section">
        <div className="results-header">
          <h2>Search Results</h2>
          <div className="search-info">
            <span>Searched for: {searchParams.blood_group} {searchParams.component}</span>
            <span>Location: {searchParams.district}, {searchParams.state}</span>
          </div>
        </div>

        {primaryResult.blood_banks && primaryResult.blood_banks.length > 0 ? (
          <div className="blood-banks-list">
            <div className="results-count">
              Found {primaryResult.blood_banks.length} blood bank(s)
            </div>
            {primaryResult.blood_banks.map((bank, index) => renderBloodBank(bank, index))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No Blood Banks Found</h3>
            <p>{primaryResult.message || 'No blood banks found for your search criteria.'}</p>
          </div>
        )}

        {primaryResult.disclaimer && (
          <div className="disclaimer">
            <span className="disclaimer-icon">⚠️</span>
            <p>{primaryResult.disclaimer}</p>
          </div>
        )}

        {primaryResult.recommendations && (
          <div className="recommendations">
            <h3>Recommendations:</h3>
            <ul>
              {primaryResult.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {primaryResult.emergency_contacts && (
          <div className="emergency-contacts">
            <h3>Emergency Contacts:</h3>
            <div className="contacts-grid">
              {Object.entries(primaryResult.emergency_contacts).map(([name, number]) => (
                <div key={name} className="contact-item">
                  <span className="contact-name">{name}:</span>
                  <a href={`tel:${number}`} className="contact-number">{number}</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.strategies_attempted && (
          <div className="debug-info">
            <details>
              <summary>Search Details</summary>
              <div className="debug-content">
                {results.strategies_attempted.map((attempt, index) => (
                  <div key={index} className="strategy-attempt">
                    <strong>{attempt.strategy}:</strong>
                    <span className={attempt.success ? 'success' : 'failed'}>
                      {attempt.success ? ' ✓ Success' : ' ✗ Failed'}
                    </span>
                    {attempt.reason && <p>Reason: {attempt.reason}</p>}
                    {attempt.error && <p>Error: {attempt.error}</p>}
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="blood-availability">
      <div className="container">
        <div className="page-header">
          <h1>Blood Bank Search</h1>
          <p>Find blood banks and check availability across India</p>
        </div>

        <div className="search-section">
          <form onSubmit={searchBloodBanks} className="search-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="state">State *</label>
                <select
                  id="state"
                  name="state"
                  value={searchParams.state}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select State</option>
                  {indianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="district">District/City *</label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={searchParams.district}
                  onChange={handleInputChange}
                  placeholder="e.g., Chennai, Bangalore"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="blood_group">Blood Group *</label>
                <select
                  id="blood_group"
                  name="blood_group"
                  value={searchParams.blood_group}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="component">Blood Component</label>
                <select
                  id="component"
                  name="component"
                  value={searchParams.component}
                  onChange={handleInputChange}
                >
                  {components.map(component => (
                    <option key={component} value={component}>{component}</option>
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
                  Search Blood Banks
                </>
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {renderResults()}

        {/* Quick Tips */}
        <div className="tips-section">
          <h3>Search Tips</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <span className="tip-icon">💡</span>
              <h4>For Better Results</h4>
              <ul>
                <li>Use full city names (e.g., "Chennai" not "CHN")</li>
                <li>Try nearby major cities if no results</li>
                <li>Contact blood banks directly for real-time stock</li>
              </ul>
            </div>
            <div className="tip-card">
              <span className="tip-icon">🚨</span>
              <h4>Emergency Needs</h4>
              <ul>
                <li>Call multiple blood banks simultaneously</li>
                <li>Contact hospital blood banks directly</li>
                <li>Consider compatible blood groups in emergency</li>
              </ul>
            </div>
            <div className="tip-card">
              <span className="tip-icon">📞</span>
              <h4>Important Numbers</h4>
              <ul>
                <li>Emergency: 108</li>
                <li>Blood Helpline: 1910</li>
                <li>Red Cross: 011-23711551</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Blood Compatibility Chart */}
        <div className="compatibility-section">
          <h3>Blood Compatibility Chart</h3>
          <div className="compatibility-table">
            <table>
              <thead>
                <tr>
                  <th>Blood Group</th>
                  <th>Can Receive From</th>
                  <th>Can Donate To</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>O-</td>
                  <td>O-</td>
                  <td>All groups (Universal Donor)</td>
                </tr>
                <tr>
                  <td>O+</td>
                  <td>O+, O-</td>
                  <td>O+, A+, B+, AB+</td>
                </tr>
                <tr>
                  <td>A-</td>
                  <td>A-, O-</td>
                  <td>A+, A-, AB+, AB-</td>
                </tr>
                <tr>
                  <td>A+</td>
                  <td>A+, A-, O+, O-</td>
                  <td>A+, AB+</td>
                </tr>
                <tr>
                  <td>B-</td>
                  <td>B-, O-</td>
                  <td>B+, B-, AB+, AB-</td>
                </tr>
                <tr>
                  <td>B+</td>
                  <td>B+, B-, O+, O-</td>
                  <td>B+, AB+</td>
                </tr>
                <tr>
                  <td>AB-</td>
                  <td>AB-, A-, B-, O-</td>
                  <td>AB+, AB-</td>
                </tr>
                <tr>
                  <td>AB+</td>
                  <td>All groups (Universal Recipient)</td>
                  <td>AB+</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BloodAvailability;