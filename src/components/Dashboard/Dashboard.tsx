import React, { useState, useMemo, useEffect } from 'react';
import { Filter, TrendingUp, TrendingDown, AlertTriangle, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { apiService } from '../../services/api';
import * as XLSX from 'xlsx';

// 🔧 PARÁMETRO PARA ALTERNAR ENTRE MOCK Y REAL
const USE_MOCK_DATA = false; // Cambia a true para usar datos mock

// 📊 MOCK DATA - Basado en tu ejemplo
const MOCK_COMPARISON_DATA = [
  {
    "table": "all",
    "totalRecords": 12,
    "differences": 18,
    "newInSelection1": 3,
    "newInSelection2": 2,
    "records": [
      {
        "table": "/SYCLO/CA000P",
        "type": "different",
        "fieldChanges": [
          {
            "record1": {
              "PARAM_NAME": "WCMCatalogProfileName",
              "PARAM_VALUE": "ZWCM",
              "PARAM_GROUP": "CATALOGTYPE",
              "DEP_RECORD_NO": "0000000000",
              "PARAM_TYPE": "",
              "PARAM_SCOPE": "",
              "PARAM_COMMENT": "",
              "ACTIVE": "X",
              "FLAG_NO_CHANGE": "X"
            },
            "record2": {
              "PARAM_NAME": "WCMCatalogProfileName",
              "PARAM_VALUE": "ZWCM",
              "PARAM_GROUP": "CATALOGTYPE",
              "DEP_RECORD_NO": "0000000000",
              "PARAM_TYPE": "",
              "PARAM_SCOPE": "",
              "PARAM_COMMENT": "Updated comment",
              "ACTIVE": "",
              "FLAG_NO_CHANGE": "X"
            },
            "fields": {
              "PARAM_COMMENT": true,
              "ACTIVE": true
            }
          },
          {
            "record1": {
              "PARAM_NAME": "EnableMobileSync",
              "PARAM_VALUE": "TRUE",
              "PARAM_GROUP": "SYNC",
              "DEP_RECORD_NO": "0000000001",
              "PARAM_TYPE": "BOOLEAN",
              "PARAM_SCOPE": "GLOBAL",
              "PARAM_COMMENT": "Enable sync functionality",
              "ACTIVE": "X",
              "FLAG_NO_CHANGE": ""
            },
            "record2": {
              "PARAM_NAME": "EnableMobileSync",
              "PARAM_VALUE": "TRUE",
              "PARAM_GROUP": "SYNC_NEW",
              "DEP_RECORD_NO": "0000000001",
              "PARAM_TYPE": "BOOLEAN",
              "PARAM_SCOPE": "GLOBAL",
              "PARAM_COMMENT": "Enable sync functionality",
              "ACTIVE": "X",
              "FLAG_NO_CHANGE": ""
            },
            "fields": {
              "PARAM_GROUP": true
            }
          },
          {
            "record1": {
              "PARAM_NAME": "MaxRetryAttempts",
              "PARAM_VALUE": "5",
              "PARAM_GROUP": "RETRY",
              "DEP_RECORD_NO": "0000000002",
              "PARAM_TYPE": "INTEGER",
              "PARAM_SCOPE": "MODULE",
              "PARAM_COMMENT": "Maximum retry attempts",
              "ACTIVE": "X",
              "FLAG_NO_CHANGE": ""
            },
            "record2": null,
            "fields": {}
          },
          {
            "record1": null,
            "record2": {
              "PARAM_NAME": "NewFeatureFlag",
              "PARAM_VALUE": "ENABLED",
              "PARAM_GROUP": "FEATURES",
              "DEP_RECORD_NO": "0000000003",
              "PARAM_TYPE": "STRING",
              "PARAM_SCOPE": "GLOBAL",
              "PARAM_COMMENT": "New feature toggle",
              "ACTIVE": "X",
              "FLAG_NO_CHANGE": ""
            },
            "fields": {}
          }
        ]
      },
      {
        "table": "/SYCLO/CA000S",
        "type": "different",
        "fieldChanges": [
          {
            "record1": {
              "OBJECT_TYPE": "ORDER",
              "MOBILE_STATUS": "OPEN",
              "MBLSTATUS_LABEL": "Open",
              "ISTAT": "I0001",
              "STSMA": "ORDEN",
              "ESTAT": "E0001",
              "STATUS_ATTR_1": "ATTR1",
              "STATUS_ATTR_2": "ATTR2",
              "FLAG_INIT_STATUS": "X",
              "FLAG_NO_UPDATE": "",
              "FLAG_DISABLED": ""
            },
            "record2": {
              "OBJECT_TYPE": "ORDER",
              "MOBILE_STATUS": "OPEN",
              "MBLSTATUS_LABEL": "Open",
              "ISTAT": "I0001",
              "STSMA": "ORDEN",
              "ESTAT": "E0001",
              "STATUS_ATTR_1": "ATTR1",
              "STATUS_ATTR_2": "ATTR2",
              "FLAG_INIT_STATUS": "X",
              "FLAG_NO_UPDATE": "X",
              "FLAG_DISABLED": "X"
            },
            "fields": {
              "FLAG_NO_UPDATE": true,
              "FLAG_DISABLED": true
            }
          }
        ]
      }
    ]
  }
];

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

  // Estados para controlar la expansión de secciones
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Función para descargar Excel de una tabla específica
  const downloadTableExcel = (tableData: any) => {
    try {
      // Obtener campos únicos de la tabla
      const tableFields = getTableFields(tableData);
      
      // Organizar registros por tipo
      const organizedRecords = organizeRecordsByType(tableData);
      
      // Crear libro de trabajo
      const workbook = XLSX.utils.book_new();
      
      // Función auxiliar para convertir registros a formato de hoja
      const createSheetData = (records: any[], sheetType: 'different' | 'onlySelection1' | 'onlySelection2') => {
        if (records.length === 0) return [tableFields]; // Solo headers si no hay datos
        
        const sheetData = [];
        
        if (sheetType === 'different') {
          // Para diferencias, incluir una columna adicional para identificar la selección
          const headers = [...tableFields, 'SELECCION'];
          sheetData.push(headers);
          
          records.forEach(change => {
            // Fila para Selección 1
            const row1 = tableFields.map(field => change.record1[field] || '');
            row1.push('SELECCION_1');
            sheetData.push(row1);
            
            // Fila para Selección 2
            const row2 = tableFields.map(field => change.record2[field] || '');
            row2.push('SELECCION_2');
            sheetData.push(row2);
            
            // Fila vacía como separador
            sheetData.push(new Array(headers.length).fill(''));
          });
        } else {
          // Para registros únicos
          sheetData.push(tableFields);
          
          records.forEach(change => {
            const record = sheetType === 'onlySelection1' ? change.record1 : change.record2;
            const row = tableFields.map(field => record[field] || '');
            sheetData.push(row);
          });
        }
        
        return sheetData;
      };

      console.log("Despues de return sheetData");
      
      // Formatear fechas para el nombre del archivo
      const formatDateForFilename = (dateString: string) => {
        console.log(dateString);
        const date = new Date(dateString);
        return date.toISOString().split('T')[0].replace(/-/g, '');
      };

     const formatHoursForFilename = (dateString: string): string => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Fecha inválida');
      }
      const isoTime = date.toISOString().split('T')[1].replace('Z', ''); // "20:53:21.746"
      const [hh, mm, ssMs] = isoTime.split(':');                         // ["20","53","21.746"]
      const ss = ssMs.split('.')[0];                                     // "21"
      return `${hh}${mm}${ss}`;                                          // "205321"
    };
      
            // Limpiar nombres para el archivo (remover caracteres especiales)
      const cleanName = (name: string) => {
        return name.replace(/[^a-zA-Z0-9]/g, '_');
      };

      console.log(" antes de crear hojas")
      // Crear hojas
      const diferenciasData = createSheetData(organizedRecords.different, 'different');
      const soloSel1Data = createSheetData(organizedRecords.onlySelection1, 'onlySelection1');
      const soloSel2Data = createSheetData(organizedRecords.onlySelection2, 'onlySelection2');
      
      // Convertir a hojas de Excel
      const diferenciasSheet = XLSX.utils.aoa_to_sheet(diferenciasData);
      const soloSel1Sheet = XLSX.utils.aoa_to_sheet(soloSel1Data);
      const soloSel2Sheet = XLSX.utils.aoa_to_sheet(soloSel2Data);
      
      console.log("antes de crear nombres de hojas")
      // Crear nombres de hojas personalizados
      const fecha1 = formatDateForFilename(selection1Date);
      const fecha2 = formatDateForFilename(selection2Date);
      const hora1 = formatHoursForFilename( selection1Date);
      const hora2 = formatHoursForFilename( selection2Date);
      const sel1SheetName = `${cleanName(selection1Company)}_${cleanName(selection1Version)}_${fecha1}`;
      let sel2SheetName = `${cleanName(selection2Company)}_${cleanName(selection2Version)}_${fecha2}`;
      
       console.log("antes de crear hohas Diferencias ");
      // Agregar hojas al libro
      XLSX.utils.book_append_sheet(workbook, diferenciasSheet, 'Diferencias');
      XLSX.utils.book_append_sheet(workbook, soloSel1Sheet, sel1SheetName);
      console.log(soloSel2Sheet ,sel2SheetName );
      if ( sel1SheetName === sel2SheetName ) sel2SheetName = sel2SheetName + '_' + hora2;
      XLSX.utils.book_append_sheet(workbook, soloSel2Sheet, sel2SheetName);
      


      console.log("antes de crear nombres del archivo")
      // Crear nombre del archivo
      // const fecha1 = formatDateForFilename(selection1Date);
      // const fecha2 = formatDateForFilename(selection2Date);
      const tableName = tableData.table.replace(/[\/]/g, '_'); // Reemplazar / por _
      
      const fileName = `${cleanName(selection1Company)}_${cleanName(selection1Version)}_${fecha1}_vs_${cleanName(selection2Company)}_${cleanName(selection2Version)}_${fecha2}_${tableName}.xlsx`;
      
      console.log("antes de writeFile")
      // Descargar archivo
      XLSX.writeFile(workbook, fileName);
      
      console.log(`Excel descargado: ${fileName}`);
      
    } catch (error) {
      console.error('Error al generar Excel:', error);
      alert('Error al generar el archivo Excel. Revisa la consola para más detalles.');
    }
  };

  // Cargar datos del historial al montar el componente
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        if (USE_MOCK_DATA) {
          // Simular datos de historial para el mock
          const mockHistory = [
            { company: 'ACME Corp', version: '1.0', uploadedAt: '2024-01-15T10:00:00Z', fileName: 'config_v1.json', recordCount: 150, tablesProcessed: ['/SYCLO/CA000P', '/SYCLO/CA000S'] },
            { company: 'ACME Corp', version: '1.1', uploadedAt: '2024-01-20T14:30:00Z', fileName: 'config_v1.1.json', recordCount: 175, tablesProcessed: ['/SYCLO/CA000P', '/SYCLO/CA000S', '/SYCLO/CA000G'] },
            { company: 'Beta Inc', version: '2.0', uploadedAt: '2024-01-25T09:15:00Z', fileName: 'config_v2.json', recordCount: 200, tablesProcessed: ['/MFND/C_ODO03', '/MFND/C_ODO03D'] }
          ];
          setHistoryData(mockHistory);
        } else {
          const data = await apiService.getFiles();
          setHistoryData(data);
        }
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
    setSelectedTable('all');
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
    setSelectedTable('all');
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

  // Toggle section expansion (para Solo Sel 1, Solo Sel 2, etc.)
  const toggleSectionExpansion = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  // Expand all tables when comparison data changes
  useEffect(() => {
    if (comparisonData.length > 0) {
      const allTableNames = comparisonData.flatMap(item => 
        item.records?.map(record => record.table) || []
      );
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
      tablesProcessed: item.tablesProcessed || []
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

  // Obtener tablas disponibles directamente del historial seleccionado
  const availableTables = useMemo(() => {
    if (!selection1Company || !selection1Version || !selection1Date) return [];
    
    const selectedUpload = historyData.find(item => 
      item.company === selection1Company && 
      item.version === selection1Version && 
      item.uploadedAt === selection1Date
    );
    
    return selectedUpload?.tablesProcessed || [];
  }, [historyData, selection1Company, selection1Version, selection1Date]);

  // Execute comparison when all parameters are ready
  useEffect(() => {
    const executeComparison = async () => {
      if (canCompare) {
        try {
          setComparing(true);

          if (USE_MOCK_DATA) {
            // Simular delay para el mock
            await new Promise(resolve => setTimeout(resolve, 1000));
            setComparisonData(MOCK_COMPARISON_DATA);
          } else {
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

            const result = await apiService.compareUploads({
              selection1: {
                fileName: selection1Upload.fileName,
                uploadDate: selection1Date
              },
              selection2: {
                fileName: selection2Upload.fileName,
                uploadDate: selection2Date
              },
              table: selectedTable === 'all' ? 'all' : selectedTable
            });

            setComparisonData(result);
          }
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
      selection2Company, selection2Version, selection2Date, selectedTable, historyData]);

  // Generate comparison summary from the new data structure
  const comparisonSummary = useMemo(() => {
    if (comparisonData.length === 0) return null;
    
    const totals = comparisonData.reduce((acc, item) => ({
      totalRecords: acc.totalRecords + (item.totalRecords || 0),
      differences: acc.differences + (item.differences || 0),
      newInSelection1: acc.newInSelection1 + (item.newInSelection1 || 0),
      newInSelection2: acc.newInSelection2 + (item.newInSelection2 || 0)
    }), { totalRecords: 0, differences: 0, newInSelection1: 0, newInSelection2: 0 });

    const tablesAffected = comparisonData.reduce((acc, item) => {
      return acc + (item.records?.length || 0);
    }, 0);

    return {
      ...totals,
      tablesAffected
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
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Helper function to get all unique fields from a table's records
  const getTableFields = (tableRecords: any) => {
    if (!tableRecords.fieldChanges || tableRecords.fieldChanges.length === 0) return [];
    
    const fieldsSet = new Set<string>();
    
    tableRecords.fieldChanges.forEach((change: any) => {
      if (change.record1) {
        Object.keys(change.record1).forEach(field => fieldsSet.add(field));
      }
      if (change.record2) {
        Object.keys(change.record2).forEach(field => fieldsSet.add(field));
      }
    });
    
    return Array.from(fieldsSet);
  };

  // Helper function to determine if a field has differences
  const hasFieldDifference = (change: any, field: string) => {
    return change.fields && change.fields[field] === true;
  };
  
  const organizeRecordsByType = (tableData: any) => {
    if (!tableData.fieldChanges) return { different: [], onlySelection1: [], onlySelection2: [] };
    
    const different = [];
    const onlySelection1 = [];
    const onlySelection2 = [];
    
    tableData.fieldChanges.forEach((change: any) => {
      if (change.record1 && change.record2) {
        different.push(change);
      } else if (change.record1 && !change.record2) {
        onlySelection1.push(change);
      } else if (!change.record1 && change.record2) {
        onlySelection2.push(change);
      }
    });
    
    return { different, onlySelection1, onlySelection2 };
  };

  // Helper function to render a section of records
  const renderRecordSection = (
    records: any[], 
    tableFields: string[], 
    sectionType: 'different' | 'onlySelection1' | 'onlySelection2',
    tableName: string
  ) => {
    if (records.length === 0) return null;
    
    const sectionKey = `${tableName}-${sectionType}`;
    const isExpanded = expandedSections.has(sectionKey);
    
    const sectionConfig = {
      different: {
        title: 'Registros con Diferencias',
        icon: '⚡',
        color: 'border-red-400 bg-red-50',
        headerColor: 'bg-red-100 hover:bg-red-200',
        count: records.length
      },
      onlySelection1: {
        title: 'Solo en Selección 1',
        icon: '🔵',
        color: 'border-blue-400 bg-blue-50',
        headerColor: 'bg-blue-100 hover:bg-blue-200',
        count: records.length
      },
      onlySelection2: {
        title: 'Solo en Selección 2',
        icon: '🟢',
        color: 'border-green-400 bg-green-50',
        headerColor: 'bg-green-100 hover:bg-green-200',
        count: records.length
      }
    };
    
    const config = sectionConfig[sectionType];
    
    return (
      <div className={`border rounded-lg overflow-hidden mb-4 ${config.color}`}>
        {/* Section Header */}
        <div 
          className={`px-4 py-3 cursor-pointer transition-colors ${config.headerColor}`}
          onClick={() => toggleSectionExpansion(sectionKey)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 mr-2 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 mr-2 text-gray-600" />
              )}
              <span className="text-lg mr-2">{config.icon}</span>
              <div>
                <h4 className="font-medium text-gray-900">
                  {config.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {config.count} registro{config.count !== 1 ? 's' : ''} encontrado{config.count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {isExpanded ? 'Contraer' : 'Expandir'}
            </div>
          </div>
        </div>
        
        {/* Section Content */}
        {isExpanded && (
          <div className="overflow-x-auto bg-white">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {tableFields.map((field, fieldIndex) => (
                    <th key={fieldIndex} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                      {formatFieldName(field)}
                    </th>
                  ))}
                  {sectionType === 'different' && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Selección
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white">
                {records.map((change, changeIndex) => (
                  <React.Fragment key={changeIndex}>
                    {/* Para registros diferentes, mostrar ambas filas */}
                    {sectionType === 'different' ? (
                      <>
                        {/* Fila Selección 1 */}
                        <tr className="bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-400">
                          {tableFields.map((field, fieldIndex) => (
                            <td key={`sel1-${fieldIndex}`} className="px-3 py-2 text-sm">
                              <code className={`px-2 py-1 rounded text-xs font-mono break-all max-w-48 ${
                                hasFieldDifference(change, field) 
                                  ? 'bg-red-200 text-red-800 font-bold' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {change.record1[field] || '-'}
                              </code>
                            </td>
                          ))}
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Selección 1
                            </span>
                          </td>
                        </tr>
                        
                        {/* Fila Selección 2 */}
                        <tr className="bg-green-50 hover:bg-green-100 border-l-4 border-green-400">
                          {tableFields.map((field, fieldIndex) => (
                            <td key={`sel2-${fieldIndex}`} className="px-3 py-2 text-sm">
                              <code className={`px-2 py-1 rounded text-xs font-mono break-all max-w-48 ${
                                hasFieldDifference(change, field) 
                                  ? 'bg-red-200 text-red-800 font-bold' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {change.record2[field] || '-'}
                              </code>
                            </td>
                          ))}
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Selección 2
                            </span>
                          </td>
                        </tr>
                      </>
                    ) : (
                      /* Para registros únicos, mostrar solo una fila */
                      <tr className={`hover:opacity-80 border-l-4 ${
                        sectionType === 'onlySelection1' 
                          ? 'bg-blue-50 border-blue-400' 
                          : 'bg-green-50 border-green-400'
                      }`}>
                        {tableFields.map((field, fieldIndex) => (
                          <td key={`unique-${fieldIndex}`} className="px-3 py-2 text-sm">
                            <code className={`px-2 py-1 rounded text-xs font-mono break-all max-w-48 ${
                              sectionType === 'onlySelection1' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {sectionType === 'onlySelection1' 
                                ? (change.record1[field] || '-')
                                : (change.record2[field] || '-')
                              }
                            </code>
                          </td>
                        ))}
                      </tr>
                    )}
                    
                    {/* Separador entre registros */}
                    {changeIndex < records.length - 1 && (
                      <tr>
                        <td colSpan={tableFields.length + (sectionType === 'different' ? 1 : 0)} className="h-2 bg-gray-100"></td>
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
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">
            {USE_MOCK_DATA ? 'Cargando datos mock...' : 'Cargando datos del historial...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenido a Iquant - Comparación SSAM
          {USE_MOCK_DATA && <span className="text-sm text-blue-600 ml-2">(MODO MOCK)</span>}
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

        {/* Filtro de Tablas */}
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
              disabled={!USE_MOCK_DATA && availableTables.length === 0}
            >
              <option value="all">Todas las Tablas</option>
              {(USE_MOCK_DATA ? ['/SYCLO/CA000P', '/SYCLO/CA000S', '/SYCLO/CA000G'] : availableTables).map(table => (
                <option key={table} value={table}>{table}</option>
              ))}
            </select>
            {!USE_MOCK_DATA && availableTables.length === 0 ? (
              <p className="text-xs text-gray-500 mt-1">
                Completa la Selección 1 para ver las tablas disponibles
              </p>
            ) : (
              <p className="text-xs text-green-600 mt-1">
                📊 {USE_MOCK_DATA ? '/SYCLO/CA000P, /SYCLO/CA000S, /SYCLO/CA000G' : availableTables.join(', ')}
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
                <p className="text-sm font-medium text-gray-600">Total Registros</p>
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
                <p className="text-sm font-medium text-gray-600">Diferencias</p>
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

      {/* Comparison Results */}
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
              {comparisonData.map((dataGroup, groupIndex) => (
                <div key={groupIndex}>
                  {dataGroup.records?.map((tableData, tableIndex) => {
                    const isExpanded = expandedTables.has(tableData.table);
                    const tableFields = getTableFields(tableData);
                    
                    return (
                      <div key={tableIndex} className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                        {/* Accordion Header con Botón de Descarga */}
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex items-center cursor-pointer hover:bg-gray-100 transition-colors rounded px-2 py-1 -mx-2"
                              onClick={() => toggleTableExpansion(tableData.table)}
                            >
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
                                  {tableData.fieldChanges?.length || 0} cambios encontrados
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              {/* Botón de Descarga Excel */}
                              <button
                                onClick={() => downloadTableExcel(tableData)}
                                className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                title="Descargar Excel para esta tabla"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Descargar Excel
                              </button>
                              
                              <div className="text-sm text-gray-500">
                                {isExpanded ? 'Contraer' : 'Expandir'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Accordion Content - Organized by Record Type */}
                        {isExpanded && (
                          <div className="p-4 space-y-4">
                            {(() => {
                              const organizedRecords = organizeRecordsByType(tableData);
                              
                              return (
                                <>
                                  {/* Sección: Registros con Diferencias */}
                                  {renderRecordSection(
                                    organizedRecords.different, 
                                    tableFields, 
                                    'different', 
                                    tableData.table
                                  )}
                                  
                                  {/* Sección: Solo en Selección 1 */}
                                  {renderRecordSection(
                                    organizedRecords.onlySelection1, 
                                    tableFields, 
                                    'onlySelection1', 
                                    tableData.table
                                  )}
                                  
                                  {/* Sección: Solo en Selección 2 */}
                                  {renderRecordSection(
                                    organizedRecords.onlySelection2, 
                                    tableFields, 
                                    'onlySelection2', 
                                    tableData.table
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
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