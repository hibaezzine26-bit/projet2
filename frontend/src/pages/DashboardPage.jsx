import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import { Package, AlertTriangle, CheckCircle, Clock, Layers3 } from 'lucide-react';
import './DashboardPage.css';
import api from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalArticles: 0,
    minMaxCount: 0,
    planifieCount: 0,
    surDemandeCount: 0,
    anomaliesCount: 0,
    articlesCritiques: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [summaryResponse, resultatsResponse] = await Promise.all([
          api.get('/analyse/summary'),
          api.get('/analyse/resultats')
        ]);

        const summary = summaryResponse.data || {};
        const resultats = resultatsResponse.data || [];

        setStats({
          totalArticles: Number(summary.totalArticles || 0),
          minMaxCount: Number(summary.minMaxCount || 0),
          planifieCount: Number(summary.planifieCount || 0),
          surDemandeCount: Number(summary.surDemandeCount || 0),
          anomaliesCount: Number(summary.anomaliesCount || 0),
          articlesCritiques: Number(summary.articlesCritiques || 0),
          totalToLaunch: resultats.length
        });
      } catch (error) {
        console.error('Erreur dashboard', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Articles total',
      value: stats.totalArticles,
      icon: Package,
      color: 'primary'
    },
    {
      title: 'Min & Max',
      value: stats.minMaxCount,
      icon: Layers3,
      color: 'warning'
    },
    {
      title: 'Planifié',
      value: stats.planifieCount,
      icon: Clock,
      color: 'secondary'
    },
    {
      title: 'Sur demande',
      value: stats.surDemandeCount,
      icon: AlertTriangle,
      color: 'danger'
    },
    {
      title: 'Anomalies',
      value: stats.anomaliesCount,
      icon: AlertTriangle,
      color: 'danger'
    },
    {
      title: 'Articles critiques',
      value: stats.articlesCritiques,
      icon: CheckCircle,
      color: 'success'
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="page-header animate-fade-in">
        <h1>Tableau de bord PDR</h1>
        <p>Suivi des règles d’approvisionnement, des OT planifiés et des anomalies de consommation.</p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <Card key={index} className={`stat-card animate-fade-in delay-${(index % 3) + 1}`}>
            <div className="stat-card-inner">
              <div>
                <h3 className="stat-title">{stat.title}</h3>
                {loading ? (
                  <div className="skeleton-text"></div>
                ) : (
                  <div className="stat-value">{stat.value}</div>
                )}
              </div>
              <div className={`stat-icon-wrapper text-${stat.color}`}>
                <stat.icon size={32} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="dashboard-content">
        <Card className="dashboard-chart animate-fade-in delay-2">
          <h3>Workflow de décision</h3>
          <div className="chart-placeholder">
            <p>1. Import des fichiers Excel • 2. Calcul des règles • 3. Reporting • 4. Export</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
