import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-6 transition-colors duration-300">
            <div className="theme-panel max-w-md w-full p-8 text-center flex flex-col items-center">
                <ShieldAlert size={64} className="text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]" />
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Access Denied</h1>
                <p className="text-[var(--text-secondary)] mb-8">
                    Your authenticated Role lacks the administrative clearance required to view this sector. 
                </p>
                <Link to="/home" className="bg-accent hover:bg-[var(--color-accent-hover-light)] dark:hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-bold transition-all w-full text-center">
                    Return to Safe Zone
                </Link>
            </div>
        </div>
    );
}
