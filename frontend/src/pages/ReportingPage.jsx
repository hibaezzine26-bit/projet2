import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import { Download, RefreshCw, Play, AlertTriangle, Layers, Clock, Zap, Search, CheckCircle } from 'lucide-react';
import api from '../services/api';
import './ReportingPage.css';

const ReportingPage = () => {
  const [resultats, setResultats] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysing, setAnalysing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'MIN_MAX', 'PLANIFIE', 'SUR_DEMANDE', 'ANOMALIES'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  const safeResultats = Array.isArray(resultats) ? resultats : [];
  const safeAnomalies = Array.isArray(anomalies) ? anomalies : [];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resResponse, anomResponse] = await Promise.allSettled([
        api.get('/analyse/resultats'),
        api.get('/analyse/anomalies')
      ]);

      if (resResponse.status === 'fulfilled' && Array.isArray(resResponse.value?.data)) {
        setResultats(resResponse.value.data);
      } else {
        setResultats([]);
      }

      if (anomResponse.status === 'fulfilled' && Array.isArray(anomResponse.value?.data)) {
        setAnomalies(anomResponse.value.data);
      } else {
        setAnomalies([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données", error);
      setResultats([]);
      setAnomalies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExecuterAnalyse = async () => {
    setAnalysing(true);
    setStatusMessage(null);
    try {
      const res = await api.post('/analyse/executer');
      setStatusMessage({ 
        type: 'success', 
        text: typeof res.data === 'string' ? res.data : 'Analyse du moteur de règles terminée avec succès !' 
      });
      await fetchData();
    } catch (error) {
      console.error("Erreur lors de l'exécution de l'analyse", error);
      const errMsg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : null) || "Erreur lors de l'exécution de l'analyse.";
      setStatusMessage({ type: 'error', text: errMsg });
    } finally {
      setAnalysing(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/excel/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Resultats_Approvisionnement_PDR.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erreur lors de l'export", error);
      setStatusMessage({ type: 'error', text: "Erreur lors du téléchargement du fichier Excel." });
    } finally {
      setExporting(false);
    }
  };

  // Filtrage selon l'onglet actif et le terme de recherche
  const getFilteredData = () => {
    let list = [];
    if (activeTab === 'ANOMALIES') {
      list = safeAnomalies;
    } else if (activeTab === 'MIN_MAX') {
      list = safeResultats.filter(r => r && r.mode === 'MIN_MAX');
    } else if (activeTab === 'PLANIFIE') {
      list = safeResultats.filter(r => r && r.mode === 'PLANIFIE');
    } else if (activeTab === 'SUR_DEMANDE') {
      list = safeResultats.filter(r => r && r.mode === 'SUR_DEMANDE');
    } else {
      list = safeResultats;
    }

    if (!searchTerm.trim()) return list;

    const term = searchTerm.toLowerCase();
    if (activeTab === 'ANOMALIES') {
      return list.filter(item => 
        (item.article?.codeSAP && item.article.codeSAP.toLowerCase().includes(term)) ||
        (item.article?.description && item.article.description.toLowerCase().includes(term))
      );
    }

    return list.filter(item => 
      (item.article?.codeSAP && item.article.codeSAP.toLowerCase().includes(term)) ||
      (item.article?.codeOracle && item.article.codeOracle.toLowerCase().includes(term)) ||
      (item.article?.description && item.article.description.toLowerCase().includes(term)) ||
      (item.justification && item.justification.toLowerCase().includes(term))
    );
  };

  // Statistiques KPIs
  const totalMinMax = safeResultats.filter(r => r && r.mode === 'MIN_MAX').length;
  const totalPlanifie = safeResultats.filter(r => r && r.mode === 'PLANIFIE').length;
  const totalSurDemande = safeResultats.filter(r => r && r.mode === 'SUR_DEMANDE').length;
  const totalAnomalies = safeAnomalies.length;

  const columnsResultats = [
    { header: 'Code SAP', accessor: 'codeSAP', render: (row) => <strong>{row?.article?.codeSAP || '-'}</strong> },
    { header: 'Code Oracle', accessor: 'codeOracle', render: (row) => row?.article?.codeOracle || '-' },
    { header: 'Désignation Article', accessor: 'description', render: (row) => row?.article?.description || '-' },
    { 
      header: 'Mode / Règle', 
      accessor: 'mode', 
      render: (row) => {
        let badgeClass = 'badge-minmax';
        let label = 'Min & Max';
        if (row?.mode === 'PLANIFIE') { badgeClass = 'badge-planifie'; label = 'Planifié'; }
        if (row?.mode === 'SUR_DEMANDE') { badgeClass = 'badge-surdemande'; label = 'Sur Demande'; }
        return <span className={`mode-badge ${badgeClass}`}>{label}</span>;
      }
    },
    { 
      header: 'Priorité', 
      accessor: 'priorite', 
      render: (row) => <span className="prio-tag">P{row?.priorite || 1}</span> 
    },
    { 
      header: 'Qté à Lancer', 
      accessor: 'quantiteALancer', 
      render: (row) => <span className="qty-badge">{row?.quantiteALancer ?? 0}</span> 
    },
    { 
      header: 'Seuil Min / Max', 
      accessor: 'seuils',
      render: (row) => row?.article?.seuilMin != null ? `${row.article.seuilMin} / ${row.article.seuilMax}` : '-' 
    },
    { header: 'Justification', accessor: 'justification', render: (row) => row?.justification || '-' },
    { header: 'Date Analyse', accessor: 'dateAnalyse', render: (row) => row?.dateAnalyse ? new Date(row.dateAnalyse).toLocaleDateString() : '-' }
  ];

  const columnsAnomalies = [
    { header: 'Code SAP', accessor: 'codeSAP', render: (row) => <strong>{row?.article?.codeSAP || '-'}</strong> },
    { header: 'Désignation Article', accessor: 'description', render: (row) => row?.article?.description || '-' },
    { header: 'Qté Installée', accessor: 'quantiteInstallee', render: (row) => <strong>{row?.quantiteInstallee ?? 0}</strong> },
    { header: 'Conso Mensuelle', accessor: 'consommationMensuelle', render: (row) => <span className="qty-badge danger">{row?.consommationMensuelle ?? 0}</span> },
    { 
      header: 'Taux Conso', 
      accessor: 'tauxConsommation', 
      render: (row) => (
        <span className="anomaly-ratio">
          {row?.tauxConsommation != null ? `${(row.tauxConsommation * 100).toFixed(0)}%` : '0%'}
        </span>
      )
    },
    { 
      header: 'Condition Règle', 
      accessor: 'condition',
      render: () => <span className="rule-cond">&gt; 200% Qté installée</span> 
    },
    { 
      header: 'Statut', 
      accessor: 'statut', 
      render: (row) => <span className="mode-badge badge-anomaly">{row?.statut || 'DETECTEE'}</span> 
    },
    { header: 'Date Détection', accessor: 'dateDetection', render: (row) => row?.dateDetection ? new Date(row.dateDetection).toLocaleDateString() : '-' }
  ];

  const filteredData = getFilteredData();

  return (
    <div className="reporting-container">
      <div className="page-header animate-fade-in flex-between">
        <div>
          <h1>Résultats & Optimisation des Approvisionnements</h1>
          <p>Restitution des 4 états de décision selon le Cahier des Charges PDR</p>
        </div>
        <div className="header-actions">
          <Button variant="primary" onClick={handleExecuterAnalyse} disabled={analysing}>
            <Play size={18} className={analysing ? 'spin' : ''} />
            {analysing ? "Calcul en cours..." : "Lancer l'analyse des règles"}
          </Button>
          <Button variant="secondary" onClick={fetchData} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
            Actualiser
          </Button>
          <Button onClick={handleExport} disabled={exporting || (safeResultats.length === 0 && safeAnomalies.length === 0)}>
            <Download size={18} />
            {exporting ? 'Exportation...' : 'Exporter Excel complet'}
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div className={`status-alert ${statusMessage.type} animate-fade-in`}>
          {statusMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="reporting-kpi-grid">
        <div className={`kpi-box ${activeTab === 'ALL' ? 'active' : ''}`} onClick={() => setActiveTab('ALL')}>
          <div className="kpi-icon total"><Layers size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-title">Total à Lancer</span>
            <span className="kpi-value">{safeResultats.length}</span>
          </div>
        </div>

        <div className={`kpi-box ${activeTab === 'MIN_MAX' ? 'active' : ''}`} onClick={() => setActiveTab('MIN_MAX')}>
          <div className="kpi-icon minmax"><Zap size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-title">1. Règle Min & Max</span>
            <span className="kpi-value">{totalMinMax}</span>
          </div>
        </div>

        <div className={`kpi-box ${activeTab === 'PLANIFIE' ? 'active' : ''}`} onClick={() => setActiveTab('PLANIFIE')}>
          <div className="kpi-icon planifie"><Clock size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-title">2. Mode Planifié (OT)</span>
            <span className="kpi-value">{totalPlanifie}</span>
          </div>
        </div>

        <div className={`kpi-box ${activeTab === 'SUR_DEMANDE' ? 'active' : ''}`} onClick={() => setActiveTab('SUR_DEMANDE')}>
          <div className="kpi-icon surdemande"><Layers size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-title">3. Sur Demande</span>
            <span className="kpi-value">{totalSurDemande}</span>
          </div>
        </div>

        <div className={`kpi-box ${activeTab === 'ANOMALIES' ? 'active' : ''}`} onClick={() => setActiveTab('ANOMALIES')}>
          <div className="kpi-icon anomaly"><AlertTriangle size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-title">4. Conso Inhabituelle</span>
            <span className="kpi-value">{totalAnomalies}</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="reporting-controls">
        <div className="reporting-tabs">
          <button className={`tab-btn ${activeTab === 'ALL' ? 'active' : ''}`} onClick={() => setActiveTab('ALL')}>
            Consolidé ({safeResultats.length})
          </button>
          <button className={`tab-btn ${activeTab === 'MIN_MAX' ? 'active' : ''}`} onClick={() => setActiveTab('MIN_MAX')}>
            • Min & Max ({totalMinMax})
          </button>
          <button className={`tab-btn ${activeTab === 'PLANIFIE' ? 'active' : ''}`} onClick={() => setActiveTab('PLANIFIE')}>
            • Mode Planifié ({totalPlanifie})
          </button>
          <button className={`tab-btn ${activeTab === 'SUR_DEMANDE' ? 'active' : ''}`} onClick={() => setActiveTab('SUR_DEMANDE')}>
            • Sur Demande ({totalSurDemande})
          </button>
          <button className={`tab-btn ${activeTab === 'ANOMALIES' ? 'active' : ''}`} onClick={() => setActiveTab('ANOMALIES')}>
            ⚠️ Consommations Inhabituelles ({totalAnomalies})
          </button>
        </div>

        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text"
            placeholder="Rechercher par code SAP, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Resultats */}
      <Card className="animate-fade-in delay-1">
        <Table 
          columns={activeTab === 'ANOMALIES' ? columnsAnomalies : columnsResultats} 
          data={filteredData} 
          loading={loading || analysing} 
          emptyMessage={
            safeResultats.length === 0 && safeAnomalies.length === 0
              ? "Aucun résultat pour le moment. Cliquez sur 'Lancer l'analyse des règles' pour exécuter le calcul sur les données importées."
              : "Aucun élément ne correspond au filtre ou à la recherche."
          }
        />
      </Card>
    </div>
  );
};

export default ReportingPage;


