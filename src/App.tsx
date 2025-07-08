import React from 'react';
import { useAuthStore } from './stores/authStore';
import Login from './components/Login';
import DashboardLayout from './components/Layout/DashboardLayout';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ? <DashboardLayout /> : <Login />;
};

function App() {
  return (
    <AppContent />
  );
}

export default App;