import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, ShoppingBag, Scissors, Loader, ChevronRight, Menu, X, Image } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Protect Admin Route
    React.useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/login');
                return;
            }

            const checkRole = async () => {
                const { data: profile } = await supabase
                    .from('perfis')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile?.role !== 'admin' && profile?.role !== 'barbeiro') {
                    navigate('/');
                }
            };
            checkRole();
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="flex bg-dark-bg min-h-[50vh] items-center justify-center">
                <Loader className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Agendamentos', path: '/admin/agendamentos', icon: Calendar },
        { name: 'Gestão', path: '/admin/gerenciar', icon: Users },
        { name: 'Produtos', path: '/admin/produtos', icon: ShoppingBag },
        { name: 'Galeria', path: '/admin/galeria', icon: Image },
        { name: 'Serviços', path: '/admin/servicos', icon: Scissors },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-zinc-950 pt-24 pb-12 relative flex">
            {/* Sidebar Toggle (Mobile) */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-primary text-dark rounded-full shadow-xl shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
            >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Sidebar Backdrop */}
            <AnimatePresence>
                {sidebarOpen && window.innerWidth < 1024 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Navigation */}
            <AnimatePresence mode="wait">
                {(sidebarOpen || window.innerWidth >= 1024) && (
                    <motion.aside
                        initial={{ x: -280, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -280, opacity: 0 }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
                        // Drag functionality for mobile
                        drag={window.innerWidth < 1024 ? "x" : false}
                        dragConstraints={{ top: 0, bottom: 0, left: -280, right: 0 }}
                        dragElastic={0.1}
                        onDragEnd={(_, info) => {
                            if (info.offset.x < -100) {
                                setSidebarOpen(false);
                            }
                        }}
                        className={clsx(
                            "fixed lg:sticky top-0 lg:top-24 left-0 h-screen lg:h-[calc(100vh-6rem)] w-[280px] lg:w-64 bg-zinc-900 lg:bg-zinc-900/50 backdrop-blur-md border-r border-white/5 z-40 lg:z-0 flex-shrink-0 lg:rounded-r-2xl overflow-y-auto shadow-2xl lg:shadow-none",
                            "lg:block"
                        )}
                        style={{ x: 0 }} // Reset transformation for drag
                    >
                        {/* Mobile Header in Sidebar */}
                        <div className="lg:hidden p-6 flex justify-between items-center border-b border-white/5 bg-zinc-900/50">
                            <span className="font-heading font-bold text-white text-lg">Menu</span>
                            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 hidden lg:block">Menu Admin</h2>
                            <nav className="space-y-2">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                                        className={clsx(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                            isActive(item.path)
                                                ? "text-primary bg-primary/10"
                                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <item.icon className={clsx("w-5 h-5", isActive(item.path) ? "text-primary" : "group-hover:text-primary")} />
                                        <span className="font-medium relative z-10">{item.name}</span>
                                        {isActive(item.path) && (
                                            <motion.div
                                                layoutId="active-nav"
                                                className="absolute inset-0 border-l-2 border-primary"
                                                transition={{ duration: 0.3 }}
                                            />
                                        )}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Quick Stats or Info in Sidebar Footer */}
                        <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent lg:from-black/50">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                    <Scissors className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Logado como</p>
                                    <p className="text-sm font-bold text-white truncate max-w-[120px]">{user?.user_metadata?.nome || 'Admin'}</p>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <motion.main
                layout
                className="flex-1 px-4 sm:px-8 max-w-[1600px] mx-auto w-full lg:w-auto overflow-hidden min-h-[calc(100vh-6rem)]"
            >
                {/* Breadcrumb-like header or spacing */}
                <div className="mb-8 flex items-center gap-2 text-sm text-gray-400">
                    <span>Painel</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-white">{navItems.find(i => isActive(i.path))?.name || 'Dashboard'}</span>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Outlet />
                </motion.div>
            </motion.main>
        </div>
    );
};

export default AdminLayout;
