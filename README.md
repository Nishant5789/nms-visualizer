# nms-visualizer

A lightweight, React-based frontend for a **Network Monitoring System (NMS)**. This project provides an intuitive interface to manage credentials, configure network discovery, and monitor networked devices. Built with modern web technologies, it integrates seamlessly with a backend API to handle credential storage, device discovery, and real-time monitoring.

---

## 🚀 Features

- **Credentials Management**  
  Add, update, and delete credentials (username/password) with a responsive UI, synced with the backend database.

- **Network Discovery**  
  Configure and run discovery tasks for network devices (IP addresses, ports, device types) with support for Linux, SNMP, and Windows environments.

- **Monitoring Dashboard**  
  View and manage monitored objects with real-time status updates (Pending / Active), including provisioning options with customizable poll intervals.

- **API Integration**  
  Communicates with a backend server (e.g., `http://localhost:8080`) for CRUD operations and monitoring tasks.

- **Responsive Design**  
  Built with Tailwind CSS for a clean, modern, and mobile-friendly user interface.

---

## 📸 Screenshots

- **Dashboard View**
  
  ![Dashboard](https://cdn.jsdelivr.net/gh/Nishant5789/My_Tech_Notes@main/asset/nmslite_dashboard.png)

- **Discovery View**
  
  ![Discovery](https://cdn.jsdelivr.net/gh/Nishant5789/My_Tech_Notes@main/asset/nmslite_discovery.png)

- **Credential Management**
  
  ![Credential](https://cdn.jsdelivr.net/gh/Nishant5789/My_Tech_Notes@main/asset/nmslite_credential.png)

- **Monitor View - 1**
  
  ![Monitor 1](https://cdn.jsdelivr.net/gh/Nishant5789/My_Tech_Notes@main/asset/nmslite_monitor_1.png)

- **Monitor View - 2**
  
  ![Monitor 2](https://cdn.jsdelivr.net/gh/Nishant5789/My_Tech_Notes@main/asset/nmslite_monitor_2.png)

---

## 🛠 Tech Stack

- **React** – Dynamic and interactive UI components
- **Axios** – API requests handling
- **React Router** – Client-side routing
- **Tailwind CSS** – Styling and responsive layouts

---

## ⚙️ Setup Instructions

```bash
git clone https://github.com/[your-username]/nms_frontendlite.git
cd nms_frontendlite
npm install
