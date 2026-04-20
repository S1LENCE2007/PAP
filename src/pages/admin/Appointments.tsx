import React, { useEffect, useState } from 'react';
import { Check, X, Loader, Repeat } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar, { type CalendarEvent } from '../../components/Calendar';

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
    // Reschedule states
    const [reschedulingApt, setReschedulingApt] = useState<any>(null);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');

    // Calendar states
    const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());

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
            const now = new Date();
            const formattedData = (data as unknown as AppointmentData[]).map(item => {
                const perfis = Array.isArray(item.perfis) ? item.perfis[0] : item.perfis;
                const servicos = Array.isArray(item.servicos) ? item.servicos[0] : item.servicos;
                const barbeiros = Array.isArray(item.barbeiros) ? item.barbeiros[0] : item.barbeiros;

                let currentStatus = item.status === 'pendente' ? 'marcado' : item.status;
                const aptDate = new Date(item.data_hora);
                const endDate = new Date(aptDate.getTime() + (servicos?.duracao || 30) * 60000);

                // Auto-conclude past appointments
                if ((currentStatus === 'marcado' || currentStatus === 'confirmado') && now > endDate) {
                    currentStatus = 'concluido';
                    supabase.from('Marcacoes').update({ status: 'concluido' }).eq('id', item.id).then();
                } else if (item.status === 'pendente') {
                    // Migrate legacy 'pendente' to 'marcado'
                    supabase.from('Marcacoes').update({ status: 'marcado' }).eq('id', item.id).then();
                }

                return {
                    ...item,
                    status: currentStatus,
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
    }, []);

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

    const handleRescheduleSubmit = async () => {
        if (!newDate || !newTime) return alert('Por favor, selecione a nova data e hora.');
        const novaDataHora = `${newDate}T${newTime}:00`;
        
        try {
            const { error } = await supabase
                .from('Marcacoes')
                .update({ data_hora: novaDataHora })
                .eq('id', reschedulingApt.id);

            if (error) throw error;
            
            fetchAppointments();
            setReschedulingApt(null);
            setNewDate('');
            setNewTime('');
            alert('Marcação reagendada com sucesso!');
        } catch (error) {
            console.error('Erro ao reagendar:', error);
            alert('Erro ao reagendar a marcação.');
        }
    };



    const calendarEvents: CalendarEvent[] = appointments.map(apt => ({
        id: apt.id,
        title: apt.perfis?.nome || 'Cliente',
        subtitle: `${apt.servicos?.nome || 'Vários'} • ${apt.barbeiros?.nome || ''}`,
        start: new Date(apt.data_hora),
        end: new Date(new Date(apt.data_hora).getTime() + (apt.servicos?.duracao || 30) * 60000),
        status: apt.status,
        clientDetails: {
            name: apt.perfis?.nome || 'Cliente',
            phone: apt.perfis?.telemovel,
            email: apt.perfis?.email
        },
        rawAppointment: apt
    }));

    const renderAdminActions = (event: CalendarEvent) => {
        const apt = event.rawAppointment;
        if (!apt) return null;

        return (
            <div className="flex flex-wrap gap-2">
                {(apt.status === 'marcado' || apt.status === 'confirmado' || apt.status === 'pendente') && (
                    <button
                        onClick={() => {
                            setReschedulingApt(apt);
                        }}
                        className="flex-1 min-w-[120px] py-2 bg-zinc-700/50 text-gray-300 rounded-lg hover:bg-zinc-600 transition-all font-bold flex items-center justify-center gap-2 border border-white/5"
                    >
                        <Repeat className="w-4 h-4" /> Reagendar
                    </button>
                )}
                {(apt.status === 'marcado' || apt.status === 'pendente') && (
                    <button
                        onClick={() => handleStatusUpdate(apt.id, 'confirmado')}
                        className="flex-1 min-w-[120px] py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-all font-bold flex items-center justify-center gap-2 border border-green-500/20"
                    >
                        <Check className="w-4 h-4" /> Confirmar
                    </button>
                )}
                {apt.status === 'confirmado' && (
                    <button
                        onClick={() => handleStatusUpdate(apt.id, 'concluido')}
                        className="flex-1 min-w-[120px] py-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-all font-bold flex items-center justify-center gap-2 border border-emerald-500/20"
                    >
                        <Check className="w-4 h-4" /> Concluir
                    </button>
                )}
                {(apt.status === 'marcado' || apt.status === 'pendente' || apt.status === 'confirmado') && (
                    <button
                        onClick={() => handleStatusUpdate(apt.id, 'cancelado')}
                        className="flex-1 min-w-[120px] py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all font-bold flex items-center justify-center gap-2 border border-red-500/20"
                    >
                        <X className="w-4 h-4" /> Cancelar
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-end gap-4 mb-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-white">Calendário de Agendamentos</h1>
                    <p className="text-gray-400">Visão global e gestão imediata de todas as marcações.</p>
                </div>
            </header>

            {/* Main Content Area */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : (
                <Calendar
                    events={calendarEvents}
                    view={calendarView}
                    onViewChange={setCalendarView}
                    currentDate={currentDate}
                    onDateChange={setCurrentDate}
                    renderActions={renderAdminActions}
                />
            )}

            {/* Reschedule Modal */}
            <AnimatePresence>
                {reschedulingApt && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Reagendar Marcação</h3>
                            <p className="text-sm text-gray-400 mb-6">Selecione a nova data e hora para a marcação de <span className="text-white font-bold">{reschedulingApt.perfis?.nome || 'Cliente'}</span>.</p>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Nova Data</label>
                                    <input 
                                        type="date"
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Nova Hora</label>
                                    <input 
                                        type="time"
                                        value={newTime}
                                        onChange={(e) => setNewTime(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setReschedulingApt(null)} className="flex-1 py-2 rounded-lg btn-outline">Cancelar</button>
                                <button onClick={handleRescheduleSubmit} className="flex-1 py-2 rounded-lg btn-primary">Confirmar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminAppointments;
