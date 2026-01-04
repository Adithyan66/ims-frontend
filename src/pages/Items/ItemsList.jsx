import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { itemsService } from '../../services/itemsService';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ItemForm from './ItemForm';
import { formatPrice } from '../../utils/formatters';

const ItemsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
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
  const [editingItem, setEditingItem] = useState(null);
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
    
    fetchItems(urlQuery, urlPage, urlLimit);
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

  const fetchItems = async (query = '', pageNum = page, limitNum = limit) => {
    try {
      setLoading(true);
      const response = await itemsService.getAll(pageNum, limitNum, query);
      // Response structure: { status: "success", data: { data: [...], pagination: {...} }, message: "..." }
      const responseData = response.data || {};
      const itemsData = responseData.data || [];
      const paginationData = responseData.pagination || {};
      
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setPagination({
        total: paginationData.total || 0,
        page: paginationData.page || 1,
        limit: paginationData.limit || 10,
        totalPages: paginationData.totalPages || 0
      });
      setError('');
    } catch (err) {
      setError('Failed to fetch items');
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
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      setDeletingId(item._id);
      await itemsService.delete(item._id);
      // Refresh current page after delete
      fetchItems(searchQuery, page, limit);
    } catch (err) {
      setError('Failed to delete item');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      if (editingItem) {
        await itemsService.update(editingItem._id, formData);
      } else {
        await itemsService.create(formData);
      }
      setIsModalOpen(false);
      setEditingItem(null);
      // Refresh current page after save
      fetchItems(searchQuery, page, limit);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save item');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'quantity', label: 'Quantity' },
    { 
      key: 'price', 
      label: 'Price',
      render: (value) => formatPrice(value)
    }
  ];

  const showingFrom = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const showingTo = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-200">Inventory Items</h1>
        <div className="flex items-center gap-3">
          <div className="w-64">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name..."
            />
          </div>
          <Button variant="primary" onClick={handleCreate}>
            Add New Item
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
            data={items}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deletingId={deletingId}
            emptyMessage="No items found"
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
            />
          )}
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
      >
        <ItemForm
          item={editingItem}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          loading={submitting}
        />
      </Modal>
    </div>
  );
};

export default ItemsList;
