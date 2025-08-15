import React, { useState, useEffect } from 'react';
import { Home, BarChart3, Upload, History, Filter, Download, Edit, Plus, Eye, X, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

const GESTORES = {
  VALLENOVA: ['Juan L. Herrero', 'Yolanda Alba', 'Ignacio Tejerina', 'Juan L. Blanco', 'Liliam Arroyo'],
  PROMOTOR: ['Pedro Zalama Casanova', 'Pedro Zalama Hernández', 'José Miguel Velasco']
};

const ESTADOS = {
  Libre: { color: 'bg-green-100 text-green-800', bgColor: 'bg-green-500' },
  Bloqueada: { color: 'bg-yellow-100 text-yellow-800', bgColor: 'bg-yellow-500' },
  Reservada: { color: 'bg-red-100 text-red-800', bgColor: 'bg-red-500' }
};

const PLANTILLA_DATOS = [
  {
    Portal: 'A',
    Planta: '1',
    Letra: 'A',
    Tipología: '2D',
    Orientación: 'Sur',
    Dormitorios: 2,
    'Superficie Útil + Terraza': 85.50,
    'Superficie Útil Vivienda': 65.20,
    'Superficie Útil Terrazas': 20.30,
    'PVP Final': 180000,
    Observaciones: 'Ejemplo de vivienda'
  }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viviendas, setViviendas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVivienda, setSelectedVivienda] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    portal: '',
    estado: '',
    tipologia: '',
    gestor: ''
  });

  // Función para agregar al historial
  const agregarHistorial = (vivienda, accion, detalles) => {
    const entrada = {
      id: Date.now() + Math.random(),
      fecha: new Date().toISOString(),
      vivienda: `${vivienda.portal || vivienda.Portal || ''}${vivienda.planta || vivienda.Planta || ''}${vivienda.letra || vivienda.Letra || ''}`,
      accion,
      detalles,
      usuario: 'Sistema'
    };
    setHistorial(prev => [entrada, ...prev]);
  };

  // Dashboard Component
  const Dashboard = () => {
    const stats = {
      total: viviendas.length,
      libre: viviendas.filter(v => v.estado === 'Libre').length,
      bloqueada: viviendas.filter(v => v.estado === 'Bloqueada').length,
      reservada: viviendas.filter(v => v.estado === 'Reservada').length
    };

    const porcentajes = {
      libre: stats.total ? Math.round((stats.libre / stats.total) * 100) : 0,
      bloqueada: stats.total ? Math.round((stats.bloqueada / stats.total) * 100) : 0,
      reservada: stats.total ? Math.round((stats.reservada / stats.total) * 100) : 0
    };

    if (viviendas.length === 0) {
      return (
        <div className="text-center py-12">
          <Home className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay viviendas</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza importando viviendas desde la pestaña "Importar"
          </p>
          <p className="mt-2 text-xs text-blue-600">
            💡 Los datos se mantienen durante la sesión actual
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Viviendas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-500 rounded-full" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Libres</p>
                <p className="text-2xl font-bold text-green-600">{stats.libre}</p>
                <p className="text-xs text-gray-500">{porcentajes.libre}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-500 rounded-full" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Bloqueadas</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.bloqueada}</p>
                <p className="text-xs text-gray-500">{porcentajes.bloqueada}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-500 rounded-full" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Reservadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.reservada}</p>
                <p className="text-xs text-gray-500">{porcentajes.reservada}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución por Portal</h3>
          <div className="grid grid-cols-3 gap-4">
            {['A', 'B', 'C'].map(portal => {
              const viviendasPortal = viviendas.filter(v => v.portal === portal);
              const statsPortal = {
                total: viviendasPortal.length,
                libre: viviendasPortal.filter(v => v.estado === 'Libre').length,
                bloqueada: viviendasPortal.filter(v => v.estado === 'Bloqueada').length,
                reservada: viviendasPortal.filter(v => v.estado === 'Reservada').length
              };

              return (
                <div key={portal} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-center mb-3">Portal {portal}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="font-medium">{statsPortal.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-600">Libres:</span>
                      <span className="font-medium text-green-600">{statsPortal.libre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-yellow-600">Bloqueadas:</span>
                      <span className="font-medium text-yellow-600">{statsPortal.bloqueada}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-red-600">Reservadas:</span>
                      <span className="font-medium text-red-600">{statsPortal.reservada}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Modal Component
  const Modal = ({ vivienda, onClose, onSave }) => {
    const [nuevoEstado, setNuevoEstado] = useState(vivienda?.estado || '');
    const [empresa, setEmpresa] = useState(vivienda?.gestor || '');
    const [responsable, setResponsable] = useState(vivienda?.ultimo_responsable || '');
    const [observaciones, setObservaciones] = useState(vivienda?.observaciones || '');
    const [guardando, setGuardando] = useState(false);

    const handleSave = async () => {
      if (!nuevoEstado) return;

      setGuardando(true);
      
      // Simular delay de guardado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const cambios = {
          estado: nuevoEstado,
          gestor: nuevoEstado === 'Libre' ? '' : empresa,
          ultimo_responsable: nuevoEstado === 'Libre' ? '' : responsable,
          observaciones: observaciones,
          updated_at: new Date().toISOString()
        };

        onSave(cambios);
        onClose();
      } catch (error) {
        console.error('Error guardando cambios:', error);
        alert('Error al guardar los cambios');
      } finally {
        setGuardando(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Editar Vivienda {vivienda?.portal}{vivienda?.planta}{vivienda?.letra}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {nuevoEstado === 'Libre' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Nota:</strong> Al cambiar a estado "Libre", se eliminarán automáticamente la empresa y el responsable asignados.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={nuevoEstado}
                onChange={(e) => {
                  setNuevoEstado(e.target.value);
                  // Si cambia a Libre, limpiar empresa y responsable
                  if (e.target.value === 'Libre') {
                    setEmpresa('');
                    setResponsable('');
                  }
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Seleccionar estado</option>
                {Object.keys(ESTADOS).map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
              <select
                value={empresa}
                onChange={(e) => {
                  setEmpresa(e.target.value);
                  setResponsable('');
                }}
                disabled={nuevoEstado === 'Libre'}
                className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">
                  {nuevoEstado === 'Libre' ? 'No aplicable para viviendas libres' : 'Seleccionar empresa'}
                </option>
                {Object.keys(GESTORES).map(emp => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
            </div>

            {empresa && nuevoEstado !== 'Libre' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Responsable</label>
                <select
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Seleccionar responsable</option>
                  {GESTORES[empresa].map(resp => (
                    <option key={resp} value={resp}>{resp}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows="3"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!nuevoEstado || guardando}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {guardando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Lista de Viviendas Component
  const Viviendas = () => {
    const viviendasFiltradas = viviendas.filter(vivienda => {
      return (
        (!filtros.portal || vivienda.portal === filtros.portal) &&
        (!filtros.estado || vivienda.estado === filtros.estado) &&
        (!filtros.tipologia || vivienda.tipologia === filtros.tipologia) &&
        (!filtros.gestor || vivienda.gestor === filtros.gestor)
      );
    });

    const exportarExcel = () => {
      if (viviendas.length === 0) {
        alert('No hay viviendas para exportar');
        return;
      }

      const datosExport = viviendas.map(v => ({
        Portal: v.portal,
        Planta: v.planta,
        Letra: v.letra,
        Tipología: v.tipologia,
        Orientación: v.orientacion,
        Dormitorios: v.dormitorios,
        'Superficie Útil + Terraza': parseFloat(v.superficie_util_terraza).toFixed(2),
        'Superficie Útil Vivienda': parseFloat(v.superficie_util_vivienda).toFixed(2),
        'Superficie Útil Terrazas': parseFloat(v.superficie_util_terrazas).toFixed(2),
        'PVP Final': v.pvp_final,
        Observaciones: v.observaciones,
        Estado: v.estado,
        Gestor: v.gestor,
        'Último Responsable': v.ultimo_responsable
      }));

      const ws = XLSX.utils.json_to_sheet(datosExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Viviendas');
      XLSX.writeFile(wb, `lubens_farnesio_viviendas_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    if (viviendas.length === 0) {
      return (
        <div className="text-center py-12">
          <Home className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay viviendas</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza importando viviendas desde la pestaña "Importar"
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Filtros</h3>
            <button
              onClick={exportarExcel}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filtros.portal}
              onChange={(e) => setFiltros(prev => ({ ...prev, portal: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Todos los portales</option>
              <option value="A">Portal A</option>
              <option value="B">Portal B</option>
              <option value="C">Portal C</option>
            </select>

            <select
              value={filtros.estado}
              onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Todos los estados</option>
              {Object.keys(ESTADOS).map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>

            <select
              value={filtros.tipologia}
              onChange={(e) => setFiltros(prev => ({ ...prev, tipologia: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Todas las tipologías</option>
              <option value="1D">1D</option>
              <option value="2D">2D</option>
              <option value="3D">3D</option>
            </select>

            <select
              value={filtros.gestor}
              onChange={(e) => setFiltros(prev => ({ ...prev, gestor: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Todos los gestores</option>
              {Object.keys(GESTORES).map(gestor => (
                <option key={gestor} value={gestor}>{gestor}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla de viviendas */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vivienda</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipología</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Superficie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PVP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {viviendasFiltradas.map((vivienda) => (
                  <tr key={vivienda.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {vivienda.portal}{vivienda.planta}{vivienda.letra}
                      </div>
                      <div className="text-sm text-gray-500">
                        Portal {vivienda.portal} - Planta {vivienda.planta}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vivienda.tipologia}</div>
                      <div className="text-sm text-gray-500">
                        {vivienda.dormitorios} {vivienda.dormitorios === 1 ? 'dormitorio' : 'dormitorios'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{parseFloat(vivienda.superficie_util_terraza).toFixed(2)} m²</div>
                      <div className="text-sm text-gray-500">
                        Viv: {parseFloat(vivienda.superficie_util_vivienda).toFixed(2)} m² + Ter: {parseFloat(vivienda.superficie_util_terrazas).toFixed(2)} m²
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(vivienda.pvp_final)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ESTADOS[vivienda.estado]?.color}`}>
                        {vivienda.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vivienda.ultimo_responsable || '-'}</div>
                      <div className="text-sm text-gray-500">{vivienda.gestor || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedVivienda(vivienda);
                          setModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
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

  // Importar Component
  const Importar = () => {
    const [archivo, setArchivo] = useState(null);
    const [previsualizacion, setPrevisualizacion] = useState([]);
    const [importando, setImportando] = useState(false);

    const descargarPlantilla = () => {
      const ws = XLSX.utils.json_to_sheet(PLANTILLA_DATOS);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
      XLSX.writeFile(wb, 'plantilla_lubens_farnesio.xlsx');
    };

    const manejarArchivo = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      setArchivo(file);
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          setPrevisualizacion(jsonData.slice(0, 5)); // Mostrar primeras 5 filas
        } catch (error) {
          alert('Error al leer el archivo. Asegúrate de que sea un archivo Excel válido.');
          console.error(error);
        }
      };

      reader.readAsArrayBuffer(file);
    };

    const confirmarImportacion = async () => {
      if (!archivo) return;

      setImportando(true);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          // Simular delay de importación
          await new Promise(resolve => setTimeout(resolve, 1000));

          const nuevasViviendas = jsonData.map((row, index) => ({
            id: Date.now() + index,
            portal: row.Portal || '',
            planta: row.Planta || '',
            letra: row.Letra || '',
            tipologia: row.Tipología || '',
            orientacion: row.Orientación || '',
            dormitorios: parseInt(row.Dormitorios) || 0,
            superficie_util_terraza: parseFloat(row['Superficie Útil + Terraza'] || 0).toFixed(2),
            superficie_util_vivienda: parseFloat(row['Superficie Útil Vivienda'] || 0).toFixed(2),
            superficie_util_terrazas: parseFloat(row['Superficie Útil Terrazas'] || 0).toFixed(2),
            pvp_final: parseFloat(row['PVP Final']) || 0,
            observaciones: row.Observaciones || '',
            estado: 'Libre',
            gestor: '',
            ultimo_responsable: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));

          // Actualizar estado local
          setViviendas(prev => [...prev, ...nuevasViviendas]);

          // Agregar al historial
          agregarHistorial(
            { Portal: 'Sistema', Planta: '', Letra: '' },
            'Importación',
            `Se importaron ${nuevasViviendas.length} viviendas desde ${archivo.name}`
          );

          setArchivo(null);
          setPrevisualizacion([]);
          alert(`Se importaron ${nuevasViviendas.length} viviendas correctamente.`);
        } catch (error) {
          console.error('Error al importar:', error);
          alert('Error al importar el archivo. Verifica el formato.');
        } finally {
          setImportando(false);
        }
      };

      reader.readAsArrayBuffer(archivo);
    };

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-blue-400">ℹ️</div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Demo Version:</strong> Los datos se mantienen solo durante la sesión actual. 
                Para persistencia real, implementa la conexión con Supabase en tu proyecto local.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Descargar Plantilla</h3>
          <p className="text-gray-600 mb-4">
            Descarga la plantilla Excel con las columnas correctas para importar viviendas.
          </p>
          <button
            onClick={descargarPlantilla}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar Plantilla Excel
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Importar Viviendas</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar archivo Excel
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={manejarArchivo}
              disabled={importando}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
          </div>

          {previsualizacion.length > 0 && (
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Previsualización (primeras 5 filas)</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(previsualizacion[0]).map(key => (
                        <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previsualizacion.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="px-4 py-2 text-sm text-gray-900">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <button
                onClick={confirmarImportacion}
                disabled={importando}
                className="mt-4 flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {importando ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {importando ? 'Importando...' : 'Confirmar Importación'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Historial Component
  const Historial = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Historial de Cambios</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {historial.length === 0 ? (
              <div className="px-6 py-4 text-center text-gray-500">
                No hay cambios registrados
              </div>
            ) : (
              historial.map((entrada) => (
                <div key={entrada.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <History className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {entrada.vivienda} - {entrada.accion}
                        </p>
                        <p className="text-sm text-gray-500">{entrada.detalles}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(entrada.fecha).toLocaleString('es-ES')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // Manejar guardado de cambios en modal
  const manejarGuardadoModal = (cambios) => {
    // Actualizar estado local
    setViviendas(prev => prev.map(vivienda => 
      vivienda.id === selectedVivienda.id 
        ? { ...vivienda, ...cambios }
        : vivienda
    ));

    agregarHistorial(
      selectedVivienda,
      'Actualización',
      cambios.estado === 'Libre' 
        ? `Estado cambiado a ${cambios.estado} - Empresa y responsable eliminados`
        : `Estado cambiado a ${cambios.estado}${cambios.ultimo_responsable ? ` - Responsable: ${cambios.ultimo_responsable}` : ''}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LUBENS FARNESIO</h1>
                <p className="text-sm text-gray-500">Gestión de Viviendas</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Demo Version</p>
              <p className="text-xs text-blue-600">Datos en memoria</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
              { id: 'viviendas', name: 'Viviendas', icon: Home },
              { id: 'importar', name: 'Importar', icon: Upload },
              { id: 'historial', name: 'Historial', icon: History }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-1 py-4 border-b-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'viviendas' && <Viviendas />}
        {activeTab === 'importar' && <Importar />}
        {activeTab === 'historial' && <Historial />}
      </main>

      {/* Modal */}
      {modalOpen && selectedVivienda && (
        <Modal
          vivienda={selectedVivienda}
          onClose={() => {
            setModalOpen(false);
            setSelectedVivienda(null);
          }}
          onSave={manejarGuardadoModal}
        />
      )}
    </div>
  );
}

export default App;