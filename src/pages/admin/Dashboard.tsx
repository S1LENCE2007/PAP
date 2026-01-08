import React, { useEffect, useState } from 'react';
import { Users, Calendar, ShoppingBag, Loader, ArrowRight, Clock } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalClients: 0,
        todayAppointments: 0,
        totalProducts: 0,
        pendingReviews: 0,
        totalRevenue: 0
    });
    const navigate = useNavigate();
    const [recentActivity, setRecentActivity] = useState<{ id: string; data_hora: string; status: string; perfis: { nome: string } | { nome: string }[] | null; servicos: { nome: string } | { nome: string }[] | null }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];

                const [clients, appointments, products, reviews, revenueDataResult, recentAptsResult] = await Promise.all([
                    supabase.from('perfis').select('id', { count: 'exact' }).eq('role', 'cliente'),
                    supabase.from('Marcacoes').select('id', { count: 'exact' }).gte('data_hora', `${today}T00:00:00`).lte('data_hora', `${today}T23:59:59`),
                    supabase.from('produtos').select('id', { count: 'exact' }),
                    supabase.from('avaliacoes').select('id', { count: 'exact' }),
                    supabase.from('Marcacoes')
                        .select(`
                            servicos (preco)
                        `)
                        .eq('status', 'concluido'),
                    supabase.from('Marcacoes')
                        .select(`
                            id,
                            data_hora,
                            status,
                            perfis (nome),
                            servicos (nome)
                        `)
                        .order('created_at', { ascending: false })
                        .limit(5)
                ]);

                // Calculate total revenue from the specific revenue query result
                const totalRevenue = revenueDataResult.data?.reduce((acc, curr) => {
                    // @ts-ignore
                    return acc + (curr.servicos?.preco || 0);
                }, 0) || 0;

                setStats({
                    totalClients: clients.count || 0,
                    todayAppointments: appointments.count || 0,
                    totalProducts: products.count || 0,
                    pendingReviews: reviews.count || 0,
                    totalRevenue: totalRevenue
                });

                setRecentActivity(recentAptsResult.data || []);
            } catch (error) {
                console.error('Erro ao buscar estatísticas:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { title: 'Clientes Totais', value: stats.totalClients, icon: Users, color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20' },
        { title: 'Agendamentos Hoje', value: stats.todayAppointments, icon: Calendar, color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/20' },
        { title: 'Produtos', value: stats.totalProducts, icon: ShoppingBag, color: 'text-purple-400', bg: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20' },
        { title: 'Receita Total', value: `${stats.totalRevenue}€`, icon: ShoppingBag, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/20' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
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

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            <header className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-white">Dashboard</h1>
                <p className="text-gray-400">Visão geral da sua barbearia hoje.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        variants={item}
                        whileHover={{ y: -5 }}
                        className={`p-6 rounded-xl border ${stat.border} bg-gradient-to-br ${stat.bg} backdrop-blur-sm relative overflow-hidden group`}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Action Area */}
                <motion.div variants={item} className="lg:col-span-2 space-y-8">
                    {/* Recent Activity */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Últimos Agendamentos</h2>
                            <Link to="/admin/agendamentos" className="text-primary hover:text-amber-300 text-sm flex items-center gap-1 transition-colors">
                                Ver todos <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {recentActivity.length > 0 ? (
                            <div className="space-y-3">
                                {recentActivity.map((apt) => (
                                    <div key={apt.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">
                                                    {Array.isArray(apt.perfis) ? apt.perfis[0]?.nome : apt.perfis?.nome || 'Cliente Desconhecido'}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {Array.isArray(apt.servicos) ? apt.servicos[0]?.nome : apt.servicos?.nome}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1 justify-end">
                                                <Clock className="w-3 h-3" />
                                                {new Date(apt.data_hora).toLocaleDateString('pt-PT')}
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                                                ${apt.status === 'confirmado' ? 'bg-green-500/20 text-green-400' :
                                                    apt.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {apt.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Sem agendamentos recentes.</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Quick Actions Sidebar */}
                <motion.div variants={item} className="space-y-6">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                        <h2 className="text-xl font-bold text-white mb-6">Ações Rápidas</h2>
                        <div className="space-y-3">
                            <button onClick={() => navigate('/admin/agendamentos')}
                                className="w-full p-4 rounded-xl bg-white/5 hover:bg-primary/10 border border-white/5 hover:border-primary/30 flex items-center gap-4 transition-all group text-left">
                                <div className="p-2 rounded-lg bg-primary/20 text-primary group-hover:scale-110 transition-transform">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white group-hover:text-primary transition-colors">Gerir Agenda</h3>
                                    <p className="text-xs text-gray-400">Consultar marcações</p>
                                </div>
                            </button>

                            <button onClick={() => navigate('/admin/gerenciar')}
                                className="w-full p-4 rounded-xl bg-white/5 hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/30 flex items-center gap-4 transition-all group text-left">
                                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-500 group-hover:scale-110 transition-transform">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">Barbeiros & Serviços</h3>
                                    <p className="text-xs text-gray-400">Adicionar ou editar</p>
                                </div>
                            </button>

                            <button onClick={() => navigate('/admin/produtos')}
                                className="w-full p-4 rounded-xl bg-white/5 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/30 flex items-center gap-4 transition-all group text-left">
                                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-500 group-hover:scale-110 transition-transform">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">Loja Online</h3>
                                    <p className="text-xs text-gray-400">Gerir produtos</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
