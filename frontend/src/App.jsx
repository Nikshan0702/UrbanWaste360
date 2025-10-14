import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Authentication from './user/Authentication';
import Dashboard from './user/Dashboard';
import PaymentDetailsPage from './payment/PaymentDetailsPage';


function App() {
  return (
    <BrowserRouter>
    
          <Routes>
          <Route path="/" element={<Authentication />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/PaymentDetailsPage" element={<PaymentDetailsPage />} />
          </Routes>
      
    </BrowserRouter>
  );
}

export default App;