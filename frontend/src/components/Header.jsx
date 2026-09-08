import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, ShieldCheck, User, Sun, Moon } from 'lucide-react';
import './Header.css';

const getPageTitle = (pathname) => {
  switch (pathname) {
    case '/app/dashboard':
      return { title: 'Tableau de bord', subtitle: 'Synthèse des règles d’approvisionnement et stocks' };
    case '/app/import':
      return { title: 'Importation de données', subtitle: 'Intégration des fichiers SAP, Backlog & Consommation' };
    case '/app/reporting':
      return { title: 'Reporting & Export', subtitle: 'Restitution des décisions et exports Excel' };
    case '/app/consommation-anormale':
      return { title: 'Consommation inhabituelle', subtitle: 'Détection des anomalies de consommation' };
    default:
      return { title: 'PDR Manager', subtitle: 'Gestion industrielle des approvisionnements' };
  }
};

const Header = ({ onToggleSidebar }) => {
  const { user } = useContext(AuthContext);
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const { title, subtitle } = getPageTitle(location.pathname);

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Ouvrir le menu"
        >
          <Menu size={22} />
        </button>
        <div className="header-title-wrap">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        {/* Theme Toggle Button (Sombre / Clair) */}
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={isDark ? 'Passer au mode clair' : 'Passer au mode sombre'}
          aria-label="Changer le thème"
        >
          {isDark ? <Sun size={19} className="theme-icon sun" /> : <Moon size={19} className="theme-icon moon" />}
        </button>

        <div className="user-profile-pill">
          <div className="user-avatar">
            <User size={16} />
          </div>
          <div className="user-info">
            <span className="user-name">Administrateur</span>
            <span className="user-email">{user?.email || 'admin@ocp.ma'}</span>
          </div>
          <span className="user-role-badge">
            <ShieldCheck size={13} />
            ADMIN
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
