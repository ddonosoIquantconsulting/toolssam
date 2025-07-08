import React, { useState, useMemo } from 'react';
import { Filter, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { mockCSVData } from '../../data/mockData';
import { CSVData, ComparisonResult } from '../../types';

const Dashboard: React.FC = () => {
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedVersion, setSelectedVersion] = useState<string>('all');

  // Get unique companies and versions
  const companies = useMemo(() => {
    const unique = [...new Set(mockCSVData.map(item => item.COMPANY))];
    return unique;
  }, []);

  const versions = useMemo(() => {
    const unique = [...new Set(mockCSVData.map(item => item.VERSION))];
    return unique;
  }, []);

  // Filter data based on selections
  const filteredData = useMemo(() => {
    let filtered = mockCSVData;
    
    if (selectedCompany !== 'all') {
      filtered = filtered.filter(item => item.COMPANY === selectedCompany);
    }
    
    if (selectedVersion !== 'all') {
      filtered = filtered.filter(item => item.VERSION === selectedVersion);
    }
    
    return filtered;
  }, [selectedCompany, selectedVersion]);

  // Generate comparison data
  const comparisonData = useMemo(() => {
    if (companies.length < 2) return [];
    
    const comparisons: ComparisonResult[] = [];
    const [company1, company2] = companies;
    
    const company1Data = mockCSVData.filter(item => item.COMPANY === company1);
    const company2Data = mockCSVData.filter(item => item.COMPANY === company2);
    
    company1Data.forEach(item1 => {
      const item2 = company2Data.find(item => 
        item.PARAM_NAME === item1.PARAM_NAME && 
        item.TABLE === item1.TABLE
      );
      
      if (item2) {
        comparisons.push({
          paramName: item1.PARAM_NAME,
          company1Value: item1.PARAM_VALUE,
          company2Value: item2.PARAM_VALUE,
          isDifferent: item1.PARAM_VALUE !== item2.PARAM_VALUE,
          table: item1.TABLE,
          paramGroup: item1.PARAM_GROUP
        });
      }
    });
    
    return comparisons;
  }, [companies]);

  const stats = useMemo(() => {
    const totalParams = comparisonData.length;
    const differences = comparisonData.filter(item => item.isDifferent).length;
    const matches = totalParams - differences;
    
    return {
      total: totalParams,
      differences,
      matches,
      differencePercentage: totalParams > 0 ? Math.round((differences / totalParams) * 100) : 0
    };
  }, [comparisonData]);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenido a Iquant - Comparación SSAM
        </h1>
        <p className="text-gray-600">
          Sistema de análisis y comparación de configuraciones SAP Service Asset Manager
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filtros de Comparación</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las Companies</option>
              {companies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Version
            </label>
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las Versiones</option>
              {versions.map(version => (
                <option key={version} value={version}>{version}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Parámetros</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Diferencias</p>
              <p className="text-2xl font-bold text-red-600">{stats.differences}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Coincidencias</p>
              <p className="text-2xl font-bold text-green-600">{stats.matches}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">% Diferencias</p>
              <p className="text-2xl font-bold text-orange-600">{stats.differencePercentage}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Comparación de Configuraciones ({companies.join(' vs ')})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parámetro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tabla
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grupo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {companies[0]}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {companies[1]}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {comparisonData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.paramName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.table}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.paramGroup}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {item.company1Value}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {item.company2Value}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.isDifferent ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Diferente
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Igual
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;