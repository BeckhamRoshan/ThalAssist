import React, { useState } from 'react';
import { User, Heart, Droplet, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import './Register.css';

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    userType: 'patient',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    bloodGroup: '',
    city: '',
    medicalHistory: '',
    emergencyContact: '',
    weight: '',
    lastDonation: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const { register, isLoading, error, clearError } = useAuth();
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear auth error
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = {};

    // Basic validation
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm password';
    else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    if (!formData.bloodGroup) errors.bloodGroup = 'Blood group is required';
    if (!formData.city.trim()) errors.city = 'City is required';

    // Donor-specific validation
    if (formData.userType === 'donor') {
      if (!formData.weight || formData.weight < 45) {
        errors.weight = 'Weight must be at least 45 kg for donation';
      }
    }

    // Patient-specific validation
    if (formData.userType === 'patient') {
      if (!formData.emergencyContact.trim()) {
        errors.emergencyContact = 'Emergency contact is required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      console.log('Submitting registration with data:', formData);
      
      const result = await register(formData);
      
      if (result.success) {
        console.log('Registration successful:', result.user);
        // Registration was successful, the user should now be logged in
        // You might want to redirect to dashboard here
      } else {
        console.error('Registration failed:', result.error);
      }
    } catch (error) {
      console.error('Registration submission error:', error);
    }
  };

  const renderError = (fieldName) => {
    if (validationErrors[fieldName]) {
      return <span className="error-text">{validationErrors[fieldName]}</span>;
    }
    return null;
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="icon-circle">
            <Heart className="icon-heart" />
          </div>
          <h2>Join ThalAssist</h2>
          <p>Create your account to get started</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="user-type-select">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, userType: 'patient' }))}
              className={`user-btn ${formData.userType === 'patient' ? 'active' : ''}`}
            >
              <User className="user-icon" />
              <span>Patient</span>
              <small>Need blood</small>
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, userType: 'donor' }))}
              className={`user-btn ${formData.userType === 'donor' ? 'active' : ''}`}
            >
              <Droplet className="user-icon" />
              <span>Donor</span>
              <small>Donate blood</small>
            </button>
          </div>

          <div className="input-grid">
            <div className="input-group">
              <input 
                type="text" 
                name="name" 
                placeholder="Full Name" 
                value={formData.name} 
                onChange={handleChange} 
                className={validationErrors.name ? 'error' : ''}
                required 
              />
              {renderError('name')}
            </div>
            
            <div className="input-group">
              <input 
                type="email" 
                name="email" 
                placeholder="Email Address" 
                value={formData.email} 
                onChange={handleChange} 
                className={validationErrors.email ? 'error' : ''}
                required 
              />
              {renderError('email')}
            </div>
            
            <div className="input-group">
              <input 
                type="password" 
                name="password" 
                placeholder="Password" 
                value={formData.password} 
                onChange={handleChange} 
                className={validationErrors.password ? 'error' : ''}
                required 
              />
              {renderError('password')}
            </div>
            
            <div className="input-group">
              <input 
                type="password" 
                name="confirmPassword" 
                placeholder="Confirm Password" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                className={validationErrors.confirmPassword ? 'error' : ''}
                required 
              />
              {renderError('confirmPassword')}
            </div>
            
            <div className="input-group">
              <input 
                type="tel" 
                name="phone" 
                placeholder="Phone Number" 
                value={formData.phone} 
                onChange={handleChange} 
                className={validationErrors.phone ? 'error' : ''}
                required 
              />
              {renderError('phone')}
            </div>
            
            <div className="input-group">
              <input 
                type="date" 
                name="dateOfBirth" 
                value={formData.dateOfBirth} 
                onChange={handleChange} 
                className={validationErrors.dateOfBirth ? 'error' : ''}
                required 
              />
              {renderError('dateOfBirth')}
            </div>
            
            <div className="input-group">
              <select 
                name="bloodGroup" 
                value={formData.bloodGroup} 
                onChange={handleChange} 
                className={validationErrors.bloodGroup ? 'error' : ''}
                required
              >
                <option value="">Select Blood Group</option>
                {bloodGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
              {renderError('bloodGroup')}
            </div>
            
            <div className="input-group">
              <input 
                type="text" 
                name="city" 
                placeholder="City" 
                value={formData.city} 
                onChange={handleChange} 
                className={validationErrors.city ? 'error' : ''}
                required 
              />
              {renderError('city')}
            </div>
          </div>

          {formData.userType === 'patient' && (
            <div className="additional-info">
              <div className="input-group">
                <textarea 
                  name="medicalHistory" 
                  placeholder="Medical History (Optional)" 
                  value={formData.medicalHistory} 
                  onChange={handleChange}
                ></textarea>
              </div>
              <div className="input-group">
                <input 
                  type="text" 
                  name="emergencyContact" 
                  placeholder="Emergency Contact" 
                  value={formData.emergencyContact} 
                  onChange={handleChange} 
                  className={validationErrors.emergencyContact ? 'error' : ''}
                  required
                />
                {renderError('emergencyContact')}
              </div>
            </div>
          )}

          {formData.userType === 'donor' && (
            <div className="additional-info">
              <div className="input-group">
                <input 
                  type="number" 
                  name="weight" 
                  placeholder="Weight (kg)" 
                  value={formData.weight} 
                  onChange={handleChange} 
                  className={validationErrors.weight ? 'error' : ''}
                  min="45"
                  required
                />
                {renderError('weight')}
              </div>
              <div className="input-group">
                <input 
                  type="date" 
                  name="lastDonation" 
                  placeholder="Last Donation Date (Optional)" 
                  value={formData.lastDonation} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="switch-login">
          <p>
            Already have an account?{' '}
            <button type="button" onClick={onSwitchToLogin}>Sign in here</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;