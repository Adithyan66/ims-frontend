# adiyo inventory system - Frontend

A comprehensive React frontend application for an Inventory Management System built with React, React Router, Tailwind CSS, and Axios.

## Features

- **User Authentication**: Login functionality with JWT token management
- **Inventory Management**: Full CRUD operations for inventory items with search functionality
- **Customer Management**: CRUD operations for customer records
- **Sales Management**: Record sales with automatic inventory deduction, support for cash and customer sales
- **Reports**: Sales reports, items reports, and customer ledger
- **Data Export**: Export reports to Excel, PDF, Print, and Email

## Tech Stack

- **React 19** - UI library
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **XLSX** - Excel file generation
- **jsPDF** - PDF generation
- **jsPDF-AutoTable** - PDF table generation

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Backend API running (see backend README)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (optional):
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_IS_REG_OPEN=true
```

- `VITE_API_BASE_URL`: API base URL (defaults to `http://localhost:3000/api` if not specified)
- `VITE_IS_REG_OPEN`: Enable/disable registration feature (defaults to `true` if not specified). Set to `"false"` to disable registration UI

## Running the Application

### Development Mode
```bash
npm run dev
```

The application will start on `http://localhost:5173` (or the next available port)

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Layout components (Sidebar, Header, Layout)
│   ├── common/         # Common components (Button, Input, Modal, Table, SearchBar)
│   └── ProtectedRoute.jsx
├── context/            # React Context providers
│   └── AuthContext.jsx
├── pages/              # Page components
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Items/          # Inventory management pages
│   ├── Customers/      # Customer management pages
│   ├── Sales/          # Sales management pages
│   └── Reports/        # Reports pages
├── services/           # API service functions
│   ├── api.js          # Axios HTTP client
│   ├── authService.js
│   ├── itemsService.js
│   ├── customersService.js
│   ├── salesService.js
│   └── reportsService.js
├── utils/              # Utility functions
│   ├── exportUtils.js  # Export functions (Excel, PDF, Print)
│   └── validators.js   # Form validation functions
├── App.jsx             # Main app component with routes
└── main.jsx            # Entry point
```

## API Integration

The frontend communicates with the backend API at the base URL specified in the `.env` file or defaults to `http://localhost:3000/api`.

### Authentication

- Login: `POST /api/auth/login`
- JWT token is stored in localStorage
- Token is automatically included in API requests via axios interceptor

### Protected Routes

All routes except `/login` are protected and require authentication. Unauthenticated users are redirected to the login page.

## Features Details

### Inventory Management
- View all items in a table
- Search items by name or description
- Add, edit, and delete items
- Item fields: Name, Description, Quantity, Price

### Customer Management
- View all customers
- Add, edit, and delete customers
- Customer fields: Name, Address, Mobile Number

### Sales Management
- View all sales
- Add, edit, and delete sales
- Support for cash sales and customer sales
- Automatic total price calculation
- Sales fields: Item, Quantity, Customer (optional), Date

### Reports
- **Sales Report**: View all sales with export options (Print, Excel, PDF, Email)
- **Items Report**: View all items with export options (Print, Excel, PDF)
- **Customer Ledger**: View transactions for a specific customer with export options (Print, Excel, PDF)

### Data Export
- **Print**: Opens print dialog with formatted table
- **Excel**: Downloads .xlsx file
- **PDF**: Downloads .pdf file
- **Email**: Sends sales report via email (requires backend email configuration)

## Error Handling

- API errors are handled gracefully with error messages displayed to users
- 401 errors automatically redirect to login page
- Form validation provides inline error messages
- Network errors are displayed with user-friendly messages

## Styling

The application uses Tailwind CSS for all styling. The design is:
- Responsive (mobile-friendly)
- Modern and clean
- Consistent color scheme
- Accessible components

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Notes

- Ensure the backend API is running before starting the frontend
- The backend API should be configured to allow CORS requests from the frontend URL
- Authentication tokens are stored in localStorage
- Email export requires backend email service configuration (see backend README)

## License

ISC
