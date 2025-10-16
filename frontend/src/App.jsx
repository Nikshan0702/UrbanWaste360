import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Authentication from './user/Authentication';
import Dashboard from './user/Dashboard';
import PaymentDetailsPage from './payment/PaymentDetailsPage';
import HomePage from './payment/HomePage';
import ZoneSelectionPage from './Collecter/ZoneSelectionPage';
import BinListPage from './Collecter/BinListPage';
import CollectionFormPage from './Collecter/CollectionFormPage';
import ConfirmationPage from './Collecter/ConfirmationPage';
import CollecterDashBoard from './Collecter/Collectiondashboard';
import NearbyBins from './Collecter/NearbyBinsComponent';
import CollectionRecords from './Collecter/CollectionRecords';
import Bin from './Collecter/Bin';
import { Toaster } from 'react-hot-toast';


function App() {
  return (
    <BrowserRouter>
          <Toaster position="top-center" />
          <Routes>
          <Route path="/Authentication" element={<Authentication />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/" element={<HomePage />} />


          <Route path="/ZoneSelection" element={<ZoneSelectionPage />} />
          <Route path="/bins" element={<BinListPage />} />
          <Route path="/collection-form" element={<CollectionFormPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/CollecterDashBoard" element={<CollecterDashBoard />} />
          <Route path="/NearbyBins" element={<NearbyBins />} />    
          <Route path="/CollectionRecords" element={<CollectionRecords />} /> 
          <Route path="/Bin" element={<Bin />} />        

          <Route path="*" element={<div className="p-10">404 Not Found</div>} />
          </Routes>
      
    </BrowserRouter>
  );
}

export default App;