import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const Discovery = () => {
  const [discoveryList, setDiscoveryList] = useState([]);
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [discoveryId, setDiscoveryId] = useState(null); // For edit mode

  const fetchDiscovery = async () => {
    try {
      const res = await axios.get('api/discovery/');
      setDiscoveryList(res.data);
    } catch (err) {
      console.error('Error fetching discovery:', err);
    }
  };

  useEffect(() => {
    fetchDiscovery();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      credential_id: parseInt(credentialId),
      ip,
      port: parseInt(port),
      discovery_status: 'pending'
    };

    try {
      if (discoveryId) {
        await axios.put(`api/discovery/${discoveryId}`, data);
        toast.success('Discovery updated successfully!', { autoClose: 2000 });
      } else {
        await axios.post('api/discovery/', data);
        toast.success('Discovery added successfully!', { autoClose: 2000 });
      }
      fetchDiscovery();
      resetForm();
    } catch (err) {
      console.log(err);
      
      toast.error(err.response.data.statusMsg, { autoClose: 2000 });
    }
  };

  const resetForm = () => {
    setIp('');
    setPort('');
    setCredentialId('');
    setDiscoveryId(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`api/discovery/${id}`);
      fetchDiscovery();
      toast.success('Discovery deleted successfully!', { autoClose: 2000 });
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete discovery', { autoClose: 2000 });
    }
  };


  const handleEdit = (item) => {
    setIp(item.ip);
    setPort(item.port);
    setCredentialId(item.credential_id);
    setDiscoveryId(item.discovery_id);
  };

  // ✅ Run Discovery Logic
  const handleRunDiscovery = async (id) => {
    // Show loading toast and get its ID
    const toastId = toast.loading('Discovery is running...');
  
    try {
      // Run discovery
      await axios.post('api/discovery/run', {
        discovery_id: parseInt(id),
      });
  
      // Update the toast once successful
      toast.update(toastId, { render: 'Discovery completed!', type: 'success', isLoading: false, autoClose: 2000 });
  
    } catch (error) {
      // Handle failure and update toast
      if (error.response?.data?.statusMsg?.includes('Discovery failed')) {
        toast.update(toastId, { render: error.response.data.statusMsg, type: 'error', isLoading: false, autoClose: 5000 });
      } else {
        console.error('An error occurred while running the discovery:', error);
        toast.update(toastId, { render: 'An error occurred while running the discovery.', type: 'error', isLoading: false, autoClose: 5000 });
      }
    }
  
    // Fetch updated discovery
    const res = await axios.get(`api/discovery/${id}`);
  
    // Update that specific discovery status in the list
    setDiscoveryList((prevList) =>
      prevList.map((item) =>
        item.discovery_id === id ? { ...item, discovery_status: res.data.discovery_status } : item
      )
    );
  };
  
  
  return (
    <div className="p-8 mx-20">
      <h2 className="text-2xl font-bold mb-4">Discovery List</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-3  gap-4">
          <input
            type="text"
            placeholder="Credential ID"
            value={credentialId}
            onChange={(e) => setCredentialId(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="IP Address"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="number"
            placeholder="Port"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="border p-2 rounded"
            required
          />
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            {discoveryId ? 'Update' : 'Add'}
          </button>

          {discoveryId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <table className="w-full border text-center">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Discovery ID</th>
            <th className="p-2">Credential ID</th>
            <th className="p-2">IP</th>
            <th className="p-2">Port</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {discoveryList.map((item) => (
            <tr key={item.discovery_id} className="border-t">
              <td className="p-2">{item.discovery_id}</td>
              <td className="p-2">{item.credential_id}</td>
              <td className="p-2">{item.ip}</td>
              <td className="p-2">{item.port}</td>
              <td className="p-2">{item.discovery_status}</td>
              <td className="p-2 flex gap-2 justify-center">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.discovery_id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
                {/* ✅ Run Button */}
                <button
                  onClick={() => handleRunDiscovery(item.discovery_id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Run
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Discovery;
