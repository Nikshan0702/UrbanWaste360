// import React, { useState } from 'react';

// import { useNavigate } from 'react-router-dom';

// const Authentication = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [formData, setFormData] = useState({
//     name: '',
//     number: '',
//     address: '',
//     email: '',
//     password: '',
//     confirmPassword: ''
//   });
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   // Backend API configuration
//   const API_BASE_URL = 'http://localhost:8080/api/auth';

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     try {
//       if (isLogin) {
//         await handleLogin();
//       } else {
//         await handleRegister();
//       }
//     } catch (err) {
//       setError(err.message || 'Something went wrong!');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleLogin = async () => {
//     const loginData = {
//       email: formData.email,
//       password: formData.password
//     };

//     console.log('Sending login data:', loginData);

//     const response = await fetch(`${API_BASE_URL}/login`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(loginData)
//     });

//     console.log('Login response status:', response.status);

//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(errorText || 'Login failed!');
//     }

//     const data = await response.json();
//     console.log('Login successful:', data);

//     // Store authentication data
//     localStorage.setItem('authToken', data.token || data.jwtToken || 'demo-token');
//     localStorage.setItem('userData', JSON.stringify({
//       name: data.name || formData.email,
//       email: formData.email,
//       role: data.role || 'user',
//       id: data.id || data.userId
//     }));

//     navigate('/dashboard');
//   };

//   const handleRegister = async () => {
//     // Frontend validation
//     if (formData.password !== formData.confirmPassword) {
//       throw new Error("Passwords do not match!");
//     }

//     if (formData.password.length < 6) {
//       throw new Error("Password must be at least 6 characters long!");
//     }

//     // CORRECTED: Match exact field names from your User model
//     const userData = {
//       name: formData.name,
//       number: formData.number,      // Changed from phoneNumber to number
//       address: formData.address,
//       email: formData.email,
//       password: formData.password
//       // role, createdAt, updatedAt are handled by backend
//     };

//     console.log('Sending registration data:', userData);

//     const response = await fetch(`${API_BASE_URL}/register`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(userData)
//     });

//     console.log('Register response status:', response.status);

//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(errorText || `Registration failed with status: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log('Registration successful:', data);

//     // Registration successful
//     setError('');
//     alert("Registration Successful! Please login with your credentials.");
//     setIsLogin(true);
    
//     // Clear form but keep email for convenience
//     setFormData({
//       name: '',
//       number: '',
//       address: '',
//       email: formData.email,
//       password: '',
//       confirmPassword: ''
//     });
//   };

//   const toggleMode = () => {
//     setIsLogin(!isLogin);
//     setError('');
//     setFormData({
//       name: '',
//       number: '',
//       address: '',
//       email: '',
//       password: '',
//       confirmPassword: ''
//     });
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   // Demo login for testing
//   const handleDemoLogin = () => {
//     setFormData({
//       ...formData,
//       email: 'demo@example.com',
//       password: 'demo123'
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-lg">
//       <nav className="bg-white shadow-sm border-b border-gray-100">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center space-x-3">
//               <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
//                 <span className="text-white text-xl">♻️</span>
//               </div>
//               <h1 className="text-2xl font-bold text-gray-900">UrbanWaste360</h1>
//             </div>
//           </div>
//         </div>
//       </nav>
//         <div className="text-center mb-8">
//           <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
//             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//             </svg>
//           </div>
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent mb-2">
//             {isLogin ? 'Welcome Back' : 'Get Started'}
//           </h1>
//           <p className="text-gray-600 text-lg">
//             {isLogin ? 'Sign in to continue your journey' : 'Create your account to get started'}
//           </p>
//         </div>

//         {/* Main Card */}
//         <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
//           {/* Toggle Switch */}
//           <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
//             <button
//               onClick={() => setIsLogin(true)}
//               className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
//                 isLogin 
//                   ? 'bg-white text-emerald-700 shadow-lg' 
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               Sign In
//             </button>
//             <button
//               onClick={() => setIsLogin(false)}
//               className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
//                 !isLogin 
//                   ? 'bg-white text-emerald-700 shadow-lg' 
//                   : 'text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               Sign Up
//             </button>
//           </div>

//           {error && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3">
//               <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//               </svg>
//               <span className="text-red-700 text-sm font-medium">{error}</span>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Registration Fields */}
//             {!isLogin && (
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Full Name
//                   </label>
//                   <div className="relative">
//                     <input
//                       type="text"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400"
//                       placeholder="Enter your full name"
//                       required
//                       minLength="2"
//                       maxLength="50"
//                     />
//                     <div className="absolute inset-y-0 right-0 flex items-center pr-3">
//                       <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Phone Number
//                   </label>
//                   <div className="relative">
//                     <input
//                       type="tel"
//                       name="number"
//                       value={formData.number}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400"
//                       placeholder="Enter your phone number"
//                       required
//                       minLength="10"
//                       maxLength="15"
//                     />
//                     <div className="absolute inset-y-0 right-0 flex items-center pr-3">
//                       <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Address
//                   </label>
//                   <textarea
//                     name="address"
//                     rows="2"
//                     value={formData.address}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400 resize-none"
//                     placeholder="Enter your complete address"
//                     required
//                     minLength="5"
//                     maxLength="200"
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Common Fields */}
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400"
//                     placeholder="Enter your email address"
//                     required
//                   />
//                   <div className="absolute inset-y-0 right-0 flex items-center pr-3">
//                     <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                     </svg>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400 pr-12"
//                     placeholder={isLogin ? "Enter your password" : "Create a strong password"}
//                     required
//                     minLength="6"
//                   />
//                   <button
//                     type="button"
//                     onClick={togglePasswordVisibility}
//                     className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
//                   >
//                     {showPassword ? (
//                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
//                       </svg>
//                     ) : (
//                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                       </svg>
//                     )}
//                   </button>
//                 </div>
//               </div>

