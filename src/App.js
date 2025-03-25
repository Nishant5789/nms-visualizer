import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Credentials from './components/Credentials';
import Discovery from './components/Discovery';
import Monitor from './components/Monitor';
import { ToastContainer, Bounce } from 'react-toastify';

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/credentials" element={<Credentials />} />
          <Route path="/discovery" element={<Discovery />} />
          <Route path="/monitor/:id" element={<Monitor />} />
        </Routes>
      </Router>
      <ToastContainer  position="top-center"  autoClose={5000}  hideProgressBar={false}  newestOnTop={false}  closeOnClick  rtl={false}  pauseOnFocusLoss  draggable
 pauseOnHover  theme="colored"  transition={Bounce} />
     </>

  );
}

export default App;