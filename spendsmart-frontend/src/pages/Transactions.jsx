import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiLogOut,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiPieChart,
  FiPlus,
  FiSettings,
  FiUser,
  FiTrash2,
  FiEdit2,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { categoryAPI, transactionAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency } from '../utils/currency';

const formatDate = (date) => new Date(date).toISOString().split('T')[0];

const defaultFilters = {
  startDate: '',
  endDate: '',
  type: '',
  categoryId: '',
};

const defaultForm = {
  amount: '',
  type: 'EXPENSE',
  categoryId: '',
  date: formatDate(new Date()),
  description: '',
};

const sanitizeParams = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value));

const Transactions = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryType = new URLSearchParams(location.search).get('type');

  const [showSidebar, setShowSidebar] = useState(true);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({
    ...defaultFilters,
    type: queryType || '',
  });
  const [form, setForm] = useState({
    ...defaultForm,
    type: queryType || 'EXPENSE',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type]
  );

  const navItems = [
    { path: '/dashboard', icon: <FiPieChart className="me-2" />, label: 'Dashboard' },
    { path: '/transactions', icon: <FiDollarSign className="me-2" />, label: 'Transactions' },
    { path: '/categories', icon: <FiSettings className="me-2" />, label: 'Categories' },
    { path: '/reports', icon: <FiPieChart className="me-2" />, label: 'Reports' },
    { path: '/profile', icon: <FiUser className="me-2" />, label: 'Profile' },
  ];

  const loadCategories = async () => {
    try {
      const res = await categoryAPI.list();
      setCategories(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load categories');
    }
  };

  const loadData = async (params = filters) => {
    setLoading(true);
    try {
      const sanitized = sanitizeParams(params);
      const [transactionsRes, summaryRes] = await Promise.all([
        transactionAPI.list(sanitized),
        transactionAPI.getDashboardSummary({
          startDate: sanitized.startDate,
          endDate: sanitized.endDate,
        }),
      ]);
      setTransactions(transactionsRes.data || []);
      setSummary(summaryRes.data || null);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    loadData(filters);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    loadData(defaultFilters);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'type') {
      setForm((prev) => ({ ...prev, categoryId: '' }));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm((prev) => ({
      ...defaultForm,
      type: prev.type,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.categoryId) {
      toast.error('Please select a category');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
      };
      if (editingId) {
        await transactionAPI.update(editingId, payload);
        toast.success('Transaction updated');
      } else {
        await transactionAPI.create(payload);
        toast.success('Transaction added');
      }
      resetForm();
      loadData(filters);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
    setForm({
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.categoryId,
      date: transaction.date,
      description: transaction.description || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) {
      return;
    }
    try {
      await transactionAPI.remove(id);
      toast.success('Transaction deleted');
      loadData(filters);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to delete transaction');
    }
  };

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${showSidebar ? 'show' : 'hide'}`}>
        <div className="sidebar-header">
          <h3 className="sidebar-title">
            <span className="text-primary">Spend</span>
            <span className="text-success">Smart</span>
          </h3>
          <button className="btn btn-link text-white d-md-none" onClick={() => setShowSidebar(false)}>
            ×
          </button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
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

      <div className="main-content">
        <nav className="top-navbar">
          <button className="btn btn-link d-md-none" onClick={() => setShowSidebar(true)}>
            ☰
          </button>
          <div>
            <h4 className="mb-0">Transactions</h4>
            <small className="text-muted">Track every income and expense with precision</small>
          </div>
          <div className="navbar-actions">
            <button className="btn btn-primary btn-shadow" onClick={resetForm}>
              <FiPlus className="me-2" />
              New Transaction
            </button>
          </div>
        </nav>

        <div className="dashboard-content">
          {loading ? (
            <LoadingSpinner text="Loading transactions..." />
          ) : (
            <>
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="stat-card income animated-card">
                    <div className="stat-icon">
                      <FiTrendingUp />
                    </div>
                    <div className="stat-info">
                      <div className="stat-label">Income</div>
                      <div className="stat-value">{formatCurrency(summary?.totalIncome || 0)}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="stat-card expense animated-card">
                    <div className="stat-icon">
                      <FiTrendingDown />
                    </div>
                    <div className="stat-info">
                      <div className="stat-label">Expense</div>
                      <div className="stat-value">{formatCurrency(summary?.totalExpense || 0)}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="stat-card balance animated-card">
                    <div className="stat-icon">
                      <FiDollarSign />
                    </div>
                    <div className="stat-info">
                      <div className="stat-label">Balance</div>
                      <div className="stat-value">{formatCurrency(summary?.balance || 0)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-lg-4">
                  <div className="card shadow-sm mb-4">
                    <div className="card-header">
                      <h5 className="card-title mb-0">
                        {editingId ? 'Update Transaction' : 'Add Transaction'}
                      </h5>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label className="form-label">Amount</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            name="amount"
                            value={form.amount}
                            onChange={handleFormChange}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Type</label>
                          <select
                            className="form-select"
                            name="type"
                            value={form.type}
                            onChange={handleFormChange}
                          >
                            <option value="EXPENSE">Expense</option>
                            <option value="INCOME">Income</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Category</label>
                          <select
                            className="form-select"
                            name="categoryId"
                            value={form.categoryId}
                            onChange={handleFormChange}
                            required
                          >
                            <option value="">Select category</option>
                            {filteredCategories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Date</label>
                          <input
                            type="date"
                            className="form-control"
                            name="date"
                            value={form.date}
                            onChange={handleFormChange}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            name="description"
                            value={form.description}
                            onChange={handleFormChange}
                            placeholder="Optional"
                          />
                        </div>
                        <div className="d-grid gap-2">
                          <button className="btn btn-primary" type="submit" disabled={saving}>
                            {saving ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Saving...
                              </>
                            ) : editingId ? (
                              <>
                                <FiEdit2 className="me-2" />
                                Update Transaction
                              </>
                            ) : (
                              <>
                                <FiPlus className="me-2" />
                                Add Transaction
                              </>
                            )}
                          </button>
                          {editingId && (
                            <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                <div className="col-lg-8">
                  <div className="card shadow-sm">
                    <div className="card-header">
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <h5 className="card-title mb-0">Transaction History</h5>
                        <button className="btn btn-sm btn-link" onClick={clearFilters}>
                          Clear filters
                        </button>
                      </div>
                      <form className="row g-3 mt-2" onSubmit={handleFilterSubmit}>
                        <div className="col-md-4">
                          <input
                            type="date"
                            className="form-control"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <input
                            type="date"
                            className="form-control"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <select
                            className="form-select"
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                          >
                            <option value="">All types</option>
                            <option value="EXPENSE">Expense</option>
                            <option value="INCOME">Income</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <select
                            className="form-select"
                            name="categoryId"
                            value={filters.categoryId}
                            onChange={handleFilterChange}
                          >
                            <option value="">All categories</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name} ({category.type.toLowerCase()})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <button className="btn btn-outline-primary w-100" type="submit">
                            Apply Filters
                          </button>
                        </div>
                      </form>
                    </div>
                    <div className="card-body">
                      {transactions.length === 0 ? (
                        <p className="text-muted mb-0">No transactions found for the selected filters.</p>
                      ) : (
                        <div className="table-responsive">
                          <table className="table align-middle">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th className="text-end">Amount</th>
                                <th className="text-end">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {transactions.map((transaction) => (
                                <tr key={transaction.id}>
                                  <td>{transaction.date}</td>
                                  <td>
                                    <div className="fw-semibold">{transaction.categoryName}</div>
                                    <small className="text-muted">{transaction.type}</small>
                                  </td>
                                  <td className="text-muted">
                                    {transaction.description || <em>No description</em>}
                                  </td>
                                  <td
                                    className={`text-end ${
                                      transaction.type === 'INCOME' ? 'text-success' : 'text-danger'
                                    }`}
                                  >
                                    {transaction.type === 'INCOME' ? '+' : '-'}
                                    {formatCurrency(transaction.amount)}
                                  </td>
                                  <td className="text-end">
                                    <button
                                      className="btn btn-sm btn-outline-primary me-2"
                                      onClick={() => handleEdit(transaction)}
                                    >
                                      <FiEdit2 />
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => handleDelete(transaction.id)}
                                    >
                                      <FiTrash2 />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;

