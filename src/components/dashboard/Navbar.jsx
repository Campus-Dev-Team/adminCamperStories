import { toast } from 'react-toastify';
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import campushm from '/src/assets/Campushm.png';

const Navbar = ({ handleButtonClick }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // Cierra sesión
        toast.success("Sesión cerrada correctamente");
        navigate("/login"); // Redirige a la página de inicio de sesión
    };

    return (
        <nav className="w-64 h-screen bg-[#2E2B5B] border-r border-white/10 flex flex-col pt-12 p-2">
            <img src={campushm} alt="Campus" className="w-32 h-auto mx-auto -mb-2" />
            <h2 className="text-xl font-bold mb-4 text-center pt-1 text-white">Admin Panel</h2>
            {/* Centrar los botones */}
            <ul className="flex-1 flex flex-col justify-center items-center space-y-4">
                <li>
                    <button 
                        onClick={handleButtonClick} 
                        className="w-40 py-2 px-4 rounded hover:bg-white/10 transition text-center text-white"
                    >
                        Dashboard
                    </button>
                </li>
                <li>
                    <button 
                        onClick={handleButtonClick} 
                        className="w-40 py-2 px-4 rounded hover:bg-white/10 transition text-center text-white"
                    >
                        Users
                    </button>
                </li>
                <li>
                    <button 
                        onClick={handleButtonClick} 
                        className="w-40 py-2 px-4 rounded hover:bg-white/10 transition text-center text-white"
                    >
                        Settings
                    </button>
                </li>
            </ul>
            {/* Alinear botón de logout abajo */}
            <button 
                onClick={handleLogout}
                className="w-40 py-2 px-4 rounded bg-red-500 hover:bg-red-600 transition text-white mt-auto mb-4 mx-auto"
            >
                Cerrar sesión
            </button>
        </nav>
    );
}

export default Navbar;
