import { useEffect, useState } from 'react';
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
  FiShoppingBag,
  FiHome,
  FiCoffee,
  FiHeart,
  FiBriefcase,
  FiBook,
  FiZap,
  FiGift,
  FiMusic,
  FiCamera,
  FiSmartphone,
  FiWifi,
  FiCreditCard,
  FiActivity,
  FiDownload,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { transactionAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, convertUsdToInr } from '../utils/currency';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  ComposedChart,
} from 'recharts';

const formatDate = (date) => new Date(date).toISOString().split('T')[0];

const COLORS = [
  '#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f', 
  '#edc949', '#af7aa1', '#ff9d9d', '#9b59b6', '#3498db',
  '#e74c3c', '#2ecc71', '#f39c12', '#1abc9c', '#34495e'
];

// Map category names to icons - Enhanced mapping
const getCategoryIcon = (categoryName) => {
  const name = categoryName?.toLowerCase() || '';
  
  // Food & Dining
  if (name.includes('food') || name.includes('restaurant') || name.includes('dining') || 
      name.includes('groceries') || name.includes('meal') || name.includes('lunch') || 
      name.includes('dinner') || name.includes('breakfast')) {
    return <FiCoffee />;
  }
  
  // Shopping
  if (name.includes('shopping') || name.includes('retail') || name.includes('store') || 
      name.includes('market') || name.includes('mall')) {
    return <FiShoppingBag />;
  }
  
  // Home & Housing
  if (name.includes('home') || name.includes('housing') || name.includes('rent') || 
      name.includes('mortgage') || name.includes('house') || name.includes('apartment')) {
    return <FiHome />;
  }
  
  // Transport
  if (name.includes('car') || name.includes('transport') || name.includes('vehicle') || 
      name.includes('gas') || name.includes('fuel') || name.includes('taxi') || 
      name.includes('uber') || name.includes('bus') || name.includes('train') || 
      name.includes('metro') || name.includes('subway')) {
    return <FiActivity />;
  }
  
  // Health & Medical
  if (name.includes('health') || name.includes('medical') || name.includes('doctor') || 
      name.includes('pharmacy') || name.includes('hospital') || name.includes('medicine') ||
      name.includes('clinic')) {
    return <FiHeart />;
  }
  
  // Work & Income
  if (name.includes('work') || name.includes('business') || name.includes('salary') || 
      name.includes('income') || name.includes('wage') || name.includes('employment')) {
    return <FiBriefcase />;
  }
  
  // Education
  if (name.includes('education') || name.includes('school') || name.includes('book') || 
      name.includes('tuition') || name.includes('university') || name.includes('college') ||
      name.includes('course')) {
    return <FiBook />;
  }
  
  // Utilities
  if (name.includes('utilities') || name.includes('electric') || name.includes('bill') || 
      name.includes('water') || name.includes('gas') || name.includes('power') ||
      name.includes('internet') || name.includes('wifi') || name.includes('network')) {
    return <FiZap />;
  }
  
  // Gifts
  if (name.includes('gift') || name.includes('present') || name.includes('donation')) {
    return <FiGift />;
  }
  
  // Entertainment
  if (name.includes('music') || name.includes('entertainment') || name.includes('movie') || 
      name.includes('cinema') || name.includes('film') || name.includes('tv') ||
      name.includes('streaming') || name.includes('netflix') || name.includes('spotify')) {
    return <FiMusic />;
  }
  
  // Photography
  if (name.includes('photo') || name.includes('camera') || name.includes('photography')) {
    return <FiCamera />;
  }
  
  // Gaming
  if (name.includes('game') || name.includes('gaming') || name.includes('playstation') ||
      name.includes('xbox') || name.includes('nintendo')) {
    return <FiActivity />;
  }
  
  // Phone & Telecom
  if (name.includes('phone') || name.includes('mobile') || name.includes('telecom') ||
      name.includes('cell') || name.includes('sim')) {
    return <FiSmartphone />;
  }
  
  // Fitness & Sports
  if (name.includes('fitness') || name.includes('gym') || name.includes('sport') ||
      name.includes('exercise') || name.includes('workout') || name.includes('yoga')) {
    return <FiActivity />;
  }
  
  // Credit & Payment
  if (name.includes('credit') || name.includes('card') || name.includes('payment') ||
      name.includes('bank') || name.includes('finance')) {
    return <FiCreditCard />;
  }
  
  // Default
  return <FiDollarSign />;
};

