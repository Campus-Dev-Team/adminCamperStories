import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import campushm from '/src/assets/Campushm.png';
import { LogOut } from "lucide-react";

const Navbar = ({ handleButtonClick }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false); // Estado del menú hamburguesa

    const handleLogout = () => {
        logout();
        toast.success("Sesión cerrada correctamente");
        navigate("/login");
    };

    return (
        <>
            {/*  Barra lateral fija solo desde 1031px hidden [@media(min-width:1031px)]:flex 
            <nav className=" w-44 h-screen bg-[#1e1b4b] border-r border-white/10 flex-col pt-12 p-2 fixed left-0 top-0">
                <img src={campushm} alt="Campus" className="w-28 h-auto mx-auto -mb-2" />
                <h2 className="text-md font-bold pt-2 mb-4 text-center pt-1 text-white">Admin Panel</h2>
                 <ul className="flex-1 flex flex-col justify-center items-center space-y-4">
                    <li><button onClick={handleButtonClick} className="w-40 py-2 px-4 rounded hover:bg-white/10 transition text-center text-white">Dashboard</button></li>
                    <li><button onClick={handleButtonClick} className="w-40 py-2 px-4 rounded hover:bg-white/10 transition text-center text-white">Users</button></li>
                    <li><button onClick={handleButtonClick} className="w-40 py-2 px-4 rounded hover:bg-white/10 transition text-center text-white">Settings</button></li>
    </ul>
                <button onClick={handleLogout} className="mt-8 px-6 py-3 rounded  hover:bg-transparent-300 transition text-white text-lg flex items-center gap-2">
                    <LogOut className="h-5 w-5" />
                    Salir
                </button>
            </nav>*/}



            {/*  Hamburguesa desde 1030px hacia abajo [@media(min-width:1031px)]:hidden */}
            <nav className=" w-full bg-[#07073b] [@media(min-width:1031px)]:hidden text-white px-11 py-2 fixed top-0 left-0 relative z-20">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col items-center">
                        <img src={campushm} alt="Campus" className="w-20 h-auto" />
                        <h2 className="text-sm font-bold pt-1">Admin Panel</h2>
                    </div>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-white focus:outline-none z-50 relative"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>
                </div>

                {isOpen && (
                    <div className="fixed top-0 left-0 w-screen h-screen bg-[#1e1b4b] text-white flex flex-col items-center justify-center z-40 transition-opacity animate-fade-in">
                        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
                        {/* <ul className="space-y-6 text-center">
                            <li><button onClick={handleButtonClick} className="text-lg py-3 px-6 rounded hover:bg-white/10 transition">Dashboard</button></li>
                            <li><button onClick={handleButtonClick} className="text-lg py-3 px-6 rounded hover:bg-white/10 transition">Users</button></li>
                            <li><button onClick={handleButtonClick} className="text-lg py-3 px-6 rounded hover:bg-white/10 transition">Settings</button></li>
                </ul> */}
                        <button onClick={handleLogout} className="mt-8 px-6 py-3 rounded  hover:bg-red-600 transition text-white text-lg flex items-center gap-2">
                            <LogOut className="h-5 w-5" />
                            Salir
                        </button>
                    </div>
                )}
            </nav>

            <nav className=" w-full bg-[#07073b] hidden [@media(min-width:1031px)]:flex text-white px-11 py-2 fixed top-0 left-0 relative z-20">

                <div className="flex flex-row items-center w-full py-3">
                    <div className="flex items-center mr-6">
                        <img src={campushm} alt="Campus" className="w-20 h-auto" />
                        <h2 className="text-sm font-bold ml-3">Admin Panel</h2>
                    </div>

                    {/* Espacio para los botones de navegación que están comentados 
    <div className="flex-grow">
        <ul className="flex space-x-4">
            <li><button onClick={handleButtonClick} className="py-2 px-4 rounded hover:bg-white/10 transition">Dashboard</button></li>
            <li><button onClick={handleButtonClick} className="py-2 px-4 rounded hover:bg-white/10 transition">Users</button></li>
            <li><button onClick={handleButtonClick} className="py-2 px-4 rounded hover:bg-white/10 transition">Settings</button></li>
        </ul>
    </div>
    */}

                    <div className="ml-auto">
                        <button onClick={handleLogout} className="px-4 py-2 rounded hover:bg-red-600 transition text-white flex items-center gap-2">
                            <LogOut className="h-5 w-5" />
                            Salir
                        </button>
                    </div>
                </div>


            </nav>
        </>
    );
};

export default Navbar;