import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import {
    User, Clock, LogOut, Loader, X, Repeat,
    Edit2, Save, Shield, Scissors, History, Mail, Phone, Lock
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { clsx } from 'clsx';

interface Appointment {
    id: string;
    data_hora: string;
    status: string;
    servicos: {
        nome: string;
        preco: number;
        duracao: number;
    };
    barbeiros: {
        nome: string;
    };
}

const Profile: React.FC = () => {
    const { user, role, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'settings'>('upcoming');

    // Profile Form State
    const [profileData, setProfileData] = useState({
        nome: '',
        telemovel: ''
    });

    // Password State
    const [passwords, setPasswords] = useState({
        new: '',
        confirm: ''
    });

    useEffect(() => {
        if (location.state?.editMode) {
            setActiveTab('settings');
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        if (user) {
            setProfileData({
                nome: user.user_metadata?.nome || '',
                telemovel: user.user_metadata?.telemovel || ''
            });
        }
    }, [user]);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('Marcacoes')
                    .select(`
                        id,
                        data_hora,
                        status,
                        servicos (nome, preco, duracao),
                        barbeiros (nome)
                    `)
                    .eq('cliente_id', user.id)
                    .order('data_hora', { ascending: false });

                if (error) throw error;

                type SectionData = { nome: string; preco?: number; duracao?: number };

                interface AppointmentData {
                    id: string;
                    data_hora: string;
                    status: string;
                    servicos: SectionData | SectionData[];
                    barbeiros: SectionData | SectionData[];
                }

                const formattedData = (data as unknown as AppointmentData[]).map(item => {
                    const servicos = Array.isArray(item.servicos) ? item.servicos[0] : item.servicos;
                    const barbeiros = Array.isArray(item.barbeiros) ? item.barbeiros[0] : item.barbeiros;

                    return {
                        ...item,
                        servicos: servicos ? {
                            nome: servicos.nome,
                            preco: servicos.preco || 0,
                            duracao: servicos.duracao || 0
                        } : { nome: 'Serviço Removido', preco: 0, duracao: 0 },
                        barbeiros: barbeiros ? {
                            nome: barbeiros.nome
                        } : { nome: 'Barbeiro Removido' }
                    };
                });

                setAppointments(formattedData);
            } catch (error) {
                console.error('Erro ao buscar agendamentos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('perfis')
                .update({
                    nome: profileData.nome,
                    telemovel: profileData.telemovel
                })
                .eq('id', user?.id);

            if (error) throw error;

            await supabase.auth.updateUser({
                data: {
                    nome: profileData.nome,
                    telemovel: profileData.telemovel
                }
            });

            alert('Perfil atualizado com sucesso!');
            window.location.reload();
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            alert('Erro ao atualizar perfil.');
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert('As palavras-passe não coincidem.');
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwords.new
            });

            if (error) throw error;

            alert('Palavra-passe alterada com sucesso!');
            setPasswords({ new: '', confirm: '' });
        } catch (error) {
            console.error('Erro ao alterar palavra-passe:', error);
            alert('Erro ao alterar palavra-passe. Tente novamente.');
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
        try {
            const { error } = await supabase.from('Marcacoes').update({ status: 'cancelado' }).eq('id', id);
            if (error) throw error;
            setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: 'cancelado' } : apt));
        } catch (error) {
            console.error('Erro ao cancelar:', error);
            alert('Erro ao cancelar agendamento.');
        }
    };

    const handleReschedule = (apt: Appointment) => {
        navigate('/agendar', {
            state: { serviceName: apt.servicos.nome, barberName: apt.barbeiros.nome }
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    };

    const isUpcoming = (dateString: string) => new Date(dateString) > new Date();

    const upcomingAppointments = appointments.filter(apt => isUpcoming(apt.data_hora) && apt.status !== 'cancelado');
    const pastAppointments = appointments.filter(apt => !isUpcoming(apt.data_hora) || apt.status === 'cancelado');

    const displayAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

    return (
        <div className="min-h-screen bg-dark-bg text-gray-100">
            <PageHeader
                title={<>MEU <span className="text-primary">DASHBOARD</span></>}
                subtitle="Faça a gestão do seu perfil e dos seus agendamentos exclusivos."
                backgroundImage="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: User Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-dark/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 sticky top-24 shadow-xl">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="relative w-32 h-32 mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-yellow-600 rounded-full blur opacity-20"></div>
                                    <div className="relative w-full h-full bg-gray-800 rounded-full border-2 border-primary/50 flex items-center justify-center overflow-hidden">
                                        <User className="w-16 h-16 text-gray-400" />
                                    </div>
                                    <div className="absolute bottom-1 right-1 bg-dark border border-gray-700 rounded-full p-1.5" title="Seu Cargo">
                                        <Shield className="w-4 h-4 text-primary" />
                                    </div>
                                </div>

                                <h2 className="text-2xl font-heading font-bold text-white mb-1">{user?.user_metadata?.nome || 'Cliente'}</h2>
                                <p className="text-sm text-gray-400 mb-4">{role?.toUpperCase() || 'MEMBRO'}</p>

                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={clsx(
                                        "w-full flex items-center justify-center gap-2 py-2 text-sm rounded-lg transition-all",
                                        activeTab === 'settings'
                                            ? "bg-primary text-dark font-bold shadow-lg shadow-primary/20"
                                            : "btn-outline"
                                    )}
                                >
                                    <Edit2 className="w-4 h-4" /> Editar Perfil
                                </button>
                            </div>

                            <div className="space-y-4 border-t border-white/5 pt-6">
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center text-primary">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 truncate">
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="truncate" title={user?.email}>{user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center text-primary">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Telemóvel</p>
                                        <p>{user?.user_metadata?.telemovel || 'Não definido'}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={signOut}
                                className="w-full mt-8 flex items-center justify-center gap-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 py-3 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                            >
                                <LogOut className="w-4 h-4" /> Sair da Conta
                            </button>
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN: Appointments Dashboard */}
                    <div className="lg:col-span-2">
                        {/* Tabs */}
                        <div className="flex items-center gap-6 mb-8 border-b border-white/5 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('upcoming')}
                                className={clsx(
                                    "pb-4 text-sm font-bold uppercase tracking-wider relative transition-colors whitespace-nowrap",
                                    activeTab === 'upcoming' ? "text-primary" : "text-gray-500 hover:text-gray-300"
                                )}
                            >
                                Próximos
                                {activeTab === 'upcoming' && (
                                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={clsx(
                                    "pb-4 text-sm font-bold uppercase tracking-wider relative transition-colors whitespace-nowrap",
                                    activeTab === 'history' ? "text-primary" : "text-gray-500 hover:text-gray-300"
                                )}
                            >
                                Histórico
                                {activeTab === 'history' && (
                                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={clsx(
                                    "pb-4 text-sm font-bold uppercase tracking-wider relative transition-colors whitespace-nowrap",
                                    activeTab === 'settings' ? "text-primary" : "text-gray-500 hover:text-gray-300"
                                )}
                            >
                                Definições
                                {activeTab === 'settings' && (
                                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                                )}
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader className="w-10 h-10 text-primary animate-spin" />
                            </div>
                        ) : activeTab === 'settings' ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Personal Details Card */}
                                <div className="bg-dark/40 border border-white/5 rounded-2xl p-6 sm:p-8">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <User className="w-5 h-5 text-primary" />
                                        Informações Pessoais
                                    </h3>

                                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">Nome Completo</label>
                                                <input
                                                    type="text"
                                                    value={profileData.nome}
                                                    onChange={(e) => setProfileData({ ...profileData, nome: e.target.value })}
                                                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">Telemóvel</label>
                                                <input
                                                    type="tel"
                                                    value={profileData.telemovel}
                                                    onChange={(e) => setProfileData({ ...profileData, telemovel: e.target.value })}
                                                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-sm text-gray-400">Email (Não editável)</label>
                                                <div className="relative">
                                                    <input
                                                        type="email"
                                                        value={user?.email || ''}
                                                        disabled
                                                        className="w-full bg-black/20 border border-gray-800 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed pl-10"
                                                    />
                                                    <Lock className="w-4 h-4 text-gray-600 absolute left-3 top-3.5" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <button type="submit" className="btn-primary px-6 py-2.5 flex items-center gap-2">
                                                <Save className="w-4 h-4" />
                                                Guardar Informações
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Security Card */}
                                <div className="bg-dark/40 border border-white/5 rounded-2xl p-6 sm:p-8">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-primary" />
                                        Segurança da Conta
                                    </h3>

                                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">Nova Palavra-passe</label>
                                                <input
                                                    type="password"
                                                    value={passwords.new}
                                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                    placeholder="Mínimo 6 caracteres"
                                                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">Confirmar Palavra-passe</label>
                                                <input
                                                    type="password"
                                                    value={passwords.confirm}
                                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                    placeholder="Repita a palavra-passe"
                                                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <button
                                                type="submit"
                                                className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors border border-gray-700"
                                                disabled={!passwords.new || !passwords.confirm}
                                            >
                                                <Lock className="w-4 h-4" />
                                                Atualizar Palavra-passe
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        ) : displayAppointments.length > 0 ? (
                            <div className="space-y-4">
                                <AnimatePresence mode="popLayout">
                                    {displayAppointments.map((apt) => (
                                        <motion.div
                                            key={apt.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-dark/40 border border-white/5 hover:border-primary/30 rounded-xl p-5 transition-all group"
                                        >
                                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">
                                                        <Scissors className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                                                            {apt.servicos?.nome}
                                                        </h3>
                                                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                                            <div className="flex items-center gap-1">
                                                                <User className="w-3 h-3" />
                                                                {apt.barbeiros?.nome}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {formatTime(apt.data_hora)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-2 pl-16 md:pl-0">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-white font-heading font-bold text-lg">
                                                            {formatDate(apt.data_hora)}
                                                        </span>
                                                        <span className={clsx(
                                                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                                            apt.status === 'confirmado' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                                                apt.status === 'pendente' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                                                    "bg-red-500/10 text-red-500 border-red-500/20"
                                                        )}>
                                                            {apt.status}
                                                        </span>
                                                    </div>

                                                    {activeTab === 'upcoming' && (apt.status === 'pendente' || apt.status === 'confirmado') && (
                                                        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleReschedule(apt)}
                                                                className="p-2 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors"
                                                                title="Reagendar"
                                                            >
                                                                <Repeat className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancel(apt.id)}
                                                                className="p-2 hover:bg-red-500/10 rounded-lg text-red-500/70 hover:text-red-500 transition-colors"
                                                                title="Cancelar"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="bg-dark/30 border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                    <History className="w-8 h-8 text-gray-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {activeTab === 'upcoming' ? "Sem agendamentos futuros" : "Sem histórico recente"}
                                </h3>
                                <p className="text-gray-400 mb-8 max-w-sm">
                                    {activeTab === 'upcoming'
                                        ? "Você não tem nenhum corte agendado para os próximos dias."
                                        : "Você ainda não realizou agendamentos conosco."}
                                </p>
                                <button onClick={() => navigate('/agendar')} className="btn-primary px-8 py-3">
                                    Agendar Agora
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
