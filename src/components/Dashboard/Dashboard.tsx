import React, { useState, useMemo, useEffect } from 'react';
import { Filter, TrendingUp, TrendingDown, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { apiService } from '../../services/api';

const Dashboard: React.FC = () => {
  // Estados para datos del historial
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [comparing, setComparing] = useState(false);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  // Estados para Selección 1
  const [selection1Company, setSelection1Company] = useState<string>('');
  const [selection1Date, setSelection1Date] = useState<string>('');
  const [selection1Version, setSelection1Version] = useState<string>('');

  // Estados para Selección 2
  const [selection2Company, setSelection2Company] = useState<string>('');
  const [selection2Date, setSelection2Date] = useState<string>('');
  const [selection2Version, setSelection2Version] = useState<string>('');

  // Estado para filtro de tablas
  const [selectedTable, setSelectedTable] = useState<string>('all');

  // Cargar datos del historial al montar el componente
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const data = await apiService.getFiles();
        setHistoryData(data);
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Reset selections when company changes
  const handleSelection1CompanyChange = (company: string) => {
    setSelection1Company(company);
    setSelection1Version('');
    setSelection1Date('');
    setSelectedTable('all'); // Reset table selection
  };

  const handleSelection2CompanyChange = (company: string) => {
    setSelection2Company(company);
    setSelection2Version('');
    setSelection2Date('');
  };

  // Reset date when version changes
  const handleSelection1VersionChange = (version: string) => {
    setSelection1Version(version);
    setSelection1Date('');
    setSelectedTable('all'); // Reset table selection
  };

  const handleSelection2VersionChange = (version: string) => {
    setSelection2Version(version);
    setSelection2Date('');
  };

  // Handle date change for Selection 1 - reset table selection
  const handleSelection1DateChange = (date: string) => {
    setSelection1Date(date);
    setSelectedTable('all');
  };

  // Toggle table expansion
  const toggleTableExpansion = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  // Expand all tables when comparison data changes
  useEffect(() => {
    if (comparisonData.length > 0) {
      const allTableNames = comparisonData.map(table => table.table);
      setExpandedTables(new Set(allTableNames));
    }
  }, [comparisonData]);

  // Get unique companies
  const companies = useMemo(() => {
    const unique = [...new Set(historyData.map(item => item.company))];
    return unique.filter(Boolean);
  }, [historyData]);

  // Get versions for Selection 1 based on selected company
  const selection1Versions = useMemo(() => {
    if (!selection1Company) return [];
    const filtered = historyData.filter(item => item.company === selection1Company);
    const unique = [...new Set(filtered.map(item => item.version))];
    return unique.filter(Boolean);
  }, [historyData, selection1Company]);

  // Get versions for Selection 2 based on selected company
  const selection2Versions = useMemo(() => {
    if (!selection2Company) return [];
    const filtered = historyData.filter(item => item.company === selection2Company);
    const unique = [...new Set(filtered.map(item => item.version))];
    return unique.filter(Boolean);
  }, [historyData, selection2Company]);

  // Get upload dates for Selection 1 based on company and version
  const selection1Dates = useMemo(() => {
    if (!selection1Company || !selection1Version) return [];
    const filtered = historyData.filter(item => 
      item.company === selection1Company && item.version === selection1Version
    );
    return filtered.map(item => ({
      value: item.uploadedAt,
      label: new Date(item.uploadedAt).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      fileName: item.fileName,
      recordCount: item.recordCount,
      tablesProcessed: item.tablesProcessed || [] // Incluir las tablas procesadas
    }));
  }, [historyData, selection1Company, selection1Version]);

  // Get upload dates for Selection 2 based on company and version
  const selection2Dates = useMemo(() => {
    if (!selection2Company || !selection2Version) return [];
    const filtered = historyData.filter(item => 
      item.company === selection2Company && item.version === selection2Version
    );
    return filtered.map(item => ({
      value: item.uploadedAt,
      label: new Date(item.uploadedAt).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      fileName: item.fileName,
      recordCount: item.recordCount,
      tablesProcessed: item.tablesProcessed || []
    }));
  }, [historyData, selection2Company, selection2Version]);

  // 🎯 NUEVO: Obtener tablas disponibles directamente del historial seleccionado
  const availableTables = useMemo(() => {
    if (!selection1Company || !selection1Version || !selection1Date) return [];
    
    // Buscar el registro específico seleccionado
    const selectedUpload = historyData.find(item => 
      item.company === selection1Company && 
      item.version === selection1Version && 
      item.uploadedAt === selection1Date
    );
    
    return selectedUpload?.tablesProcessed || [];
  }, [historyData, selection1Company, selection1Version, selection1Date]);

  // Execute comparison when all parameters are ready
// Cambios necesarios en tu Dashboard.tsx

// 🔄 CAMBIO 1: Actualizar el useEffect de comparación
useEffect(() => {
  const executeComparison = async () => {
    if (canCompare) {
      try {
        setComparing(true);

        // 🆕 Obtener fileName de cada selección
        const selection1Upload = historyData.find(item => 
          item.company === selection1Company && 
          item.version === selection1Version && 
          item.uploadedAt === selection1Date
        );

        const selection2Upload = historyData.find(item => 
          item.company === selection2Company && 
          item.version === selection2Version && 
          item.uploadedAt === selection2Date
        );

        if (!selection1Upload || !selection2Upload) {
          console.error('No se encontraron los uploads seleccionados');
          setComparisonData([]);
          return;
        }

        // 🆕 Llamada al nuevo endpoint
        const result = await apiService.compareUploads({
          selection1: {
            fileName: selection1Upload.fileName,  // Usar filename del upload
            uploadDate: selection1Date
          },
          selection2: {
            fileName: selection2Upload.fileName,  // Usar filename del upload
            uploadDate: selection2Date
          },
          table: selectedTable === 'all' ? 'all' : selectedTable
        });

        setComparisonData(result);
      } catch (error) {
        console.error('Error executing comparison:', error);
        setComparisonData([]);
      } finally {
        setComparing(false);
      }
    } else {
      setComparisonData([]);
    }
  };

  executeComparison();
}, [selection1Company, selection1Version, selection1Date, 
    selection2Company, selection2Version, selection2Date, selectedTable, historyData]); // 🔄 Agregar historyData como dependencia

  // Generate comparison summary
  const comparisonSummary = useMemo(() => {
    if (comparisonData.length === 0) return null;
    
    const totals = comparisonData.reduce((acc, table) => ({
      totalRecords: acc.totalRecords + table.totalRecords,
      differences: acc.differences + table.differences,
      newInSelection1: acc.newInSelection1 + table.newInSelection1,
      newInSelection2: acc.newInSelection2 + table.newInSelection2
    }), { totalRecords: 0, differences: 0, newInSelection1: 0, newInSelection2: 0 });

    return {
      ...totals,
      tablesAffected: comparisonData.length
    };
  }, [comparisonData]);

  const stats = useMemo(() => {
    if (!comparisonSummary) return { total: 0, differences: 0, newRecords: 0, tablesAffected: 0 };
    
    return {
      total: comparisonSummary.totalRecords,
      differences: comparisonSummary.differences,
      newRecords: comparisonSummary.newInSelection1 + comparisonSummary.newInSelection2,
      tablesAffected: comparisonSummary.tablesAffected
    };
  }, [comparisonSummary]);

  const canCompare = selection1Company && selection1Version && selection1Date && 
                    selection2Company && selection2Version && selection2Date;

  // Helper function to format field names for display
  const formatFieldName = (field: string) => {
    return field
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Cargando datos del historial...</div>
        </div>
      </div>
    );
  }

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

      {/* Comparison Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <Filter className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filtros de Comparación</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
          {/* Selección 1 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-md font-medium text-gray-900 mb-4 text-center bg-blue-50 py-2 rounded">
              Selección 1
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <select
                  value={selection1Company}
                  onChange={(e) => handleSelection1CompanyChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar Company</option>
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
                  value={selection1Version}
                  onChange={(e) => handleSelection1VersionChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!selection1Company}
                >
                  <option value="">Seleccionar Version</option>
                  {selection1Versions.map(version => (
                    <option key={version} value={version}>{version}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Carga
                </label>
                <select
                  value={selection1Date}
                  onChange={(e) => handleSelection1DateChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!selection1Company || !selection1Version}
                >
                  <option value="">Seleccionar Fecha</option>
                  {selection1Dates.map((date, index) => (
                    <option key={index} value={date.value}>
                      {date.label} ({date.recordCount} registros)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Selección 2 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-md font-medium text-gray-900 mb-4 text-center bg-green-50 py-2 rounded">
              Selección 2
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <select
                  value={selection2Company}
                  onChange={(e) => handleSelection2CompanyChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Seleccionar Company</option>
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
                  value={selection2Version}
                  onChange={(e) => handleSelection2VersionChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={!selection2Company}
                >
                  <option value="">Seleccionar Version</option>
                  {selection2Versions.map(version => (
                    <option key={version} value={version}>{version}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Carga
                </label>
                <select
                  value={selection2Date}
                  onChange={(e) => setSelection2Date(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={!selection2Company || !selection2Version}
                >
                  <option value="">Seleccionar Fecha</option>
                  {selection2Dates.map((date, index) => (
                    <option key={index} value={date.value}>
                      {date.label} ({date.recordCount} registros)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Filtro de Tablas - OPTIMIZADO */}
        <div className="border-t border-gray-200 pt-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tablas
              {availableTables.length > 0 && (
                <span className="text-blue-600 text-xs ml-2">
                  ({availableTables.length} disponibles)
                </span>
              )}
            </label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={availableTables.length === 0}
            >
              <option value="all">Todas las Tablas</option>
              {availableTables.map(table => (
                <option key={table} value={table}>{table}</option>
              ))}
            </select>
            {availableTables.length === 0 ? (
              <p className="text-xs text-gray-500 mt-1">
                Completa la Selección 1 para ver las tablas disponibles
              </p>
            ) : (
              <p className="text-xs text-green-600 mt-1">
                📊 {availableTables.join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* Validation Message */}
        {!canCompare && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Para realizar la comparación, selecciona Company, Version y Fecha de Carga en ambas selecciones.
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {canCompare && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Diferencias</p>
                <p className="text-2xl font-bold text-gray-900">
                  {comparing ? '...' : stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valores Diferentes</p>
                <p className="text-2xl font-bold text-red-600">
                  {comparing ? '...' : stats.differences}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nuevos Registros</p>
                <p className="text-2xl font-bold text-green-600">
                  {comparing ? '...' : stats.newRecords}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tablas Afectadas</p>
                <p className="text-2xl font-bold text-orange-600">
                  {comparing ? '...' : stats.tablesAffected}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Results with Dynamic Grids */}
      {canCompare && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Comparación de Configuraciones
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selection1Company} ({selection1Version}) vs {selection2Company} ({selection2Version})
                  {selectedTable !== 'all' && ` - Tabla: ${selectedTable}`}
                </p>
              </div>
              {comparing && (
                <div className="text-sm text-blue-600">Comparando...</div>
              )}
            </div>
          </div>
          
          {comparing ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">Ejecutando comparación...</div>
            </div>
          ) : comparisonData.length > 0 ? (
            <div className="p-6 space-y-6">
              {comparisonData.map((tableData, tableIndex) => {
                const isExpanded = expandedTables.has(tableData.table);
                return (
                  <div key={tableIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Accordion Header */}
                    <div 
                      className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-200"
                      onClick={() => toggleTableExpansion(tableData.table)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 mr-2 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 mr-2 text-gray-500" />
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900">
                              Tabla: {tableData.table}
                            </h3>
                            <div className="text-sm text-gray-600 mt-1">
                              Total: {tableData.totalRecords} diferencias | 
                              Valores diferentes: {tableData.differences} | 
                              Nuevos en Sel. 1: {tableData.newInSelection1} | 
                              Nuevos en Sel. 2: {tableData.newInSelection2}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {isExpanded ? 'Contraer' : 'Expandir'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Accordion Content - Dynamic Grid */}
                    {isExpanded && (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              {/* Dynamic columns based on table fields */}
                              {tableData.fields && tableData.fields.map((field, fieldIndex) => (
                                <th key={fieldIndex} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                                  {formatFieldName(field)}
                                </th>
                              ))}
                              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {tableData.records.map((record, recordIndex) => (
                              <React.Fragment key={recordIndex}>
                                {/* Row for Selection 1 - Blue */}
                                <tr className="bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-400">
                                  {tableData.fields && tableData.fields.map((field, fieldIndex) => (
                                    <td key={`sel1-${fieldIndex}`} className="px-3 py-2 text-sm" 
                                        rowSpan={record.type === 'different' ? 2 : 1}>
                                      <div className="flex flex-col space-y-1">
                                        <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono break-all max-w-48">
                                          {record.type === 'different' 
                                            ? (record[`${field}_sel1`] || '-')
                                            : record.type === 'new_in_selection1' 
                                              ? (record[field] || '-')
                                              : '(No existe)'
                                          }
                                        </code>
                                      </div>
                                    </td>
                                  ))}
                                  <td className="px-3 py-2" rowSpan={record.type === 'different' ? 2 : 1}>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      record.type === 'different' ? 'bg-red-100 text-red-800' :
                                      record.type === 'new_in_selection1' ? 'bg-blue-100 text-blue-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {record.type === 'different' ? 'Diferente' :
                                       record.type === 'new_in_selection1' ? 'Nuevo Sel. 1' :
                                       'Nuevo Sel. 2'}
                                    </span>
                                  </td>
                                </tr>
                                
                                {/* Row for Selection 2 - Green (only for different values) */}
                                {record.type === 'different' && (
                                  <tr className="bg-green-50 hover:bg-green-100 border-l-4 border-green-400 border-b border-gray-200">
                                    {tableData.fields && tableData.fields.map((field, fieldIndex) => (
                                      <td key={`sel2-${fieldIndex}`} className="px-3 py-2 text-sm">
                                        <div className="flex flex-col space-y-1">
                                          <code className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono break-all max-w-48">
                                            {record[`${field}_sel2`] || '-'}
                                          </code>
                                        </div>
                                      </td>
                                    ))}
                                  </tr>
                                )}

                                {/* For new records in selection 2, show complete green row */}
                                {record.type === 'new_in_selection2' && (
                                  <tr className="bg-green-50 hover:bg-green-100 border-l-4 border-green-400 border-b border-gray-200">
                                    {tableData.fields && tableData.fields.map((field, fieldIndex) => (
                                      <td key={`new-sel2-${fieldIndex}`} className="px-3 py-2 text-sm">
                                        <div className="flex flex-col space-y-1">
                                          <code className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono break-all max-w-48">
                                            {record[field] || '-'}
                                          </code>
                                        </div>
                                      </td>
                                    ))}
                                    <td className="px-3 py-2"></td>
                                  </tr>
                                )}

                                {/* Add separator between records for better readability */}
                                {recordIndex < tableData.records.length - 1 && (
                                  <tr>
                                    <td colSpan={tableData.fields ? tableData.fields.length + 1 : 1} className="h-2 bg-gray-100"></td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ¡Sin diferencias encontradas!
              </h3>
              <p className="text-gray-600">
                Las configuraciones seleccionadas son idénticas.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;