import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, UploadCloud, FileText, AlertTriangle, LogOut, X } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useContext(AuthContext);

  const navItems = [
    { path: '/app/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { path: '/app/import', label: 'Import SAP/Excel', icon: UploadCloud },
    { path: '/app/reporting', label: 'Reporting & Export', icon: FileText },
    { path: '/app/consommation-anormale', label: 'Consommation inhabituelle', icon: AlertTriangle },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo-pill">
              <img src="/ocp-logo.png" alt="Logo OCP" className="sidebar-logo-img" />
            </div>
            <div className="sidebar-brand-text">
              <h2>PDR Manager</h2>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-nav-container">
         
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon size={19} className="nav-icon" />
                <span className="nav-text">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
