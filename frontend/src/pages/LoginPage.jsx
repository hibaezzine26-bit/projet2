import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Package, Lock, Mail } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
    } catch (err) {
      setError('Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background-elements">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>
      
      <Card className="login-card animate-fade-in">
        <div className="login-header">
          <div className="logo-container">
            <img src="/ocp-logo.png" alt="OCP logo" className="brand-logo" />
          </div>
          <h1>PDR Manager</h1>
          <p>Connectez-vous pour gérer vos approvisionnements</p>
        </div>

        {error && <div className="login-error animate-fade-in">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-with-icon">
            <Mail className="input-icon" size={20} />
            <Input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-with-icon">
            <Lock className="input-icon" size={20} />
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? <div className="spinner"></div> : 'Se connecter'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
