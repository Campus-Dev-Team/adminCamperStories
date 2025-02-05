import React, { useEffect, useState, useMemo } from "react";
import { toast, ToastContainer } from 'react-toastify';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users, UserX, Check, X, AlertCircle } from 'lucide-react';
import { endpoints } from "../services/apiConfig";
import { useNavigate } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/dashboard/Navbar';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        totalRegistrados: 0,
        registrosIncompletos: 0,
        campersPendientes: [],
        showAll: true
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("all"); // "all", "pending", "complete"

    const fetchCamperDetails = async (camperId) => {
        try {
            const [dreams, projects, videos] = await Promise.all([
                fetch(`${endpoints.campers}/${camperId}/dreams`).then(res => res.json()),
                fetch(`${endpoints.campers}/${camperId}/proyects`).then(res => res.json()),
                fetch(`${endpoints.campers}/${camperId}/videos`).then(res => res.json())
            ]);
            
            return {
                hasDreams: dreams && dreams.length > 0,
                hasProjects: projects && projects.length > 0,
                hasVideos: videos && videos.length > 0
            };
        } catch (error) {
            console.error("Error fetching details:", error);
            return {
                hasDreams: false,
                hasProjects: false,
                hasVideos: false
            };
        }
    };

    const fetchCampers = async () => {
        try {
            setLoading(true);
            const endpoint = endpoints.campers;
            const response = await fetch(endpoint, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                }
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const responseData = await response.json();
            
            // Fetch additional details for each camper
            const campersWithDetails = await Promise.all(
                responseData.map(async (camper) => {
                    const details = await fetchCamperDetails(camper.camper_id);
                    return {
                        ...camper,
                        ...details,
                        isComplete: camper.main_video_url && details.hasDreams && 
                                  details.hasProjects && details.hasVideos
                    };
                })
            );

            const incompleteCount = campersWithDetails.filter(c => !c.isComplete).length;

            setData({
                totalRegistrados: campersWithDetails.length,
                registrosIncompletos: incompleteCount,
                campersPendientes: campersWithDetails,
                showAll: true
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
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        toast.success("Sesión cerrada exitosamente");
        navigate("/");
    };

    const filteredCampers = useMemo(() => {
        let filtered = data.campersPendientes.filter(camper => 
            camper?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        switch (activeFilter) {
            case "pending":
                return filtered.filter(camper => !camper.isComplete);
            case "complete":
                return filtered.filter(camper => camper.isComplete);
            default:
                return filtered;
        }
    }, [data.campersPendientes, searchTerm, activeFilter]);

    const renderStatusIcon = (status) => {
        return status ? 
            <Check className="h-5 w-5 text-green-500" /> : 
            <X className="h-5 w-5 text-red-500" />;
    };

    const renderCamperRow = (camper) => {
        if (!camper?.camper_id) return null;

        return (
            <TableRow key={camper.camper_id} className="border-white/10 hover:bg-white/5 transition">
                <TableCell>
                    <img
                        src={camper.profile_picture || "/api/placeholder/40/40"}
                        alt={camper.full_name}
                        className="w-10 h-10 rounded-full object-cover border border-white/20"
                    />
                </TableCell>
                <TableCell className="font-medium text-white">{camper.full_name}</TableCell>
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
                <TableCell>
                    <Badge 
                        className={`${camper.isComplete ? 'bg-green-500' : 'bg-red-500'} text-white`}
                    >
                        {camper.isComplete ? 'Completo' : 'Pendiente'}
                    </Badge>
                </TableCell>
                <TableCell>
                    <button 
                        onClick={() => navigate(`/camper/${camper.camper_id}`)}
                        className="text-primary hover:text-primary/80"
                    >
                        Ver detalles
                    </button>
                </TableCell>
            </TableRow>
        );
    };

    return (
        <div className="min-h-screen bg-[#1E1B4B] text-white font-sans relative overflow-hidden flex">
            <ToastContainer theme="dark" />
            <Navbar />

            <div className="flex-1 flex flex-col">
                <header className="border-b border-white/10 bg-[#2E2B5B]/50 backdrop-blur-xl sticky top-0 z-10">
                    <div className="flex h-16 items-center justify-between px-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                            <Input
                                placeholder="Buscar campers..."
                                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 w-full focus:bg-white/10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveFilter("all")}
                                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                                        activeFilter === "all" 
                                            ? "bg-primary text-white" 
                                            : "bg-white/5 hover:bg-white/10"
                                    }`}
                                >
                                    Todos
                                </button>
                                <button
                                    onClick={() => setActiveFilter("pending")}
                                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                                        activeFilter === "pending" 
                                            ? "bg-red-500 text-white" 
                                            : "bg-white/5 hover:bg-white/10"
                                    }`}
                                >
                                    Pendientes
                                </button>
                                <button
                                    onClick={() => setActiveFilter("complete")}
                                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                                        activeFilter === "complete" 
                                            ? "bg-green-500 text-white" 
                                            : "bg-white/5 hover:bg-white/10"
                                    }`}
                                >
                                    Completos
                                </button>
                            </div>
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
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                        <Card className="bg-[#2E2B5B] bg-opacity-50 backdrop-blur-xl border border-white/10 rounded-lg p-6">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-white flex items-center justify-between">
                                    Total Registrados
                                    <Users className="h-5 w-5 text-primary" />
                                </CardTitle>
                                <CardDescription className="text-white/60">
                                    Total de campers
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white mb-1">
                                    {loading ? "..." : data.totalRegistrados}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#2E2B5B] bg-opacity-50 backdrop-blur-xl border border-white/10 rounded-lg p-6">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-white flex items-center justify-between">
                                    Registros Incompletos
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                </CardTitle>
                                <CardDescription className="text-white/60">
                                    Necesitan completar información
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white mb-1">
                                    {loading ? "..." : data.registrosIncompletos}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#2E2B5B] bg-opacity-50 backdrop-blur-xl border border-white/10 rounded-lg p-6">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-white flex items-center justify-between">
                                    Registros Completos
                                    <Check className="h-5 w-5 text-green-500" />
                                </CardTitle>
                                <CardDescription className="text-white/60">
                                    Información completa
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white mb-1">
                                    {loading ? "..." : (data.totalRegistrados - data.registrosIncompletos)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-[#2E2B5B] bg-opacity-50 backdrop-blur-xl border border-white/10 rounded-lg p-6">
                        <CardHeader>
                            <CardTitle className="text-white">
                                Estado de Registro de Campers
                            </CardTitle>
                            <CardDescription className="text-white/60">
                                Seguimiento detallado del progreso de registro
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
                                            <TableHead className="text-white/80">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8">
                                                    <div className="flex items-center justify-center text-white/60">
                                                        Cargando información...
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredCampers.length > 0 ? (
                                            filteredCampers.map(renderCamperRow)
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8">
                                                    <div className="flex flex-col items-center justify-center text-white/60">
                                                        <UserX className="h-8 w-8 mb-2" />
                                                        No se encontraron registros
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;