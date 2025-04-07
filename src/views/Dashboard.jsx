import { useEffect, useState, useMemo } from "react";
import { FileDown } from "lucide-react"
import { toast, ToastContainer } from "react-toastify";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL2 = import.meta.env.VITE_API_BASE_URL2;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TbUserDollar } from "react-icons/tb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users, UserX, Check, X, MapPin, Edit } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/dashboard/Navbar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { fetchDonaciones } from '../services/donationsService';
import { getCampusIdByCityId } from '../services/campusService';
import AuthService from "../services/AuthService";
import { useAuth } from "../contexts/AuthContext";
import style from "../styles/admin.module.css";
import { Button } from "@/components/ui/button";
import { api, mainEndpoints } from '../services/axiosConfig';
const ITEMS_PER_PAGE = 9;
import { FaFileDownload } from "react-icons/fa";
// Importar la librería para exportar Excel
import * as XLSX from 'xlsx';


const AdminDashboard = () => {
  const navigate = useNavigate();
  const {refreshAuthState, currentUser, logout } = useAuth();
  let { loading } = useAuth();
  const [ loadingInfo, setLoadingInfo] = useState(true);
  const [campusId, setCampusId] = useState("");
  const [data, setData] = useState({
    notRegistered: 0,
    totalRegistrados: 0,
    registrosIncompletos: 0,
    campersPendientes: [],
    campusName: null,
    Donaciones: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [notRegisteredUsers, setNotRegisteredUsers] = useState([]);
  const [donaciones, setDonaciones] = useState([]);
  const [loadingDonaciones, setLoadingDonaciones] = useState(false);
  let isRegionalAdmin;

  const campusNames = {
    1: "Bucaramanga",
    2: "Bogotá",
    3: "Tibú"
  };

  useEffect(() => {
    const checkAuth = async () => {
      const autoRedirect = await AuthService.checkAuth();
      if (autoRedirect) navigate(autoRedirect);
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter]);

  useEffect(() => {
    const essentialData = async (cityId) => {
      const campusId = await getCampusIdByCityId(cityId);
      setCampusId(campusId.id);
      getCampersData(campusId.id);
    }

    if (currentUser) {
      
      essentialData(currentUser.cityId);
      isRegionalAdmin = currentUser.role === 5;
    }
  }, [currentUser]);

  const getNoRegisteredUsers = async (campusIdParam) => {
    try {
      const noRegisteredUsers = await api.get(
        `${mainEndpoints.admin}/${campusIdParam}/getAllUnlisted`
      );

      
      // Corrección aquí - usa noRegisteredUsers en lugar de response
      setNotRegisteredUsers(noRegisteredUsers.data.data || []);
      
      setData((prevData) => ({
        ...prevData,
        notRegistered: noRegisteredUsers.data.data?.length || 0,
      }));
    } catch (error) {
      console.error("Error al obtener usuarios no registrados:", error);
      toast.error("Upps.. no se encontraron usuarios no registrados");
    }
  };

  const getCampersData = async (campusIdParam) => {
    try {
      setLoadingInfo(true);
      let endpoint = `${mainEndpoints.campers}/all/details`;

      if (currentUser.role === 5) {
        endpoint = `${mainEndpoints.admin}/campers/my-campus`;
      }

      const regionCampers = (await api.get(endpoint)).data.data;

      let allCampers = [];
      let campusName = null;

      if (currentUser.role === 5) {
        allCampers = regionCampers.campers || [];
        campusName = regionCampers.campusName;
      } else {
        allCampers = regionCampers || [];
      }

      const incompleteCount = allCampers.filter(
        (camper) =>
          !(
            camper.main_video_url &&
            camper.dreams?.length > 0 &&
            camper.projects?.length > 0 &&
            camper.videos?.length > 0
          )
      ).length;

      setData({
        notRegistered: 0, 
        totalRegistrados: allCampers.length,
        registrosIncompletos: incompleteCount,
        campersPendientes: allCampers.map((camper) => ({
          ...camper,
          isComplete: !!(
            camper.main_video_url &&
            camper.dreams?.length > 0 &&
            camper.projects?.length > 0 &&
            camper.videos?.length > 0
          ),
          hasDreams: camper.dreams?.length > 0,
          hasProjects: camper.projects?.length > 0,
          hasVideos: camper.videos?.length > 0,
        })),
        campusName: campusName,
        Donaciones: 0,
      });

      await getNoRegisteredUsers(campusIdParam);
      await getDonations(campusIdParam);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoadingInfo(false);
    }
  };

  const getDonations = async (campusIdParam) => {
    try {
      setLoadingDonaciones(true);
      const regionDonations = await fetchDonaciones(campusIdParam);

      setDonaciones(regionDonations || []);

      setData((prevData) => ({
        ...prevData,
        Donaciones: regionDonations.data.length || 0,
      }));
    } catch (error) {
      console.error("Error al obtener las donaciones:", error);
      toast.error("Error al cargar las donaciones");
    } finally {
      setLoadingDonaciones(false);
    }
  };

  const filteredCampers = useMemo(() => {
    let filtered = [];
  
    if (activeFilter === "Donados") {
      return []; // Retornamos un array vacío porque mostraremos la tabla de donaciones
    } else if (activeFilter === "notRegistred") {
      // Filtramos los usuarios no registrados por nombre si hay búsqueda
      filtered = notRegisteredUsers || [];
      if (searchTerm) {
        filtered = filtered.filter((user) =>
          (user?.full_name || user?.nombre || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      }
    } else {
      filtered = data.campersPendientes || []; // Add fallback to empty array
  
      // Filtro por nombre
      if (searchTerm) {
        filtered = filtered.filter((camper) =>
          camper?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
  
      // Filtro por estado
      switch (activeFilter) {
        case "pending":
          filtered = filtered.filter((camper) => !camper.isComplete);
          break;
        case "complete":
          filtered = filtered.filter((camper) => camper.isComplete);
          break;
        default:
          break;
      }
    }
  
    return filtered || []; // Ensure return value is always an array
  }, [notRegisteredUsers, data.campersPendientes, searchTerm, activeFilter]);
  
  // Modify these lines to add safety checks
  const totalPages = Math.ceil((filteredCampers?.length || 0) / ITEMS_PER_PAGE);
  const paginatedCampers = (filteredCampers || []).slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Función para descargar datos en Excel
  const downloadExcel = () => {
    let dataToExport = [];
    let fileName = "datos_dashboard.xlsx";

    // Determinar qué datos exportar según el filtro activo
    if (activeFilter === "Donados") {
      // Exportar datos de donaciones
      dataToExport = donaciones.map(item => ({
        'Nombre del Camper': item.full_name,
        'Donador': item.NOMBRE_DONADOR,
        'Cantidad Donada': item.amount,
        'Fecha': new Date(item.created_at).toLocaleDateString()
      }));
      fileName = "donaciones.xlsx";
    } else if (activeFilter === "notRegistred") {
      // Exportar datos de usuarios no registrados
      dataToExport = notRegisteredUsers.map((user, index) => ({
        '#': index + 1,
        'Nombre Completo': user.full_name || user.nombre || "Sin nombre",
        'Documento': user.documentoNumero || "Sin documento"
      }));
      fileName = "usuarios_no_registrados.xlsx";
    } else {
      // Exportar datos de campers (filtrados según activeFilter)
      dataToExport = filteredCampers.map(camper => ({
        'Nombre': camper.full_name,
        'Video Principal': camper.main_video_url ? "Sí" : "No",
        'Sueños': camper.hasDreams ? "Sí" : "No",
        'Proyectos': camper.hasProjects ? "Sí" : "No",
        'Videos': camper.hasVideos ? "Sí" : "No",
        'Estado': camper.isComplete ? "Completo" : "Pendiente",
        'Campus': campusNames[camper.campus_id] || "Otro"
      }));

      // Ajustar nombre del archivo según el filtro
      if (activeFilter === "pending") {
        fileName = "campers_pendientes.xlsx";
      } else if (activeFilter === "complete") {
        fileName = "campers_completos.xlsx";
      } else {
        fileName = "todos_los_campers.xlsx";
      }
    }

    // Crear libro y hoja de trabajo
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

    // Generar y descargar el archivo Excel
    XLSX.writeFile(workbook, fileName);

    // Mostrar mensaje de éxito
    toast.success(`Archivo ${fileName} descargado correctamente`);
  };

  if (loadingInfo) {
    return (
      <div className="min-h-screen bg-[#1E1B4B] text-white font-sans relative overflow-hidden flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  const renderStatusIcon = (status) => (
    <div className="flex justify-center items-center">
      {status ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />}
    </div>
  );

  // Tabla de donaciones
  const DonacionesTable = () => {

    const paginatedDonaciones = donaciones.data.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

    const totalDonacionesPages = Math.ceil(donaciones.length / ITEMS_PER_PAGE);

    return (
      <>
        {/* Versión desktop */}
        <div className="hidden [@media(min-width:1031px)]:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white/80 whitespace-nowrap">Nombre del Camper</TableHead>
                  <TableHead className="text-white/80 text-center whitespace-nowrap">Donador</TableHead>
                  <TableHead className="text-white/80 text-center whitespace-nowrap">Cantidad donada</TableHead>
                  <TableHead className="text-white/80 text-center whitespace-nowrap">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingDonaciones ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Cargando información de donaciones...
                    </TableCell>
                  </TableRow>
                ) : paginatedDonaciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No hay donaciones registradas.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDonaciones.map((donacion, index) => (
                    <TableRow key={index} className="border-white/10 hover:bg-white/5 transition">
                      <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                        {donacion.full_name}
                      </TableCell>
                      <TableCell className="text-center">{donacion.NOMBRE_DONADOR}</TableCell>
                      <TableCell className="text-center">${donacion.amount}</TableCell>
                      <TableCell className="text-center">{new Date(donacion.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Versión mobile */}
        <div className="block [@media(min-width:1031px)]:hidden grid gap-4">
          {loadingDonaciones ? (
            <div className="text-center py-8">Cargando información de donaciones...</div>
          ) : paginatedDonaciones.length === 0 ? (
            <div className="text-center py-8">No hay donaciones registradas.</div>
          ) : (
            paginatedDonaciones.map((donacion, index) => (
              <Card key={index} className={`${style.tarjeta2} bg-[#3B3768] border border-white/10 p-3 rounded-lg flex flex-col items-center text-center gap-2`}>
                <h3 className="truncate text-lg font-medium">{donacion.full_name}</h3>
                <div className="grid grid-cols-1 gap-1 w-full">
                  <div className="flex justify-between"><span className="text-white/70">Donador:</span> <span>{donacion.NOMBRE_DONADOR}</span></div>
                  <div className="flex justify-between"><span className="text-white/70">Cantidad:</span> <span>${donacion.amount}</span></div>
                  <div className="flex justify-between"><span className="text-white/70">Fecha:</span> <span>{new Date(donacion.created_at).toLocaleDateString()}</span></div>
                </div>
              </Card>
            ))
          )}
        </div>

        {!loadingDonaciones && totalDonacionesPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent className="gap-2 flex-wrap">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="transition-transform transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed rounded-full p-2 text-[1px]"
                  />
                </PaginationItem>
                {(() => {
                  // Determinar el rango de páginas a mostrar
                  let startPage = Math.max(1, currentPage - 2);
                  let endPage = Math.min(totalDonacionesPages, startPage + 4);

                  // Ajustar el rango si estamos cerca del final
                  if (endPage - startPage < 4) {
                    startPage = Math.max(1, endPage - 4);
                  }

                  // Crear el array de páginas a mostrar
                  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className={`rounded-medium px-3 py-2 text-[12px] font-medium transition-colors ${currentPage === page
                          ? 'bg-transparent text-blue'
                          : 'text-white-700 hover:bg-white-200'
                          }`}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ));
                })()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(totalDonacionesPages, prev + 1))}
                    disabled={currentPage === totalDonacionesPages}
                    className="transition-transform transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed rounded-full p-2 text-[1px]"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </>
    );
  };

  // Tabla de usuarios no registrados
  const NoRegistradosTable = ({ 
    notRegisteredUsers = [], 
    loading = false, 
    currentPage = 1, 
    setCurrentPage, 
    ITEMS_PER_PAGE = 10,
    style 
  }) => {
    // Ahora notRegisteredUsers es directamente el array
    const safeUsers = notRegisteredUsers || [];
    
    const paginatedUsers = safeUsers.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
    
    const totalNoRegistradosPages = Math.ceil(safeUsers.length / ITEMS_PER_PAGE);
  
  
    return (
      <>
        {/* Versión desktop */}
        <div className="hidden [@media(min-width:1031px)]:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white/80 whitespace-nowrap">#</TableHead>
                  <TableHead className="text-white/80 whitespace-nowrap">Nombre Completo</TableHead>
                  <TableHead className="text-white/80 text-center whitespace-nowrap">Documento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      Cargando información de usuarios no registrados...
                    </TableCell>
                  </TableRow>
                ) : paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      No hay usuarios no registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user, index) => (
                    <TableRow key={index} className="border-white/10 hover:bg-white/5 transition">
                      <TableCell className="whitespace-nowrap">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </TableCell>
                      <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                        {user.full_name || user.nombre || "Sin nombre"}
                      </TableCell>
                      <TableCell className="text-center">
                        {user.documentoNumero || "Sin documento"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
  
        {/* Versión mobile */}
        <div className="block [@media(min-width:1031px)]:hidden grid gap-4">
          {loading ? (
            <div className="text-center py-8">Cargando información de usuarios no registrados...</div>
          ) : paginatedUsers.length === 0 ? (
            <div className="text-center py-8">No hay usuarios no registrados.</div>
          ) : (
            paginatedUsers.map((user, index) => (
              <Card key={index} className={`${style?.tarjeta2 || ''} bg-[#3B3768] border border-white/10 p-3 rounded-lg flex flex-col items-center text-center gap-2`}>
                <div className="bg-white/10 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                  {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                </div>
                <h3 className="truncate text-lg font-medium">{user.full_name || user.nombre || "Sin nombre"}</h3>
                <div className="text-white/70">Documento: {user.documentoNumero || "Sin documento"}</div>
              </Card>
            ))
          )}
        </div>
  
        {!loading && totalNoRegistradosPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent className="gap-2 flex-wrap">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="transition-transform transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed rounded-full p-2 text-[1px]"
                  />
                </PaginationItem>
                {(() => {
                  // Determinar el rango de páginas a mostrar
                  let startPage = Math.max(1, currentPage - 2);
                  let endPage = Math.min(totalNoRegistradosPages, startPage + 4);
  
                  // Ajustar el rango si estamos cerca del final
                  if (endPage - startPage < 4) {
                    startPage = Math.max(1, endPage - 4);
                  }
  
                  // Crear el array de páginas a mostrar
                  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className={`rounded-medium px-3 py-2 text-[12px] font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-transparent text-blue'
                            : 'text-white-700 hover:bg-white-200'
                        }`}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ));
                })()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(totalNoRegistradosPages, prev + 1))}
                    disabled={currentPage === totalNoRegistradosPages}
                    className="transition-transform transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed rounded-full p-2 text-[1px]"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#07073b] text-white font-sans ">
      <ToastContainer theme="dark" />
      <Navbar />
      <div className="flex-1 flex flex-col w-full px-5 overflow-hidden">
        <header className="backdrop-blur-xl m-2 sticky pt-4 z-10 bg-transparent">
          <CardTitle className="flex justify-center flex-wrap">
            <div className="items-center">
              {activeFilter === "Donados"
                ? "Registro de Donaciones"
                : activeFilter === "notRegistred"
                ? "Usuarios No Registrados"
                : isRegionalAdmin
                ? `Campers del Campus ${data.campusName}`
                : "Estado de Registro de Campers"}
            </div>
          </CardTitle>
          <CardDescription>
            <div className="text-center">
              {activeFilter === "Donados"
                ? "Listado de las donaciones realizadas a los campers"
                : activeFilter === "notRegistred"
                ? "Campers que aún no se han registrado en la plataforma"
                : "Seguimiento detallado del progreso de registro"}
            </div>
          </CardDescription>
        </header>

        <main className="h-dvh items-center md:p-2 pr-2 flex-1 overflow-auto">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg m-2 mr-1 md:p-4">
            <div className="flex flex-row-reverse">
              <button
                onClick={downloadExcel}
                className="hover:scale-110 transition-transform flex  items-center gap-2"
                title="Descargar Excel"
              >
                <FileDown className={`${style.icono} h-5 w-5 mx-6 text-white`} />
              </button>
            </div>
            <CardHeader className="text-center">
              <div className="flex flex-col md:flex-row items-start justify-between  pl-2 py-5">
                <div className="relative w-full md:w-72 mb-4 md:mb-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar camper..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10  bg-white/5 border-white/10 text-white placeholder:text-white/60 w-full"
                  />
                </div>
                <div className="flex flex-wrap gap-2 md:gap-4 items-center  text-white">
                  {[
                    "Donados",
                    "notRegistred",
                    "all",
                    "pending",
                    "complete",
                  ].map((f) => (
                    <Badge
                      key={f}
                      variant={activeFilter === f ? "default" : "secondary"}
                      className={`cursor-pointer py-2 px-4 rounded 
                    ${
                      activeFilter === f ? "bg-white/10" : "hover:bg-white/10"
                    }`}
                      onClick={() => setActiveFilter(f)}
                    >
                      {f === "Donados" && (
                        <>
                          <TbUserDollar className="h-4 w-4 mr-1" /> Donados (
                          {data.Donaciones})
                        </>
                      )}
                      {f === "notRegistred" && (
  <>
    <Users className="h-4 w-4 mr-1" /> No Registrados (
    {notRegisteredUsers.length})
  </>
)}
                      {f === "all" && (
                        <>
                          <Users className="h-4 w-4 mr-1" /> Todos (
                          {data.totalRegistrados})
                        </>
                      )}
                      {f === "pending" && (
                        <>
                          <UserX className="h-4 w-4 mr-1" /> Pendientes (
                          {data.registrosIncompletos})
                        </>
                      )}
                      {f === "complete" && (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Completados (
                          {data.totalRegistrados - data.registrosIncompletos})
                        </>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activeFilter === "Donados" ? (
                <DonacionesTable />
              ) : activeFilter === "notRegistred" ? (
                <NoRegistradosTable 
  notRegisteredUsers={notRegisteredUsers}
  loading={loadingInfo}
  currentPage={currentPage}
  setCurrentPage={setCurrentPage}
  ITEMS_PER_PAGE={ITEMS_PER_PAGE}
  style={style}
/>
              ) : (
                <>
                  {/* Versión desktop para la tabla principal de campers */}
                  <div className="hidden [@media(min-width:1031px)]:block">
                    <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-lg pl-3">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/10">
                            <TableHead className="text-white/80 whitespace-nowrap">
                              Foto
                            </TableHead>
                            <TableHead className="text-white/80 whitespace-nowrap">
                              Nombre
                            </TableHead>
                            <TableHead className="text-white/80 text-center whitespace-nowrap">
                              Video Principal
                            </TableHead>
                            <TableHead className="text-white/80 text-center whitespace-nowrap">
                              Sueños
                            </TableHead>
                            <TableHead className="text-white/80 text-center whitespace-nowrap">
                              Proyectos
                            </TableHead>
                            <TableHead className="text-white/80 text-center whitespace-nowrap">
                              Videos
                            </TableHead>
                            <TableHead className="text-white/80 p-3 w-2 whitespace-nowrap">
                              Estado
                            </TableHead>
                            <TableHead className="text-white/80 text-center whitespace-nowrap">
                              Campus
                            </TableHead>
                            <TableHead className="text-white/80 whitespace-nowrap flex items-center justify-center">
                              Editar
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell
                                colSpan={7}
                                className="text-center py-8"
                              >
                                Cargando información...
                              </TableCell>
                            </TableRow>
                          ) : paginatedCampers.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={7}
                                className="text-center py-8"
                              >
                                No se encontraron campers que coincidan con los
                                criterios de búsqueda.
                              </TableCell>
                            </TableRow>
                          ) : (
                            paginatedCampers.map((camper) => (
                              <TableRow
                                key={camper.camper_id}
                                className="border-white/10 hover:bg-white/5 transition"
                              >
                                <TableCell>
                                  <img
                                    src={
                                      camper.profile_picture ||
                                      "/api/placeholder/40/40"
                                    }
                                    alt={camper.full_name}
                                    className="w-10 h-10 rounded-full object-cover border border-white/20"
                                  />
                                </TableCell>
                                <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                                  {camper.full_name}
                                </TableCell>
                                <TableCell className="text-center">
                                  {renderStatusIcon(camper.main_video_url)}
                                </TableCell>
                                <TableCell className="text-center">
                                  {renderStatusIcon(camper.hasDreams)}
                                </TableCell>
                                <TableCell className="text-center">
                                  {renderStatusIcon(camper.hasProjects)}
                                </TableCell>
                                <TableCell className="text-center">
                                  {renderStatusIcon(camper.hasVideos)}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  <Badge
                                    variant={
                                      camper.isComplete
                                        ? "success"
                                        : "destructive"
                                    }
                                  >
                                    {camper.isComplete
                                      ? "Completo"
                                      : "Pendiente"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center font-bold text-xs">
                                  {campusNames[camper.campus_id] || "Otro"}
                                </TableCell>
                                <TableCell className="flex items-end justify-center mt-2.5">
                                  <a
                                    href={`${API_BASE_URL2}/login?redirect=/campers/profile/${camper.camper_id}/edit`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button variant="ghostNoHover" size="icon">
                                      <Edit className="h-5" />
                                    </Button>
                                  </a>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="block [@media(min-width:1031px)]:hidden grid gap-4">
                    {paginatedCampers.length === 0 ? (
                      <div className="text-center py-8">
                        No se encontraron campers.
                      </div>
                    ) : (
                      paginatedCampers.map((camper) => (
                        <Card
                          key={camper.camper_id}
                          className={`${style.tarjeta} bg-[#07073b] border border-white/10 p-2 rounded-lg flex flex-col items-center text-center gap-3`}
                        >
                          <img
                            src={
                              camper.profile_picture ||
                              "/api/placeholder/100/100"
                            }
                            alt={camper.full_name}
                            className="w-20 h-20 rounded-full"
                          />
                          <h3 className="truncate">{camper.full_name}</h3>
                          <div className="flex justify-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1">
                              {renderStatusIcon(camper.main_video_url)}
                              <span className="text-xs">Video Principal</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {renderStatusIcon(camper.hasDreams)}
                              <span className="text-xs">Sueños</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {renderStatusIcon(camper.hasProjects)}
                              <span className="text-xs">Proyectos</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {renderStatusIcon(camper.hasVideos)}
                              <span className="text-xs">Videos</span>
                            </div>
                          </div>
                          <Badge
                            variant={
                              camper.isComplete ? "success" : "destructive"
                            }
                          >
                            {camper.isComplete ? "Completo" : "Pendiente"}
                          </Badge>
                          <div className="flex items-center gap-1">
                            Editar:
                            <span className="text-xs">
                              <Link
                                to={`${API_BASE_URL}/campers/profile/${camper.camper_id}/edit`}
                              >
                                <Button variant="ghostNoHover" size="icon">
                                  <Edit className="h-4 flex items-center justify-center mt-1" />
                                </Button>
                              </Link>
                            </span>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>

                  {/* Paginación */}
                  {!loading && (
                    <>
                      {/* Paginación condicional: solo se muestra para la tabla principal, no para Donados ni No Registrados */}
                      {activeFilter !== "Donados" &&
                        activeFilter !== "notRegistred" &&
                        totalPages > 1 && (
                          <div className="mt-6 flex justify-center">
                            <Pagination>
                              <PaginationContent className="gap-2 flex-wrap">
                                <PaginationItem>
                                  <PaginationPrevious
                                    onClick={() =>
                                      setCurrentPage((prev) =>
                                        Math.max(1, prev - 1)
                                      )
                                    }
                                    disabled={currentPage === 1}
                                    className="transition-transform transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed rounded-full p-2 text-[1px]"
                                  />
                                </PaginationItem>
                                {(() => {
                                  // Determinar el rango de páginas a mostrar
                                  let startPage = Math.max(1, currentPage - 2);
                                  let endPage = Math.min(
                                    totalPages,
                                    startPage + 4
                                  );

                                  // Ajustar el rango si estamos cerca del final
                                  if (endPage - startPage < 4) {
                                    startPage = Math.max(1, endPage - 4);
                                  }

                                  // Crear el array de páginas a mostrar
                                  return Array.from(
                                    { length: endPage - startPage + 1 },
                                    (_, i) => startPage + i
                                  ).map((page) => (
                                    <PaginationItem key={page}>
                                      <PaginationLink
                                        onClick={() => setCurrentPage(page)}
                                        isActive={currentPage === page}
                                        className={`rounded-medium px-3 py-2 text-[12px] font-medium transition-colors ${
                                          currentPage === page
                                            ? "bg-[transparent] text-blue"
                                            : "text-white-700 hover:bg-white-200"
                                        }`}
                                      >
                                        {page}
                                      </PaginationLink>
                                    </PaginationItem>
                                  ));
                                })()}
                                <PaginationItem>
                                  <PaginationNext
                                    onClick={() =>
                                      setCurrentPage((prev) =>
                                        Math.min(prev + 1, totalPages)
                                      )
                                    }
                                    disabled={currentPage === totalPages}
                                    className="transition-transform transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed rounded-full p-2 text-[1px]"
                                  />
                                </PaginationItem>
                              </PaginationContent>
                            </Pagination>
                          </div>
                        )}
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;