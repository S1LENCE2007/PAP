import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Scissors, User, LogOut, ShoppingBag, Image, Phone, LayoutDashboard, Star, ChevronDown, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut, isAdmin, role } = useAuth();
    const { itemCount } = useCart();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Serviços', path: '/servicos', icon: Scissors },
        { name: 'Galeria', path: '/galeria', icon: Image },
        { name: 'Loja', path: '/loja', icon: ShoppingBag },
        { name: 'Avaliações', path: '/avaliacoes', icon: Star },
        { name: 'Contactos', path: '/contato', icon: Phone },
        // Admin link moved to separate logic
    ];

    const isActive = (path: string) => location.pathname === path;

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
        setIsOpen(false);
        setUserMenuOpen(false);
    };

    return (
        <nav
            className={clsx(
                'fixed top-0 w-full z-50 transition-all duration-300',
                scrolled ? 'bg-dark/95 backdrop-blur-md shadow-lg py-2 border-b border-white/5' : 'bg-transparent py-6'
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2 group">
                            <Scissors className="h-8 w-8 text-primary group-hover:rotate-45 transition-transform duration-300" />
                            <span className="font-heading font-bold text-xl tracking-wider text-white">BARBEARIA DOURADO</span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        className={clsx(
                                            'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 relative group flex items-center gap-2',
                                            isActive(link.path)
                                                ? 'text-primary'
                                                : 'text-gray-300 hover:text-primary'
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {link.name}
                                        <span className={clsx(
                                            "absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300",
                                            isActive(link.path) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                                        )} />
                                    </Link>
                                );
                            })}
                            <Link
                                to="/agendar"
                                className="ml-4 px-4 py-2 rounded-lg bg-primary text-black text-sm font-bold uppercase tracking-wide hover:bg-primary/90 hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-primary/10"
                            >
                                <Calendar className="w-4 h-4" />
                                Marcação
                            </Link>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-4 ml-12">
                        <Link to="/loja/carrinho" className="relative text-gray-300 hover:text-primary transition-colors p-2">
                            <ShoppingBag className="w-6 h-6" />
                            {itemCount > 0 && (
                                <span className="absolute top-0 right-0 bg-primary text-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {itemCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden">
                                        <User className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <span className="font-medium max-w-[100px] truncate hidden lg:block">
                                        {user.user_metadata?.nome || 'Cliente'}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {userMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-2 w-56 bg-dark border border-gray-800 rounded-lg shadow-xl py-2 z-50 ring-1 ring-black ring-opacity-5"
                                        >
                                            <div className="px-4 py-3 border-b border-gray-800 mb-2">
                                                <p className="text-sm text-gray-400">Logado como</p>
                                                <p className="text-sm font-bold text-white truncate">{user.email}</p>
                                            </div>

                                            <Link
                                                to="/perfil"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-primary transition-colors"
                                            >
                                                <User className="w-4 h-4 mr-3" />
                                                Meu Perfil
                                            </Link>



                                            {isAdmin && (
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-primary transition-colors"
                                                >
                                                    <LayoutDashboard className="w-4 h-4 mr-3" />
                                                    Painel Admin
                                                </Link>
                                            )}

                                            {role === 'barbeiro' && (
                                                <Link
                                                    to="/barbeiro"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-primary transition-colors"
                                                >
                                                    <LayoutDashboard className="w-4 h-4 mr-3" />
                                                    Painel Barbeiro
                                                </Link>
                                            )}

                                            <div className="border-t border-gray-800 my-2"></div>

                                            <button
                                                onClick={handleSignOut}
                                                className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-red-900/10 hover:text-red-300 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4 mr-3" />
                                                Sair da Conta
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-gray-300 hover:text-white font-medium transition-colors">
                                    Entrar
                                </Link>
                                <Link to="/registo" className="btn-primary text-sm px-4 py-2 font-bold uppercase tracking-wide hover:scale-105 transition-transform duration-300">
                                    Registar
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="-mr-2 flex md:hidden">
                        <Link to="/loja/carrinho" className="relative text-gray-300 hover:text-primary transition-colors p-2 mr-2">
                            <ShoppingBag className="w-6 h-6" />
                            {itemCount > 0 && (
                                <span className="absolute top-0 right-0 bg-primary text-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {itemCount}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="md:hidden bg-dark-bg border-t border-gray-800 absolute w-full"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={clsx(
                                        'block px-3 py-2 rounded-md text-base font-medium',
                                        isActive(link.path)
                                            ? 'text-primary bg-gray-900'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            <div className="border-t border-gray-700 pt-4 mt-4">
                                {user ? (
                                    <>
                                        <Link
                                            to="/perfil"
                                            onClick={() => setIsOpen(false)}
                                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                        >
                                            Meu Perfil
                                        </Link>

                                        {isAdmin && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setIsOpen(false)}
                                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                            >
                                                Painel Admin
                                            </Link>
                                        )}

                                        {role === 'barbeiro' && (
                                            <Link
                                                to="/barbeiro"
                                                onClick={() => setIsOpen(false)}
                                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                            >
                                                Painel Barbeiro
                                            </Link>
                                        )}

                                        <Link
                                            to="/agendar"
                                            onClick={() => setIsOpen(false)}
                                            className="block w-full text-center mt-4 btn-primary"
                                        >
                                            Agendar Online
                                        </Link>
                                        <button
                                            onClick={handleSignOut}
                                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-gray-700 mt-2"
                                        >
                                            Sair
                                        </button>
                                    </>
                                ) : (
                                    <div className="space-y-3 px-3">
                                        <Link
                                            to="/login"
                                            onClick={() => setIsOpen(false)}
                                            className="block text-center text-gray-300 hover:text-white font-medium"
                                        >
                                            Entrar
                                        </Link>
                                        <Link
                                            to="/registo"
                                            onClick={() => setIsOpen(false)}
                                            className="block w-full text-center btn-primary"
                                        >
                                            Registar
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
