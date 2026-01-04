const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-gray-800 bg-opacity-95 backdrop-blur-md border border-gray-700 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-gray-800 bg-opacity-95 backdrop-blur-md px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-200">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-300 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
