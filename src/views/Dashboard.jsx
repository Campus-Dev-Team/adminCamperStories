import { useEffect, useState } from "react"
import { toast, ToastContainer } from 'react-toastify'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Search, Users, UserX } from "lucide-react"
import { endpoints } from "../services/apiConfig"
import { useNavigate } from "react-router-dom"
import 'react-toastify/dist/ReactToastify.css'
import campushm from '/src/assets/Campushm.png';

const fetchWithAuth = async (url) => {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No token found")

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    })

    if (response.status === 401) {
        localStorage.removeItem("token")
        window.location.href = "/login"
    }

    return response
}

const AdminDashboard = () => {
    const navigate = useNavigate()
    const [data, setData] = useState({
        totalRegistrados: 0,
        registrosIncompletos: 0,
        campersPendientes: [],
    })
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
            return
        }

        const fetchData = async () => {
            try {
                setLoading(true)
                const [resTotal, resIncomplete] = await Promise.all([
                    fetchWithAuth(endpoints.Count),
                    fetchWithAuth(endpoints.Imcomplete),
                ])

                const [totalData, incompleteData] = await Promise.all([
                    resTotal.json(), 
                    resIncomplete.json()
                ])

                setData({
                    totalRegistrados: totalData.totalRegistros || 0,
                    registrosIncompletos: incompleteData.totalIncompletos.length || 0,
                    campersPendientes: incompleteData.totalIncompletos || [],
                })
            } catch (error) {
                console.error("Error:", error)
                toast.error("Error al cargar los datos")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [navigate])

    const handleLogout = () => {
        localStorage.removeItem("token")
        toast.success("Sesión cerrada exitosamente")
        navigate("/")
    }

    const filteredCampers = data.campersPendientes.filter((camper) =>
        camper.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const renderCamperRow = (camper) => {
        const estado = Object.values(camper).some((val) => val === null) ? "Pendiente" : "Completo"

        return (
            <TableRow key={camper.id} className="border-white/10 hover:bg-white/5 transition">
                <TableCell>
                    <img
                        src={camper.profile_picture || "https://via.placeholder.com/40"}
                        alt={camper.full_name}
                        className="w-10 h-10 rounded-full object-cover border border-white/20"
                    />
                </TableCell>
                <TableCell className="font-medium text-white">{camper.full_name}</TableCell>
                <TableCell>
                    <Badge 
                        className={`border-secondary/20 ${
                            estado === "Pendiente" ? "bg-red-500" : "bg-green-500"
                        } text-white`}
                    >
                        {estado}
                    </Badge>
                </TableCell>
            </TableRow>
        )
    }

    const handleButtonClick = () => {
        toast.info("Estamos trabajando en ello", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
        })
    }

    return (
        <div className="min-h-screen bg-[#1E1B4B] text-white font-sans relative overflow-hidden flex">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
            
            {/* Left Navbar */}
            <nav className="w-64 bg-[#2E2B5B] border-r border-white/10 pt-14 p-2">
            <img src={campushm} alt="Campus" className="w-32 h-auto mx-auto mb-2" />
                <h2 className="text-xl pb-7 font-bold mb-4 text-center pt-1 text-white">Admin Panel</h2>
                <ul className="space-y-2">
                    <li>
                        <button 
                            onClick={handleButtonClick} 
                            className="block w-full py-1 px-2 rounded hover:bg-white/10 transition text-left text-white"
                        >
                            Dashboard
                        </button>
                    </li>
                    <li>
                        <button 
                            onClick={handleButtonClick} 
                            className="block w-full py-1 px-2 rounded hover:bg-white/10 transition text-left text-white"
                        >
                            Users
                        </button>
                    </li>
                    <li>
                        <button 
                            onClick={handleButtonClick} 
                            className="block w-full py-1 px-2 rounded hover:bg-white/10 transition text-left text-white"
                        >
                            Settings
                        </button>
                    </li>
                </ul>
            </nav>

            {/* Main Content */}
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
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm text-white transition-colors"
                        >
                            Cerrar sesión
                        </button>
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
                                <CardDescription className="text-white/60">Últimos 30 días</CardDescription>
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
                                    <UserX className="h-5 w-5 text-secondary" />
                                </CardTitle>
                                <CardDescription className="text-white/60">Necesitan seguimiento</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white mb-1">
                                    {loading ? "..." : data.registrosIncompletos}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-[#2E2B5B] bg-opacity-50 backdrop-blur-xl border border-white/10 rounded-lg p-6">
                        <CardHeader>
                            <CardTitle className="text-white">Registros Pendientes</CardTitle>
                            <CardDescription className="text-white/60">
                                Usuarios que necesitan completar su registro
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <p className="text-white/60">Cargando...</p>
                            ) : (
                                <div className="overflow-y-auto max-h-[32rem] max-w-[100%] no-scrollbar">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-white/10">
                                                <TableHead className="text-white/80">Foto</TableHead>
                                                <TableHead className="text-white/80">Nombre</TableHead>
                                                <TableHead className="text-white/80">Estado</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredCampers.length > 0 ? (
                                                filteredCampers.map(renderCamperRow)
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center text-white/60">
                                                        No hay registros coincidentes.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    )
}

export default AdminDashboard