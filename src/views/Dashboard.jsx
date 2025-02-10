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
import { Search, Users, UserX, Check, X } from "lucide-react";
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

const ITEMS_PER_PAGE = 10;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    totalRegistrados: 0,
    registrosIncompletos: 0,
    campersPendientes: [],
    showAll: true,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const fetchCamperDetails = async (camperId) => {
    try {
      const response = await fetch(endpoints.campersDetails(camperId));
      if (!response.ok) throw new Error("Error al obtener detalles del camper");

      const { camper, dreams, projects, videos } = await response.json();
      return {
        ...camper,
        hasDreams: dreams.length > 0,
        hasProjects: projects.length > 0,
        hasVideos: videos.length > 0,
        isComplete:
          camper.main_video_url &&
          dreams.length > 0 &&
          projects.length > 0 &&
          videos.length > 0,
      };
    } catch (error) {
      console.error("Error fetching camper details:", error);
      return {
        hasDreams: false,
        hasProjects: false,
        hasVideos: false,
        isComplete: false,
      };
    }
  };

  const fetchCampers = async () => {
    try {
      setLoading(true);
      const response = await fetch(endpoints.campers, { headers: getHeaders() });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const responseData = await response.json();
      const campersWithDetails = await Promise.all(
        responseData.map((camper) => fetchCamperDetails(camper.camper_id))
      );

      const incompleteCount = campersWithDetails.filter((c) => !c.isComplete)
        .length;

      setData({
        totalRegistrados: campersWithDetails.length,
        registrosIncompletos: incompleteCount,
        campersPendientes: campersWithDetails,
        showAll: true,
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
    fetchCampers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
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
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm text-white transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Card className="bg-[#2E2B5B] bg-opacity-50 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <CardHeader>
              <CardTitle className="text-white">Estado de Registro de Campers</CardTitle>
              <CardDescription className="text-white/60">Seguimiento detallado del progreso de registro</CardDescription>
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
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem className="mx-1">
                        <PaginationPrevious
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="transition-transform transform hover:scale-110"
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, index) => (
                        <PaginationItem key={index + 1} className="mx-1">
                          <PaginationLink
                            onClick={() => setCurrentPage(index + 1)}
                            isActive={currentPage === index + 1}
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem className="mx-1">
                        <PaginationNext
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="transition-transform transform hover:scale-110"
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
