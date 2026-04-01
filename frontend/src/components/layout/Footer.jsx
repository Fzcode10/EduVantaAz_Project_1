import React from 'react';
import { Youtube, Instagram, Facebook, Send, GraduationCap, CheckCircle2 } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-[var(--bg-surface)] text-[var(--text-secondary)] pt-16 pb-8 border-t border-[var(--border-divider)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Brand Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
             <div className="bg-accent p-1.5 rounded-lg">
                <GraduationCap className="text-white" size={24} />
             </div>
             <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
               EduVanta<span className="text-accent">AZ</span>
             </h2>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            Personalized mentorship and smart progress tracking 
            designed to help every student grow confidently.
          </p>
        </div>

        {/* Features Section */}
        <div>
          <h5 className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6">
            Features
          </h5>
          <ul className="space-y-4 text-sm">
            {[
              "1:1 Mentor",
              "Personal Guidance",
              "Progress Tracking",
              "Career Support"
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 hover:text-accent transition cursor-pointer group">
                <CheckCircle2 size={16} className="text-[var(--text-secondary)] group-hover:text-accent transition-colors" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Social Section */}
        <div>
          <h5 className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6">
            Connect With Us
          </h5>
          <div className="flex flex-col space-y-4 text-sm">
            <a href="#" className="flex items-center gap-3 hover:text-accent transition">
              <Youtube size={20} className="text-red-500" /> YouTube
            </a>
            <a href="#" className="flex items-center gap-3 hover:text-accent transition">
              <Instagram size={20} className="text-pink-500" /> Instagram
            </a>
            <a href="#" className="flex items-center gap-3 hover:text-accent transition">
              <Facebook size={20} className="text-blue-600" /> Facebook
            </a>
          </div>
        </div>

        {/* Newsletter Section */}
        <div>
          <h5 className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6">
            Stay Updated
          </h5>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Get study tips & platform updates directly in your inbox.
          </p>

          <div className="relative group">
            <input
              type="email"
              placeholder="Enter your email"
              className="theme-input !py-3 !pl-4 !pr-12"
            />
            <button className="absolute right-1.5 top-1.5 bg-accent hover:bg-[var(--color-accent-hover-light)] dark:hover:bg-accent-hover p-2 rounded-lg text-white transition-all shadow-md active:scale-95 cursor-pointer">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-16 border-t border-[var(--border-divider)] pt-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[var(--text-secondary)] opacity-80">
            © {new Date().getFullYear()} EduVantaAZ. All rights reserved.
          </p>

          <div className="flex space-x-8 text-xs font-semibold text-[var(--text-secondary)] opacity-80">
            <span className="hover:text-accent cursor-pointer transition uppercase tracking-tighter">
              Privacy Policy
            </span>
            <span className="hover:text-accent cursor-pointer transition uppercase tracking-tighter">
              Terms of Service
            </span>
            <span className="hover:text-accent cursor-pointer transition uppercase tracking-tighter">
              Support
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;