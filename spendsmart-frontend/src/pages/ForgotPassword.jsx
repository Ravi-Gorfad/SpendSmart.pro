import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { passwordAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiMail, FiArrowLeft } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await passwordAPI.forgotPassword({ email });
      toast.success('Password reset OTP sent to your email');
      navigate('/reset-password', {
        state: { email },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          'Failed to send OTP. Please check your email and try again.'
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
          <p className="auth-subtitle">Reset your password</p>
        </div>

        <div className="text-center mb-4">
          <FiMail className="text-primary" size={64} />
          <p className="mt-3">
            Enter your email address and we'll send you an OTP to reset your
            password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              <FiMail className="me-2" />
              Email Address
            </label>
            <input
              type="email"
              className="form-control form-control-lg"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@example.com"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 mb-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Sending OTP...
              </>
            ) : (
              <>
                <FiMail className="me-2" />
                Send OTP
              </>
            )}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-decoration-none">
              <FiArrowLeft className="me-2" />
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