const Reports = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(true);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('bar'); // 'bar', 'line', 'area'
  const [filters, setFilters] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 5);
    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  });

  const navItems = [
    { path: '/dashboard', icon: <FiPieChart className="me-2" />, label: 'Dashboard' },
    { path: '/transactions', icon: <FiDollarSign className="me-2" />, label: 'Transactions' },
    { path: '/categories', icon: <FiSettings className="me-2" />, label: 'Categories' },
    { path: '/reports', icon: <FiPieChart className="me-2" />, label: 'Reports' },
    { path: '/profile', icon: <FiUser className="me-2" />, label: 'Profile' },
  ];

  const loadSummary = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const res = await transactionAPI.getDashboardSummary(currentFilters);
      setSummary(res.data || null);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
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
    loadSummary(filters);
  };

  // Helper function to format chart axis values in INR
  const formatChartValue = (value) => {
    const inrValue = convertUsdToInr(value);
    if (inrValue >= 100000) {
      return `₹${(inrValue / 100000).toFixed(1)}L`;
    } else if (inrValue >= 1000) {
      return `₹${(inrValue / 1000).toFixed(1)}k`;
    }
    return `₹${inrValue.toFixed(0)}`;
  };

  // Download CSV Report
  const downloadCSV = () => {
    if (!summary || !expenseBreakdown.length) {
      toast.error('No data available to download');
      return;
    }

    const csvRows = [];
    
    // Header
    csvRows.push(['Category', 'Amount', 'Percentage'].join(','));
    
    // Data rows
    expenseBreakdown.forEach((item) => {
      csvRows.push([
        `"${item.name}"`,
        item.value,
        `${item.percentage.toFixed(2)}%`
      ].join(','));
    });
    
    // Summary
    csvRows.push([]);
    csvRows.push(['Summary', '', '']);
    csvRows.push(['Total Income', summary.totalIncome, '']);
    csvRows.push(['Total Expense', summary.totalExpense, '']);
    csvRows.push(['Balance', summary.balance, '']);
    csvRows.push(['Average Daily Expense', summary.averageDailyExpense, '']);
    csvRows.push(['Date Range', `${filters.startDate} to ${filters.endDate}`, '']);
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `spendsmart-report-${filters.startDate}-to-${filters.endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report downloaded successfully');
  };

  // Download PDF Report (using browser print)
  const downloadPDF = () => {
    if (!summary || !expenseBreakdown.length) {
      toast.error('No data available to download');
      return;
    }

    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SpendSmart Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4e79a7; color: white; }
            .summary { margin-top: 30px; }
            .summary-item { margin: 10px 0; }
          </style>
        </head>
        <body>
          <h1>SpendSmart Financial Report</h1>
          <p><strong>Date Range:</strong> ${filters.startDate} to ${filters.endDate}</p>
          
          <h2>Category Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${expenseBreakdown.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${formatCurrency(item.value)}</td>
                  <td>${item.percentage.toFixed(2)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <h2>Summary</h2>
            <div class="summary-item"><strong>Total Income:</strong> ${formatCurrency(summary.totalIncome)}</div>
            <div class="summary-item"><strong>Total Expense:</strong> ${formatCurrency(summary.totalExpense)}</div>
            <div class="summary-item"><strong>Balance:</strong> ${formatCurrency(summary.balance)}</div>
            <div class="summary-item"><strong>Average Daily Expense:</strong> ${formatCurrency(summary.averageDailyExpense)}</div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
    toast.success('Opening print dialog for PDF');
  };

  // Transform expense breakdown for PieChart (needs 'value' key)
  const expenseBreakdown =
    summary?.categoryBreakdown
      ?.filter((item) => item.type === 'EXPENSE' && Number(item.amount) > 0)
      ?.map((item) => ({
        name: item.categoryName,
        value: Number(item.amount),
        categoryId: item.categoryId,
        percentage: item.percentage,
      }))
      ?.sort((a, b) => b.value - a.value) || [];

  // Transform monthly trend for charts (format month and ensure numbers)
  const monthlyTrend =
    summary?.monthlyTrend?.map((item) => {
      const monthStr = String(item.month);
      const monthDate = new Date(monthStr + '-01');
      return {
        month: monthStr.substring(5) || monthStr, // Extract MM from YYYY-MM
        fullMonth: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income: Number(item.income),
        expense: Number(item.expense),
        balance: Number(item.income) - Number(item.expense),
      };
    }) || [];

  // Category distribution for horizontal bar chart
  const categoryDistribution = expenseBreakdown.slice(0, 10).map((item) => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    fullName: item.name,
    value: item.value,
    percentage: item.percentage,
  }));

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '4px 0' }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
            <h4 className="mb-0">Insights & Reports</h4>
            <small className="text-muted">Visualise your progress and spending behaviour</small>
          </div>
          <div className="navbar-actions d-flex gap-2">
            <button className="btn btn-success btn-shadow" onClick={downloadCSV}>
              <FiDownload className="me-2" />
              Download CSV
            </button>
            <button className="btn btn-info btn-shadow text-white" onClick={downloadPDF}>
              <FiDownload className="me-2" />
              Download PDF
            </button>
            <button className="btn btn-primary btn-shadow" onClick={() => navigate('/transactions')}>
              <FiPlus className="me-2" />
              Add Transaction
            </button>
          </div>
        </nav>

        <div className="dashboard-content">
          <form className="row g-3 mb-4" onSubmit={handleFilterSubmit}>
            <div className="col-md-4">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                required
              />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button className="btn btn-outline-primary w-100" type="submit">
                Update Reports
              </button>
            </div>
          </form>

          {loading ? (
            <LoadingSpinner text="Loading reports..." />
          ) : !summary ? (
            <p className="text-muted">No data available for the selected range.</p>
          ) : (
            <>
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div className="stat-card income animated-card">
                    <div className="stat-icon">
                      <FiTrendingUp />
                    </div>
                    <div className="stat-info">
                      <div className="stat-label">Total Income</div>
                      <div className="stat-value">{formatCurrency(summary.totalIncome)}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-card expense animated-card">
                    <div className="stat-icon">
                      <FiTrendingDown />
                    </div>
                    <div className="stat-info">
                      <div className="stat-label">Total Expense</div>
                      <div className="stat-value">{formatCurrency(summary.totalExpense)}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-card balance animated-card">
                    <div className="stat-icon">
                      <FiDollarSign />
                    </div>
                    <div className="stat-info">
                      <div className="stat-label">Net Balance</div>
                      <div className="stat-value">{formatCurrency(summary.balance)}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-card savings animated-card">
                    <div className="stat-icon">
                      <FiPieChart />
                    </div>
                    <div className="stat-info">
                      <div className="stat-label">Daily Avg Expense</div>
                      <div className="stat-value">
                        {formatCurrency(summary.averageDailyExpense)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Income vs Expense Trend - Interactive Chart */}
              <div className="row g-4 mb-4">
                <div className="col-12">
                  <div className="card shadow-sm">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h5 className="card-title mb-0">Income vs Expense Trend</h5>
                      <div className="btn-group btn-group-sm" role="group">
                        <button
                          type="button"
                          className={`btn ${chartType === 'bar' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setChartType('bar')}
                        >
                          Bar
                        </button>
                        <button
                          type="button"
                          className={`btn ${chartType === 'line' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setChartType('line')}
                        >
                          Line
                        </button>
                        <button
                          type="button"
                          className={`btn ${chartType === 'area' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setChartType('area')}
                        >
                          Area
                        </button>
                      </div>
                    </div>
                    <div className="card-body" style={{ minHeight: 400 }}>
                      {monthlyTrend.length === 0 ? (
                        <p className="text-muted mb-0 text-center py-5">No trend data yet.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={350}>
                          {chartType === 'bar' ? (
                            <ComposedChart data={monthlyTrend}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                              <XAxis dataKey="fullMonth" tick={{ fontSize: 12 }} />
                              <YAxis tick={{ fontSize: 12 }} tickFormatter={formatChartValue} />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend />
                              <Bar dataKey="income" fill="#4e79a7" name="Income" radius={[8, 8, 0, 0]} />
                              <Bar dataKey="expense" fill="#e15759" name="Expense" radius={[8, 8, 0, 0]} />
                            </ComposedChart>
                          ) : chartType === 'line' ? (
                            <LineChart data={monthlyTrend}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                              <XAxis dataKey="fullMonth" tick={{ fontSize: 12 }} />
                              <YAxis tick={{ fontSize: 12 }} tickFormatter={formatChartValue} />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="income"
                                stroke="#4e79a7"
                                strokeWidth={3}
                                name="Income"
                                dot={{ r: 5 }}
                                activeDot={{ r: 8 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="expense"
                                stroke="#e15759"
                                strokeWidth={3}
                                name="Expense"
                                dot={{ r: 5 }}
                                activeDot={{ r: 8 }}
                              />
                            </LineChart>
                          ) : (
                            <AreaChart data={monthlyTrend}>
                              <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#4e79a7" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="#4e79a7" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#e15759" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="#e15759" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                              <XAxis dataKey="fullMonth" tick={{ fontSize: 12 }} />
                              <YAxis tick={{ fontSize: 12 }} tickFormatter={formatChartValue} />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend />
                              <Area
                                type="monotone"
                                dataKey="income"
                                stroke="#4e79a7"
                                fillOpacity={1}
                                fill="url(#colorIncome)"
                                name="Income"
                              />
                              <Area
                                type="monotone"
                                dataKey="expense"
                                stroke="#e15759"
                                fillOpacity={1}
                                fill="url(#colorExpense)"
                                name="Expense"
                              />
                            </AreaChart>
                          )}
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Monefy-Style Category Chart */}
              <div className="row g-4 mb-4">
                <div className="col-12">
                  <div className="card shadow-sm">
                    <div className="card-header">
                      <h5 className="card-title mb-0">Category-Wise Spending Overview</h5>
                    </div>
                    <div className="card-body">
                      {expenseBreakdown.length === 0 ? (
                        <p className="text-muted text-center py-5 mb-0">
                          Record expenses to see the category breakdown.
                        </p>
                      ) : (
                        <div className="monefy-chart-container">
                          <div className="monefy-donut-wrapper">
                            <ResponsiveContainer width="100%" height={500}>
                              <PieChart>
                                <Pie
                                  data={expenseBreakdown}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={120}
                                  outerRadius={180}
                                  paddingAngle={2}
                                  startAngle={90}
                                  endAngle={-270}
                                >
                                  {expenseBreakdown.map((entry, index) => (
                                    <Cell
                                      key={entry.categoryId || entry.name}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(value) => formatCurrency(value)}
                                  contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="monefy-chart-center">
                              <div className="monefy-center-income">
                                {formatCurrency(summary.totalIncome)}
                              </div>
                              <div className="monefy-center-label" style={{ color: '#4e79a7', fontSize: '0.9rem' }}>
                                Income
                              </div>
                              <div className="monefy-center-expense">
                                {formatCurrency(summary.totalExpense)}
                              </div>
                              <div className="monefy-center-label" style={{ color: '#e15759', fontSize: '0.9rem' }}>
                                Expense
                              </div>
                            </div>
                            {/* Category Icons Around Chart with Percentages */}
                            <svg
                              className="monefy-connecting-lines"
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                pointerEvents: 'none',
                                zIndex: 5,
                              }}
                            >
                              {expenseBreakdown.slice(0, 12).map((item, index) => {
                                const totalItems = Math.min(expenseBreakdown.length, 12);
                                const angle = (index * 360) / totalItems;
                                const radiusPercent = 35;
                                const centerX = 50;
                                const centerY = 50;
                                const angleRad = ((angle - 90) * Math.PI) / 180;
                                const x = centerX + (radiusPercent * Math.cos(angleRad));
                                const y = centerY + (radiusPercent * Math.sin(angleRad));
                                const chartRadius = 18;
                                const lineEndX = centerX + (chartRadius * Math.cos(angleRad));
                                const lineEndY = centerY + (chartRadius * Math.sin(angleRad));
                                
                                return (
                                  <line
                                    key={`line-${item.categoryId || item.name}`}
                                    x1={`${lineEndX}%`}
                                    y1={`${lineEndY}%`}
                                    x2={`${x}%`}
                                    y2={`${y}%`}
                                    stroke={COLORS[index % COLORS.length]}
                                    strokeWidth="1.5"
                                    strokeDasharray="3,3"
                                    opacity="0.4"
                                  />
                                );
                              })}
                            </svg>
                            <div className="monefy-category-icons">
                              {expenseBreakdown.slice(0, 12).map((item, index) => {
                                const totalItems = Math.min(expenseBreakdown.length, 12);
                                const angle = (index * 360) / totalItems;
                                const radiusPercent = 35;
                                const centerX = 50;
                                const centerY = 50;
                                const angleRad = ((angle - 90) * Math.PI) / 180;
                                const x = centerX + (radiusPercent * Math.cos(angleRad));
                                const y = centerY + (radiusPercent * Math.sin(angleRad));
                                
                                return (
                                  <div
                                    key={item.categoryId || item.name}
                                    className="monefy-category-icon"
                                    style={{
                                      left: `${x}%`,
                                      top: `${y}%`,
                                      color: COLORS[index % COLORS.length],
                                    }}
                                    title={`${item.name}: ${formatCurrency(item.value)}`}
                                  >
                                    <div className="monefy-icon-wrapper">
                                      {getCategoryIcon(item.name)}
                                    </div>
                                    <div className="monefy-category-percentage">
                                      {item.percentage ? `${item.percentage.toFixed(0)}%` : '0%'}
                                    </div>
                                    <div className="monefy-category-name">
                                      {item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Distribution Charts */}
              <div className="row g-4 mb-4">
                <div className="col-lg-6">
                  <div className="card shadow-sm">
                    <div className="card-header">
                      <h5 className="card-title mb-0">Category Distribution (Pie)</h5>
                    </div>
                    <div className="card-body" style={{ minHeight: 400 }}>
                      {expenseBreakdown.length === 0 ? (
                        <p className="text-muted mb-0 text-center py-5">Record expenses to see the breakdown.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={350}>
                          <PieChart>
                            <Pie
                              data={expenseBreakdown}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={120}
                              innerRadius={60}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {expenseBreakdown.map((entry, index) => (
                                <Cell key={entry.categoryId || entry.name} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                              verticalAlign="bottom"
                              height={36}
                              formatter={(value) => (value.length > 15 ? value.substring(0, 15) + '...' : value)}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="card shadow-sm">
                    <div className="card-header">
                      <h5 className="card-title mb-0">Category Distribution (Bar)</h5>
                    </div>
                    <div className="card-body" style={{ minHeight: 400 }}>
                      {categoryDistribution.length === 0 ? (
                        <p className="text-muted mb-0 text-center py-5">Record expenses to see the breakdown.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={350}>
                          <BarChart
                            data={categoryDistribution}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={formatChartValue} />
                            <YAxis
                              dataKey="name"
                              type="category"
                              tick={{ fontSize: 12 }}
                              width={100}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar
                              dataKey="value"
                              fill="#4e79a7"
                              name="Amount"
                              radius={[0, 8, 8, 0]}
                            >
                              {categoryDistribution.map((entry, index) => (
                                <Cell key={entry.fullName} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card shadow-sm mt-4">
                <div className="card-header">
                  <h5 className="card-title mb-0">Top Spending Categories</h5>
                </div>
                <div className="card-body">
                  {expenseBreakdown.length === 0 ? (
                    <p className="text-muted mb-0">
                      Once you add expenses, the top categories will appear here.
                    </p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table align-middle">
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th className="text-end">Amount</th>
                            <th className="text-end">Share</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expenseBreakdown.map((item, index) => (
                            <tr key={item.categoryId || item.name}>
                              <td>
                                <span
                                  className="badge me-2"
                                  style={{
                                    backgroundColor: COLORS[index % COLORS.length],
                                    width: '12px',
                                    height: '12px',
                                    display: 'inline-block',
                                    borderRadius: '50%',
                                  }}
                                >
                                  &nbsp;
                                </span>
                                {item.name}
                              </td>
                              <td className="text-end">{formatCurrency(item.value)}</td>
                              <td className="text-end">
                                {item.percentage ? `${item.percentage.toFixed(1)}%` : '0%'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;

