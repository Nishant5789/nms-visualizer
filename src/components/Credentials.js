import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CredentialPage = () => {
  const [credentials, setCredentials] = useState([]);
  const [newCredential, setNewCredential] = useState({
    credential_name: '',
    username: '',
    password: '',
    system_type: 'linux',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const response = await axios.get('api/credentials/');
      setCredentials(response.data);
    } catch (error) {
      console.error('Error fetching credentials:', error);
    }
  };

  const handleChange = (e) => {
    setNewCredential({ ...newCredential, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      credential_name: newCredential.credential_name,
      credential_data: {
        username: newCredential.username,
        password: newCredential.password,
      },
      system_type: newCredential.system_type,
    };

    try {
      if (editingId) {
        // Update flow
        await axios.put(`api/credentials/${editingId}`, payload);
      } else {
        // Add flow
        await axios.post('api/credentials/', payload);
      }

      setNewCredential({ credential_name: '', username: '', password: '', system_type: 'linux' });
      setEditingId(null);
      fetchCredentials();
    } catch (error) {
      console.error('Error saving credential:', error);
    }
  };

  const handleEdit = (credential) => {
    const parsedData = JSON.parse(credential.credential_data);
    setEditingId(credential.credential_id);
    setNewCredential({
      credential_name: credential.credential_name,
      username: parsedData.username,
      password: parsedData.password,
      system_type: credential.system_type,
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`api/credentials/${id}`);
      fetchCredentials();
    } catch (error) {
      console.error('Error deleting credential:', error);
    }
  };

  return (
    <div className="mx-20 p-8">
      <h1 className="text-3xl font-bold mb-8">Credential Manager</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="credential_name"
            value={newCredential.credential_name}
            onChange={handleChange}
            placeholder="Credential Name"
            required
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="username"
            value={newCredential.username}
            onChange={handleChange}
            placeholder="Username"
            required
            className="border p-2 rounded"
          />
          <input
            type="password"
            name="password"
            value={newCredential.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="border p-2 rounded"
          />
          <select
            name="system_type"
            value={newCredential.system_type}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="linux">Linux</option>
            <option value="windows">Windows</option>
          </select>
        </div>

        <div className="mt-4 flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {editingId ? 'Update' : 'Add'}
          </button>

          {/* Optional Cancel Button */}
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setNewCredential({ credential_name: '', username: '', password: '', system_type: 'linux' });
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Credentials Table */}
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 border">Credential Name</th>
            <th className="py-2 px-4 border">Username</th>
            <th className="py-2 px-4 border">Password</th>
            <th className="py-2 px-4 border">System Type</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {credentials.map((cred) => {
            const parsedData = JSON.parse(cred.credential_data);
            return (
              <tr key={cred.id} className="text-center">
                <td className="py-2 px-4 border">{cred.credential_name}</td>
                <td className="py-2 px-4 border">{parsedData.username}</td>
                <td className="py-2 px-4 border">{parsedData.password}</td>
                <td className="py-2 px-4 border">{cred.system_type}</td>
                <td className="py-2 px-4 border flex gap-2 justify-center">
                  <button
                    onClick={() => handleEdit(cred)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cred.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CredentialPage;
