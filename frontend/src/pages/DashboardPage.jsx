import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import {
  Layers,
  RefreshCw,
  Package,
  CheckCircle2,
  CalendarClock,
  HelpCircle,
  AlertOctagon,
  Search,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import analyseService from '../services/analyseService';
import './DashboardPage.css';

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
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [summaryData, resultatsData] = await Promise.all([
        analyseService.getSummary(),
        analyseService.getResultats()
      ]);

      const summary = summaryData || {};
      const resultatsList = Array.isArray(resultatsData) ? resultatsData : [];

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
        totalToLaunch: resultatsList.length
      });
      setResultats(resultatsList);
    } catch {
      // Handled gracefully with fallback empty states
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalCalculated =
    (stats.minMaxCount || 0) +
    (stats.planifieCount || 0) +
    (stats.surDemandeCount || 0) || 1;

  const ruleSegments = [
    {
      label: 'Règle Min & Max (Stock Sécurité)',
      count: stats.minMaxCount || 0,
      percent: Math.round(((stats.minMaxCount || 0) / totalCalculated) * 100),
      color: '#00a651',
      badgeVariant: 'minmax'
    },
    {
      label: 'Règle Mode Planifié (BOM & OT)',
      count: stats.planifieCount || 0,
      percent: Math.round(((stats.planifieCount || 0) / totalCalculated) * 100),
      color: '#f59e0b',
      badgeVariant: 'planifie'
    },
    {
      label: 'Règle Sur Demande (Non Critique)',
      count: stats.surDemandeCount || 0,
      percent: Math.round(((stats.surDemandeCount || 0) / totalCalculated) * 100),
      color: '#8b5cf6',
      badgeVariant: 'surdemande'
    }
  ];

  const filteredResultats = resultats.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const codeSAP = (item?.article?.codeSAP || '').toLowerCase();
    const desc = (item?.article?.description || '').toLowerCase();
    return codeSAP.includes(term) || desc.includes(term);
  });

  const columnsResultats = [
    {
      header: 'Code SAP',
      accessor: 'codeSAP',
      render: (row) => <strong className="sap-code-cell">{row?.article?.codeSAP || '-'}</strong>
    },
    {
      header: 'Désignation Article',
      accessor: 'description',
      render: (row) => (
        <span className="desc-cell" title={row?.article?.description}>
          {row?.article?.description || '-'}
        </span>
      )
    },
    {
      header: 'UDM',
      accessor: 'udm',
      align: 'center',
      render: (row) => <span className="udm-tag">{row?.article?.udm || 'ST'}</span>
    },
    {
      header: 'Qté à Lancer',
      accessor: 'quantiteALancer',
      align: 'right',
      render: (row) => (
        <Badge variant="info" size="md" className="qty-badge-cell">
          {row?.quantiteALancer ?? 0}
        </Badge>
      )
    },
    {
      header: 'Règle Appliquée',
      accessor: 'mode',
      align: 'center',
      render: (row) => {
        if (row?.mode === 'PLANIFIE') {
          return <Badge variant="planifie">Planifié</Badge>;
        }
        if (row?.mode === 'SUR_DEMANDE') {
          return <Badge variant="surdemande">Sur Demande</Badge>;
        }
        return <Badge variant="minmax">Min & Max</Badge>;
      }
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Top Header Row */}
      <div className="page-header animate-fade-in">
        <div>
          <h1>Tableau de bord Décisionnel</h1>
          <p>Supervision en temps réel des règles PDR, calculs de réapprovisionnement et stocks OCP.</p>
        </div>
        <div className="header-actions">
          <Button
            variant="secondary"
            onClick={fetchStats}
            disabled={loading}
            icon={RefreshCw}
            className={loading ? 'btn-refreshing' : ''}
          >
            Actualiser
          </Button>
          <Link to="/app/reporting" style={{ textDecoration: 'none' }}>
            <Button variant="primary" icon={ArrowUpRight}>
              Voir le Reporting
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid animate-fade-in delay-1">
        <Card className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Articles</span>
            <div className="kpi-icon-wrap total">
              <Package size={20} />
            </div>
          </div>
          <div className="kpi-value">{stats.totalArticles.toLocaleString()}</div>
          <div className="kpi-subtext">Base référentielle PDR</div>
        </Card>

        <Card className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Min & Max</span>
            <div className="kpi-icon-wrap minmax">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="kpi-value">{stats.minMaxCount.toLocaleString()}</div>
          <div className="kpi-subtext">Stock de sécurité actif</div>
        </Card>

        <Card className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Mode Planifié</span>
            <div className="kpi-icon-wrap planifie">
              <CalendarClock size={20} />
            </div>
          </div>
          <div className="kpi-value">{stats.planifieCount.toLocaleString()}</div>
          <div className="kpi-subtext">Basé sur BOM & OT</div>
        </Card>

        <Card className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Sur Demande</span>
            <div className="kpi-icon-wrap surdemande">
              <HelpCircle size={20} />
            </div>
          </div>
          <div className="kpi-value">{stats.surDemandeCount.toLocaleString()}</div>
          <div className="kpi-subtext">Approvisionnement ponctuel</div>
        </Card>

        <Card className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Anomalies</span>
            <div className="kpi-icon-wrap anomalies">
              <AlertOctagon size={20} />
            </div>
          </div>
          <div className="kpi-value value-danger">{stats.anomaliesCount.toLocaleString()}</div>
          <div className="kpi-subtext">Consommation inhabituelle</div>
        </Card>
      </div>

      {/* Breakdown Card */}
      <Card
        title="Répartition Analytique des Modes d'Approvisionnement"
        subtitle="Distribution des règles industrielles appliquées sur le parc de pièces de rechange"
        icon={Layers}
        className="breakdown-card animate-fade-in delay-2"
      >
        <div className="rules-breakdown-list">
          {ruleSegments.map((seg) => (
            <div key={seg.label} className="rule-bar-row">
              <div className="rule-bar-header">
                <div className="rule-name-wrap">
                  <span className="rule-color-dot" style={{ backgroundColor: seg.color }} />
                  <span className="rule-name">{seg.label}</span>
                </div>
                <div className="rule-stats-wrap">
                  <strong>{seg.count.toLocaleString()} articles</strong>
                  <span className="rule-pct">({seg.percent}%)</span>
                </div>
              </div>
              <div className="rule-progress-track">
                <div
                  className="rule-progress-fill"
                  style={{ width: `${seg.percent}%`, backgroundColor: seg.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Decision Results Table */}
      <Card
        title="Articles Prioritaires à Approvisionner"
        subtitle={`Total : ${filteredResultats.length} articles identifiés avec un besoin de commande`}
        icon={TrendingUp}
        action={
          <div className="table-search-box">
            <Input
              icon={Search}
              placeholder="Rechercher code SAP ou désignation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dashboard-search-input"
            />
          </div>
        }
        className="dashboard-table-card animate-fade-in delay-3"
      >
        <Table
          columns={columnsResultats}
          data={filteredResultats}
          loading={loading}
          emptyMessage="Aucun article à lancer trouvé pour les critères actuels."
        />
      </Card>
    </div>
  );
};

export default DashboardPage;
