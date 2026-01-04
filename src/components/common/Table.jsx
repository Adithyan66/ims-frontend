const Table = ({ columns, data, onEdit, onDelete, deletingId, emptyMessage = 'No data available' }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-800 border border-gray-700">
        <thead className="bg-gray-700">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-600"
              >
                {column.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-600">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-6 py-4 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-700">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          disabled={deletingId === row._id}
                          className={`text-red-400 hover:text-red-300 ${deletingId === row._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {deletingId === row._id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
