import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Authentication from './user/Authentication';
import Dashboard from './user/Dashboard';
import PaymentDetailsPage from './payment/PaymentDetailsPage';
import HomePage from './payment/HomePage';
import CollectorDashboard from './Collecter/CollecterDashboard';

function App() {
  return (
    <BrowserRouter>
    
          <Routes>
          <Route path="/Authentication" element={<Authentication />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/collector-dashboard" element={<CollectorDashboard />} />
          </Routes>
      
    </BrowserRouter>
  );
}

export default App;