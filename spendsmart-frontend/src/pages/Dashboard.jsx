import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FiLogOut,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiPieChart,
  FiPlus,
  FiSettings,
  FiUser,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { transactionAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency } from '../utils/currency';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(true);
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const formatDate = (date) => date.toISOString().split('T')[0];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 29);
      const params = {
        startDate: formatDate(start),
        endDate: formatDate(end),
      };

      const [summaryRes, transactionsRes] = await Promise.all([
        transactionAPI.getDashboardSummary(params),
        transactionAPI.list({ ...params }),
      ]);

      setSummary(summaryRes.data);
      setTransactions(transactionsRes.data || []);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
      toast.error(error.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = summary
    ? {
        totalIncome: Number(summary.totalIncome ?? 0),
        totalExpense: Number(summary.totalExpense ?? 0),
        balance: Number(summary.balance ?? 0),
        averageDailyExpense: Number(summary.averageDailyExpense ?? 0),
      }
    : {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        averageDailyExpense: 0,
      };

  const savingsRate =
    stats.totalIncome > 0 ? ((stats.balance / stats.totalIncome) * 100).toFixed(1) : '0.0';

  const recentTransactions = transactions.slice(0, 5);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="main-content d-flex align-items-center justify-content-center">
          <LoadingSpinner size="lg" text="Loading your dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${showSidebar ? 'show' : 'hide'}`}>
        <div className="sidebar-header">
          <h3 className="sidebar-title">
            <span className="text-primary">Spend</span>
            <span className="text-success">Smart</span>
          </h3>
          <button
            className="btn btn-link text-white d-md-none"
            onClick={() => setShowSidebar(false)}
          >
            ×
          </button>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active" onClick={() => navigate('/dashboard')}>
            <FiPieChart className="me-2" />
            Dashboard
          </button>
          <button className="nav-item" onClick={() => navigate('/transactions')}>
            <FiDollarSign className="me-2" />
            Transactions
          </button>
          <button className="nav-item" onClick={() => navigate('/categories')}>
            <FiSettings className="me-2" />
            Categories
          </button>
          <button className="nav-item" onClick={() => navigate('/reports')}>
            <FiPieChart className="me-2" />
            Reports
          </button>
          <button className="nav-item" onClick={() => navigate('/profile')}>
            <FiUser className="me-2" />
            Profile
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.username}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button className="btn btn-outline-light btn-sm w-100" onClick={handleLogout}>
            <FiLogOut className="me-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Navbar */}
        <nav className="top-navbar">
          <button
            className="btn btn-link d-md-none"
            onClick={() => setShowSidebar(true)}
          >
            ☰
          </button>
          <div>
            <h4 className="mb-0">Dashboard</h4>
            <small className="text-muted">Manage your finances efficiently</small>
          </div>
          <div className="navbar-actions">
            <button
              className="btn btn-primary btn-shadow"
              onClick={() => navigate('/transactions')}
            >
              <FiPlus className="me-2" />
              Add Transaction
            </button>
          </div>
        </nav>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Welcome Section */}
          <div className="welcome-section mb-4">
            <h2 className="welcome-title">
              Welcome back, <span className="text-primary">{user?.username}</span>! 👋
            </h2>
            <p className="welcome-subtitle">Here's your financial overview</p>
          </div>

          {/* Stats Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-3 col-sm-6">
              <div className="stat-card income animated-card">
                <div className="stat-icon">
                  <FiTrendingUp />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Total Income</div>
                  <div className="stat-value">{formatCurrency(stats.totalIncome)}</div>
                  <div className="stat-change positive">
                    {summary ? 'Updated with live data' : 'Waiting for activity'}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="stat-card expense animated-card">
                <div className="stat-icon">
                  <FiTrendingDown />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Total Expense</div>
                  <div className="stat-value">{formatCurrency(stats.totalExpense)}</div>
                  <div className="stat-change negative">
                    {summary ? `${formatCurrency(stats.averageDailyExpense)}/day` : 'No expenses yet'}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="stat-card balance animated-card">
                <div className="stat-icon">
                  <FiDollarSign />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Balance</div>
                  <div className="stat-value">{formatCurrency(stats.balance)}</div>
                  <div className="stat-change positive">Available now</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="stat-card savings animated-card">
                <div className="stat-icon">
                  <FiPieChart />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Savings Rate</div>
                  <div className="stat-value">
                    {savingsRate}%
                  </div>
                  <div className="stat-change positive">Great job!</div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Transactions */}
          <div className="row g-3">
            <div className="col-lg-8">
              <div className="card shadow-sm interactive-card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Monthly Overview</h5>
                  <button
                    className="btn btn-sm btn-link text-primary p-0"
                    onClick={() => navigate('/reports')}
                  >
                    View Details →
                  </button>
                </div>
                <div className="card-body">
                  {summary?.monthlyTrend?.length ? (
                    <div className="monthly-trend">
                      {summary.monthlyTrend.slice(-6).reverse().map((trend, index) => {
                        const monthStr = String(trend.month);
                        const monthDate = new Date(monthStr + '-01');
                        return (
                          <div
                            key={trend.month}
                            className="monthly-trend-item d-flex justify-content-between align-items-center py-3 border-bottom"
                            style={{ animationDelay: `${index * 0.1}s` }}
                            onClick={() => navigate('/reports')}
                          >
                            <div className="flex-grow-1">
                              <strong className="d-block">
                                {monthDate.toLocaleDateString('en-US', {
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </strong>
                              <small className="text-muted">{monthStr}</small>
                            </div>
                            <div className="text-end me-4">
                              <div className="text-success fw-bold">
                                {formatCurrency(Number(trend.income))}
                              </div>
                              <small className="text-muted">Income</small>
                            </div>
                            <div className="text-end">
                              <div className="text-danger fw-bold">
                                {formatCurrency(Number(trend.expense))}
                              </div>
                              <small className="text-muted">Expense</small>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="chart-placeholder text-center py-5">
                      <p className="text-muted mb-3">No historical data yet</p>
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate('/transactions')}
                      >
                        <FiPlus className="me-2" />
                        Add Your First Transaction
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm interactive-card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Recent Transactions</h5>
                  <button
                    className="btn btn-sm btn-link text-primary p-0"
                    onClick={() => navigate('/transactions')}
                  >
                    View All →
                  </button>
                </div>
                <div className="card-body">
                  {recentTransactions.length > 0 ? (
                    <div className="transaction-list">
                      {recentTransactions.map((transaction, index) => (
                        <div
                          key={transaction.id}
                          className="transaction-item"
                          style={{ animationDelay: `${index * 0.1}s` }}
                          onClick={() => navigate('/transactions')}
                        >
                          <div className="transaction-info">
                            <div className="transaction-description">
                              {transaction.description || 'No description'}
                            </div>
                            <div className="transaction-meta">
                              <span className="transaction-category">
                                {transaction.categoryName || transaction.category || 'Unknown'}
                              </span>
                              <span className="transaction-date">{transaction.date}</span>
                            </div>
                            <div className="small text-muted">
                              {transaction.type === 'INCOME' ? 'Income' : 'Expense'}
                            </div>
                          </div>
                          <div
                            className={`transaction-amount ${
                              transaction.type === 'INCOME' ? 'income' : 'expense'
                            }`}
                          >
                            {transaction.type === 'INCOME' ? '+' : '-'}
                            {formatCurrency(Math.abs(Number(transaction.amount || 0)))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted mb-3">No transactions yet</p>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate('/transactions')}
                      >
                        <FiPlus className="me-2" />
                        Add Transaction
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="row g-3 mt-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Spending Breakdown</h5>
                </div>
                <div className="card-body">
                  {summary?.categoryBreakdown?.length ? (
                    <div className="row">
                      {summary.categoryBreakdown.map((item) => (
                        <div key={item.categoryId} className="col-md-4 mb-3">
                          <div className="p-3 bg-light rounded">
                            <div className="d-flex justify-content-between mb-2">
                              <strong>{item.categoryName}</strong>
                              <span>{item.percentage}%</span>
                            </div>
                            <div className="text-muted">{item.type}</div>
                            <div className="fw-bold">{formatCurrency(item.amount)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted mb-0">You haven't recorded any expenses yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row g-3 mt-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Quick Actions</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-3 col-sm-6">
                      <button
                        className="btn btn-outline-primary w-100"
                        onClick={() => navigate('/transactions?type=INCOME')}
                      >
                        <FiPlus className="me-2" />
                        Add Income
                      </button>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <button
                        className="btn btn-outline-danger w-100"
                        onClick={() => navigate('/transactions?type=EXPENSE')}
                      >
                        <FiPlus className="me-2" />
                        Add Expense
                      </button>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <button
                        className="btn btn-outline-success w-100"
                        onClick={() => navigate('/categories')}
                      >
                        <FiSettings className="me-2" />
                        Manage Categories
                      </button>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <button
                        className="btn btn-outline-info w-100"
                        onClick={() => navigate('/reports')}
                      >
                        <FiPieChart className="me-2" />
                        View Reports
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

