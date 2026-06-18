import toast from 'react-hot-toast';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';
import { CheckCircle, X, Repeat, Loader } from 'lucide-react';
import Calendar, { type CalendarEvent } from '../../components/Calendar';
import { motion } from 'framer-motion';
import ConfirmModal from '../../components/modals/ConfirmModal';
import RescheduleModal from '../../components/modals/RescheduleModal';

const BarberAppointments: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Calendar states
    const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());

    // Reschedule State
    const [reschedulingApt, setReschedulingApt] = useState<any>(null);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null; newStatus: string | null; message: string }>({ isOpen: false, id: null, newStatus: null, message: '' });

    useEffect(() => {
        if (!user) return;
        fetchData();
    }, [user]);

    const fetchData = async () => {
        if (!user) return;
        try {
            let query = supabase
                .from('Marcacoes')
                .select(`
                    *,
                    servico:servicos(nome, duracao, preco),
                    cliente:perfis(nome, telemovel, email),
                    barbeiros (nome)
                `);

            if (!isAdmin) {
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
                query = query.eq('barbeiro_id', barberData.id);
            }

            const { data, error } = await query.order('data_hora', { ascending: true });

            if (error) throw error;
            const now = new Date();
            const apts = (data || []).map(item => {
                let currentStatus = item.status === 'pendente' ? 'marcado' : item.status;
                const aptDate = new Date(item.data_hora);
                const endDate = new Date(aptDate.getTime() + (item.servico?.duracao || 30) * 60000);

                if ((currentStatus === 'marcado' || currentStatus === 'confirmado') && now > endDate) {
                    currentStatus = 'concluido';
                    supabase.from('Marcacoes').update({ status: 'concluido' }).eq('id', item.id).then();
                } else if (item.status === 'pendente') {
                    supabase.from('Marcacoes').update({ status: 'marcado' }).eq('id', item.id).then();
                }

                return { ...item, status: currentStatus };
            });

            setAppointments(apts);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const calendarEvents: CalendarEvent[] = appointments.map(apt => ({
        id: apt.id,
        title: apt.cliente?.nome || 'Cliente',
        subtitle: (() => {
            const serviceName = apt.servico?.nome || 'Serviço';
            const bData = Array.isArray(apt.barbeiros) ? apt.barbeiros[0] : apt.barbeiros;
            return `${serviceName} • ${bData?.nome || 'Sem Barbeiro'}`;
        })(),
        start: new Date(apt.data_hora),
        end: new Date(new Date(apt.data_hora).getTime() + (apt.servico?.duracao || 30) * 60000),
        status: apt.status,
        clientDetails: {
            name: apt.cliente?.nome || 'Cliente',
            phone: apt.cliente?.telemovel,
            email: apt.cliente?.email
        },
        rawAppointment: apt
    }));

    const handleStatusUpdateClick = (id: string, newStatus: string) => {
        setConfirmModal({
            isOpen: true,
            id,
            newStatus,
            message: `Deseja alterar o status para "${newStatus}"?`
        });
    };

    const handleConfirmStatusUpdate = async () => {
        if (!confirmModal.id || !confirmModal.newStatus) return;

        try {
            const { error } = await supabase
                .from('Marcacoes')
                .update({ status: confirmModal.newStatus })
                .eq('id', confirmModal.id);

            if (error) throw error;
            fetchData();
            toast.success('Status atualizado com sucesso!');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Erro ao atualizar status.');
        } finally {
            setConfirmModal({ isOpen: false, id: null, newStatus: null, message: '' });
        }
    };

    const renderBarberActions = (event: CalendarEvent) => {
        const apt = event.rawAppointment;
        if (!apt) return null;

        return (
            <div className="flex flex-wrap gap-2">
                {(apt.status === 'marcado' || apt.status === 'confirmado' || apt.status === 'pendente') && (
                    <button
                        onClick={() => setReschedulingApt(apt)}
                        className="flex-1 min-w-[120px] py-2 bg-zinc-700/50 text-gray-300 rounded-lg hover:bg-zinc-600 transition-all font-bold flex items-center justify-center gap-2 border border-white/5"
                    >
                        <Repeat className="w-4 h-4" /> Remarcar
                    </button>
                )}
                {(apt.status === 'marcado' || apt.status === 'pendente') && (
                    <button
                        onClick={() => handleStatusUpdateClick(apt.id, 'confirmado')}
                        className="flex-1 min-w-[120px] py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-all font-bold flex items-center justify-center gap-2 border border-green-500/20"
                    >
                        <CheckCircle className="w-4 h-4" /> Confirmar
                    </button>
                )}
                {apt.status === 'confirmado' && (
                    <button
                        onClick={() => handleStatusUpdateClick(apt.id, 'concluido')}
                        className="flex-1 min-w-[120px] py-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-all font-bold flex items-center justify-center gap-2 border border-emerald-500/20"
                    >
                        <CheckCircle className="w-4 h-4" /> Concluir
                    </button>
                )}
                {(apt.status === 'marcado' || apt.status === 'pendente' || apt.status === 'confirmado') && (
                    <button
                        onClick={() => handleStatusUpdateClick(apt.id, 'cancelado')}
                        className="flex-1 min-w-[120px] py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all font-bold flex items-center justify-center gap-2 border border-red-500/20"
                    >
                        <X className="w-4 h-4" /> Cancelar
                    </button>
                )}
            </div>
        );
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

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="text-white"
        >
            <div className="w-full">
                <motion.div variants={item} className="space-y-8">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                        <Calendar
                            events={calendarEvents}
                            view={calendarView}
                            onViewChange={setCalendarView}
                            currentDate={currentDate}
                            onDateChange={setCurrentDate}
                            renderActions={renderBarberActions}
                        />
                    </div>
                </motion.div>
            </div>

            {reschedulingApt && (
                <RescheduleModal
                    isOpen={!!reschedulingApt}
                    onClose={() => setReschedulingApt(null)}
                    appointmentId={reschedulingApt.id}
                    currentBarberId={reschedulingApt.barbeiro_id}
                    currentServiceId={reschedulingApt.servico_id}
                    currentDateHora={reschedulingApt.data_hora}
                    onSuccess={fetchData}
                />
            )}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, newStatus: null, message: '' })}
                onConfirm={handleConfirmStatusUpdate}
                title="Atualizar Status"
                message={confirmModal.message}
                confirmText="Confirmar"
                isDestructive={confirmModal.newStatus === 'cancelado'}
            />
        </motion.div>
    );
};

export default BarberAppointments;
