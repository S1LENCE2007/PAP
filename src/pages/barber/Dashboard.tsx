import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';
import { Calendar, Clock, User, Scissors, CheckCircle, AlertCircle, Loader } from 'lucide-react';

import { motion } from 'framer-motion';

const BarberDashboard: React.FC = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        todayCount: 0,
        pendingCount: 0,
        completedCount: 0,
        totalRevenue: 0
    });
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'cancelled'>('upcoming');

    useEffect(() => {
        if (!user) return;
        fetchData();
    }, [user]);

    const fetchData = async () => {
        if (!user) return;
        try {
            // 1. Get Barber ID
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

            // 2. Fetch Appointments
            const { data, error } = await supabase
                .from('Marcacoes')
                .select(`
                    *,
                    servico:servicos(nome, duracao, preco),
                    cliente:perfis(nome, telemovel)
                `)
                .eq('barbeiro_id', barberData.id)
                .order('data_hora', { ascending: true }); // Closest first

            if (error) throw error;

            const apts = data || [];
            setAppointments(apts);

            // 3. Calculate Stats
            const today = new Date().toISOString().split('T')[0];
            const todayApts = apts.filter(a => a.data_hora.startsWith(today));
            const pending = apts.filter(a => a.status === 'pendente');
            const completed = apts.filter(a => a.status === 'confirmado' || a.status === 'concluido'); // Assuming 'confirmado' roughly means confirmed/done contextually or user marks as done

            const revenue = completed.reduce((acc, curr) => {
                const price = curr.servico?.preco || 0;
                return acc + price;
            }, 0);

            setStats({
                todayCount: todayApts.length,
                pendingCount: pending.length,
                completedCount: completed.length,
                totalRevenue: revenue
            });

        } catch (error) {
            console.error('Error fetching data:', error);
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
        { title: 'Hoje', value: stats.todayCount, icon: Calendar, color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20' },
        { title: 'Pendentes', value: stats.pendingCount, icon: AlertCircle, color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/20' },
        { title: 'Confirmados', value: stats.completedCount, icon: CheckCircle, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/20' },
        { title: 'Receita Est.', value: `${stats.totalRevenue}€`, icon: Scissors, color: 'text-purple-400', bg: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20' },
    ];

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        if (!window.confirm(`Deseja alterar o status para "${newStatus}"?`)) return;

        try {
            const { error } = await supabase
                .from('Marcacoes')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Erro ao atualizar status.');
        }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="min-h-screen bg-dark-bg text-white p-6 pt-24"
        >
            <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-white">Painel do Barbeiro</h1>
                    <p className="text-gray-400">Bem-vindo, {user?.user_metadata?.nome || 'Profissional'}</p>
                </div>
                <div className="flex gap-4">

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Action Area: Appointments List */}
                <motion.div variants={item} className="lg:col-span-2 space-y-8">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <h2 className="text-xl font-bold text-white">Seus Agendamentos</h2>

                            <div className="flex p-1 bg-black/40 rounded-lg border border-white/5">
                                <button
                                    onClick={() => setActiveTab('upcoming')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'upcoming' ? 'bg-zinc-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Próximos
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-zinc-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Histórico
                                </button>
                                <button
                                    onClick={() => setActiveTab('cancelled')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'cancelled' ? 'bg-zinc-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Cancelados
                                </button>
                            </div>
                        </div>

                        {appointments.filter(apt => {
                            if (activeTab === 'upcoming') return apt.status === 'pendente' || apt.status === 'confirmado';
                            if (activeTab === 'history') return apt.status === 'concluido';
                            if (activeTab === 'cancelled') return apt.status === 'cancelado';
                            return true;
                        }).length > 0 ? (
                            <div className="space-y-3">
                                {appointments
                                    .filter(apt => {
                                        if (activeTab === 'upcoming') return apt.status === 'pendente' || apt.status === 'confirmado';
                                        if (activeTab === 'history') return apt.status === 'concluido';
                                        if (activeTab === 'cancelled') return apt.status === 'cancelado';
                                        return true;
                                    })
                                    .map((apt) => (
                                        <div key={apt.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors shrink-0">
                                                    <User className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-lg">
                                                        {apt.cliente?.nome || 'Cliente Desconhecido'}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                                        <Scissors className="w-3 h-3" />
                                                        {apt.servico?.nome}
                                                        <span className="text-primary font-bold">({apt.servico?.preco}€)</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-1 w-full md:w-auto justify-between md:justify-end pl-16 md:pl-0">
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Clock className="w-4 h-4 text-primary" />
                                                    <span className="font-medium">
                                                        {new Date(apt.data_hora).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })}
                                                        <span className="mx-1">•</span>
                                                        {new Date(apt.data_hora).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                                                    ${apt.status === 'confirmado' ? 'bg-green-500/20 text-green-400' :
                                                            apt.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                apt.status === 'concluido' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {apt.status}
                                                    </span>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2 mt-2">
                                                    {apt.status === 'pendente' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(apt.id, 'confirmado')}
                                                                className="px-3 py-1 bg-green-500/10 text-green-400 text-xs rounded hover:bg-green-500/20 transition-colors font-bold border border-green-500/20"
                                                            >
                                                                Confirmar
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(apt.id, 'cancelado')}
                                                                className="px-3 py-1 bg-red-500/10 text-red-400 text-xs rounded hover:bg-red-500/20 transition-colors font-bold border border-red-500/20"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </>
                                                    )}
                                                    {apt.status === 'confirmado' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(apt.id, 'concluido')}
                                                            className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs rounded hover:bg-blue-500/20 transition-colors font-bold border border-blue-500/20"
                                                        >
                                                            Concluir
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-gray-500">
                                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="text-lg">Sem agendamentos encontrados.</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Quick Actions Sidebar */}
                <motion.div variants={item} className="space-y-6">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                        <h2 className="text-xl font-bold text-white mb-6">Informações</h2>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <h3 className="font-bold text-white mb-1">Dica do Dia</h3>
                                <p className="text-sm text-gray-400">Mantenha sua disponibilidade atualizada para evitar conflitos.</p>
                            </div>

                            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                                <h3 className="font-bold text-primary mb-1">Suporte</h3>
                                <p className="text-sm text-gray-400">Precisa de ajuda com o sistema? Contate o administrador.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default BarberDashboard;
