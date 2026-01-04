import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { customersService } from '../../services/customersService';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import CustomerForm from './CustomerForm';

const CustomersList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [limit, setLimit] = useState(Number(searchParams.get('limit')) || 10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const urlPage = Number(searchParams.get('page')) || 1;
    const urlLimit = Number(searchParams.get('limit')) || 10;
    const urlQuery = searchParams.get('q') || '';
    
    setPage(urlPage);
    setLimit(urlLimit);
    setSearchQuery(urlQuery);
    
    if (urlQuery.trim()) {
      searchCustomers(urlQuery, urlPage, urlLimit);
    } else {
      fetchCustomers(urlPage, urlLimit);
    }
  }, [searchParams]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentQuery = searchParams.get('q') || '';
      if (searchQuery !== currentQuery) {
        // Reset to page 1 when search query changes
        const newParams = new URLSearchParams();
        if (searchQuery.trim()) {
          newParams.set('q', searchQuery);
        }
        newParams.set('page', '1');
        newParams.set('limit', limit.toString());
        setSearchParams(newParams);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const updateURL = (newPage, newLimit, query) => {
    const params = new URLSearchParams();
    if (query && query.trim()) {
      params.set('q', query.trim());
    }
    params.set('page', newPage.toString());
    params.set('limit', newLimit.toString());
    setSearchParams(params);
  };

  const fetchCustomers = async (pageNum = page, limitNum = limit) => {
    try {
      setLoading(true);
      const response = await customersService.getAll(pageNum, limitNum);
      // Response structure: { status: "success", data: { data: [...], pagination: {...} }, message: "..." }
      const responseData = response.data || {};
      const customersData = responseData.data || [];
      const paginationData = responseData.pagination || {};
      
      setCustomers(Array.isArray(customersData) ? customersData : []);
      setPagination({
        total: paginationData.total || 0,
        page: paginationData.page || 1,
        limit: paginationData.limit || 10,
        totalPages: paginationData.totalPages || 0
      });
      setError('');
    } catch (err) {
      setError('Failed to fetch customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async (query, pageNum = 1, limitNum = limit) => {
    try {
      setLoading(true);
      const response = await customersService.search(query, pageNum, limitNum);
      // Response structure: { status: "success", data: { data: [...], pagination: {...} }, message: "..." }
      const responseData = response.data || {};
      const customersData = responseData.data || [];
      const paginationData = responseData.pagination || {};
      
      setCustomers(Array.isArray(customersData) ? customersData : []);
      setPagination({
        total: paginationData.total || 0,
        page: paginationData.page || 1,
        limit: paginationData.limit || 10,
        totalPages: paginationData.totalPages || 0
      });
      setError('');
    } catch (err) {
      setError('Failed to search customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (searchQuery.trim()) {
      updateURL(newPage, limit, searchQuery);
    } else {
      updateURL(newPage, limit, '');
    }
  };

  const handlePageSizeChange = (newLimit) => {
    if (searchQuery.trim()) {
      updateURL(1, newLimit, searchQuery);
    } else {
      updateURL(1, newLimit, '');
    }
  };

  const handleCreate = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`Are you sure you want to delete "${customer.name}"?`)) {
      return;
    }

    try {
      setDeletingId(customer._id);
      await customersService.delete(customer._id);
      // Refresh current page after delete
      if (searchQuery.trim()) {
        searchCustomers(searchQuery, page, limit);
      } else {
        fetchCustomers(page, limit);
      }
    } catch (err) {
      setError('Failed to delete customer');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      if (editingCustomer) {
        await customersService.update(editingCustomer._id, formData);
      } else {
        await customersService.create(formData);
      }
      setIsModalOpen(false);
      setEditingCustomer(null);
      // Refresh current page after save
      if (searchQuery.trim()) {
        searchCustomers(searchQuery, page, limit);
      } else {
        fetchCustomers(page, limit);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save customer');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'address', label: 'Address' },
    { key: 'mobileNumber', label: 'Mobile Number' }
  ];

  const showingFrom = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const showingTo = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-200">Customers</h1>
        <div className="flex items-center gap-3">
          <div className="w-64">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name..."
            />
          </div>
          <Button variant="primary" onClick={handleCreate}>
            Add New Customer
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 bg-opacity-30 border border-red-800 text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-300">Loading...</div>
      ) : (
        <>
          <Table
            columns={columns}
            data={customers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deletingId={deletingId}
            emptyMessage="No customers found"
          />
          
          {pagination.totalPages > 0 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              pageSize={pagination.limit}
              onPageSizeChange={handlePageSizeChange}
              total={pagination.total}
              showingFrom={showingFrom}
              showingTo={showingTo}
              itemLabel="customers"
            />
          )}
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
      >
        <CustomerForm
          customer={editingCustomer}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingCustomer(null);
          }}
          loading={submitting}
        />
      </Modal>
    </div>
  );
};

export default CustomersList;
