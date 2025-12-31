import { Link } from 'react-router-dom';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiShield,
  FiPieChart,
  FiDollarSign,
  FiSmartphone,
  FiBarChart2,
  FiCheck,
  FiArrowRight,
  FiUsers,
  FiAward,
} from 'react-icons/fi';

// Simplified landing page without auth context dependency
const SimpleLanding = () => {
  const features = [
    {
      icon: <FiDollarSign />,
      title: 'Track Expenses',
      description: 'Easily record and categorize all your expenses in one place.',
    },
    {
      icon: <FiPieChart />,
      title: 'Visual Analytics',
      description: 'Get insights with beautiful charts and detailed reports.',
    },
    {
      icon: <FiTrendingUp />,
      title: 'Budget Planning',
      description: 'Set budgets and track your spending against your goals.',
    },
    {
      icon: <FiShield />,
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and completely private.',
    },
    {
      icon: <FiSmartphone />,
      title: 'Mobile Friendly',
      description: 'Access your finances anywhere, anytime on any device.',
    },
    {
      icon: <FiBarChart2 />,
      title: 'Smart Reports',
      description: 'Generate comprehensive reports to understand your spending.',
    },
  ];

  const benefits = [
    'Real-time expense tracking',
    'Category-based organization',
    'Monthly and yearly reports',
    'Secure OTP-based authentication',
    'Export data to CSV/PDF',
    'Multi-device synchronization',
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="container">
          <div className="nav-content">
            <div className="nav-brand">
              <span className="text-primary">Spend</span>
              <span className="text-success">Smart</span>
            </div>
            <div className="nav-links">
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Take Control of Your
                <span className="gradient-text"> Finances</span>
              </h1>
              <p className="hero-description">
                SpendSmart helps you track expenses, manage budgets, and achieve
                your financial goals with ease. Start your journey to financial
                freedom today.
              </p>
              <div className="hero-cta">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started Free
                  <FiArrowRight className="ms-2" />
                </Link>
                <Link to="/login" className="btn btn-outline-primary btn-lg">
                  Sign In
                </Link>
              </div>
              <div className="hero-stats">
                <div className="stat-item">
                  <FiUsers className="stat-icon" />
                  <div>
                    <div className="stat-number">10K+</div>
                    <div className="stat-label">Active Users</div>
                  </div>
                </div>
                <div className="stat-item">
                  <FiDollarSign className="stat-icon" />
                  <div>
                    <div className="stat-number">$1M+</div>
                    <div className="stat-label">Tracked</div>
                  </div>
                </div>
                <div className="stat-item">
                  <FiAward className="stat-icon" />
                  <div>
                    <div className="stat-number">4.9/5</div>
                    <div className="stat-label">Rating</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-card">
                <div className="card-header">
                  <div className="card-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div className="card-content">
                  <div className="demo-stats">
                    <div className="demo-stat income">
                      <FiTrendingUp />
                      <div>
                        <div className="demo-label">Income</div>
                        <div className="demo-value">$5,000</div>
                      </div>
                    </div>
                    <div className="demo-stat expense">
                      <FiTrendingDown />
                      <div>
                        <div className="demo-label">Expense</div>
                        <div className="demo-value">$3,200</div>
                      </div>
                    </div>
                    <div className="demo-stat balance">
                      <FiDollarSign />
                      <div>
                        <div className="demo-label">Balance</div>
                        <div className="demo-value">$1,800</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-description">
              Everything you need to manage your finances effectively
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2 className="section-title">Why Choose SpendSmart?</h2>
              <p className="section-description">
                Join thousands of users who are taking control of their finances
                with our intuitive platform.
              </p>
              <ul className="benefits-list">
                {benefits.map((benefit, index) => (
                  <li key={index} className="benefit-item">
                    <FiCheck className="benefit-check" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn btn-primary btn-lg mt-4">
                Start Free Trial
                <FiArrowRight className="ms-2" />
              </Link>
            </div>
            <div className="benefits-visual">
              <div className="visual-card">
                <FiDollarSign className="visual-icon" />
                <h3>Smart Insights</h3>
                <p>Get AI-powered insights into your spending patterns</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Take Control?</h2>
            <p className="cta-description">
              Join SpendSmart today and start your journey to financial
              freedom. It's free to get started!
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free
              <FiArrowRight className="ms-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>
                <span className="text-primary">Spend</span>
                <span className="text-success">Smart</span>
              </h3>
              <p>Your smart expense tracking companion</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#security">Security</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#blog">Blog</a>
                <a href="#contact">Contact</a>
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <a href="#help">Help Center</a>
                <a href="#docs">Documentation</a>
                <a href="#faq">FAQ</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 SpendSmart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SimpleLanding;


