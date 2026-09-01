import React, { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import api from '../services/api';
import './ConsumptionAnomalyPage.css';

const ConsumptionAnomalyPage = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const response = await api.get('/analyse/anomalies');
      const data = Array.isArray(response.data) ? response.data : [];
      setAnomalies(data);
    } catch (error) {
      console.error('Erreur lors du chargement des anomalies', error);
      setAnomalies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
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
      </div>

      <Card className="anomaly-card animate-fade-in delay-1">
        <div className="anomaly-summary">
          <div>
            <span className="summary-label">Articles détectés</span>
            <strong>{anomalies.length}</strong>
          </div>
        </div>

        <Table
          columns={columns}
          data={anomalies}
          loading={loading}
          emptyMessage="Aucune consommation inhabituelle détectée pour le moment."
        />
      </Card>
    </div>
  );
};

export default ConsumptionAnomalyPage;
