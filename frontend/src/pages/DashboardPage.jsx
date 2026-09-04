import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import { Layers, RefreshCw } from 'lucide-react';
import './DashboardPage.css';
import api from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalArticles: 0,
    minMaxCount: 0,
    planifieCount: 0,
    surDemandeCount: 0,
    anomaliesCount: 0,
    articlesCritiques: 0,
    stockRate: 0,
    minMaxRate: 0,
    planifieRate: 0,
    surDemandeRate: 0,
    articlesEnStock: 0,
    articlesSansStock: 0,
    totalToLaunch: 0
  });
  const [resultats, setResultats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
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
        stockRate: Number(summary.stockRate || 0),
        minMaxRate: Number(summary.minMaxRate || 0),
        planifieRate: Number(summary.planifieRate || 0),
        surDemandeRate: Number(summary.surDemandeRate || 0),
        articlesEnStock: Number(summary.articlesEnStock || 0),
        articlesSansStock: Number(summary.articlesSansStock || 0),
        totalToLaunch: resultats.length
      });
      setResultats(resultats);
    } catch (error) {
      console.error('Erreur dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const donutSegments = [
    {
      label: 'Min & Max',
      value: Number(stats.minMaxCount || 0),
      color: '#00a651'
    },
    {
      label: 'Planifié',
      value: Number(stats.planifieCount || 0),
      color: '#2864e8'
    },
    {
      label: 'Sur demande',
      value: Number(stats.surDemandeCount || 0),
      color: '#c084fc'
    },
    {
      label: 'En stock',
      value: Number(stats.articlesEnStock || 0),
      color: '#60a5fa'
    }
  ];

  const donutTotal = donutSegments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  const donutChart = donutSegments.map((segment) => ({
    ...segment,
    percent: (segment.value / donutTotal) * 100,
    displayPercent: Math.round((segment.value / donutTotal) * 100)
  }));

  const columnsResultats = [
    { header: 'Code SAP', accessor: 'codeSAP', render: (row) => <strong>{row?.article?.codeSAP || '-'}</strong> },
    { header: 'Description', accessor: 'description', render: (row) => row?.article?.description || '-' },
    { header: 'UDM', accessor: 'udm', render: (row) => row?.article?.udm || '-' },
    { header: 'Quantité demandée', accessor: 'quantiteALancer', render: (row) => <span className="qty-badge">{row?.quantiteALancer ?? 0}</span> },
    { header: 'Catégorie', accessor: 'categorie', render: (row) => row?.article?.categorie || '-' },
    {
      header: 'Mode d\'achat',
      accessor: 'mode',
      render: (row) => {
        let label = 'Min & Max';
        let className = 'badge-minmax';

        if (row?.mode === 'PLANIFIE') {
          label = 'Planifié';
          className = 'badge-planifie';
        } else if (row?.mode === 'SUR_DEMANDE') {
          label = 'Sur Demande';
          className = 'badge-surdemande';
        }

        return <span className={`mode-badge ${className}`}>{label}</span>;
      }
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="page-header animate-fade-in dashboard-header-row">
        <div>
          <h1>Tableau de bord PDR</h1>
          <p>Suivi des règles d’approvisionnement, des OT planifiés et des anomalies de consommation.</p>
        </div>
        <Button variant="secondary" onClick={fetchStats} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
          Actualiser
        </Button>
      </div>

      <Card className="donut-card animate-fade-in delay-2">
        <div className="donut-header-row">
          <h3><Layers size={19} /> Répartition des règles d’approvisionnement</h3>
          <div className="donut-summary-total">
            <span>Total articles</span>
            <strong>{stats.totalArticles}</strong>
          </div>
        </div>

        <div className="rule-chart" role="img" aria-label="Répartition des règles d'approvisionnement">
          {donutChart.map((segment) => (
            <div key={segment.label} className="rule-row">
              <div className="rule-row-header">
                <span className="rule-label">
                  <span className="legend-color" style={{ background: segment.color }} />
                  {segment.label}
                </span>
                <strong>{segment.value} articles ({segment.displayPercent}%)</strong>
              </div>
              <div className="rule-track">
                <div
                  className="rule-bar"
                  style={{ width: `${segment.percent}%`, background: segment.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="dashboard-content">
        <Card className="dashboard-table-card animate-fade-in delay-2">
          <h3>Liste des articles à lancer</h3>
          <Table
            columns={columnsResultats}
            data={resultats}
            loading={loading}
            emptyMessage="Aucun article à lancer pour le moment."
          />
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
