import React, { useState } from 'react';
import { User, Heart, Droplet } from 'lucide-react';
import { useAuth } from './AuthContext';
import './Login.css';

const Login = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'patient'
  });
  const [errors, setErrors] = useState({});
  const { login, isLoading } = useAuth();

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be 6+ chars';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await login(formData.email, formData.password, formData.userType);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-circle"><Heart /></div>
          <h2>Welcome Back</h2>
          <p>Sign in to your ThalAssist account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="user-type-select">
            <button
              type="button"
              className={formData.userType === 'patient' ? 'active' : ''}
              onClick={() => setFormData(prev => ({ ...prev, userType: 'patient' }))}
            >
              <User /> Patient
            </button>
            <button
              type="button"
              className={formData.userType === 'donor' ? 'active' : ''}
              onClick={() => setFormData(prev => ({ ...prev, userType: 'donor' }))}
            >
              <Droplet /> Donor
            </button>
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="switch-register">
          <p>Don't have an account? <span onClick={onSwitchToRegister}>Sign up here</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
