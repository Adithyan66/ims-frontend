const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  pageSize, 
  onPageSizeChange,
  total,
  showingFrom,
  showingTo,
  itemLabel = 'items'
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-700">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">
          Showing <span className="text-gray-200 font-medium">{showingFrom}</span> to{' '}
          <span className="text-gray-200 font-medium">{showingTo}</span> of{' '}
          <span className="text-gray-200 font-medium">{total}</span> {itemLabel}
        </span>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Show:</label>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-gray-800 border border-gray-600 text-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentPage === 1
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
              : 'bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-600 hover:border-gray-500'
          }`}
        >
          Previous
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...' || page === currentPage}
              className={`min-w-[2.5rem] px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                page === '...'
                  ? 'text-gray-500 cursor-default'
                  : page === currentPage
                  ? 'bg-blue-600 text-white border border-blue-600'
                  : 'bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-600 hover:border-gray-500'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentPage === totalPages
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
              : 'bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-600 hover:border-gray-500'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;

