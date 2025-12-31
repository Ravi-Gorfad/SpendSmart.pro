import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiLogOut,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiPieChart,
  FiSettings,
  FiUser,
  FiEdit2,
  FiSave,
  FiX,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { userAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(true);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    country: '',
  });

  const navItems = [
    { path: '/dashboard', icon: <FiPieChart className="me-2" />, label: 'Dashboard' },
    { path: '/transactions', icon: <FiDollarSign className="me-2" />, label: 'Transactions' },
    { path: '/categories', icon: <FiSettings className="me-2" />, label: 'Categories' },
    { path: '/reports', icon: <FiPieChart className="me-2" />, label: 'Reports' },
    { path: '/profile', icon: <FiUser className="me-2" />, label: 'Profile' },
  ];

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getProfile();
      const data = res.data;
      setProfile(data);
      setFormData({
        firstName: data.firstName || '',
        middleName: data.middleName || '',
        lastName: data.lastName || '',
        phoneNumber: data.phoneNumber || '',
        street: data.street || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
      });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Map frontend field names to backend field names
      const payload = {
        firstname: formData.firstName,
        middlename: formData.middleName,
        lastname: formData.lastName,
        email: profile?.email, // Keep existing email, don't allow changing via profile update
        phoneNumber: formData.phoneNumber || null,
        street: formData.street || null,
        city: formData.city || null,
        state: formData.state || null,
        country: formData.country || null,
      };
      await userAPI.updateProfile(payload);
      toast.success('Profile updated successfully');
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        middleName: profile.middleName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || '',
        street: profile.street || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || '',
      });
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="main-content d-flex align-items-center justify-content-center">
          <LoadingSpinner size="lg" text="Loading profile..." />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
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
            <div className="user-avatar">
              {authUser?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{authUser?.username}</div>
              <div className="user-email">{authUser?.email}</div>
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
            <h4 className="mb-0">Profile Settings</h4>
            <small className="text-muted">Manage your personal information</small>
          </div>
          <div className="navbar-actions">
            {!editing ? (
              <button className="btn btn-primary btn-shadow" onClick={() => setEditing(true)}>
                <FiEdit2 className="me-2" />
                Edit Profile
              </button>
            ) : (
              <div className="d-flex gap-2">
                <button
                  className="btn btn-success btn-shadow"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <FiSave className="me-2" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button className="btn btn-outline-secondary btn-shadow" onClick={handleCancel}>
                  <FiX className="me-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="dashboard-content">
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card shadow-sm">
                <div className="card-body text-center">
                  <div className="profile-avatar-large mb-3">
                    {profile?.firstName?.charAt(0)?.toUpperCase() ||
                      authUser?.username?.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="mb-1">
                    {profile?.firstName && profile?.lastName
                      ? `${profile.firstName} ${profile.lastName}`
                      : authUser?.username}
                  </h4>
                  <p className="text-muted mb-3">{authUser?.email}</p>
                  <div className="text-start">
                    <div className="mb-2">
                      <small className="text-muted d-block">Username</small>
                      <strong>{authUser?.username}</strong>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted d-block">Email Verified</small>
                      <span className={`badge ${profile?.emailVerified ? 'bg-success' : 'bg-warning'}`}>
                        {profile?.emailVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                    {profile?.createdAt && (
                      <div>
                        <small className="text-muted d-block">Member Since</small>
                        <strong>{new Date(profile.createdAt).toLocaleDateString()}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="card shadow-sm">
                <div className="card-header">
                  <h5 className="card-title mb-0">Personal Information</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">First Name</label>
                      {editing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="form-control-plaintext">
                          {profile?.firstName || <em className="text-muted">Not set</em>}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Middle Name</label>
                      {editing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="middleName"
                          value={formData.middleName}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="form-control-plaintext">
                          {profile?.middleName || <em className="text-muted">Not set</em>}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last Name</label>
                      {editing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="form-control-plaintext">
                          {profile?.lastName || <em className="text-muted">Not set</em>}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone Number</label>
                      {editing ? (
                        <input
                          type="tel"
                          className="form-control"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="form-control-plaintext">
                          {profile?.phoneNumber || <em className="text-muted">Not set</em>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card shadow-sm mt-4">
                <div className="card-header">
                  <h5 className="card-title mb-0">Address Information</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Street Address</label>
                      {editing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="street"
                          value={formData.street}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="form-control-plaintext">
                          {profile?.street || <em className="text-muted">Not set</em>}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">City</label>
                      {editing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="form-control-plaintext">
                          {profile?.city || <em className="text-muted">Not set</em>}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">State</label>
                      {editing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="form-control-plaintext">
                          {profile?.state || <em className="text-muted">Not set</em>}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Country</label>
                      {editing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="form-control-plaintext">
                          {profile?.country || <em className="text-muted">Not set</em>}
                        </div>
                      )}
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

export default Profile;

