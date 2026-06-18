import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';
import { Calendar as CalendarIcon, CheckCircle, AlertCircle, Loader, Package, Users, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const BarberDashboard: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        todayCount: 0,
        pendingCount: 0,
        completedCount: 0,
        totalOrders: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;
        fetchData();
    }, [user]);

    const fetchData = async () => {
        if (!user) return;
        try {
            let barberId = user.id;

            if (!isAdmin) {
                // Get Barber ID linked to user
                const { data: barberData, error: barberError } = await supabase
                    .from('barbeiros')
                    .select('id')
                    .eq('id', user.id)
                    .single();

                if (barberError || !barberData) {
                    console.error("Barber not found linked to this user");
                    setLoading(false);
                    return;
                }
                barberId = barberData.id;
            }

            // 1. Fetch Appointments stats (for stats calculation)
            let appointmentsQuery = supabase
                .from('Marcacoes')
                .select(`
                    id,
                    data_hora,
                    status,
                    servicos (duracao)
                `);

            if (!isAdmin) {
                appointmentsQuery = appointmentsQuery.eq('barbeiro_id', barberId);
            }

            const { data: aptsData, error: aptsError } = await appointmentsQuery;
            if (aptsError) throw aptsError;

            // 2. Fetch Orders Count
            const { count: ordersCount } = await supabase
                .from('encomendas')
                .select('*', { count: 'exact', head: true });

            // Calculate Stats
            const now = new Date();
            const today = new Date();
            const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            const processedApts = (aptsData || []).map(item => {
                const servicos = Array.isArray(item.servicos) ? item.servicos[0] : item.servicos;
                let currentStatus = item.status === 'pendente' ? 'marcado' : item.status;
                const aptDate = new Date(item.data_hora);
                const duracao = servicos && typeof servicos.duracao === 'number' ? servicos.duracao : 30;
                const endDate = new Date(aptDate.getTime() + (duracao * 60000));

                if ((currentStatus === 'marcado' || currentStatus === 'confirmado') && now > endDate) {
                    currentStatus = 'concluido';
                }
                return { ...item, status: currentStatus };
            });

            const todayApts = processedApts.filter(a => {
                if (!a.data_hora) return false;
                const aptDate = new Date(a.data_hora);
                const aptString = `${aptDate.getFullYear()}-${String(aptDate.getMonth() + 1).padStart(2, '0')}-${String(aptDate.getDate()).padStart(2, '0')}`;
                return aptString === todayString;
            });

            const pending = processedApts.filter(a => a.status === 'marcado' || a.status === 'pendente');
            const confirmed = processedApts.filter(a => a.status === 'confirmado');

            setStats({
                todayCount: todayApts.length,
                pendingCount: pending.length,
                completedCount: confirmed.length,
                totalOrders: ordersCount || 0
            });

            // 3. Fetch Recent Activity (last 5 appointments)
            let recentQuery = supabase
                .from('Marcacoes')
                .select(`
                    id,
                    data_hora,
                    status,
                    perfis (nome, telemovel, email),
                    servicos (nome),
                    barbeiros (nome)
                `);

            if (!isAdmin) {
                recentQuery = recentQuery.eq('barbeiro_id', barberId);
            }

            const { data: recentData, error: recentError } = await recentQuery
                .order('created_at', { ascending: false })
                .limit(5);

            if (recentError) throw recentError;

            const mappedRecent = (recentData || []).map(item => ({
                ...item,
                status: item.status === 'pendente' ? 'marcado' : item.status
            }));
            setRecentActivity(mappedRecent);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg text-white flex justify-center items-center">
                <Loader className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const statCards = [
        { title: 'Hoje', value: stats.todayCount, icon: CalendarIcon, color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20' },
        { title: 'Marcados', value: stats.pendingCount, icon: AlertCircle, color: 'text-yellow-400', bg: 'from-yellow-500/20 to-yellow-600/5', border: 'border-yellow-500/20' },
        { title: 'Confirmados', value: stats.completedCount, icon: CheckCircle, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/20' },
        { title: 'Encomendas', value: stats.totalOrders, icon: Package, color: 'text-purple-400', bg: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20' },
    ];

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="text-white"
        >
            <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-white">Dashboard do Barbeiro</h1>
                    <p className="text-gray-400">Bem-vindo, {user?.user_metadata?.nome || 'Profissional'}</p>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        variants={item}
                        whileHover={{ y: -5 }}
                        className={`p-4 rounded-xl border ${stat.border} bg-gradient-to-br ${stat.bg} backdrop-blur-sm relative overflow-hidden group`}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <stat.icon className="w-16 h-16" />
                        </div>
                        <div className="relative z-10">
                            <div className={`p-3 rounded-lg w-fit mb-4 bg-black/20 ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                            <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">{stat.title}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="w-full">
                {/* Recent Activity */}
                <motion.div variants={item} className="space-y-8">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Últimas Marcações</h2>
                            <Link to="/barbeiro/marcações" className="text-primary hover:text-amber-300 text-sm flex items-center gap-1 transition-colors">
                                Ver todas <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {recentActivity.length > 0 ? (
                            <div className="space-y-3">
                                {recentActivity.map((apt) => {
                                    const profile = Array.isArray(apt.perfis) ? apt.perfis[0] : apt.perfis;
                                    const service = Array.isArray(apt.servicos) ? apt.servicos[0] : apt.servicos;
                                    const barber = Array.isArray(apt.barbeiros) ? apt.barbeiros[0] : apt.barbeiros;

                                    return (
                                        <div key={apt.id} className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group gap-2 sm:gap-0">
                                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                                    <Users className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">
                                                        {profile?.nome || 'Cliente Desconhecido'}
                                                    </p>
                                                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-3 text-xs text-gray-400 mt-0.5">
                                                        <span>{profile?.telemovel}</span>
                                                        <span className="hidden sm:inline">•</span>
                                                        <span>{profile?.email}</span>
                                                    </div>
                                                    <p className="text-sm text-primary mt-1">
                                                        {service?.nome} • <span className="text-gray-400 font-normal">Profissional: {barber?.nome || 'Sem Barbeiro'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right w-full sm:w-auto mt-2 sm:mt-0 flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-0 sm:mb-1 justify-end">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(apt.data_hora).toLocaleDateString('pt-PT', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                                                    ${apt.status === 'confirmado' ? 'bg-blue-500/20 text-blue-400' :
                                                        (apt.status === 'marcado' || apt.status === 'pendente') ? 'bg-yellow-500/20 text-yellow-400' :
                                                            apt.status === 'concluido' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {apt.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Sem marcações recentes.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default BarberDashboard;
