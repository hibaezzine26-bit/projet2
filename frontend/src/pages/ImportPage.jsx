import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { UploadCloud, File, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import api from '../services/api';
import './ImportPage.css';

const formatFileSize = (bytes) => {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const ImportPage = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length) {
      setFiles(selectedFiles);
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
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/excel/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        importMessages.push(
          `${file.name}: ${typeof response.data === 'string' ? response.data : 'Importation réussie.'}`
        );
      }

      setResult({
        type: 'success',
        message: importMessages.join(' | ')
      });
      setFiles([]);
    } catch (error) {
      console.error('Erreur importation:', error);
      const serverMessage =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        error.message ||
        "Erreur lors de l'importation du fichier.";

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
      <div className="page-header animate-fade-in">
        <h1>Import de Données</h1>
        <p>Téléversez votre fichier Excel contenant l'état du stock, le backlog, les BOM et l'historique de consommation.</p>
      </div>

      <Card className="import-card animate-fade-in delay-1">
        <div className="upload-area">
          <UploadCloud size={64} className="upload-icon" />
          <h3>Choisir les fichiers à importer</h3>
          <p>Vous pouvez sélectionner plusieurs fichiers Excel avant de lancer l'import.</p>

          <input
            type="file"
            id="file-upload"
            className="file-input"
            accept=".xlsx, .xls"
            multiple
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload" className="btn btn-secondary upload-btn">
            Parcourir les fichiers
          </label>
        </div>

        {files.length > 0 && (
          <div className="files-list animate-fade-in">
            <div className="files-list-header">
              <h4>Fichiers sélectionnés</h4>
              <span>{files.length} fichier{files.length > 1 ? 's' : ''}</span>
            </div>

            {files.map((file) => (
              <div key={`${file.name}-${file.size}`} className="file-row">
                <div className="file-name">
                  <File size={18} />
                  <div>
                    <span>{file.name}</span>
                    <small>{formatFileSize(file.size)}</small>
                  </div>
                </div>

                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={() => removeFile(file.name)}
                  aria-label={`Supprimer ${file.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="start-upload-btn"
            >
              {uploading ? 'Importation en cours...' : `Lancer l'import (${files.length})`}
            </Button>
          </div>
        )}

        {result && (
          <div className={`import-result ${result.type} animate-fade-in`}>
            {result.type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
            <span>{result.message}</span>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ImportPage;
