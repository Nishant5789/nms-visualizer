import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";




const Dashboard = () => {
  const [mergedData, setMergedData] = useState([]);
  const [discoveryData, setDiscoveryData] = useState([]);
  const [objectData, setObjectData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDiscovery, setSelectedDiscovery] = useState(null);
  const [pollInterval, setPollInterval] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const discoveryRes = await axios.get("api/discovery/");
    const objectRes = await axios.get("api/object/");
    setDiscoveryData(discoveryRes.data);
    setObjectData(objectRes.data);
    mergeData(discoveryRes.data, objectRes.data);
  };

  const mergeData = (discovery, objects) => {
    let discoveryData = discovery
      .filter((disc) => disc.discovery_status === "completed")
      .map((item) => ({
        ...item,
        type: "discovery",
      }));

    console.log(discoveryData);


    const objectMap = new Map();
    objects.forEach((obj) => {
      objectMap.set(obj.ip, { ...obj, type: "object" });
    });

    discoveryData = discoveryData.filter((disc) => !objectMap.has(disc.ip));

    const merged = [...discoveryData, ...Array.from(objectMap.values())];

    setMergedData(merged);
  };


  // Handle provision button click
  const handleProvisionClick = (item) => {
    setSelectedDiscovery(item);
    setPollInterval("");
    setShowModal(true);
  };

  const navigate = useNavigate();

  const handleMonitor = (object_id) => {
    navigate(`/monitor/${object_id}`);
  };


  const handleProvisionSubmit = async () => {
    try {
      await axios.post("api/object/provision/", {
        ip: selectedDiscovery.ip,
        pollinterval: Number(pollInterval),
      });

      // Refresh the data after provisioning
      await fetchData();

      // Remove the provisioned discovery from the discovery data
      setDiscoveryData((prev) =>
        prev.filter((d) => d.discovery_id !== selectedDiscovery.discovery_id)
      );

      setShowModal(false);
      setSelectedDiscovery(null);
    } catch (error) {
      console.error("Provisioning failed:", error);
    }
  };

      // Add Delete Function
      const handleDelete = async (object_id) => {
        if (!object_id) return;
        try {
          await axios.delete(`api/object/${object_id}`);
          await fetchData();  // Refresh the dashboard after deletion
        } catch (error) {
          console.error("Delete failed:", error);
        }
      };

  return (
    <div className="p-8 mx-20">
      <h2 className="text-2xl font-bold mb-6">Merged Dashboard</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200 text-xl font-semibold">
            <th className="p-4">IP</th>
            <th className="p-4">Poll Interval</th>
            <th className="p-4">System Type</th>
            <th className="p-4">Credential Name</th>
            <th className="p-4">Action</th>
          </tr>
        </thead>

        <tbody>
          {mergedData.map((item, index) => (
            <tr
              key={index}
              className="text-xl text-center font-sans border-t hover:bg-gray-100 hover:scale-[1.01] transition-all duration-300"
            >
              <td className="p-4">
                {item.ip} <span className="text-xl">🌐</span>
              </td>
              <td className="p-4">
                {item.type === "discovery" ? "Not Applicable" : item.pollinterval}
              </td>
              <td className="p-4">{item.system_type}</td>
              <td className="p-4">{item.credential_name}</td>
              <td className="p-4">
                {item.type === "discovery" ? (
                  item.discovery_status === "completed" && (
                    <button
                      onClick={() => handleProvisionClick(item)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Provision
                    </button>
                  )
                ) : (
                  <>
                    <button
                      onClick={() => handleMonitor(item.object_id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Monitor
                    </button>

                    {/* Show Delete button only if object_id exists */}
                    {item.object_id && (
                      <button
                        onClick={() => handleDelete(item.object_id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 ml-2"
                      >
                        Delete
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Provision */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] relative shadow-xl">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
              onClick={() => setShowModal(false)}
            >
              ✖
            </button>
            <h2 className="text-2xl mb-4 font-semibold text-center">Provision Device</h2>
            <p className="mb-2">IP: <span className="font-medium">{selectedDiscovery.ip}</span></p>
            <label className="block mb-2 text-lg">Poll Interval (ms):</label>
            <input
              type="number"
              value={pollInterval}
              onChange={(e) => setPollInterval(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded mb-4"
              placeholder="Enter Poll Interval"
            />
            <button
              onClick={handleProvisionSubmit}
              className="bg-green-600 w-full text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
