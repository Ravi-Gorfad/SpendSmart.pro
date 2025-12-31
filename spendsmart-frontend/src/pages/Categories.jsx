import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { categoryAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

const defaultForm = {
  name: '',
  type: 'EXPENSE',
  description: '',
};

const Categories = () => {
  const [activeType, setActiveType] = useState('EXPENSE');
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCategories = async (type = activeType) => {
    setLoading(true);
    try {
      const response = await categoryAPI.list({ type });
      setCategories(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    if (!editingId) {
      setForm((prev) => ({ ...prev, type: activeType }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType]);

  const resetForm = () => {
    setForm({ ...defaultForm, type: activeType });
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await categoryAPI.update(editingId, form);
        toast.success('Category updated successfully');
      } else {
        await categoryAPI.create(form);
        toast.success('Category created successfully');
      }
      resetForm();
      loadCategories(form.type);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Action failed');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      description: category.description || '',
      type: category.type,
    });
    setActiveType(category.type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }
    try {
      await categoryAPI.remove(id);
      toast.success('Category deleted');
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete category');
    }
  };

  const summary = useMemo(() => {
    const total = categories.length;
    const byLetter = categories.reduce((acc, cat) => {
      const letter = cat.name.charAt(0).toUpperCase();
      acc[letter] = (acc[letter] || 0) + 1;
      return acc;
    }, {});
    return { total, byLetter };
  }, [categories]);

  return (
    <div className="container py-4 categories-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-0">Manage Categories</h2>
          <p className="text-muted mb-0">Organise your income and expense buckets in one place.</p>
        </div>
        <div className="btn-group">
          {['EXPENSE', 'INCOME'].map((type) => (
            <button
              key={type}
              className={`btn btn-${activeType === type ? 'primary' : 'outline-primary'}`}
              onClick={() => setActiveType(type)}
            >
              {type === 'EXPENSE' ? 'Expense Categories' : 'Income Categories'}
            </button>
          ))}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card shadow-sm category-form-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                {editingId ? 'Update Category' : 'Create Category'}
              </h5>
              {editingId && (
                <button type="button" className="btn btn-link p-0" onClick={resetForm}>
                  Clear
                </button>
              )}
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Category Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Food & Dining"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={form.type}
                    onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                    required
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description (optional)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Describe how you use this category"
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <button className="btn btn-primary w-100" type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiPlus className="me-2" />
                      {editingId ? 'Update Category' : 'Create Category'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <h6 className="text-muted text-uppercase fw-semibold mb-3">Summary</h6>
              <p className="mb-1">
                Total {activeType.toLowerCase()} categories:{' '}
                <strong>{summary.total}</strong>
              </p>
              <p className="text-muted small mb-0">
                {Object.entries(summary.byLetter)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([letter, count]) => `${letter}: ${count}`)
                  .join(' · ')}
              </p>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Category Library</h5>
              <span className="badge bg-secondary rounded-pill">{categories.length} items</span>
            </div>
            <div className="card-body">
              {loading ? (
                <LoadingSpinner text="Loading categories..." />
              ) : categories.length === 0 ? (
                <p className="text-muted mb-0">No categories yet. Create your first one!</p>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle category-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category.id}>
                          <td>
                            <div className="fw-semibold">{category.name}</div>
                            <span
                              className={`badge ${
                                category.type === 'EXPENSE' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'
                              }`}
                            >
                              {category.type === 'EXPENSE' ? 'Expense' : 'Income'}
                            </span>
                          </td>
                          <td className="text-muted">
                            {category.description || <em>No description</em>}
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(category)}
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(category.id)}
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
    </div>
  );
};

export default Categories;

