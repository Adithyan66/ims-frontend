import { useAuth } from '../../context/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="bg-gray-800 shadow-sm border-b border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-300 hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* <h2 className="ml-4 lg:ml-0 text-xl font-semibold text-gray-200">adiyo inventory system</h2> */}
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-300">
            {user?.email || user?.name || 'User'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

