import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { UploadCloud, File, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import './ImportPage.css';

const ImportPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/excel/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult({ 
        type: 'success', 
        message: typeof response.data === 'string' ? response.data : 'Importation réussie avec succès !' 
      });
    } catch (error) {
      console.error('Erreur importation:', error);
      const serverMessage = error.response?.data?.message || 
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
          <h3>Glissez-déposez votre fichier ici</h3>
          <p>ou</p>
          
          <input 
            type="file" 
            id="file-upload" 
            className="file-input" 
            accept=".xlsx, .xls" 
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload" className="btn btn-secondary upload-btn">
            Parcourir les fichiers
          </label>
        </div>

        {file && (
          <div className="file-info animate-fade-in">
            <div className="file-name">
              <File size={20} />
              <span>{file.name}</span>
            </div>
            
            <Button 
              onClick={handleUpload} 
              disabled={uploading}
              className="start-upload-btn"
            >
              {uploading ? 'Importation en cours...' : 'Lancer l\'import'}
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
