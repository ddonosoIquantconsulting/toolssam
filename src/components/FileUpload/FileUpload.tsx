import React, { useState, useCallback, useMemo } from 'react';
import { Upload, File, CheckCircle, XCircle, Eye, Trash2, BarChart, AlertTriangle, Search, Filter, X } from 'lucide-react';
import { apiService } from '../../services/api';

interface UploadResponse {
  message: string;
  recordsProcessed: number;
}

interface UploadedFile {
  id: string;
  fileName: string;
  recordCount: number;
  company: string;
  version: string;
  uploadedAt: string;
  status: 'completed' | 'processing' | 'error';
  product: string;
  tablesProcessed: string[];
  errorMessage?: string;
}

interface FilterState {
  company: string;
  version: string;
  uploadDate: string;
  textSearch: string;
}

const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<UploadedFile | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Estados para filtros
  const [filters, setFilters] = useState<FilterState>({
    company: '',
    version: '',
    uploadDate: '',
    textSearch: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Cargar archivos al montar el componente
  React.useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const uploadedFiles = await apiService.getFiles();
      setFiles(uploadedFiles);
    } catch (error) {
      console.error('Error loading files:', error);
      setError('Error al cargar historial de archivos');
    }
  };

  // Opciones dinámicas para los filtros
  const filterOptions = useMemo(() => {
    const companies = [...new Set(files.map(file => file.company))].filter(Boolean).sort();
    
    // Versiones filtradas por company seleccionada
    const versionsForCompany = filters.company 
      ? [...new Set(files.filter(file => file.company === filters.company).map(file => file.version))].filter(Boolean).sort()
      : [...new Set(files.map(file => file.version))].filter(Boolean).sort();
    
    // Fechas filtradas por company y version seleccionadas
    let datesForSelection = files;
    if (filters.company) {
      datesForSelection = datesForSelection.filter(file => file.company === filters.company);
    }
    if (filters.version) {
      datesForSelection = datesForSelection.filter(file => file.version === filters.version);
    }
    
    const uploadDates = [...new Set(
      datesForSelection.map(file => {
        const date = new Date(file.uploadedAt);
        return date.toLocaleDateString('es-ES');
      })
    )].sort().reverse(); // Más recientes primero

    return {
      companies,
      versions: versionsForCompany,
      uploadDates
    };
  }, [files, filters.company, filters.version]);

  // Archivos filtrados
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      // Filtro por company
      if (filters.company && file.company !== filters.company) {
        return false;
      }
      
      // Filtro por version
      if (filters.version && file.version !== filters.version) {
        return false;
      }
      
      // Filtro por fecha de carga
      if (filters.uploadDate) {
        const fileDate = new Date(file.uploadedAt).toLocaleDateString('es-ES');
        if (fileDate !== filters.uploadDate) {
          return false;
        }
      }
      
      // Filtro por texto (busca en filename, company, version)
      if (filters.textSearch) {
        const searchTerm = filters.textSearch.toLowerCase();
        const searchableText = `${file.fileName} ${file.company} ${file.version}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }
      
      return true;
    });
  }, [files, filters]);

  // Manejadores de filtros
  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterType]: value };
      
      // Si cambia company, resetear version y uploadDate
      if (filterType === 'company') {
        newFilters.version = '';
        newFilters.uploadDate = '';
      }
      
      // Si cambia version, resetear uploadDate
      if (filterType === 'version') {
        newFilters.uploadDate = '';
      }
      
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({
      company: '',
      version: '',
      uploadDate: '',
      textSearch: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    // Validar tipo de archivo
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no válido. Solo se permiten archivos Excel (.xlsx, .xls) y CSV.');
      return;
    }

    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('El archivo es demasiado grande. Tamaño máximo: 10MB');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    try {
      const result: UploadResponse = await apiService.uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      setSuccess(`${result.message}. Registros procesados: ${result.recordsProcessed}`);
      setUploadProgress(100);
      
      // Recargar la lista de archivos
      await loadFiles();
      
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setSuccess(null);
      }, 3000);

    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'Error al subir archivo');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleViewData = async () => {
    try {
      window.open('/dashboard', '_blank');
    } catch (error) {
      console.error('Error viewing data:', error);
    }
  };

  // Función para confirmar eliminación
  const confirmDelete = (file: UploadedFile) => {
    console.log({file})
    setFileToDelete(file);
    setShowDeleteModal(true);
  };

  // Función para eliminar archivo
  const handleDeleteFile = async () => {
    if (!fileToDelete) return;

    setDeleting(true);
    setError(null);

    try {
      console.log({fileToDelete});
      await apiService.deleteFileByNameAndDate(fileToDelete.fileName, fileToDelete.uploadedAt);
      
      // Remover el archivo de la lista local
      setFiles(prev => prev.filter(f => f.id !== fileToDelete.id));
      
      setSuccess(`Archivo "${fileToDelete.fileName}" eliminado exitosamente junto con todos sus registros.`);
      setShowDeleteModal(false);
      setFileToDelete(null);
      
      // Auto-cerrar mensaje de éxito
      setTimeout(() => setSuccess(null), 5000);
      
    } catch (error) {
      console.error('Error deleting file:', error);
      setError(error instanceof Error ? error.message : 'Error al eliminar archivo');
    } finally {
      setDeleting(false);
    }
  };

  // Función para cancelar eliminación
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setFileToDelete(null);
  };

  const formatDateSeparated = (isoString: string) => {
    if (!isoString) return { date: 'Fecha no disponible', time: '' };
    
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return { date: 'Fecha inválida', time: '' };
    
    return {
      date: date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subir Archivos</h1>
        <p className="text-gray-600">
          Sube archivos Excel (.xlsx, .xls) o CSV con datos de configuración SAP
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-400 mr-2" />
              <div className="text-red-600 text-sm font-medium">{error}</div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <div className="text-green-600 text-sm font-medium">{success}</div>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Arrastra archivos aquí o haz clic para seleccionar
          </h3>
          <p className="text-gray-500 mb-2">
            Archivos soportados: Excel (.xlsx, .xls) y CSV - Máximo 10MB
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Formato esperado: COMPANY, PRODUCT, VERSION, TABLE, PARAM_NAME, PARAM_VALUE, etc.
          </p>
          
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileInputChange}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          
          <label
            htmlFor="file-upload"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              uploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
            } transition-colors`}
          >
            {uploading ? 'Subiendo...' : 'Seleccionar Archivo'}
          </label>

          {/* Progress Bar */}
          {uploading && (
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{uploadProgress}% completado</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Historial de Subidas ({filteredFiles.length} de {files.length})
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                showFilters 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              {hasActiveFilters && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {Object.values(filters).filter(v => v !== '').length}
                </span>
              )}
            </button>
          </div>

          {/* Filtros */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Búsqueda por texto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buscar por texto
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={filters.textSearch}
                      onChange={(e) => handleFilterChange('textSearch', e.target.value)}
                      placeholder="Nombre de archivo..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Filtro por Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <select
                    value={filters.company}
                    onChange={(e) => handleFilterChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todas las companies</option>
                    {filterOptions.companies.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Version */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Version
                  </label>
                  <select
                    value={filters.version}
                    onChange={(e) => handleFilterChange('version', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    disabled={!filters.company && filterOptions.versions.length > 10} // Deshabilitar si hay muchas opciones sin filtrar
                  >
                    <option value="">Todas las versiones</option>
                    {filterOptions.versions.map(version => (
                      <option key={version} value={version}>{version}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de carga
                  </label>
                  <select
                    value={filters.uploadDate}
                    onChange={(e) => handleFilterChange('uploadDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todas las fechas</option>
                    {filterOptions.uploadDates.map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botón para limpiar filtros */}
              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Limpiar filtros</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {filteredFiles.length === 0 ? (
          <div className="p-8 text-center">
            <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {hasActiveFilters ? (
              <div>
                <p className="text-gray-500 mb-2">No se encontraron archivos con los filtros aplicados</p>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <p className="text-gray-500">No hay archivos subidos</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredFiles.map((file) => {
              const { date, time } = formatDateSeparated(file.uploadedAt);
              
              return (
                <div key={file.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <File className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {file.fileName}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">
                            {file.company}
                          </span>
                          <span className="text-sm text-gray-500">
                            {file.version}
                          </span>
                          <span className="text-sm text-gray-500">
                            {file.recordCount} registros
                          </span>
                          <span className="text-sm text-gray-500">
                           📅 {date}
                          </span>
                          <span className="text-sm text-gray-500">
                            🕐 {time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Status */}
                      <div className="flex items-center">
                        {file.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {file.status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                      </div>
                      {/* Delete Button */}
                      <button
                        onClick={() => confirmDelete(file)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar archivo y todos sus registros"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && fileToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmar eliminación
                </h3>
                <p className="text-sm text-gray-500">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                ¿Está seguro que desea eliminar el archivo:
              </p>
              <p className="font-semibold text-gray-900 bg-gray-50 p-3 rounded-lg">
                {fileToDelete.fileName}
              </p>
              <p className="text-sm text-red-600 mt-2">
                Se eliminarán <strong>{fileToDelete.recordCount} registros</strong> de la base de datos.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                disabled={deleting}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteFile}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;