import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Dashboard from './Dashboard';
import Login from './Login';
import { importProducts } from './importData';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setStatusMessage("Import en cours...");
    try {
      const result = await importProducts();
      if (result.success) {
        setStatusMessage(`✅ SUCCÈS: ${result.count} produits importés ! Reloading...`);
        console.log(`✅ ${result.count} produits importés avec succès !`);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setStatusMessage(`❌ ERREUR: ${result.error}`);
        console.error(`❌ Erreur : ${result.error}`);
      }
    } catch (error) {
      setStatusMessage(`❌ EXCEPTION: ${error.message}`);
      console.error(`❌ Erreur : ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <Login onLoginSuccess={() => { }} />
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      {statusMessage && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-300 text-black p-4 text-center font-bold text-xl border-b-4 border-yellow-600">
          {statusMessage}
        </div>
      )}
      <Dashboard
        onImport={handleImport}
        importing={importing}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={user}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;