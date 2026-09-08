import React, { useEffect, useState } from 'react';
import { Play, AlertTriangle, Search, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import analyseService from '../services/analyseService';
import './ConsumptionAnomalyPage.css';

const ConsumptionAnomalyPage = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysing, setAnalysing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [analysisReady, setAnalysisReady] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAnomalies = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await analyseService.getAnomalies();
      setAnomalies(Array.isArray(data) ? data : []);
    } catch (error) {
      setAnomalies([]);
      setErrorMessage(
        error.response?.status === 403
          ? 'Votre session a expiré. Reconnectez-vous pour consulter les anomalies.'
          : 'Impossible de charger les anomalies. Vérifiez que le serveur backend est actif.'
      );
    } finally {
      setLoading(false);
    }
  };

  const checkAnalysisState = async () => {
    try {
      const data = await analyseService.getEtat();
      setAnalysisReady(data?.analyseLancee === true);
    } catch {
      setAnalysisReady(false);
    }
  };

  const handleExecuterAnalyse = async () => {
    setAnalysing(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await analyseService.executerAnalyse();
      setAnalysisReady(true);
      setSuccessMessage(
        typeof res === 'string' ? res : res?.message || 'Analyse des anomalies de consommation exécutée avec succès.'
      );
      await fetchAnomalies();
    } catch (error) {
      setErrorMessage(
        error.response?.status === 403
          ? 'Votre session a expiré. Reconnectez-vous pour lancer l’analyse.'
          : "Impossible d'exécuter l'analyse. Vérifiez l'état du backend."
      );
    } finally {
      setAnalysing(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchAnomalies(), checkAnalysisState()]);
  }, []);

  const filteredAnomalies = anomalies.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const codeSAP = (item?.article?.codeSAP || '').toLowerCase();
    const desc = (item?.article?.description || '').toLowerCase();
    return codeSAP.includes(term) || desc.includes(term);
  });

  const columns = [
    {
      header: 'Code SAP',
      accessor: 'codeSAP',
      render: (row) => <strong className="sap-code-cell">{row?.article?.codeSAP || '-'}</strong>
    },
    {
      header: 'Désignation Article',
      accessor: 'description',
      render: (row) => <span className="desc-cell" title={row?.article?.description}>{row?.article?.description || '-'}</span>
    },
    {
      header: 'Consommation Mensuelle',
      accessor: 'consommationMensuelle',
      align: 'right',
      render: (row) => (
        <Badge variant="danger" size="md">
          {row?.consommationMensuelle ?? 0}
        </Badge>
      )
    },
    {
      header: 'Qté Installée / Parc',
      accessor: 'quantiteInstallee',
      align: 'right',
      render: (row) => (
        <span className="qty-installed">{row?.quantiteInstallee ?? 0}</span>
      )
    },
    {
      header: 'Statut Détection',
      accessor: 'statut',
      align: 'center',
      render: () => (
        <Badge variant="anomaly">
          <AlertTriangle size={13} />
          Surconsommation
        </Badge>
      )
    }
  ];

  return (
    <div className="anomaly-page-container">
      {/* Page Header */}
      <div className="page-header animate-fade-in">
        <div>
          <h1>Consommation Inhabituelle des PDR</h1>
          <p>Identification automatique des pièces présentant un écart de consommation anormal par rapport au parc installé.</p>
        </div>
        <div className="header-actions">
          <Button
            variant="primary"
            icon={Play}
            onClick={handleExecuterAnalyse}
            loading={analysing}
            disabled={analysing}
          >
            {analysing ? "Calcul de l'analyse en cours..." : "Lancer l'analyse"}
          </Button>
        </div>
      </div>

      {/* Status Alerts */}
      {errorMessage && (
        <div className="alert-box error animate-fade-in">
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert-box success animate-fade-in">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Summary Anomaly Card */}
      <div className="anomaly-summary-grid animate-fade-in delay-1">
        <Card className="anomaly-kpi-card">
          <div className="anomaly-kpi-left">
            <div className="anomaly-icon-shield">
              <ShieldAlert size={28} />
            </div>
            <div>
              <h3>Anomalies Identifiées</h3>
              <p>Pièces de rechange nécessitant un audit technique de maintenance</p>
            </div>
          </div>
          <div className="anomaly-count-badge">
            <strong>{anomalies.length}</strong>
            <span>articles</span>
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card
        title="Liste Détaillée des Écarts de Consommation"
        subtitle={`${filteredAnomalies.length} anomalie(s) affichée(s)`}
        icon={AlertTriangle}
        action={
          <div className="table-search-box">
            <Input
              icon={Search}
              placeholder="Rechercher code SAP ou nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        }
        className="anomaly-table-card animate-fade-in delay-2"
      >
        <Table
          columns={columns}
          data={analysisReady ? filteredAnomalies : []}
          loading={loading}
          emptyIcon={AlertTriangle}
          emptyMessage={
            analysisReady
              ? "Aucune anomalie de consommation inhabituelle détectée pour le moment."
              : "Veuillez lancer l'analyse pour charger les anomalies détectées."
          }
        />
      </Card>
    </div>
  );
};

export default ConsumptionAnomalyPage;
