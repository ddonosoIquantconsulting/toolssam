import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from '../Dashboard/Dashboard';
import FileUpload from '../FileUpload/FileUpload';
import UserManagement from '../Users/UserManagement';
import Settings from '../Settings/Settings';

const DashboardLayout: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'upload':
        return <FileUpload />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default DashboardLayout;