//               {!isLogin && (
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Confirm Password
//                   </label>
//                   <input
//                     type="password"
//                     name="confirmPassword"
//                     value={formData.confirmPassword}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400"
//                     placeholder="Confirm your password"
//                     required
//                     minLength="6"
//                   />
//                 </div>
//               )}
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//             >
//               {isLoading ? (
//                 <div className="flex items-center justify-center space-x-2">
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
//                 </div>
//               ) : (
//                 isLogin ? 'Sign In' : 'Create Account'
//               )}
//             </button>
//           </form>

//           {/* Demo Login Button */}
//           {isLogin && (
//             <div className="mt-4 text-center">
//               <button
//                 onClick={handleDemoLogin}
//                 className="text-sm text-gray-600 hover:text-emerald-700 underline"
//               >
//                 Try Demo Credentials
//               </button>
//             </div>
//           )}
//         </div>
//       </div>


//       <footer className="bg-gray-900 text-white py-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//             <div className="col-span-1 md:col-span-2">
//               <div className="flex items-center space-x-3 mb-4">
//                 <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
//                   <span className="text-white text-sm">♻️</span>
//                 </div>
//                 <h3 className="text-xl font-bold text-white">UrbanWaste360</h3>
//               </div>
//               <p className="text-gray-400 max-w-md">
//                 Making waste management simple and efficient for everyone.
//               </p>
//             </div>
//             <div>
//               <h4 className="font-semibold mb-4">Services</h4>
//               <ul className="space-y-2 text-gray-400">
//                 <li><a href="#" className="hover:text-white transition-colors">Waste Tracking</a></li>
//                 <li><a href="#" className="hover:text-white transition-colors">Payments</a></li>
//                 <li><a href="#" className="hover:text-white transition-colors">Recycling</a></li>
//                 <li><a href="#" className="hover:text-white transition-colors">Reports</a></li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-semibold mb-4">Company</h4>
//               <ul className="space-y-2 text-gray-400">
//                 <li><a href="#" className="hover:text-white transition-colors">About</a></li>
//                 <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
//                 <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
//                 <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
//               </ul>
//             </div>
//           </div>
//           <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
//             <p>&copy; 2024 DATTREO. All rights reserved.</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default Authentication;



