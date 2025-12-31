import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';

const VerifyOtp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds

  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from navigation state or prompt user
    const emailFromState = location.state?.email;
    if (emailFromState) {
      setEmail(emailFromState);
    } else {
      // If no email in state, redirect to register
      navigate('/register');
    }
  }, [location, navigate]);

  useEffect(() => {
    // Countdown timer
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, ''); // Only numbers

    setOtp(newOtp);

    // Auto-focus next input
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

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    
    setOtp(newOtp);
    
    // Focus last input
    const lastInput = document.getElementById(`otp-${5}`);
    if (lastInput) lastInput.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);

    const result = await verifyOtp(email, otpString);

    if (result.success) {
      toast.success('Registration completed successfully! You can now login.');
      navigate('/login');
    } else {
      toast.error(result.error || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    }

    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);

    const result = await resendOtp(email);

    if (result.success) {
      toast.success('New OTP sent to your email');
      setTimer(600); // Reset timer
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } else {
      toast.error(result.error || 'Failed to resend OTP. Please try again.');
    }

    setResending(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <h1 className="auth-title">
            <span className="text-primary">Spend</span>
            <span className="text-success">Smart</span>
          </h1>
          <p className="auth-subtitle">Verify your email</p>
        </div>

        <div className="text-center mb-4">
          <FiMail className="text-primary" size={64} />
          <p className="mt-3">
            We've sent a 6-digit OTP to <strong>{email}</strong>
          </p>
          <p className="text-muted small">
            Please check your email and enter the code below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
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
                onPaste={index === 0 ? handlePaste : undefined}
                maxLength={1}
                autoFocus={index === 0}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            ))}
          </div>

          <div className="mb-3 text-center">
            {timer > 0 ? (
              <p className="text-muted small">
                OTP expires in: <strong>{formatTime(timer)}</strong>
              </p>
            ) : (
              <p className="text-danger small">OTP has expired</p>
            )}
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
              onClick={handleResend}
              disabled={resending || timer > 540} // Can resend after 1 minute
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

          <div className="text-center">
            <Link to="/register" className="text-decoration-none">
              Back to registration
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;

