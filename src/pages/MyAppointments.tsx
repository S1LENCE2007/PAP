import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Loader, Scissors, User, X, Repeat, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import PageHeader from '../components/layout/PageHeader';
import { getGoogleCalendarUrl } from '../utils/calendar';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/modals/ConfirmModal';

interface Appointment {
    id: string;
    data_hora: string;
    status: string;
    servicos: {
        id: string;
        nome: string;
        preco: number;
        duracao: number;
    };
    barbeiros: {
        id: string;
        nome: string;
    };
}

const MyAppointments: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

    useEffect(() => {
        if (user) {
            fetchAppointments();
        }
    }, [user]);

    const fetchAppointments = async () => {
        try {
            const { data, error } = await supabase
                .from('Marcacoes')
                .select(`
                    id,
                    data_hora,
                    status,
                    barbeiro_id,
                    servicos (id, nome, preco, duracao),
                    barbeiros (id, nome)
                `)
                .eq('cliente_id', user?.id)
                .order('data_hora', { ascending: false });

            if (error) throw error;

            type SectionData = { id?: string; nome: string; preco?: number; duracao?: number };

            interface AppointmentData {
                id: string;
                data_hora: string;
                status: string;
                barbeiro_id: string;
                servicos: SectionData | SectionData[];
                barbeiros: SectionData | SectionData[];
            }
            const now = new Date();
            const formattedData = (data as unknown as AppointmentData[]).map(item => {
                const servicos = Array.isArray(item.servicos) ? item.servicos[0] : item.servicos;
                const barbeiros = Array.isArray(item.barbeiros) ? item.barbeiros[0] : item.barbeiros;

                let currentStatus = item.status === 'pendente' ? 'marcado' : item.status;
                const aptDate = new Date(item.data_hora);
                const duracao = servicos && typeof servicos.duracao === 'number' ? servicos.duracao : 30;
                const endDate = new Date(aptDate.getTime() + (duracao * 60000));

                if ((currentStatus === 'marcado' || currentStatus === 'confirmado') && now > endDate) {
                    currentStatus = 'concluido';
                    supabase.from('Marcacoes').update({ status: 'concluido' }).eq('id', item.id).then();
                } else if (item.status === 'pendente') {
                    supabase.from('Marcacoes').update({ status: 'marcado' }).eq('id', item.id).then();
                }

                return {
                    ...item,
                    status: currentStatus,
                    servicos: servicos ? {
                        id: servicos.id,
                        nome: servicos.nome,
                        preco: servicos.preco || 0,
                        duracao: servicos.duracao || 0
                    } : { id: '', nome: 'Serviço Removido', preco: 0, duracao: 0 },
                    barbeiros: barbeiros ? {
                        id: barbeiros.id || item.barbeiro_id,
                        nome: barbeiros.nome
                    } : { id: item.barbeiro_id || '', nome: 'Barbeiro Removido' }
                };
            }) as Appointment[];

            setAppointments(formattedData);
        } catch (error) {
            console.error('Erro ao buscar marcações:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = (id: string) => {
        setConfirmModal({ isOpen: true, id });
    };

    const handleConfirmCancel = async () => {
        if (!confirmModal.id) return;
        try {
            const { error } = await supabase
                .from('Marcacoes')
                .update({ status: 'cancelado' })
                .eq('id', confirmModal.id);

            if (error) throw error;

            setAppointments(prev => prev.map(apt => 
                apt.id === confirmModal.id ? { ...apt, status: 'cancelado' } : apt
            ));
            
            toast.success('Marcação cancelada com sucesso!');
        } catch (error) {
            console.error('Erro ao cancelar:', error);
            toast.error('Erro ao cancelar marcação.');
        } finally {
            setConfirmModal({ isOpen: false, id: null });
        }
    };

    const handleReschedule = (apt: Appointment) => {
        navigate('/agendar', {
            state: {
                serviceName: apt.servicos.nome,
                barberName: apt.barbeiros.nome,
                editAppointmentId: apt.id,
                barberId: apt.barbeiros.id,
                serviceId: apt.servicos.id,
                serviceDuracao: apt.servicos.duracao,
                servicePreco: apt.servicos.preco
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <Loader className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmado': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
            case 'marcado': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
            case 'concluido': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20';
            case 'cancelado': return 'bg-red-500/20 text-red-400 border-red-500/20';
            default: return 'bg-amber-500/20 text-amber-400 border-amber-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'concluido': return <CheckCircle className="w-4 h-4" />;
            case 'cancelado': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg text-white pb-20">
            <PageHeader
                title="Minhas Marcações"
                subtitle="Consulte o histórico dos seus agendamentos"
                backgroundImage="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                {appointments.length > 0 ? (
                    <div className="grid gap-8">
                        {appointments.map((apt, index) => (
                            <motion.div
                                key={apt.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl hover:shadow-primary/5 transition-all duration-300"
                            >
                                {/* Header */}
                                <div className="bg-white/5 p-6 border-b border-white/5 flex flex-wrap gap-4 justify-between items-center">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-primary font-bold font-mono">
                                            <CalendarIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400 flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {new Date(apt.data_hora).toLocaleDateString('pt-PT', {
                                                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                            <h3 className="text-lg font-bold text-white mt-0.5">
                                                {apt.servicos?.nome}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-bold uppercase tracking-wider text-xs ${getStatusColor(apt.status)}`}>
                                        {getStatusIcon(apt.status)}
                                        {apt.status}
                                    </div>
                                </div>

                                <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
                                    {/* Left Details */}
                                    <div className="md:col-span-2 space-y-4">
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Detalhes do Serviço</h4>
                                        <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center">
                                                <Scissors className="w-8 h-8 text-zinc-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white line-clamp-1">{apt.servicos?.nome}</p>
                                                <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                                                    <User className="w-4 h-4" /> Barbeiro: {apt.barbeiros?.nome}
                                                </p>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="bg-black/30 px-2 py-0.5 rounded text-gray-300">
                                                        {apt.servicos?.duracao} min
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary & Actions */}
                                    <div className="md:col-span-1 border-l border-white/5 md:pl-8 space-y-6 flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Resumo</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between text-white font-bold text-lg pt-2 mt-2">
                                                    <span>Preço</span>
                                                    <span className="text-primary">{apt.servicos?.preco}€</span>
                                                </div>
                                            </div>
                                        </div>

                                        {(apt.status === 'marcado' || apt.status === 'confirmado') && (
                                            <div className="grid grid-cols-2 gap-2 mt-4">
                                                <a
                                                    href={getGoogleCalendarUrl(
                                                        `Corte - ${apt.servicos?.nome}`,
                                                        apt.data_hora,
                                                        apt.servicos?.duracao || 60
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex flex-col items-center justify-center gap-2 p-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-colors text-xs font-bold text-center"
                                                >
                                                    <CalendarIcon className="w-5 h-5" />
                                                    Calendário
                                                </a>
                                                <button
                                                    onClick={() => handleReschedule(apt)}
                                                    className="flex flex-col items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors text-xs font-bold text-center"
                                                >
                                                    <Repeat className="w-5 h-5" />
                                                    Remarcar
                                                </button>
                                                <button
                                                    onClick={() => handleCancelClick(apt.id)}
                                                    className="col-span-2 flex items-center justify-center gap-2 p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors text-xs font-bold mt-2"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Cancelar Marcação
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-zinc-900/50 rounded-3xl border border-white/5 border-dashed">
                        <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CalendarIcon className="w-10 h-10 text-gray-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Sem marcações</h3>
                        <p className="text-gray-400 max-w-sm mx-auto mb-8">Você ainda não realizou marcações connosco.</p>
                        <button onClick={() => navigate('/agendar')} className="btn-primary px-8 py-3">
                            Agendar Agora
                        </button>
                    </div>
                )}
            </div>
            
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null })}
                onConfirm={handleConfirmCancel}
                title="Cancelar Marcação"
                message="Tem certeza que deseja cancelar e apagar completamente esta marcação? Esta ação não pode ser desfeita."
                confirmText="Cancelar Marcação"
            />
        </div>
    );
};

export default MyAppointments;
