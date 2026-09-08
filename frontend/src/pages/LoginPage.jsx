import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Lock, Mail, AlertCircle, Sun, Moon } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { toggleTheme, isDark } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Identifiants incorrects. Veuillez réessayer.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Theme Switcher Button */}
      <button
        type="button"
        className="login-theme-btn"
        onClick={toggleTheme}
        title={isDark ? 'Passer au mode clair' : 'Passer au mode sombre'}
        aria-label="Changer de thème"
      >
        {isDark ? <Sun size={19} /> : <Moon size={19} />}
      </button>

      <div className="login-card animate-fade-in">
        <div className="login-header">
          <img src="/ocp-logo.png" alt="Logo OCP" className="login-logo" />
          <h1>PDR Manager</h1>
          <p>Connexion à votre espace</p>
        </div>

        {error && (
          <div className="login-error animate-fade-in">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <Input
            label="Email"
            type="email"
            icon={Mail}
            placeholder="admin@ocp.ma"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Mot de passe"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="login-btn"
            loading={isLoading}
          >
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
