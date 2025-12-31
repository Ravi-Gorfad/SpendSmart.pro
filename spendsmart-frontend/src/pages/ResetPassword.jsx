import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { passwordAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiLock, FiCheckCircle, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';

const ResetPassword = () => {
  const [step, setStep] = useState(1); // 1: Verify OTP, 2: Reset Password
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const emailFromState = location.state?.email;
    if (emailFromState) {
      setEmail(emailFromState);
    } else {
      navigate('/forgot-password');
    }
  }, [location, navigate]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, '');

    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      await passwordAPI.verifyResetOtp({ email, otp: otpString });
      toast.success('OTP verified successfully');
      setStep(2);
    } catch (error) {
      toast.error(
        error.response?.data?.error || 'Invalid or expired OTP. Please try again.'
      );
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    }

    setLoading(false);
  };

  const handleResendOtp = async () => {
    setResending(true);

    try {
      await passwordAPI.resendResetOtp({ email });
      toast.success('New OTP sent to your email');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } catch (error) {
      toast.error(
        error.response?.data?.error || 'Failed to resend OTP. Please try again.'
      );
    }

    setResending(false);
  };

  const handlePasswordChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const validatePassword = () => {
    const newErrors = {};

    if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      await passwordAPI.resetPassword({
        email,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      toast.success('Password reset successful! You can now login.');
      navigate('/login');
    } catch (error) {
      toast.error(
        error.response?.data?.error || 'Failed to reset password. Please try again.'
      );
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <h1 className="auth-title">
            <span className="text-primary">Spend</span>
            <span className="text-success">Smart</span>
          </h1>
          <p className="auth-subtitle">
            {step === 1 ? 'Verify OTP' : 'Reset Password'}
          </p>
        </div>

        {step === 1 ? (
          <>
            <div className="text-center mb-4">
              <FiLock className="text-primary" size={64} />
              <p className="mt-3">
                Enter the OTP sent to <strong>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="auth-form">
              <div className="otp-container mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    className="form-control form-control-lg otp-input"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    maxLength={1}
                    autoFocus={index === 0}
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 mb-3"
                disabled={loading || otp.join('').length !== 6}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="me-2" />
                    Verify OTP
                  </>
                )}
              </button>

              <div className="text-center mb-3">
                <button
                  type="button"
                  className="btn btn-link text-decoration-none"
                  onClick={handleResendOtp}
                  disabled={resending}
                >
                  {resending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiRefreshCw className="me-2" />
                      Resend OTP
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <form onSubmit={handlePasswordSubmit} className="auth-form">
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">
                  <FiLock className="me-2" />
                  New Password *
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control form-control-lg ${
                      errors.newPassword ? 'is-invalid' : ''
                    }`}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.newPassword && (
                  <div className="invalid-feedback">{errors.newPassword}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control form-control-lg ${
                    errors.confirmPassword ? 'is-invalid' : ''
                  }`}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Confirm your new password"
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback">{errors.confirmPassword}</div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="me-2" />
                    Reset Password
                  </>
                )}
              </button>
            </form>
          </>
        )}

        <div className="text-center">
          <Link to="/login" className="text-decoration-none">
            <FiArrowLeft className="me-2" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