import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Authentication = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Backend API configuration
  const API_BASE_URL = 'http://localhost:8080/api/auth';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        await handleLogin();
      } else {
        await handleRegister();
      }
    } catch (err) {
      setError(err.message || 'Something went wrong!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    const loginData = {
      email: formData.email,
      password: formData.password
    };

    console.log('Sending login data:', loginData);

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    console.log('Login response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Login failed!');
    }

    const data = await response.json();
    console.log('Login successful:', data);

    // Store authentication data
    localStorage.setItem('authToken', data.token || data.jwtToken || 'demo-token');
    localStorage.setItem('userData', JSON.stringify({
      name: data.name || formData.email,
      email: formData.email,
      role: data.role || 'user',
      id: data.id || data.userId
    }));

    navigate('/dashboard');
  };

  const handleRegister = async () => {
    // Frontend validation
    if (formData.password !== formData.confirmPassword) {
      throw new Error("Passwords do not match!");
    }

    if (formData.password.length < 6) {
      throw new Error("Password must be at least 6 characters long!");
    }

    // CORRECTED: Match exact field names from your User model
    const userData = {
      name: formData.name,
      number: formData.number,      // Changed from phoneNumber to number
      address: formData.address,
      email: formData.email,
      password: formData.password
      // role, createdAt, updatedAt are handled by backend
    };

    console.log('Sending registration data:', userData);

    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    console.log('Register response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Registration failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Registration successful:', data);

    // Registration successful
    setError('');
    alert("Registration Successful! Please login with your credentials.");
    setIsLogin(true);
    
    // Clear form but keep email for convenience
    setFormData({
      name: '',
      number: '',
      address: '',
      email: formData.email,
      password: '',
      confirmPassword: ''
    });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      name: '',
      number: '',
      address: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Demo login for testing
  const handleDemoLogin = () => {
    setFormData({
      ...formData,
      email: 'demo@example.com',
      password: 'demo123'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">♻️</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">UrbanWaste360</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent mb-2">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h1>
            <p className="text-gray-600 text-lg">
              {isLogin ? 'Sign in to continue your journey' : 'Create your account to get started'}
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            {/* Toggle Switch */}
            <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isLogin 
                    ? 'bg-white text-emerald-700 shadow-lg' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  !isLogin 
                    ? 'bg-white text-emerald-700 shadow-lg' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 text-sm font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Registration Fields */}
              {!isLogin && (
                <div className="space-y-4">
                  {/* Name and Phone in Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400"
                          placeholder="Enter your full name"
                          required
                          minLength="2"
                          maxLength="50"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="number"
                          value={formData.number}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400"
                          placeholder="phone number"
                          required
                          minLength="10"
                          maxLength="15"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address - Full Width */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      rows="2"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400 resize-none"
                      placeholder="Enter your complete address"
                      required
                      minLength="5"
                      maxLength="200"
                    />
                  </div>
                </div>
              )}

              {/* Common Fields */}
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400"
                      placeholder="Enter your email address"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Password Fields in Grid for Registration */}
                {!isLogin ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400 pr-12"
                          placeholder="Create a strong password"
                          required
                          minLength="6"
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400"
                        placeholder="Confirm your password"
                        required
                        minLength="6"
                      />
                    </div>
                  </div>
                ) : (
                  /* Single Password Field for Login */
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400 pr-12"
                        placeholder="Enter your password"
                        required
                        minLength="6"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            {/* Demo Login Button */}
            {isLogin && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleDemoLogin}
                  className="text-sm text-gray-600 hover:text-emerald-700 underline"
                >
                  Try Demo Credentials
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">♻️</span>
                </div>
                <h3 className="text-xl font-bold text-white">UrbanWaste360</h3>
              </div>
              <p className="text-gray-400 max-w-md">
                Making waste management simple and efficient for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Waste Tracking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Payments</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Recycling</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Reports</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 UrbanWaste360. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Authentication;