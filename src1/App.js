import { useState } from 'react';
import ShipmentForm from './components/homepage';
import Login from './components/login';
import Signup from './components/signup';
import SupplierManagement from './components/admin';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from './components/Sidebar';

function App() {
  const [selectedRowData, setSelectedRowData] = useState(null);

 

  return (
    <div className="App">
      <BrowserRouter>

        
        <Routes>
          <Route path="" element={<Login />} />
          <Route path="sign-up" element={<Signup />} />
          <Route path="home" element={<ShipmentForm />} />
          <Route path="admin" element={<SupplierManagement />} />

         
        </Routes>

      </BrowserRouter>
    </div>
  );
}

export default App;
