import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import api from '../services/api';
import './ConsumptionAnomalyPage.css';

const ConsumptionAnomalyPage = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysing, setAnalysing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [analysisReady, setAnalysisReady] = useState(false);

  const fetchAnomalies = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await api.get('/analyse/anomalies');
      const data = Array.isArray(response.data) ? response.data : [];
      setAnomalies(data);
    } catch (error) {
      console.error('Erreur lors du chargement des anomalies', error);
      setAnomalies([]);
      setErrorMessage(error.response?.status === 403
        ? 'Votre session a expiré. Reconnectez-vous pour consulter les anomalies.'
        : 'Impossible de charger les anomalies. Vérifiez que le backend est démarré.');
    } finally {
      setLoading(false);
    }
  };

  const checkAnalysisState = async () => {
    const response = await api.get('/analyse/etat');
    setAnalysisReady(response.data?.analyseLancee === true);
  };

  const handleExecuterAnalyse = async () => {
    setAnalysing(true);
    setErrorMessage('');
    try {
      await api.post('/analyse/executer');
      setAnalysisReady(true);
      await fetchAnomalies();
    } catch (error) {
      console.error("Erreur lors de l'exécution de l'analyse", error);
      setErrorMessage(error.response?.status === 403
        ? 'Votre session a expiré. Reconnectez-vous pour lancer l’analyse.'
        : "Impossible d'exécuter l'analyse. Vérifiez que le backend et la base de données sont démarrés.");
    } finally {
      setAnalysing(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchAnomalies(), checkAnalysisState()]).catch((error) => {
      console.error("Erreur lors de la vérification de l'analyse", error);
    });
  }, []);

  const columns = [
    {
      header: 'Code SAP',
      accessor: 'codeSAP',
      render: (row) => row?.article?.codeSAP || '-'
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row) => row?.article?.description || '-'
    },
    {
      header: 'Quantité consommée',
      accessor: 'consommationMensuelle',
      render: (row) => (
        <span className="qty-badge danger">{row?.consommationMensuelle ?? 0}</span>
      )
    },
    {
      header: 'Quantité installée',
      accessor: 'quantiteInstallee',
      render: (row) => row?.quantiteInstallee ?? 0
    }
  ];

  return (
    <div className="anomaly-page">
      <div className="page-header animate-fade-in">
        <div>
          <h1>Consommation inhabituelle</h1>
          <p>Liste des articles dont la consommation mensuelle dépasse le seuil attendu.</p>
        </div>
        <Button variant="primary" onClick={handleExecuterAnalyse} disabled={analysing}>
          <Play size={18} className={analysing ? 'spin' : ''} />
          {analysing ? "Analyse en cours..." : "Lancer l'analyse"}
        </Button>
      </div>

      {errorMessage && <div className="page-error animate-fade-in">{errorMessage}</div>}

      <Card className="anomaly-card animate-fade-in delay-1">
        <div className="anomaly-summary">
          <div>
            <span className="summary-label">Articles détectés</span>
            <strong>{anomalies.length}</strong>
          </div>
        </div>

        <Table
          columns={columns}
          data={analysisReady ? anomalies : []}
          loading={loading}
          emptyMessage={analysisReady
            ? "Aucune consommation inhabituelle détectée pour le moment."
            : "Lancez d'abord l'analyse pour afficher les anomalies."}
        />
      </Card>
    </div>
  );
};

export default ConsumptionAnomalyPage;
