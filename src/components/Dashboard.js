import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const [monitoringObjects, setMonitoringObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [pollInterval, setPollInterval] = useState('');

  // Fetch monitoring objects from the server
  const fetchMonitoringObjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/object/');
      const mappedData = response.data.map(item => ({
        id: item.object_id,
        ip: item.object_data.ip,
        port: item.object_data.port.toString(),
        password: item.object_data.password,
        username: item.object_data.username,
        plugin_engine: item.object_data.plugin_engine,
        status: item.provisioning_status,
      }));
      setMonitoringObjects(mappedData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching monitoring objects:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchMonitoringObjects();
  }, []);

  const handleWatchMonitoring = (id) => {
    const obj = monitoringObjects.find(obj => obj.id === id);
    if (obj.status === 'active') {
      navigate(`/monitor/${id}`);
    } else {
      setSelectedObjectId(id);
      setPollInterval(''); // Reset poll interval input
      setIsModalOpen(true); // Open modal for pending objects
    }
  };

  const handleStartMonitoring = async (e) => {
    e.preventDefault();  // Corrected this line
    if (!pollInterval || isNaN(pollInterval) || parseInt(pollInterval) <= 0) {
      setError('Please enter a valid positive integer for poll interval');
      return;
    }

    try {
      setError(null);
      const payload = {
        object_id: selectedObjectId,
        pollinterval: parseInt(pollInterval),
      };

      // POST request to provision the object
      await axios.post('/api/object/provision/', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // GET request to fetch updated object data
      const response = await axios.get(`/api/object/${selectedObjectId}`);
      const updatedObject = {
        id: response.data.object_id,
        ip: response.data.object_data.ip,
        port: response.data.object_data.port.toString(),
        password: response.data.object_data.password,
        username: response.data.object_data.username,
        plugin_engine: response.data.object_data.plugin_engine,
        status: response.data.provisioning_status,
      };

      // Update the specific object in the UI
      setMonitoringObjects(prev =>
        prev.map(obj => (obj.id === selectedObjectId ? updatedObject : obj))
      );

      // Close modal and navigate
      setIsModalOpen(false);
      navigate(`/monitor/${selectedObjectId}`);
    } catch (err) {
      console.error('Error provisioning object:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedObjectId(null);
    setPollInterval('');
    setError(null);
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600 font-sans text-xl">Loading monitoring objects...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600 font-sans text-xl">Error: {error}</div>;
  }

  return (
    <div className="p-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-gray-800">
        Monitoring Dashboard
        <div className="h-1 w-24 bg-indigo-600 mt-2"></div>
      </h1>
      
      <div className="overflow-x-auto bg-white rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-indigo-600">
            <tr>
              <th className="py-4 px-6 text-left text-base md:text-lg font-bold text-white">
                OBJECT NAME
              </th>
              <th className="py-4 px-6 text-left text-base md:text-lg font-bold text-white">
                OBJECT TYPE
              </th>
              <th className="py-4 px-6 text-left text-base md:text-lg font-bold text-white">
                STATUS
              </th>
              <th className="py-4 px-6 text-left text-base md:text-lg font-bold text-white">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {monitoringObjects.map((obj) => (
              <tr key={obj.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="text-base text-gray-900">
                    {obj.ip} - {obj.username}
                  </div>
                </td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="text-base text-gray-900">
                    {obj.plugin_engine.toUpperCase()}
                  </div>
                </td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full 
                    ${obj.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      obj.status === 'active' ? 'bg-green-100 text-green-800' : 
                      'bg-red-100 text-red-800'}`}
                  >
                    {obj.status.charAt(0).toUpperCase() + obj.status.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-6 whitespace-nowrap">
                  {obj.status === 'active' ? (
                    <button
                      onClick={() => handleWatchMonitoring(obj.id)}
                      className="px-4 py-2 rounded text-sm font-medium text-white bg-green-600 hover:bg-green-700 active:bg-green-800 transition-colors"
                    >
                      Watch
                    </button>
                  ) : (
                    <button
                      onClick={() => handleWatchMonitoring(obj.id)}
                      className="px-4 py-2 rounded text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
                    >
                      Start Monitoring
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {monitoringObjects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No monitoring objects found
          </div>
        )}
      </div>

      {/* Modal for Poll Interval */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Start Monitoring</h2>
            <div className="mb-4">
              <label htmlFor="pollInterval" className="block text-sm font-medium text-gray-700">
                Poll Interval (milliseconds)
              </label>
              <input
                type="number"
                id="pollInterval"
                value={pollInterval}
                onChange={(e) => setPollInterval(e.target.value)}
                className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter poll interval (e.g., 10000)"
                min="1"
              />
            </div>
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            <div className="flex gap-4 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleStartMonitoring}
                className="px-4 py-2 rounded text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}