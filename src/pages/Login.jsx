import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { validators } from '../utils/validators';

const Login = () => {
  const isRegistrationEnabled = import.meta.env.VITE_IS_REG_OPEN !== 'false';
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});
    setLoading(true);

    try {
      let result;
      if (isRegister && isRegistrationEnabled) {
        const validationErrors = {};
        const nameError = validators.required(name);
        if (nameError) validationErrors.name = nameError;
        
        const emailError = validators.required(email) || validators.email(email);
        if (emailError) validationErrors.email = emailError;
        
        const passwordError = validators.required(password);
        if (passwordError) validationErrors.password = passwordError;

        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          setLoading(false);
          return;
        }

        result = await register(name, email, password);
      } else {
        result = await login(email, password);
      }

      if (result.success) {
        navigate('/items');
      } else {
        setError(result.message || (isRegister ? 'Registration failed' : 'Login failed'));
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setErrors({});
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mb-6">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 mb-2 tracking-tight">
              adiyo
            </h1>
            <p className="text-lg font-semibold text-gray-300 tracking-wide">
              inventory system
            </p>
            <div className="mt-2 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-100 mt-8">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            {isRegister ? 'Start managing your inventory today' : 'Sign in to continue'}
          </p>
        </div>

        {isRegistrationEnabled && (
          <div className="flex justify-center">
            <div className="inline-flex rounded-xl shadow-lg overflow-hidden border border-gray-700 bg-gray-800/50 backdrop-blur-sm" role="group">
              <button
                type="button"
                onClick={() => !isRegister && toggleMode()}
                className={`px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                  !isRegister
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => isRegister && toggleMode()}
                className={`px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                  isRegister
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                }`}
              >
                Register
              </button>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6 bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl p-8 shadow-2xl" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-gradient-to-r from-red-900/80 to-red-800/80 border border-red-600/50 text-red-100 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          <div className="space-y-4">
            {isRegister && (
              <Input
                label="Name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                error={errors.name}
                required
                className="mb-0"
              />
            )}
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
              }}
              error={errors.email}
              required
              className="mb-0"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
              }}
              error={errors.password}
              required
              className="mb-0"
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 transition-all duration-300 transform hover:scale-[1.02]"
            >
              {loading 
                ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isRegister ? 'Creating account...' : 'Signing in...'}
                  </span>
                ) 
                : (isRegister ? 'Create account' : 'Sign in')
              }
            </Button>
          </div>

          {isRegistrationEnabled && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200 font-medium"
              >
                {isRegister 
                  ? 'Already have an account? ' : "Don't have an account? "}
                <span className="text-blue-400 hover:text-blue-300 underline decoration-2 underline-offset-2">
                  {isRegister ? 'Sign in' : 'Register'}
                </span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
