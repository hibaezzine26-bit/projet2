import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, UploadCloud, FileText, AlertTriangle, LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);

  const navItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { path: '/import', label: 'Import SAP/Excel', icon: UploadCloud },
    { path: '/reporting', label: 'Reporting & Export', icon: FileText },
    { path: '/consommation-anormale', label: 'Consommation inhabituelle', icon: AlertTriangle },
  ];

  return (
    <aside className="sidebar glass">
      <div className="sidebar-header">
        <img src="/ocp-logo.png" alt="OCP logo" className="sidebar-logo" />
        <h2>PDR Manager</h2>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
