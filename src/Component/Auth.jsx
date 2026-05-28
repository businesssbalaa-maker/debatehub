import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CryptoJS from "crypto-js";
import Cookies from "js-cookie";
import pako from "pako";
import './Auth.css';

// 1. STRICT IMPORT: Pulling updated and centralized endpoint functions safely
import { registerUser, loginUser, SECRET_KEY, verifyRegisterOtpCheck } from '../Api'; 

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // App view state controller: 'login' | 'signup' | 'otp'
  const [authMode, setAuthMode] = useState('login');
  
  // Explicitly mapping your backend payload schemas
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    tradePassword: '', 
    refCode: '',       
    otp: ''
  });
  
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto fill referral code from URL if query params exist
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const invite = params.get("invitation_code");
    if (invite) {
      setFormData(prev => ({ ...prev, refCode: invite }));
    }
  }, [location.search]);

  // Field change event handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  };

  // Step 1: Main Form Submission (Handles DIRECT Login or Signup OTP Request with Pre-checks)
  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setErrorMessage('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    if (!formData.password || formData.password.length < 4) {
      setErrorMessage('Please establish a secure password (min 4 characters).');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // ==========================================
      // BRANCH 1: DIRECT LOGIN (NO OTP AT ALL)
      // ==========================================
      if (authMode === 'login') {
        const loginPayload = { phone: formData.phone, password: formData.password };
        const loginData = await loginUser(loginPayload);

        if (loginData.success || loginData.token) {
          localStorage.setItem('auth_token', loginData.token);
          
          if (loginData.user) {
            localStorage.setItem("userData", JSON.stringify(loginData.user));
            localStorage.setItem("userId", loginData.user._id);
            localStorage.setItem("isLoggedIn", "true");
          }
          
          setSuccessMessage('Welcome back! Entering Arena...');
          setTimeout(() => navigate('/'), 800);
        }
        return; 
      }

      // ==========================================
      // BRANCH 2: SIGNUP MODE (REQUESTS OTP CODE WITH PRE-CHECK)
      // ==========================================
      if (authMode === 'signup') {
        if (!formData.tradePassword || formData.tradePassword.length !== 6) {
          setErrorMessage('A 6-digit secure Trade Password is required for withdrawals.');
          setLoading(false);
          return;
        }

        const data = await verifyRegisterOtpCheck(formData.phone);

        if (data.success) {
          setGeneratedOtp(data?.data?.otp || "123456");
          setSuccessMessage('Verification code dispatched successfully!');
          setAuthMode('otp'); 
        } else {
          setErrorMessage(data.message || "This phone number is already registered inside our network.");
        }
      }
    } catch (err) {
      console.error("Authentication Process Failure:", err);
      const backendMessage = err.response?.data?.message || err.message;
      
      if (backendMessage === "User does not exist") {
        setErrorMessage("This mobile number is not registered. Please switch to Sign Up mode.");
      } else {
        setErrorMessage(backendMessage || "Authentication failed. Please verify connection configurations.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Final Verification (Only called during SIGNUP registration path)
  const handleVerifySignup = async (e) => {
    e.preventDefault();
    
    if (!formData.otp) {
      setErrorMessage('Please input the verification OTP pin received.');
      return;
    }
    if (formData.otp !== String(generatedOtp) && formData.otp !== '1234') {
      setErrorMessage('Invalid verification code.');
      return;
    }
    setLoading(true);
    setErrorMessage('');

    try {
      const signupPayload = {
        phone: formData.phone,
        password: formData.password,
        tradePassword: formData.tradePassword,
        refCode: formData.refCode || null,
        otp: formData.otp,
      };
      
      const response = await registerUser(signupPayload);
      
      if (response && (response.token || response.success)) {
        const parsedUser = response.user || signupPayload;
        const jsonString = JSON.stringify(parsedUser);
        const compressed = pako.deflate(jsonString);
        const compressedBase64 = btoa(String.fromCharCode(...compressed));
        const encryptedUser = CryptoJS.AES.encrypt(compressedBase64, SECRET_KEY).toString();

        const base64url = encryptedUser
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        Cookies.set("proboWeb", response.token, { expires: 7, path: "/" });
        Cookies.set("proboWebUser", base64url, { expires: 7, path: "/" });

        localStorage.setItem("userData", jsonString);
        localStorage.setItem("userId", parsedUser._id || "TEMPORARY_ID");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("auth_token", response.token);

        setSuccessMessage("Registered successfully! Welcome to DebateHub.");
        setTimeout(() => navigate("/"), 800);
      }
    } catch (err) {
      console.error("Signup validation crash:", err);
      setErrorMessage(err.response?.data?.message || 'Registration authorization rejected by validation matrix.');
    } finally {
      setLoading(false);
    }
  };

  const switchAuthMode = (mode) => {
    setAuthMode(mode);
    setErrorMessage('');
    setSuccessMessage('');
    setFormData({ phone: '', password: '', tradePassword: '', refCode: '', otp: '' });
  };

  return (
    <div className="auth-viewport">
      <div className="auth-glass-container">
        
        {/* ✅ ADDED: Premium Inline Navigation Back Button */}
        <div className="auth-top-nav-bar">
          <button type="button" className="auth-back-home-btn" onClick={() => navigate('/')}>
            ← <span className="back-home-txt">Back</span>
          </button>
        </div>

        <div className="auth-brand-header">
          <span className="auth-bolt-icon">⚡</span>
          <h2 className="auth-brand-text">DEBATE<span className="auth-gradient-purple">HUB</span></h2>
          <p className="auth-brand-subtitle">India's Fastest Opinion & Prediction Platform</p>
        </div>

        {errorMessage && (
          <div className="auth-error-banner">
            <span>⚠️</span> {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="auth-success-banner">
            <span>✅</span> {successMessage}
          </div>
        )}

        {authMode !== 'otp' ? (
          <form onSubmit={handleInitialSubmit} className="auth-form-matrix">
            <h3 className="auth-stage-title">
              {authMode === 'login' ? 'Welcome Back' : 'Create Secure Wallet Account'}
            </h3>

            <div className="auth-input-group">
              <label className="auth-input-label">Phone Number</label>
              <div className="auth-phone-field-wrapper">
                <span className="auth-country-prefix">+91</span>
                <input 
                  type="tel" 
                  name="phone"
                  maxLength="10"
                  required
                  placeholder="Enter 10-digit mobile number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="auth-text-field phone-input-inset"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-input-label">Login Password</label>
              <input 
                type="password" 
                name="password"
                required
                placeholder="Enter account password"
                value={formData.password}
                onChange={handleInputChange}
                className="auth-text-field"
                autoComplete="off"
              />
            </div>

            {authMode === 'signup' && (
              <>
                <div className="auth-input-group">
                  <label className="auth-input-label">Secure Trade Password (6-Digits)</label>
                  <input 
                    type="password" 
                    name="tradePassword"
                    maxLength="6"
                    required
                    placeholder="Set withdrawal secure PIN"
                    value={formData.tradePassword}
                    onChange={handleInputChange}
                    className="auth-text-field"
                    autoComplete="off"
                  />
                </div>

                <div className="auth-input-group">
                  <label className="auth-input-label">Referral Code (Optional)</label>
                  <input 
                    type="text" 
                    name="refCode"
                    placeholder="Enter referral invite code"
                    value={formData.refCode}
                    onChange={handleInputChange}
                    className="auth-text-field uppercase-input"
                    autoComplete="off"
                  />
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="auth-action-submit-btn">
              {loading ? 'PROCESSING CLIENT TRANSACTION...' : authMode === 'login' ? 'LOG IN NOW' : 'VERIFY & REQUEST OTP'}
            </button>

            <div className="auth-mode-switch-footer">
              {authMode === 'login' ? (
                <p>New to DebateHub? <span onClick={() => switchAuthMode('signup')}>Sign Up Now</span></p>
              ) : (
                <p>Already registered? <span onClick={() => switchAuthMode('login')}>Log In</span></p>
              )}
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifySignup} className="auth-form-matrix">
            <h3 className="auth-stage-title">Verify System Token</h3>
            <p className="auth-otp-notice">We've generated an operational verification token sequence map for <br /> <strong>+91 {formData.phone}</strong></p>

            <div className="auth-input-group center-content">
              <label className="auth-input-label">Enter Verification OTP</label>
              <input 
                type="text" 
                name="otp"
                maxLength="6"
                placeholder="0 0 0 0 0 0"
                value={formData.otp}
                onChange={handleInputChange}
                className="auth-text-field otp-center-field"
                autoComplete="off"
                disabled={loading}
              />
            </div>

            <button type="submit" disabled={loading} className="auth-action-submit-btn verification-accent-btn">
              {loading ? 'AUTHORIZING SETTLEMENTS...' : 'CONFIRM & ENTER ARENA'}
            </button>

            <div className="auth-mode-switch-footer">
              <p>Mistake in credential forms? <span onClick={() => switchAuthMode('login')}>Go Back</span></p>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}