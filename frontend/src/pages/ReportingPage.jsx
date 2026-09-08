import React, { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import {
  Download,
  Play,
  AlertTriangle,
  CheckCircle2,
  Search,
  Layers,
  FileSpreadsheet,
  Package,
  CalendarClock,
  HelpCircle,
  AlertOctagon,
  FileDown
} from 'lucide-react';
import analyseService from '../services/analyseService';
import importExportService from '../services/importExportService';
import './ReportingPage.css';

const ReportingPage = () => {
  const [resultats, setResultats] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysing, setAnalysing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'MIN_MAX' | 'PLANIFIE' | 'SUR_DEMANDE' | 'ANOMALIES'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  const safeResultats = Array.isArray(resultats) ? resultats : [];
  const safeAnomalies = Array.isArray(anomalies) ? anomalies : [];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resResult, anomResult] = await Promise.allSettled([
        analyseService.getResultats(),
        analyseService.getAnomalies()
      ]);

      if (resResult.status === 'fulfilled' && Array.isArray(resResult.value)) {
        setResultats(resResult.value);
      } else {
        setResultats([]);
      }

      if (anomResult.status === 'fulfilled' && Array.isArray(anomResult.value)) {
        setAnomalies(anomResult.value);
      } else {
        setAnomalies([]);
      }
    } catch {
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
      const res = await analyseService.executerAnalyse();
      setStatusMessage({
        type: 'success',
        text: typeof res === 'string' ? res : res?.message || 'Calcul des 4 règles d’approvisionnement exécuté avec succès.'
      });
      await fetchData();
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        "Erreur lors de l'exécution de l'analyse.";
      setStatusMessage({ type: 'error', text: errMsg });
    } finally {
      setAnalysing(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blobData = await importExportService.exportExcel();
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Resultats_Approvisionnement_PDR.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setStatusMessage({
        type: 'success',
        text: 'Export Excel global généré et téléchargé avec succès.'
      });
    } catch {
      setStatusMessage({ type: 'error', text: 'Erreur lors du téléchargement du fichier Excel global.' });
    } finally {
      setExporting(false);
    }
  };

  const handleExportRule = async (mode, fileName) => {
    setExporting(true);
    try {
      const blobData = await importExportService.exportRegle(mode);
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setStatusMessage({
        type: 'success',
        text: `${fileName} exporté avec succès.`
      });
    } catch {
      setStatusMessage({ type: 'error', text: `Erreur lors de l'export de la règle ${fileName}.` });
    } finally {
      setExporting(false);
    }
  };

  const totalMinMax = safeResultats.filter((r) => r?.mode === 'MIN_MAX').length;
  const totalPlanifie = safeResultats.filter((r) => r?.mode === 'PLANIFIE').length;
  const totalSurDemande = safeResultats.filter((r) => r?.mode === 'SUR_DEMANDE').length;
  const totalAnomalies = safeAnomalies.length;
  const totalDecisions = safeResultats.length;

  // Filter list by active tab and search term
  const getDisplayedData = () => {
    if (activeTab === 'ANOMALIES') {
      return safeAnomalies.filter((item) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const codeSAP = (item?.article?.codeSAP || '').toLowerCase();
        const desc = (item?.article?.description || '').toLowerCase();
        return codeSAP.includes(term) || desc.includes(term);
      });
    }

    let list = safeResultats;
    if (activeTab === 'MIN_MAX') {
      list = list.filter((r) => r?.mode === 'MIN_MAX');
    } else if (activeTab === 'PLANIFIE') {
      list = list.filter((r) => r?.mode === 'PLANIFIE');
    } else if (activeTab === 'SUR_DEMANDE') {
      list = list.filter((r) => r?.mode === 'SUR_DEMANDE');
    }

    return list.filter((item) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const codeSAP = (item?.article?.codeSAP || '').toLowerCase();
      const desc = (item?.article?.description || '').toLowerCase();
      return codeSAP.includes(term) || desc.includes(term);
    });
  };

  const displayedData = getDisplayedData();

  const columnsDecisions = [
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
      header: 'UDM',
      accessor: 'udm',
      align: 'center',
      render: (row) => <span className="udm-tag">{row?.article?.udm || 'ST'}</span>
    },
    {
      header: 'Qté à Commander',
      accessor: 'quantiteALancer',
      align: 'right',
      render: (row) => (
        <Badge variant="info" size="md">
          {row?.quantiteALancer ?? 0}
        </Badge>
      )
    },
    {
      header: 'Règle Retenue',
      accessor: 'mode',
      align: 'center',
      render: (row) => {
        if (row?.mode === 'PLANIFIE') return <Badge variant="planifie">Planifié</Badge>;
        if (row?.mode === 'SUR_DEMANDE') return <Badge variant="surdemande">Sur Demande</Badge>;
        return <Badge variant="minmax">Min & Max</Badge>;
      }
    }
  ];

  const columnsAnomalies = [
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
      render: (row) => <Badge variant="danger">{row?.consommationMensuelle ?? 0}</Badge>
    },
    {
      header: 'Quantité Installée',
      accessor: 'quantiteInstallee',
      align: 'right',
      render: (row) => row?.quantiteInstallee ?? 0
    },
    {
      header: 'Diagnostic',
      accessor: 'diagnostic',
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
    <div className="reporting-container">
      {/* Page Header */}
      <div className="page-header animate-fade-in">
        <div>
          <h1>Résultats & Optimisation des Approvisionnements</h1>
          <p>Restitution multicritère des 4 états de décision selon le Cahier des Charges PDR OCP.</p>
        </div>
        <div className="header-actions">
          <Button
            variant="primary"
            icon={Play}
            onClick={handleExecuterAnalyse}
            loading={analysing}
            disabled={analysing}
          >
            {analysing ? "Calcul en cours..." : "Lancer l'analyse des règles"}
          </Button>
          <Button
            variant="secondary"
            icon={Download}
            onClick={handleExport}
            loading={exporting}
            disabled={exporting || (totalDecisions === 0 && totalAnomalies === 0)}
          >
            Exporter Excel Global
          </Button>
        </div>
      </div>

      {/* Export By Rule Action Row */}
      <div className="export-rules-row animate-fade-in delay-1">
        <span className="export-rules-label">
          <FileDown size={16} />
          Exports Spécifiques par Règle :
        </span>
        <div className="export-rules-buttons">
          <Button
            variant="outline"
            size="sm"
            icon={FileSpreadsheet}
            onClick={() => handleExportRule('min-max', 'regle_min_max.xlsx')}
            disabled={exporting || totalMinMax === 0}
          >
            Min & Max ({totalMinMax})
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={FileSpreadsheet}
            onClick={() => handleExportRule('planifie', 'regle_mode_planifie.xlsx')}
            disabled={exporting || totalPlanifie === 0}
          >
            Mode Planifié ({totalPlanifie})
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={FileSpreadsheet}
            onClick={() => handleExportRule('sur-demande', 'regle_sur_demande.xlsx')}
            disabled={exporting || totalSurDemande === 0}
          >
            Sur Demande ({totalSurDemande})
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={FileSpreadsheet}
            onClick={() => handleExportRule('anomalies', 'anomalies_consommation.xlsx')}
            disabled={exporting || totalAnomalies === 0}
          >
            Anomalies ({totalAnomalies})
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {statusMessage && (
        <div className={`reporting-alert ${statusMessage.type} animate-fade-in`}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Interactive Filter KPI Cards */}
      <div className="reporting-kpis-grid animate-fade-in delay-2">
        <div
          className={`reporting-kpi-card ${activeTab === 'ALL' ? 'kpi-active' : ''}`}
          onClick={() => setActiveTab('ALL')}
        >
          <div className="kpi-card-header">
            <span className="kpi-card-title">Toutes Décisions</span>
            <div className="kpi-icon-mini total">
              <Package size={16} />
            </div>
          </div>
          <div className="kpi-card-val">{totalDecisions}</div>
          <span className="kpi-card-hint">Articles à commander</span>
        </div>

        <div
          className={`reporting-kpi-card ${activeTab === 'MIN_MAX' ? 'kpi-active' : ''}`}
          onClick={() => setActiveTab('MIN_MAX')}
        >
          <div className="kpi-card-header">
            <span className="kpi-card-title">Règle Min & Max</span>
            <div className="kpi-icon-mini minmax">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="kpi-card-val">{totalMinMax}</div>
          <span className="kpi-card-hint">Stock critique & sécurité</span>
        </div>

        <div
          className={`reporting-kpi-card ${activeTab === 'PLANIFIE' ? 'kpi-active' : ''}`}
          onClick={() => setActiveTab('PLANIFIE')}
        >
          <div className="kpi-card-header">
            <span className="kpi-card-title">Mode Planifié</span>
            <div className="kpi-icon-mini planifie">
              <CalendarClock size={16} />
            </div>
          </div>
          <div className="kpi-card-val">{totalPlanifie}</div>
          <span className="kpi-card-hint">Besoins OT et BOM</span>
        </div>

        <div
          className={`reporting-kpi-card ${activeTab === 'SUR_DEMANDE' ? 'kpi-active' : ''}`}
          onClick={() => setActiveTab('SUR_DEMANDE')}
        >
          <div className="kpi-card-header">
            <span className="kpi-card-title">Sur Demande</span>
            <div className="kpi-icon-mini surdemande">
              <HelpCircle size={16} />
            </div>
          </div>
          <div className="kpi-card-val">{totalSurDemande}</div>
          <span className="kpi-card-hint">Achats occasionnels</span>
        </div>

        <div
          className={`reporting-kpi-card ${activeTab === 'ANOMALIES' ? 'kpi-active' : ''}`}
          onClick={() => setActiveTab('ANOMALIES')}
        >
          <div className="kpi-card-header">
            <span className="kpi-card-title">Anomalies</span>
            <div className="kpi-icon-mini anomalies">
              <AlertOctagon size={16} />
            </div>
          </div>
          <div className="kpi-card-val value-danger">{totalAnomalies}</div>
          <span className="kpi-card-hint">Surconsommations</span>
        </div>
      </div>

      {/* Main Results Table Card */}
      <Card
        title={
          activeTab === 'ANOMALIES'
            ? 'Résultats : Anomalies de Consommation'
            : `Résultats : Décisions d'Approvisionnement (${activeTab})`
        }
        subtitle={`${displayedData.length} élément(s) correspondant aux critères`}
        icon={Layers}
        action={
          <div className="table-search-box">
            <Input
              icon={Search}
              placeholder="Filtrer code SAP ou désignation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        }
        className="reporting-table-card animate-fade-in delay-3"
      >
        <Table
          columns={activeTab === 'ANOMALIES' ? columnsAnomalies : columnsDecisions}
          data={displayedData}
          loading={loading}
          emptyMessage="Aucun résultat pour cette sélection."
        />
      </Card>
    </div>
  );
};

export default ReportingPage;
