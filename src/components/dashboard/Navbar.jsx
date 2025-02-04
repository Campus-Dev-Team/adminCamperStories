import { toast } from 'react-toastify';
import campushm from '/src/assets/Campushm.png';

const Navbar = ({ handleButtonClick }) => {
    return (
        <nav className="w-64 bg-[#2E2B5B] border-r border-white/10 pt-20 p-2">
            <img src={campushm} alt="Campus" className="w-32 h-auto mx-auto mb-2" />
            <h2 className="text-xl font-bold mb-4 text-center pt-1 text-white">Admin Panel</h2>
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
    );
}

export default Navbar; 