import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scissors, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
    const location = useLocation();

    // Hide Footer on admin pages
    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <footer className="bg-dark-bg text-white pt-16 pb-8 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center space-x-2 mb-6">
                            <Scissors className="h-6 w-6 text-primary" />
                            <span className="font-heading font-bold text-lg tracking-wider text-white">BARBEARIA DOURADO</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Tradição e estilo para o homem moderno. Uma experiência única de barbearia em Montemor-o-Velho.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 text-primary tracking-wide">Links Rápidos</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><Link to="/" className="hover:text-primary transition-colors duration-300">Início</Link></li>
                            <li><Link to="/sobre" className="hover:text-primary transition-colors duration-300">Sobre</Link></li>
                            <li><Link to="/servicos" className="hover:text-primary transition-colors duration-300">Serviços</Link></li>
                            <li><Link to="/agendar" className="hover:text-primary transition-colors duration-300">Agendar</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 text-primary tracking-wide">Contactos</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li>Rua Principal, 123</li>
                            <li>Montemor-o-Velho, Portugal</li>
                            <li>+351 912 345 678</li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 text-primary tracking-wide">Siga-nos</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300 transform hover:scale-110">
                                <Instagram className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300 transform hover:scale-110">
                                <Facebook className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors duration-300 transform hover:scale-110">
                                <Twitter className="h-6 w-6" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Barbearia Dourado. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
