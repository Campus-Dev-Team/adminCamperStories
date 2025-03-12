import { useEffect, useState, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Search, Users, UserX, Check, X, MapPin } from "lucide-react";
import { endpoints } from "../services/apiConfig";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "../contexts/AuthContext";

const ITEMS_PER_PAGE = 10;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const [data, setData] = useState({
    totalRegistrados: 0,
    registrosIncompletos: 0,
    campersPendientes: [],
    campusName: null
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  // Función para obtener el usuario actual desde localStorage
  const getCurrentUserFromStorage = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  const fetchCampersData = async () => {
    try {
      setLoading(true);

      // Obtener el usuario actual y su rol
      const storedUser = getCurrentUserFromStorage();
      const userRole = storedUser?.role_id;

      // Determinar qué endpoint usar según el rol
      let endpoint = endpoints.allCampersDetails; // Por defecto, todos los campers (admin)

      if (userRole === 5) { // Si es regionalAdmin
        endpoint = endpoints.myCampusCampers; // Usa el endpoint para obtener campers de su campus
      }

      const response = await fetch(endpoint, {
        headers: getHeaders()
      });

      if (response.status === 401) {
        toast.error("Sesión expirada o inválida");
        logout();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar los datos');
      }

      const responseData = await response.json();

      // Procesar datos según el endpoint usado
      let allCampers = [];
      let campusName = null;

      if (userRole === 5) {
        // Para regionalAdmin, los datos vienen de manera diferente
        const campusData = responseData.data || {};
        allCampers = campusData.campers || [];
        campusName = campusData.campusName;
      } else {
        // Para admin, los datos vienen directamente
        allCampers = responseData.data || [];
      }

      const incompleteCount = allCampers.filter(camper =>
        !(camper.main_video_url &&
          camper.dreams?.length > 0 &&
          camper.projects?.length > 0 &&
          camper.videos?.length > 0)
      ).length;

      setData({
        totalRegistrados: allCampers.length,
        registrosIncompletos: incompleteCount,
        campersPendientes: allCampers.map(camper => ({
          ...camper,
          isComplete: !!(camper.main_video_url &&
            camper.dreams?.length > 0 &&
            camper.projects?.length > 0 &&
            camper.videos?.length > 0),
          hasDreams: camper.dreams?.length > 0,
          hasProjects: camper.projects?.length > 0,
          hasVideos: camper.videos?.length > 0
        })),
        campusName: campusName
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchCampersData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Sesión cerrada exitosamente");
    navigate("/");
  };

  const filteredCampers = useMemo(() => {
    const filtered = data.campersPendientes.filter((camper) =>
      camper?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (activeFilter) {
      case "pending":
        return filtered.filter((camper) => !camper.isComplete);
      case "complete":
        return filtered.filter((camper) => camper.isComplete);
      default:
        return filtered;
    }
  }, [data.campersPendientes, searchTerm, activeFilter]);

  const totalPages = Math.ceil(filteredCampers.length / ITEMS_PER_PAGE);
  const paginatedCampers = filteredCampers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const renderStatusIcon = (status) => (
    <div className="flex justify-center items-center">
      {status ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />}
    </div>
  );

  // Obtener el usuario y rol para mostrar el título correcto
  const storedUser = useMemo(() => getCurrentUserFromStorage(), []);
  const isRegionalAdmin = storedUser?.role_id === 5;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E1B4B] text-white font-sans relative overflow-hidden flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E1B4B] text-white font-sans relative overflow-hidden flex">
      <ToastContainer theme="dark" />
      <Navbar />
      <div className="flex-1 flex flex-col">
        <header className="border-b border-white/10 bg-[#2E2B5B]/50 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar camper..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/60"
                />
              </div>
              <div className="flex gap-2">
                <Badge
                  variant={activeFilter === "all" ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setActiveFilter("all")}
                >
                  <Users className="h-4 w-4 mr-1" />
                  Todos ({data.totalRegistrados})
                </Badge>
                <Badge
                  variant={activeFilter === "pending" ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setActiveFilter("pending")}
                >
                  <UserX className="h-4 w-4 mr-1" />
                  Pendientes ({data.registrosIncompletos})
                </Badge>
                <Badge
                  variant={activeFilter === "complete" ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setActiveFilter("complete")}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Completados ({data.totalRegistrados - data.registrosIncompletos})
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isRegionalAdmin && data.campusName && (
                <span className="text-sm text-white/80">
                  Campus: <strong>{data.campusName}</strong>
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm text-white transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Card className="bg-[#2E2B5B] bg-opacity-50 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <CardHeader>
              <CardTitle className="text-white">
                {isRegionalAdmin
                  ? `Campers del Campus ${data.campusName || ''}`
                  : "Estado de Registro de Campers"}
              </CardTitle>
              <CardDescription className="text-white/60">
                {isRegionalAdmin
                  ? `Seguimiento de campers asignados a tu campus`
                  : "Seguimiento detallado del progreso de registro"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-white/80">Foto</TableHead>
                      <TableHead className="text-white/80">Nombre</TableHead>
                      <TableHead className="text-white/80 text-center">Video Principal</TableHead>
                      <TableHead className="text-white/80 text-center">Sueños</TableHead>
                      <TableHead className="text-white/80 text-center">Proyectos</TableHead>
                      <TableHead className="text-white/80 text-center">Videos</TableHead>
                      <TableHead className="text-white/80">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Cargando información...
                        </TableCell>
                      </TableRow>
                    ) : paginatedCampers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No se encontraron campers que coincidan con los criterios de búsqueda.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedCampers.map((camper) => (
                        <TableRow key={camper.camper_id} className="border-white/10 hover:bg-white/5 transition">
                          <TableCell>
                            <img
                              src={camper.profile_picture || "/api/placeholder/40/40"}
                              alt={camper.full_name}
                              className="w-10 h-10 rounded-full object-cover border border-white/20"
                            />
                          </TableCell>
                          <TableCell>{camper.full_name}</TableCell>
                          <TableCell>{renderStatusIcon(camper.main_video_url)}</TableCell>
                          <TableCell>{renderStatusIcon(camper.hasDreams)}</TableCell>
                          <TableCell>{renderStatusIcon(camper.hasProjects)}</TableCell>
                          <TableCell>{renderStatusIcon(camper.hasVideos)}</TableCell>
                          <TableCell>
                            <Badge variant={camper.isComplete ? "success" : "destructive"}>
                              {camper.isComplete ? "Completo" : "Pendiente"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {!loading && totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent className="gap-2">
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="transition-transform transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed rounded-full p-2 "
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, index) => (
                        <PaginationItem key={index + 1}>
                          <PaginationLink
                            onClick={() => setCurrentPage(index + 1)}
                            isActive={currentPage === index + 1}
                            className={`rounded-medium px-3 py-2 text-sm font-medium transition-colors ${currentPage === index + 1
                                ? 'bg-white-100 text-blue'
                                : 'text-white-700 hover:bg-white-200'
                              }`}
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="transition-transform transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed rounded-full p-2  "
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}


            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;