import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Discovery() {
  const [discoveries, setDiscoveries] = useState([]);
  const [newDiscovery, setNewDiscovery] = useState({
    ipAddresses: [''],
    port: '',
    credentialId: '',
    deviceType: 'linux',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch discoveries from the server
  const fetchDiscoveries = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/discovery/');
      const mappedData = response.data.map(item => ({
        id: item.discovery_id,
        ipAddresses: JSON.parse(item.ips),
        port: item.port,
        credentialId: item.credential_id,
        deviceType: item.type,
        discoveryStatus: item.discovery_status,
      }));
      setDiscoveries(mappedData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching discoveries:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Fetch discoveries on mount
  useEffect(() => {
    fetchDiscoveries();
  }, []);

  const handleAddIpField = () => {
    setNewDiscovery(prev => ({
      ...prev,
      ipAddresses: [...prev.ipAddresses, ''],
    }));
  };

  const handleRemoveIpField = (index) => {
    setNewDiscovery(prev => ({
      ...prev,
      ipAddresses: prev.ipAddresses.filter((_, i) => i !== index),
    }));
  };

  const handleIpChange = (index, value) => {
    setNewDiscovery(prev => ({
      ...prev,
      ipAddresses: prev.ipAddresses.map((ip, i) => (i === index ? value : ip)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newDiscovery.ipAddresses.some(ip => ip) && newDiscovery.port && newDiscovery.credentialId) {
      try {
        setError(null);
        const validIps = newDiscovery.ipAddresses.filter(ip => ip.trim() !== '');
        const payload = {
          ips: validIps,
          port: parseInt(newDiscovery.port),
          type: newDiscovery.deviceType,
          credential_id: parseInt(newDiscovery.credentialId),
        };

        await axios.post('/api/discovery/', payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        await fetchDiscoveries();

        setNewDiscovery({
          ipAddresses: [''],
          port: '',
          credentialId: '',
          deviceType: 'linux',
        });
        if (editingId) {
          setEditingId(null);
        }
      } catch (err) {
        console.error('Error adding discovery:', err);
        setError(err.response?.data?.message || err.message);
      }
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handleUpdate = (id) => {
    if (editingId === id) {
      handleSubmit({ preventDefault: () => {} });
    } else {
      const discovery = discoveries.find(disc => disc.id === id);
      setNewDiscovery({ ...discovery, ipAddresses: [...discovery.ipAddresses] });
      setEditingId(id);
    }
  };

  const handleDelete = async (id) => {
    try {
      setError(null);
      // Send DELETE request to the server
      await axios.delete(`/api/discovery/${id}`);

      // Update local state by removing the deleted discovery
      setDiscoveries(prev => prev.filter(disc => disc.id !== id));

      // Clear editing state if deleting the edited discovery
      if (editingId === id) {
        setEditingId(null);
        setNewDiscovery({
          ipAddresses: [''],
          port: '',
          credentialId: '',
          deviceType: 'linux',
        });
      }
    } catch (err) {
      console.error('Error deleting discovery:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleRun = async (discovery_id) => {
    try {
      setError(null);
      const payload = {
        discovery_id: discovery_id,
      };

      await axios.post('/api/discovery/run', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await axios.get(`/api/discovery/${discovery_id}`);
      setDiscoveries(prev =>
        prev.map(disc =>
          disc.id === discovery_id
            ? { ...disc, discoveryStatus: response.data.discovery_status }
            : disc
        )
      );
    } catch (err) {
      console.error('Error running discovery:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDiscovery(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600 font-sans text-xl">Loading discoveries...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600 font-sans text-xl">Error: {error}</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800 font-sans tracking-tight text-center">
        Discovery Management
      </h1>
      
      <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-100 rounded-lg shadow-md">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="space-y-2 max-h-[300px] overflow-y-auto p-2">
              {newDiscovery.ipAddresses.map((ip, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="IP Address"
                    value={ip}
                    onChange={(e) => handleIpChange(index, e.target.value)}
                    className="p-2 border rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {index === newDiscovery.ipAddresses.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleAddIpField}
                      className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white p-2 rounded min-w-[40px] transition-colors"
                      title="Add new IP field"
                    >
                      +
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRemoveIpField(index)}
                      className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white p-2 rounded min-w-[40px] transition-colors"
                      title="Remove this IP"
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {newDiscovery.ipAddresses.length} IP address{newDiscovery.ipAddresses.length !== 1 ? 'es' : ''} added
            </div>
          </div>
          
          <div className="flex flex-col gap-2 min-w-[250px]">
            <input
              type="text"
              name="port"
              placeholder="Port"
              value={newDiscovery.port}
              onChange={handleChange}
              className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="credentialId"
              placeholder="Credential ID"
              value={newDiscovery.credentialId}
              onChange={handleChange}
              className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-4 flex-wrap p-2 bg-white rounded border">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="deviceType"
                  value="linux"
                  checked={newDiscovery.deviceType === 'linux'}
                  onChange={handleChange}
                />
                Linux
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="deviceType"
                  value="snmp"
                  checked={newDiscovery.deviceType === 'snmp'}
                  onChange={handleChange}
                />
                SNMP
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="deviceType"
                  value="windows"
                  checked={newDiscovery.deviceType === 'windows'}
                  onChange={handleChange}
                />
                Windows
              </label>
            </div>
            <button 
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white p-2 rounded mt-2 transition-colors"
            >
              {editingId ? 'Save' : 'Add All'}
            </button>
          </div>
        </div>
        
        {editingId && (
          <p className="text-sm text-gray-600 mt-2">Editing discovery ID: {editingId}</p>
        )}
        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}
      </form>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border text-center align-middle font-semibold text-gray-700">ID</th>
              <th className="py-2 px-4 border text-center align-middle font-semibold text-gray-700">IP Addresses</th>
              <th className="py-2 px-4 border text-center align-middle font-semibold text-gray-700">Port</th>
              <th className="py-2 px-4 border text-center align-middle font-semibold text-gray-700">Credential ID</th>
              <th className="py-2 px-4 border text-center align-middle font-semibold text-gray-700">Device Type</th>
              <th className="py-2 px-4 border text-center align-middle font-semibold text-gray-700">Status</th>
              <th className="py-2 px-4 border text-center align-middle font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {discoveries.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-4 px-4 text-center text-gray-500">
                  No discoveries found
                </td>
              </tr>
            ) : (
              discoveries.map(disc => (
                <tr key={disc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-4 border text-center align-middle">{disc.id}</td>
                  <td className="py-2 px-4 border text-center align-middle">
                    <div className="flex flex-col gap-1">
                      {disc.ipAddresses.map((ip, index) => (
                        <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {ip}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 px-4 border text-center align-middle">{disc.port}</td>
                  <td className="py-2 px-4 border text-center align-middle">{disc.credentialId}</td>
                  <td className="py-2 px-4 border text-center align-middle">
                    {disc.deviceType.toUpperCase()}
                  </td>
                  <td className="py-2 px-4 border text-center align-middle">
                    {disc.discoveryStatus}
                  </td>
                  <td className="py-2 px-4 border text-center align-middle">
                    <div className="flex gap-2 justify-center">
                      <button 
                        onClick={() => handleUpdate(disc.id)} 
                        className="bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white p-1 rounded transition-colors"
                      >
                        {editingId === disc.id ? 'Cancel' : 'Update'}
                      </button>
                      <button 
                        onClick={() => handleDelete(disc.id)} 
                        className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white p-1 rounded transition-colors"
                      >
                        Delete
                      </button>
                      <button 
                        onClick={() => handleRun(disc.id)} 
                        className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white p-1 rounded transition-colors"
                      >
                        Run
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}