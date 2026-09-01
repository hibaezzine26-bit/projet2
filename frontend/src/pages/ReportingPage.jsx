import React, { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import { Download, Play, AlertTriangle, CheckCircle } from 'lucide-react';
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

  const handleExportRule = async (endpoint, fileName) => {
    setExporting(true);
    try {
      const response = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setStatusMessage({
        type: 'success',
        text: `${fileName} téléchargé avec succès.`
      });
    } catch (error) {
      console.error("Erreur lors de l'export de la règle", error);
      setStatusMessage({ type: 'error', text: "Erreur lors du téléchargement du fichier Excel de la règle." });
    } finally {
      setExporting(false);
    }
  };

  const totalMinMax = safeResultats.filter(r => r && r.mode === 'MIN_MAX').length;
  const totalPlanifie = safeResultats.filter(r => r && r.mode === 'PLANIFIE').length;
  const totalSurDemande = safeResultats.filter(r => r && r.mode === 'SUR_DEMANDE').length;
  const totalAnomalies = safeAnomalies.length;

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
          <Button onClick={handleExport} disabled={exporting || (safeResultats.length === 0 && safeAnomalies.length === 0)}>
            <Download size={18} />
            {exporting ? 'Exportation...' : 'Exporter Excel complet'}
          </Button>
        </div>
      </div>

      <div className="export-rules-grid">
        <Button variant="secondary" onClick={() => handleExportRule('/excel/export/min-max', 'regle_min_max.xlsx')} disabled={exporting || totalMinMax === 0}>
          <Download size={18} />
          Exporter Min & Max
        </Button>
        <Button variant="secondary" onClick={() => handleExportRule('/excel/export/planifie', 'regle_mode_planifie.xlsx')} disabled={exporting || totalPlanifie === 0}>
          <Download size={18} />
          Exporter Mode Planifié
        </Button>
        <Button variant="secondary" onClick={() => handleExportRule('/excel/export/sur-demande', 'regle_sur_demande.xlsx')} disabled={exporting || totalSurDemande === 0}>
          <Download size={18} />
          Exporter Sur Demande
        </Button>
        <Button variant="secondary" onClick={() => handleExportRule('/excel/export/anomalies', 'anomalies_consommation.xlsx')} disabled={exporting || totalAnomalies === 0}>
          <Download size={18} />
          Exporter Anomalies
        </Button>
      </div>

      {statusMessage && (
        <div className={`status-alert ${statusMessage.type} animate-fade-in`}>
          {statusMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

    </div>
  );
};

export default ReportingPage;


