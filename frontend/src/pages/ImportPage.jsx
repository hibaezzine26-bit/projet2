import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  FileCheck,
  Layers,
  Database,
  Info
} from 'lucide-react';
import importExportService from '../services/importExportService';
import './ImportPage.css';

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Ko';
  const units = ['o', 'Ko', 'Mo', 'Go'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const ImportPage = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length) {
      setFiles(selectedFiles);
      setResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files || []).filter(
      (f) => f.name.endsWith('.xlsx') || f.name.endsWith('.xls')
    );
    if (droppedFiles.length) {
      setFiles(droppedFiles);
      setResult(null);
    }
  };

  const removeFile = (fileName) => {
    setFiles((currentFiles) => currentFiles.filter((file) => file.name !== fileName));
  };

  const handleUpload = async () => {
    if (!files.length) return;

    setUploading(true);
    setResult(null);

    const importMessages = [];

    try {
      for (const file of files) {
        const importResult = await importExportService.importExcel(file);
        if (importResult?.success === false) {
          const details = Array.isArray(importResult.detailsErreurs)
            ? ` ${importResult.detailsErreurs.join(' | ')}`
            : '';
          throw new Error(`${importResult.message || 'Importation échouée.'}${details}`);
        }
        importMessages.push(
          `${file.name}: ${typeof importResult === 'string' ? importResult : importResult?.message || 'Fichier importé et traité avec succès.'}`
        );
      }

      setResult({
        type: 'success',
        message: importMessages.join(' • ')
      });
      setFiles([]);
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        error.message ||
        "Erreur lors de l'intégration du fichier Excel dans le référentiel.";

      setResult({
        type: 'error',
        message: serverMessage
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="import-container">
      {/* Page Header */}
      <div className="page-header animate-fade-in">
        <div>
          <h1>Importation des Données SAP & Excel</h1>
          <p>Chargement des fichiers sources pour alimenter le moteur de règles PDR et actualiser les stocks.</p>
        </div>
      </div>

      <div className="import-grid">
        {/* Main Upload Card */}
        <Card
          title="Zone de Téléversement"
          subtitle="Sélectionnez ou glissez vos classeurs Excel (.xlsx, .xls)"
          icon={UploadCloud}
          className="upload-main-card animate-fade-in delay-1"
        >
          <div
            className={`dropzone ${isDragOver ? 'dropzone-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="dropzone-icon-wrap">
              <UploadCloud size={44} />
            </div>
            <h3>Glissez vos classeurs Excel ici</h3>
            <p>ou cliquez pour parcourir les fichiers de votre poste de travail</p>

            <input
              type="file"
              id="file-upload"
              className="file-input-hidden"
              accept=".xlsx, .xls"
              multiple
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" className="btn btn-primary dropzone-browse-btn">
              Parcourir les fichiers
            </label>
            <span className="dropzone-hint">Formats acceptés : Microsoft Excel (.xlsx, .xls)</span>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="selected-files-list animate-fade-in">
              <div className="files-list-header">
                <h4>Fichiers en attente de traitement</h4>
                <Badge variant="info">{files.length} fichier{files.length > 1 ? 's' : ''}</Badge>
              </div>

              <div className="file-items-wrap">
                {files.map((file) => (
                  <div key={`${file.name}-${file.size}`} className="file-item-row">
                    <div className="file-item-left">
                      <div className="file-icon-badge">
                        <FileSpreadsheet size={20} />
                      </div>
                      <div className="file-meta">
                        <span className="file-title">{file.name}</span>
                        <span className="file-size">{formatFileSize(file.size)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="file-remove-btn"
                      onClick={() => removeFile(file.name)}
                      aria-label={`Supprimer ${file.name}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="files-list-footer">
                <Button
                  variant="primary"
                  size="lg"
                  icon={FileCheck}
                  onClick={handleUpload}
                  loading={uploading}
                  disabled={uploading}
                  className="upload-action-btn"
                >
                  {uploading ? 'Traitement et intégration en cours...' : `Lancer l'importation (${files.length})`}
                </Button>
              </div>
            </div>
          )}

          {/* Feedback Result Banner */}
          {result && (
            <div className={`import-feedback-banner ${result.type} animate-fade-in`}>
              {result.type === 'success' ? (
                <CheckCircle2 size={24} className="feedback-icon" />
              ) : (
                <AlertTriangle size={24} className="feedback-icon" />
              )}
              <div className="feedback-text-wrap">
                <strong>{result.type === 'success' ? 'Importation terminée' : 'Avertissement'}</strong>
                <p>{result.message}</p>
              </div>
            </div>
          )}
        </Card>

        {/* Informative Side Card */}
        <div className="import-side-info animate-fade-in delay-2">
          <Card
            title="Spécifications des Données"
            subtitle="Structure attendue par le moteur de règles PDR"
            icon={Info}
            className="info-spec-card"
          >
            <div className="spec-items-list">
              <div className="spec-item">
                <div className="spec-item-icon">
                  <Database size={16} />
                </div>
                <div>
                  <strong>État des Stocks</strong>
                  <p>Codes SAP, stock physique, stock réservé, unité de mesure (UDM).</p>
                </div>
              </div>

              <div className="spec-item">
                <div className="spec-item-icon">
                  <Layers size={16} />
                </div>
                <div>
                  <strong>Backlog & Ordres de Travail (OT)</strong>
                  <p>Besoins futurs planifiés pour le mode d'achat Planifié.</p>
                </div>
              </div>

              <div className="spec-item">
                <div className="spec-item-icon">
                  <FileSpreadsheet size={16} />
                </div>
                <div>
                  <strong>Nomenclatures BOM</strong>
                  <p>Liaisons équipements / pièces de rechange et criticité.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImportPage;
