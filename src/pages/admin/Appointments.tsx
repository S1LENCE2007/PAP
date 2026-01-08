import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Check, X, Search, Loader, Calendar, Clock, User, Scissors } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface Appointment {
    id: string;
    data_hora: string;
    status: string;
    perfis: {
        nome: string;
        telemovel: string;
        email?: string;
    } | null;
    servicos: {
        nome: string;
        preco: number;
        duracao: number;
    } | null;
    barbeiros: {
        nome: string;
    } | null;
}

const AdminAppointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('Marcacoes')
                .select(`
                    id,
                    data_hora,
                    status,
                    perfis (nome, telemovel, email),
                    servicos (nome, preco, duracao),
                    barbeiros (nome)
                `)
                .order('data_hora', { ascending: true });

            // If a specific date is selected, filter by that day
            if (dateFilter) {
                const startDate = `${dateFilter}T00:00:00`;
                const endDate = `${dateFilter}T23:59:59`;
                query = query.gte('data_hora', startDate).lte('data_hora', endDate);
            } else {
                // If no date selected (Upcoming view), show from today onwards
                const today = new Date().toISOString().split('T')[0];
                const startDate = `${today}T00:00:00`;
                query = query.gte('data_hora', startDate);
            }

            const { data, error } = await query;

            if (error) throw error;

            type SectionData = { nome: string; telemovel?: string; email?: string; preco?: number; duracao?: number };

            interface AppointmentData {
                id: string;
                data_hora: string;
                status: string;
                perfis: SectionData | SectionData[];
                servicos: SectionData | SectionData[];
                barbeiros: SectionData | SectionData[];
            }

            const formattedData = (data as unknown as AppointmentData[]).map(item => {
                const perfis = Array.isArray(item.perfis) ? item.perfis[0] : item.perfis;
                const servicos = Array.isArray(item.servicos) ? item.servicos[0] : item.servicos;
                const barbeiros = Array.isArray(item.barbeiros) ? item.barbeiros[0] : item.barbeiros;

                return {
                    ...item,
                    perfis: perfis ? {
                        nome: perfis.nome,
                        telemovel: perfis.telemovel || '',
                        email: perfis.email
                    } : null,
                    servicos: servicos ? {
                        nome: servicos.nome,
                        preco: servicos.preco || 0,
                        duracao: servicos.duracao || 0
                    } : null,
                    barbeiros: barbeiros ? {
                        nome: barbeiros.nome
                    } : null
                };
            });

            setAppointments(formattedData);
        } catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [dateFilter]);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('Marcacoes')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            setAppointments(prev => prev.map(apt =>
                apt.id === id ? { ...apt, status: newStatus } : apt
            ));
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = apt.perfis?.nome.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesTab = true;
        if (activeTab === 'pending') matchesTab = apt.status === 'pendente';
        else if (activeTab === 'confirmed') matchesTab = apt.status === 'confirmado';
        else if (activeTab === 'history') matchesTab = apt.status === 'concluido' || apt.status === 'cancelado';

        return matchesSearch && matchesTab;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'confirmado': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'pendente': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'cancelado': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-white">Agendamentos</h1>
                    <p className="text-gray-400">Gerencie todas as marcações da barbearia.</p>
                </div>

                <div className="flex bg-zinc-900 border border-white/10 rounded-xl p-1 items-center">
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="bg-transparent text-white px-4 py-2 outline-none cursor-pointer"
                    />
                    {dateFilter && (
                        <button
                            onClick={() => setDateFilter('')}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors mr-1"
                            title="Limpar filtro de data (Ver Todos Futuros)"
                        >
                            <span className="text-xs font-bold uppercase">Ver Todos</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome do cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                    />
                </div>

                <div className="flex p-1 bg-zinc-900/50 rounded-xl border border-white/10 overflow-x-auto max-w-full">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-zinc-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'pending' ? 'bg-zinc-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Pendentes
                    </button>
                    <button
                        onClick={() => setActiveTab('confirmed')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'confirmed' ? 'bg-zinc-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Confirmados
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-zinc-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Histórico
                    </button>
                </div>
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : filteredAppointments.length > 0 ? (
                    <AnimatePresence>
                        {filteredAppointments.map((apt) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={apt.id}
                                className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-primary/30 transition-all group"
                            >
                                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">

                                    {/* Time & Date */}
                                    <div className="flex items-center gap-4 min-w-[180px]">
                                        <div className="p-3 bg-white/5 rounded-xl text-primary group-hover:scale-110 transition-transform">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-white">
                                                {format(new Date(apt.data_hora), "HH:mm")}
                                            </p>
                                            <p className="text-sm text-gray-500 capitalize">
                                                {format(new Date(apt.data_hora), "EEEE, d MMM", { locale: pt })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Client Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="hidden sm:flex w-10 h-10 rounded-full bg-zinc-800 items-center justify-center text-gray-400">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{apt.perfis?.nome || 'Cliente Desconhecido'}</p>
                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                <span>{apt.perfis?.telemovel}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Service Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="hidden sm:flex w-10 h-10 rounded-full bg-zinc-800 items-center justify-center text-gray-400">
                                            <Scissors className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{apt.servicos?.nome || 'Serviço Removido'}</p>
                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                <span>{apt.servicos?.preco}€</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-700" />
                                                <span>{apt.servicos?.duracao} min</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-700" />
                                                <span className="text-primary">{apt.barbeiros?.nome}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="flex items-center gap-4 justify-end">
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusStyle(apt.status)}`}>
                                            {apt.status}
                                        </div>

                                        <div className="flex gap-2">
                                            {apt.status === 'pendente' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(apt.id, 'confirmado')}
                                                        className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 active:scale-95 transition-all"
                                                        title="Confirmar"
                                                    >
                                                        <Check className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(apt.id, 'cancelado')}
                                                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 active:scale-95 transition-all"
                                                        title="Rejeitar"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}
                                            {apt.status === 'confirmado' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(apt.id, 'concluido')}
                                                        className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 active:scale-95 transition-all"
                                                        title="Concluir"
                                                    >
                                                        <Check className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(apt.id, 'cancelado')}
                                                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 active:scale-95 transition-all"
                                                        title="Cancelar"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-white/5 border-dashed">
                        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                        <h3 className="text-xl font-bold text-white mb-2">Sem agendamentos</h3>
                        <p className="text-gray-500">Nenhum agendamento encontrado para os filtros selecionados.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAppointments;
