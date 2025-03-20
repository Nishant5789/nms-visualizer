import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useParams } from 'react-router-dom';
const Monitor = () => {
    const { id } = useParams();
  const [systemData, setSystemData] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState({
    cpuUsageData: [],
    memoryUsageData: [],
    diskUsageData: [],
    loadAverageData: [],
    swapMemoryData: [],
    networkData: [],
  });

  // Fetch data from API every 10 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/object/pollingdata/${id}`); // Replace with your API endpoint
        const resData = await response.json();

        const data = resData.map(item => ({...item.counters,  timestamp: item.timestamp}));

        setSystemData(data);
        setMetrics(data.slice(-1)[0]); // Set the latest metrics
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 2000); // Fetch every 10 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // Update chart data whenever systemData changes
  useEffect(() => {

    const updateChartData = () => {
        // console.log('systemdata',systemData);
        const formatTime = (timestamp) => {
            const date = new Date(timestamp); // Ensure timestamp is in milliseconds
            let hours = date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
          
            hours = hours % 12;
            hours = hours ? hours : 12; // 0 should be 12 in 12-hour format
          
            return `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;
          };          
          
  
      const cpuUsageData = systemData.map((data, index) => {
        console.log('data',data);
        return {
            name: formatTime(data.timestamp),
            usage: data.system_cpu_percent ? parseFloat(data.system_cpu_percent) : 0,
        }
    });
  
      const memoryUsageData = systemData.map((data, index) => ({
        name: formatTime(data.timestamp),
        usage: data.system_memory_used_percent ? parseFloat(data.system_memory_used_percent) : 0,
      }));
  
      const diskUsageData = systemData.map((data, index) => ({
        name: formatTime(data.timestamp),
        usage: data.system_disk_used_percent ? parseFloat(data.system_disk_used_percent) : 0,
      }));
  
      const loadAverageData = systemData.map((data, index) => ({
        name: formatTime(data.timestamp),
        load1: data.system_load_avg1_min ? parseFloat(data.system_load_avg1_min) : 0,
        load5: data.system_load_avg5_min ? parseFloat(data.system_load_avg5_min) : 0,
        load15: data.system_load_avg15_min ? parseFloat(data.system_load_avg15_min) : 0,
      }));
  
      const swapMemoryData = systemData.map((data, index) => ({
        name: formatTime(data.timestamp),
        used: data.system_swap_memory_used_percent ? parseFloat(data.system_swap_memory_used_percent) : 0,
        free: data.system_swap_memory_free_percent ? parseFloat(data.system_swap_memory_free_percent) : 0,
      }));
  
      const networkData = systemData.map((data, index) => ({
        name: formatTime(data.timestamp),
        tcp: data.system_network_tcp_connections ? parseInt(data.system_network_tcp_connections) : 0,
        udp: data.system_network_udp_connections ? parseInt(data.system_network_udp_connections) : 0,
      }));

  
      setChartData({
        cpuUsageData,
        memoryUsageData,
        diskUsageData,
        loadAverageData,
        swapMemoryData,
        networkData,
      });
    };
  
    if (systemData && systemData.length > 0) {
      updateChartData();   // ✅ Only run if systemData is non-empty
    }
  }, [systemData]);
  

  if (!metrics) {
    return (
      <div className="p-6 text-center text-gray-600 font-sans text-xl">
        Loading system data...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800 font-sans tracking-tight text-center">
        System Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* System Overview */}
        <div className="bg-gradient-to-br from-blue-50 to-white shadow-lg rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-2xl font-bold mb-4 text-blue-700 font-serif">System Overview</h2>
          <ul className="space-y-3 text-gray-700 font-medium font-sans">
            <li className="flex items-center">
              <span className="w-4 h-4 mr-2 bg-blue-500 rounded-full"></span>
              <span>Hostname: <span className="font-semibold text-blue-600">{metrics.system_name || 'N/A'}</span></span>
            </li>
            <li className="flex items-center">
              <span className="w-4 h-4 mr-2 bg-blue-500 rounded-full"></span>
              <span>OS Name: <span className="font-semibold text-blue-600">{metrics.system_os_name || 'N/A'}</span></span>
            </li>
            <li className="flex items-center">
              <span className="w-4 h-4 mr-2 bg-blue-500 rounded-full"></span>
              <span>OS Version: <span className="font-semibold text-blue-600">{metrics.system_os_version || 'N/A'}</span></span>
            </li>
            <li className="flex items-center">
              <span className="w-4 h-4 mr-2 bg-blue-500 rounded-full"></span>
              <span>Uptime: <span className="font-semibold text-blue-600">{metrics.started_time || 'N/A'}</span></span>
            </li>
          </ul>
        </div>

        {/* CPU Metrics */}
        <div className="bg-gradient-to-br from-green-50 to-white shadow-lg rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-2xl font-bold mb-4 text-green-700 font-serif">CPU Metrics</h2>
          <ul className="space-y-3 text-gray-700 font-medium font-sans">
            <li className="flex items-center">
              <span className="w-4 h-4 mr-2 bg-green-500 rounded-full"></span>
              <span>CPU Cores: <span className="font-semibold text-green-600">{metrics.system_cpu_cores || 'N/A'}</span></span>
            </li>
            <li className="flex items-center">
              <span className="w-4 h-4 mr-2 bg-green-500 rounded-full"></span>
              <span>CPU Usage: <span className="font-semibold text-green-600">{metrics.system_cpu_percent ? `${metrics.system_cpu_percent}%` : 'N/A'}</span></span>
            </li>
            <li className="flex items-center">
              <span className="w-4 h-4 mr-2 bg-green-500 rounded-full"></span>
              <span>CPU I/O Wait: <span className="font-semibold text-green-600">{metrics.system_cpu_io_percent ? `${metrics.system_cpu_io_percent}%` : 'N/A'}</span></span>
            </li>
            <li className="flex items-center">
              <span className="w-4 h-4 mr-2 bg-green-500 rounded-full"></span>
              <span>CPU Idle: <span className="font-semibold text-green-600">{metrics.system_cpu_idle_percent ? `${metrics.system_cpu_idle_percent}%` : 'N/A'}</span></span>
            </li>
            <li className="flex items-center">
              <span className="w-4 h-4 mr-2 bg-green-500 rounded-full"></span>
              <span>CPU Kernel: <span className="font-semibold text-green-600">{metrics.system_cpu_kernel_percent ? `${metrics.system_cpu_kernel_percent}%` : 'N/A'}</span></span>
            </li>
            <li className="flex items-center">
              <span className="w-4 h-4 mr-2 bg-green-500 rounded-full"></span>
              <span>CPU Interrupt: <span className="font-semibold text-green-600">{metrics.system_cpu_interrupt_percent ? `${metrics.system_cpu_interrupt_percent}%` : 'N/A'}</span></span>
            </li>
            <li className="flex items-center">
              <span className="w-4 h-4 mr-2 bg-green-500 rounded-full"></span>
              <span>Blocked Processes: <span className="font-semibold text-green-600">{metrics.system_blocked_processes || 'N/A'}</span></span>
            </li>
            <li className="flex items-center">
              <span className="w-4 h-4 mr-2 bg-green-500 rounded-full"></span>
              <span>Context Switches/sec: <span className="font-semibold text-green-600">{metrics.system_context_switches_per_sec || 'N/A'}</span></span>
            </li>
          </ul>
        </div>

        {/* Processes */}
        <div className="bg-gradient-to-br from-purple-50 to-white shadow-lg rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-2xl font-bold mb-4 text-purple-700 font-serif">Processes</h2>
          <ul className="space-y-3 text-gray-700 font-medium font-sans">
            <li className="flex items-center">
              <span className="w-4 h-4 mr-2 bg-purple-500 rounded-full"></span>
              <span>Running Processes: <span className="font-semibold text-purple-600">{metrics.system_running_processes || 'N/A'}</span></span>
            </li>
            <li className="flex items-center">
              <span className="w-4 h-4 mr-2 bg-purple-500 rounded-full"></span>
              <span>Threads: <span className="font-semibold text-purple-600">{metrics.system_threads || 'N/A'}</span></span>
            </li>
          </ul>
        </div>

        {/* CPU Usage History */}
        <div className="bg-gradient-to-br from-indigo-50 to-white shadow-lg rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-2xl font-bold mb-4 text-indigo-700 font-serif">CPU Usage History</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.cpuUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip wrapperClassName="bg-white shadow-md rounded-md p-2" />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line type="monotone" dataKey="usage" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Memory Usage History */}
        <div className="bg-gradient-to-br from-teal-50 to-white shadow-lg rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-2xl font-bold mb-4 text-teal-700 font-serif">Memory Usage History</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.memoryUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip wrapperClassName="bg-white shadow-md rounded-md p-2" />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line type="monotone" dataKey="usage" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Disk Usage History */}
        <div className="bg-gradient-to-br from-orange-50 to-white shadow-lg rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-2xl font-bold mb-4 text-orange-700 font-serif">Disk Usage History</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.diskUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip wrapperClassName="bg-white shadow-md rounded-md p-2" />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line type="monotone" dataKey="usage" stroke="#ff7300" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Load Average History */}
        <div className="bg-gradient-to-br from-pink-50 to-white shadow-lg rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-2xl font-bold mb-4 text-pink-700 font-serif">Load Average History</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.loadAverageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip wrapperClassName="bg-white shadow-md rounded-md p-2" />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line type="monotone" dataKey="load1" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="load5" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="load15" stroke="#ff7300" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Swap Memory History */}
        <div className="bg-gradient-to-br from-cyan-50 to-white shadow-lg rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-2xl font-bold mb-4 text-cyan-700 font-serif">Swap Memory History</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.swapMemoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip wrapperClassName="bg-white shadow-md rounded-md p-2" />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="used" fill="#8884d8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="free" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Network Connections History */}
        <div className="bg-gradient-to-br from-yellow-50 to-white shadow-lg rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-2xl font-bold mb-4 text-yellow-700 font-serif">Network Connections History</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.networkData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip wrapperClassName="bg-white shadow-md rounded-md p-2" />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="tcp" fill="#8884d8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="udp" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Monitor;