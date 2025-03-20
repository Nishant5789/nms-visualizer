import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Credentials() {
  const [credentials, setCredentials] = useState([]);
  const [newCredential, setNewCredential] = useState({ username: '', password: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch credentials from the server
  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/credentials/');
      setCredentials(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching credentials:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Fetch credentials on mount
  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCredential.username || !newCredential.password) {
      setError('Username and password are required');
      return;
    }

    try {
      setError(null);
      const payload = {
        username: newCredential.username,
        password: newCredential.password,
      };

      await axios.post('/api/credentials/', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Refetch credentials after adding
      await fetchCredentials();

      setNewCredential({ username: '', password: '' });
      if (editingId) {
        setEditingId(null);
      }
    } catch (err) {
      console.error('Error submitting credential:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleUpdate = (credential_id) => {
    if (editingId === credential_id) {
      handleSubmit({ preventDefault: () => {} });
    } else {
      const credential = credentials.find(cred => cred.credential_id === credential_id);
      setNewCredential({ username: credential.username, password: credential.password });
      setEditingId(credential_id);
    }
  };

  const handleDelete = async (credential_id) => {
    try {
      setError(null);
      // Send DELETE request to the server
      await axios.delete(`/api/credentials/${credential_id}`);

      // Refetch credentials to update UI
      await fetchCredentials();

      // Clear editing state if deleting the edited credential
      if (editingId === credential_id) {
        setEditingId(null);
        setNewCredential({ username: '', password: '' });
      }
    } catch (err) {
      console.error('Error deleting credential:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleChange = (e) => {
    setNewCredential({ ...newCredential, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600 font-sans text-xl">
        Loading credentials...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 font-sans text-xl">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800 font-sans tracking-tight text-center">
        Credentials Management
      </h1>
      
      <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-100 rounded-lg shadow-md">
        <div className="flex gap-4 mb-4 items-center">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={newCredential.username}
            onChange={handleChange}
            className="p-2 border rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={newCredential.password}
            onChange={handleChange}
            className="p-2 border rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded whitespace-nowrap transition-colors duration-200"
          >
            {editingId ? 'Save' : 'Add'}
          </button>
        </div>
        {editingId && (
          <p className="text-sm text-gray-600">Editing credential ID: {editingId}</p>
        )}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </form>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-4 border text-center align-middle font-semibold text-gray-700">Credential ID</th>
              <th className="py-3 px-4 border text-center align-middle font-semibold text-gray-700">Username</th>
              <th className="py-3 px-4 border text-center align-middle font-semibold text-gray-700">Password</th>
              <th className="py-3 px-4 border text-center align-middle font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {credentials.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-4 px-4 text-center text-gray-500">
                  No credentials found
                </td>
              </tr>
            ) : (
              credentials.map(cred => (
                <tr key={cred.credential_id} className="hover:bg-gray-50 transition-colors duration-100">
                  <td className="py-2 px-4 border text-center align-middle">{cred.credential_id}</td>
                  <td className="py-2 px-4 border text-center align-middle">{cred.username}</td>
                  <td className="py-2 px-4 border text-center align-middle">{cred.password}</td>
                  <td className="py-2 px-4 border text-center align-middle">
                    <div className="flex gap-2 justify-center">
                      <button 
                        onClick={() => handleUpdate(cred.credential_id)} 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white p-1 rounded transition-colors duration-200"
                      >
                        {editingId === cred.credential_id ? 'Cancel' : 'Update'}
                      </button>
                      <button 
                        onClick={() => handleDelete(cred.credential_id)} 
                        className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors duration-200"
                      >
                        Delete
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