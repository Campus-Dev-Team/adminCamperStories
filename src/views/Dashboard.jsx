import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users, UserX } from "lucide-react";
import { endpoints } from "../services/apiConfig";

export default function AdminDashboard() {
  const [totalRegistrados, setTotalRegistrados] = useState(0);
  const [registrosIncompletos, setRegistrosIncompletos] = useState(0);
  const [campersPendientes, setCampersPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resTotal, resIncomplete] = await Promise.all([
          fetch(endpoints.Count),
          fetch(endpoints.Imcomplete)
        ]);

        const totalData = await resTotal.json();
        const incompleteData = await resIncomplete.json();

        setTotalRegistrados(totalData.totalRegistros || 0);
        setRegistrosIncompletos(incompleteData.totalIncompletos.length || 0);
        setCampersPendientes(incompleteData.totalIncompletos || []);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCampers = campersPendientes.filter(camper =>
    camper.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#1E1B4B] text-white font-sans relative overflow-hidden">
      <header className="border-b border-white/10 bg-[#2E2B5B]/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="container flex h-16 items-center px-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              placeholder="Buscar campers..."
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 w-full focus:bg-white/10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="container p-6">
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
              <div className="text-3xl font-bold text-white mb-1">{loading ? "..." : totalRegistrados}</div>
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
              <div className="text-3xl font-bold text-white mb-1">{loading ? "..." : registrosIncompletos}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#2E2B5B] bg-opacity-50 backdrop-blur-xl border border-white/10 rounded-lg p-6">
          <CardHeader>
            <CardTitle className="text-white">Registros Pendientes</CardTitle>
            <CardDescription className="text-white/60">Usuarios que necesitan completar su registro</CardDescription>
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
                      filteredCampers.map(camper => {
                        const camposNull = Object.keys(camper).filter(key => camper[key] === null || camper[key] === undefined);
                        const estado = camposNull.length > 0 ? "Pendiente" : "Completo";

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
                                  estado === "Pendiente" ? "bg-red-500 text-white" : "bg-green-500 text-white"
                                }`}
                              >
                                {estado}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <a
                                href={`https://camperstories.vercel.app/campers/profile/${camper.id}/edit`}
                                className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition"
                              >
                                Editar
                              </a>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-white/60">
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
  );
}