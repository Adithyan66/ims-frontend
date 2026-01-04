import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const menuItems = [
    { path: '/items', label: 'Inventory', icon: '📦' },
    { path: '/customers', label: 'Customers', icon: '👥' },
    { path: '/sales', label: 'Sales', icon: '💰' },
    { path: '/reports/sales', label: 'Sales Report', icon: '📈', parent: 'reports' },
    { path: '/reports/items', label: 'Items Report', icon: '📋', parent: 'reports' },
    { path: '/reports/customers', label: 'Customer Ledger', icon: '📑', parent: 'reports' }
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 tracking-tight">
                adiyo
              </h1>
              <p className="text-xs font-semibold text-gray-300 tracking-wide -mt-1">
                inventory system
              </p>
              <div className="mt-1 h-0.5 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`
                    }
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <span className="mr-3">🚪</span>
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

