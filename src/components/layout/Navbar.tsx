import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Scissors, User, LogOut, ShoppingBag, ShoppingCart, Image, Phone, LayoutDashboard, Star, ChevronDown, Calendar, CheckCircle } from 'lucide-react';
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
        { name: 'Loja', path: '/loja', icon: ShoppingBag },
        { name: 'Galeria', path: '/galeria', icon: Image },
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
                            {/* Marcação */}
                            <Link
                                to="/agendar"
                                className={clsx(
                                    'px-3 py-2 rounded-md text-sm font-bold transition-colors duration-300 relative group flex items-center gap-2 text-primary'
                                )}
                            >
                                <Calendar className="w-4 h-4" />
                                Marcação
                                <span className={clsx(
                                    "absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300",
                                    isActive('/agendar') ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                                )} />
                            </Link>

                            {/* Carrinho */}
                            <Link
                                to="/loja/carrinho"
                                className={clsx(
                                    'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 relative group flex items-center gap-2',
                                    isActive('/loja/carrinho') ? 'text-primary' : 'text-gray-300 hover:text-primary'
                                )}
                            >
                                <div className="relative">
                                    <ShoppingCart className="w-4 h-4" />
                                    {itemCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-primary text-dark text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                            {itemCount}
                                        </span>
                                    )}
                                </div>
                                Carrinho
                                <span className={clsx(
                                    "absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300",
                                    isActive('/loja/carrinho') ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                                )} />
                            </Link>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-4 ml-12">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden">
                                        {user.user_metadata?.avatar_url ? (
                                            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-gray-400" />
                                        )}
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

                                            <div className="px-4 py-1">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Minha Conta</p>
                                            </div>

                                            <Link
                                                to="/perfil"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-primary transition-colors"
                                            >
                                                <User className="w-4 h-4 mr-3" />
                                                Meu Perfil
                                            </Link>

                                            <Link
                                                to="/minhas-marcacoes"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-primary transition-colors"
                                            >
                                                <Calendar className="w-4 h-4 mr-3" />
                                                Minhas Marcações
                                            </Link>

                                            <Link
                                                to="/minhas-encomendas"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-primary transition-colors"
                                            >
                                                <ShoppingBag className="w-4 h-4 mr-3" />
                                                Minhas Encomendas
                                            </Link>

                                            <Link
                                                to="/avaliacoes"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-primary transition-colors"
                                            >
                                                <Star className="w-4 h-4 mr-3" />
                                                Avaliações
                                            </Link>

                                            {(isAdmin || role === 'barbeiro') && (
                                                <>
                                                    <div className="border-t border-gray-800 my-2"></div>
                                                    <div className="px-4 py-1">
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Área Restrita</p>
                                                    </div>

                                                    <Link
                                                        to={isAdmin ? "/admin" : "/barbeiro"}
                                                        onClick={() => setUserMenuOpen(false)}
                                                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-primary transition-colors"
                                                    >
                                                        <LayoutDashboard className="w-4 h-4 mr-3" />
                                                        Painel de Controlo
                                                    </Link>

                                                    <Link
                                                        to="/verificar-encomenda"
                                                        onClick={() => setUserMenuOpen(false)}
                                                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-primary transition-colors"
                                                        role="menuitem"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-3" />
                                                        Validar Encomendas
                                                    </Link>
                                                </>
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
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                        >
                            {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="md:hidden bg-dark-bg/95 backdrop-blur-xl border-t border-gray-800 absolute w-full shadow-2xl overflow-hidden"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-4 pt-4 pb-6 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={clsx(
                                        'block px-4 py-3 rounded-lg text-base font-medium transition-colors',
                                        isActive(link.path)
                                            ? 'text-primary bg-primary/10'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <link.icon className="w-5 h-5" />
                                        {link.name}
                                    </div>
                                </Link>
                            ))}

                            <Link
                                to="/agendar"
                                onClick={() => setIsOpen(false)}
                                className={clsx(
                                    'block px-4 py-3 rounded-lg text-base font-bold transition-colors text-primary bg-primary/10 hover:bg-primary/20'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5" />
                                    Marcação
                                </div>
                            </Link>

                            <Link
                                to="/loja/carrinho"
                                onClick={() => setIsOpen(false)}
                                className={clsx(
                                    'block px-4 py-3 rounded-lg text-base font-medium transition-colors',
                                    isActive('/loja/carrinho')
                                        ? 'text-primary bg-primary/10'
                                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <ShoppingCart className="w-5 h-5" />
                                    Carrinho
                                    {itemCount > 0 && (
                                        <span className="ml-auto bg-primary text-dark text-xs font-bold px-2 py-0.5 rounded-full">
                                            {itemCount}
                                        </span>
                                    )}
                                </div>
                            </Link>

                            <div className="border-t border-gray-800 pt-4 mt-4 space-y-3">
                                {user ? (
                                    <>
                                        <div className="px-3 py-1 mt-2">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Minha Conta</p>
                                        </div>
                                        <Link
                                            to="/perfil"
                                            onClick={() => setIsOpen(false)}
                                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                        >
                                            <div className="flex items-center gap-3"><User className="w-5 h-5" /> Meu Perfil</div>
                                        </Link>

                                        <Link
                                            to="/minhas-marcacoes"
                                            onClick={() => setIsOpen(false)}
                                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                        >
                                            <div className="flex items-center gap-3"><Calendar className="w-5 h-5" /> Minhas Marcações</div>
                                        </Link>

                                        <Link
                                            to="/minhas-encomendas"
                                            onClick={() => setIsOpen(false)}
                                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                        >
                                            <div className="flex items-center gap-3"><ShoppingBag className="w-5 h-5" /> Minhas Encomendas</div>
                                        </Link>

                                        <Link
                                            to="/avaliacoes"
                                            onClick={() => setIsOpen(false)}
                                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                        >
                                            <div className="flex items-center gap-3"><Star className="w-5 h-5" /> Avaliações</div>
                                        </Link>

                                        {(isAdmin || role === 'barbeiro') && (
                                            <>
                                                <div className="border-t border-gray-800 my-2"></div>
                                                <div className="px-3 py-1">
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Área Restrita</p>
                                                </div>
                                                <Link
                                                    to={isAdmin ? "/admin" : "/barbeiro"}
                                                    onClick={() => setIsOpen(false)}
                                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                                >
                                                    <div className="flex items-center gap-3"><LayoutDashboard className="w-5 h-5" /> Painel de Controlo</div>
                                                </Link>
                                                <Link
                                                    to="/verificar-encomenda"
                                                    onClick={() => setIsOpen(false)}
                                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                                                >
                                                    <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5" /> Validar Encomendas</div>
                                                </Link>
                                            </>
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
                                            className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-red-500 hover:bg-white/5 hover:text-red-400 mt-2 transition-colors flex items-center gap-3"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            Sair
                                        </button>
                                    </>
                                ) : (
                                    <div className="gap-3 grid grid-cols-2 px-2">
                                        <Link
                                            to="/login"
                                            onClick={() => setIsOpen(false)}
                                            className="block text-center text-white font-bold py-3 px-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            Entrar
                                        </Link>
                                        <Link
                                            to="/registo"
                                            onClick={() => setIsOpen(false)}
                                            className="block text-center btn-primary py-3 rounded-lg shadow-lg shadow-primary/10"
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
        </nav >
    );
};

export default Navbar;
