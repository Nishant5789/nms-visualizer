import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Credentials from './components/Credentials';
import Discovery from './components/Discovery';
import Monitor from './components/Monitor';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/credentials" element={<Credentials />} />
        <Route path="/discovery" element={<Discovery />} />
        <Route path="/monitor/:id" element={<Monitor />} />
      </Routes>
    </Router>
  );
}

export default App;