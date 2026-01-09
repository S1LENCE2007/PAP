import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Check, User, Scissors, Clock, Sun, Sparkles, Loader } from 'lucide-react';
import { getRealAvailableSlots, type TimeSlot } from '../utils/realBookingService';
import { supabase } from '../utils/supabase';
import { clsx } from 'clsx';

import PageHeader from '../components/layout/PageHeader';

import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import WeeklyCalendar from '../components/ui/WeeklyCalendar';

const Booking: React.FC = () => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);

    // Data state
    interface Barber {
        id: string;
        nome: string;
        foto_url: string;
        disponivel: boolean;
    }

    interface Service {
        id: string;
        nome: string;
        preco: number;
        duracao: number;
    }

    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

    // For 'Any Barber' feature: keeps track of which barber was actually assigned to the chosen slot
    const [selectedSlotBarberId, setSelectedSlotBarberId] = useState<string | null>(null);

    const location = useLocation();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [barbersRes, servicesRes] = await Promise.all([
                    supabase.from('barbeiros').select('*').eq('disponivel', true),
                    supabase.from('servicos').select('*')
                ]);

                if (barbersRes.error) throw barbersRes.error;
                if (servicesRes.error) throw servicesRes.error;

                // Add 'Any Barber' option
                const anyBarber = {
                    id: 'any',
                    nome: 'Qualquer Profissional',
                    foto_url: '',
                    disponivel: true
                };

                const sortedBarbers = (barbersRes.data || []).sort((a, b) => a.nome.localeCompare(b.nome));
                setBarbers([anyBarber, ...sortedBarbers]);

                setServices(servicesRes.data || []);

                // Handle pre-filled state after data load
                const state = location.state as { serviceName?: string; barberName?: string } | null;
                if (state) {
                    let nextStep = 1;
                    if (state.barberName) {
                        const preSelectedBarber = sortedBarbers.find(b => b.nome === state.barberName);
                        if (preSelectedBarber) {
                            setSelectedBarber(preSelectedBarber);
                            nextStep = 2;
                        }
                    }
                    if (state.serviceName) {
                        const preSelectedService = servicesRes.data?.find(s => s.nome === state.serviceName);
                        if (preSelectedService) {
                            setSelectedService(preSelectedService);
                            if (state.barberName) nextStep = 3;
                        }
                    }
                    setStep(nextStep);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [location]);

    if (loadingData) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <Loader className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    const handleDateSelect = async (date: Date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        setSelectedDate(formattedDate);
        setSelectedTime('');
        setSelectedSlotBarberId(null);

        // Fetch real slots
        if (selectedService && selectedBarber) {
            const slots = await getRealAvailableSlots(
                formattedDate,
                selectedService.duracao,
                selectedBarber.id
            );
            setAvailableSlots(slots);
        }
    };

    const handleTimeSelect = (time: string, candidateBarberId?: string) => {
        setSelectedTime(time);

        // If "Any" was selected, we MUST use the candidate identified by the service
        // If specific barber, we use selectedBarber.id
        // If specific barber but candidateBarberId is somehow passed (should be same), use it.
        if (selectedBarber?.id === 'any' && candidateBarberId) {
            setSelectedSlotBarberId(candidateBarberId);
        } else {
            setSelectedSlotBarberId(selectedBarber?.id || null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const finalBarberId = selectedBarber?.id === 'any' ? selectedSlotBarberId : selectedBarber?.id;

        if (!user || !finalBarberId || !selectedService || !selectedDate || !selectedTime) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        setIsSubmitting(true);

        try {
            const dateTimeString = `${selectedDate}T${selectedTime}:00`;
            const dateObj = new Date(dateTimeString);

            const appointmentData = {
                cliente_id: user.id,
                barbeiro_id: finalBarberId,
                servico_id: selectedService.id,
                data_hora: dateObj.toISOString(),
                status: 'pendente'
            };

            const { error } = await supabase
                .from('Marcacoes')
                .insert([appointmentData]);

            if (error) throw error;

            setStep(5);
        } catch (error) {
            console.error('Erro ao agendar:', error);
            alert('Ocorreu um erro ao realizar o agendamento. Por favor, tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const variants = {
        enter: { opacity: 0, x: 20 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="min-h-screen bg-dark-bg text-white">
            <PageHeader
                title={<>AGENDAR <span className="text-primary">HORÁRIO</span></>}
                subtitle="Escolha o serviço, data e hora que melhor se adequam a si."
                backgroundImage="https://images.unsplash.com/photo-1503951914875-452162b7f30a?auto=format&fit=crop&q=80&w=2070"
            />

            <div className="pt-12 px-4 pb-12">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-12">
                        {/* Visual Progress Stepper */}
                        <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                            {/* Connecting Line */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -z-10 -translate-y-1/2 rounded-full">
                                <div
                                    className="h-full bg-primary transition-all duration-500 rounded-full"
                                    style={{ width: `${((step - 1) / 4) * 100}%` }}
                                />
                            </div>

                            {[
                                { num: 1, icon: User, label: 'Profissional' },
                                { num: 2, icon: Scissors, label: 'Serviço' },
                                { num: 3, icon: Calendar, label: 'Data' },
                                { num: 4, icon: Check, label: 'Confirmar' },
                                { num: 5, icon: Sparkles, label: 'Concluir' }
                            ].map((s) => (
                                <div key={s.num} className="flex flex-col items-center group">
                                    <div className={clsx(
                                        "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10",
                                        step >= s.num
                                            ? "bg-primary border-primary text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                                            : "bg-dark-bg border-gray-700 text-gray-500"
                                    )}>
                                        <s.icon className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <span className={clsx(
                                        "mt-3 text-xs md:text-sm font-bold tracking-wide transition-colors duration-300",
                                        step >= s.num ? "text-primary" : "text-gray-600"
                                    )}>
                                        {s.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-dark/50 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-white/5 shadow-2xl min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="text-xl font-bold mb-6 flex items-center"><User className="mr-2 text-primary" /> Escolha o Profissional</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
                                        {barbers.map((barber) => (
                                            <button
                                                key={barber.id}
                                                onClick={() => setSelectedBarber(barber)}
                                                className={clsx(
                                                    "relative overflow-hidden group rounded-2xl border transition-all duration-300 aspect-[3/4]",
                                                    selectedBarber?.id === barber.id
                                                        ? "border-primary shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                                                        : "border-gray-800 hover:border-gray-600"
                                                )}
                                            >
                                                <div className={clsx(
                                                    "absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10 transition-opacity duration-300",
                                                    selectedBarber?.id === barber.id ? "opacity-80" : "opacity-60 group-hover:opacity-40"
                                                )} />
                                                <img
                                                    src={barber.id === 'any' ? 'https://ui-avatars.com/api/?name=Qualquer+Pro&background=d4af37&color=000' : (barber.foto_url || 'https://ui-avatars.com/api/?name=Barber&background=random')}
                                                    alt={barber.nome}
                                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-left">
                                                    <h3 className={clsx(
                                                        "font-bold text-lg transition-colors duration-300",
                                                        selectedBarber?.id === barber.id ? "text-primary" : "text-white"
                                                    )}>{barber.nome}</h3>
                                                </div>
                                                {selectedBarber?.id === barber.id && (
                                                    <div className="absolute top-4 right-4 z-20 bg-primary text-black p-1 rounded-full">
                                                        <Check className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-8 flex justify-end">
                                        <button
                                            onClick={nextStep}
                                            disabled={!selectedBarber}
                                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Próximo
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="text-xl font-bold mb-6 flex items-center text-white"><Scissors className="mr-2 text-primary" /> Escolha o Serviço</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {services.map((service) => (
                                            <button
                                                key={service.id}
                                                onClick={() => setSelectedService(service)}
                                                className={clsx(
                                                    "group relative overflow-hidden p-6 rounded-xl border text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                                                    selectedService?.id === service.id
                                                        ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                                                        : "border-gray-800 bg-card-bg hover:border-gray-600"
                                                )}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className={clsx(
                                                        "p-3 rounded-lg transition-colors",
                                                        selectedService?.id === service.id ? "bg-primary text-black" : "bg-dark-bg text-gray-400 group-hover:text-primary"
                                                    )}>
                                                        <Scissors className="w-6 h-6" />
                                                    </div>
                                                    <span className={clsx(
                                                        "text-xl font-bold transition-colors",
                                                        selectedService?.id === service.id ? "text-primary" : "text-white"
                                                    )}>{service.preco}€</span>
                                                </div>
                                                <h3 className="font-bold text-lg text-white mb-1 group-hover:text-primary transition-colors">{service.nome}</h3>
                                                <div className="flex items-center text-sm text-gray-400">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    {service.duracao} min
                                                </div>

                                                {selectedService?.id === service.id && (
                                                    <div className="absolute top-2 right-2 text-primary">
                                                        <Check className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-8 flex justify-between">
                                        <button onClick={prevStep} className="text-gray-400 hover:text-white">Voltar</button>
                                        <button
                                            onClick={nextStep}
                                            disabled={!selectedService}
                                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Próximo
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="text-xl font-bold mb-6 flex items-center"><Calendar className="mr-2 text-primary" /> Escolha a Data e Hora</h2>

                                    <div className="mb-8">
                                        <WeeklyCalendar
                                            selectedDate={selectedDate ? new Date(selectedDate) : null}
                                            onDateSelect={handleDateSelect}
                                        />
                                    </div>

                                    {selectedDate && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-6"
                                        >
                                            {/* Manhã */}
                                            <div>
                                                <div className="flex items-center mb-3 text-gray-300">
                                                    <Sun className="w-4 h-4 mr-2 text-yellow-500" />
                                                    <span className="text-sm font-bold uppercase tracking-wider">Manhã</span>
                                                </div>
                                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
                                                    {availableSlots.filter(s => parseInt(s.time.split(':')[0]) < 12).map((slot) => (
                                                        <button
                                                            key={slot.time}
                                                            disabled={!slot.available}
                                                            onClick={() => handleTimeSelect(slot.time, slot.barberId)}
                                                            className={clsx(
                                                                "py-2 px-1 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden",
                                                                !slot.available && "bg-gray-800/50 text-gray-600 cursor-not-allowed border border-transparent",
                                                                slot.available && selectedTime === slot.time && "bg-primary text-black font-bold shadow-lg shadow-primary/20 scale-105",
                                                                slot.available && selectedTime !== slot.time && "bg-card-bg border border-gray-700 text-gray-300 hover:border-primary/50 hover:text-white"
                                                            )}
                                                        >
                                                            {slot.time}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Tarde */}
                                            <div>
                                                <div className="flex items-center mb-3 text-gray-300">
                                                    <div className="relative">
                                                        <Sun className="w-4 h-4 mr-2 text-orange-500" />
                                                        {/* Simple representation of sunset/afternoon */}
                                                    </div>
                                                    <span className="text-sm font-bold uppercase tracking-wider">Tarde</span>
                                                </div>
                                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
                                                    {availableSlots.filter(s => parseInt(s.time.split(':')[0]) >= 12).map((slot) => (
                                                        <button
                                                            key={slot.time}
                                                            disabled={!slot.available}
                                                            onClick={() => handleTimeSelect(slot.time, slot.barberId)}
                                                            className={clsx(
                                                                "py-2 px-1 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden",
                                                                !slot.available && "bg-gray-800/50 text-gray-600 cursor-not-allowed border border-transparent",
                                                                slot.available && selectedTime === slot.time && "bg-primary text-black font-bold shadow-lg shadow-primary/20 scale-105",
                                                                slot.available && selectedTime !== slot.time && "bg-card-bg border border-gray-700 text-gray-300 hover:border-primary/50 hover:text-white"
                                                            )}
                                                        >
                                                            {slot.time}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="mt-8 flex justify-between">
                                        <button onClick={prevStep} className="text-gray-400 hover:text-white">Voltar</button>
                                        <button
                                            onClick={nextStep}
                                            disabled={!selectedDate || !selectedTime}
                                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Próximo
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="text-xl font-bold mb-6 flex items-center"><User className="mr-2 text-primary" /> Confirmar Detalhes</h2>

                                    <div className="text-center mb-6">
                                        <p className="text-gray-400">
                                            O agendamento será realizado em nome de:<br />
                                            <span className="text-white font-bold text-lg block mt-1">{user?.user_metadata?.nome || user?.email}</span>
                                        </p>
                                    </div>

                                    <div className="relative mt-8 bg-card-bg rounded-lg border-2 border-dashed border-gray-700 p-6 overflow-hidden max-w-sm mx-auto shadow-2xl">
                                        {/* Ticket Cutouts */}
                                        <div className="absolute top-1/2 -left-3 w-6 h-6 bg-dark rounded-full -translate-y-1/2" />
                                        <div className="absolute top-1/2 -right-3 w-6 h-6 bg-dark rounded-full -translate-y-1/2" />

                                        <div className="text-center mb-6">
                                            <h3 className="font-heading font-bold text-xl text-primary tracking-widest uppercase">Barbearia Dourado</h3>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Comprovativo de Pré-Agendamento</p>
                                        </div>

                                        <div className="space-y-4 relative z-10">
                                            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                                                <span className="text-gray-400">Cliente</span>
                                                <span className="font-bold text-white">{user?.user_metadata?.nome || 'Cliente'}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                                                <span className="text-gray-400">Profissional</span>
                                                <span className="font-bold text-white">{selectedBarber?.nome}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                                                <span className="text-gray-400">Serviço</span>
                                                <span className="font-bold text-white">{selectedService?.nome}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                                                <span className="text-gray-400">Data</span>
                                                <span className="font-bold text-white capitalize">
                                                    {selectedDate && format(new Date(selectedDate), "EEEE, d MMM", { locale: pt })}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                                                <span className="text-gray-400">Horário</span>
                                                <span className="font-bold text-white">{selectedTime}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-gray-400 text-sm">Total a Pagar</span>
                                                <span className="font-bold text-2xl text-primary">{selectedService?.preco}€</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
                                        <button type="button" onClick={prevStep} className="w-full sm:w-auto text-gray-400 hover:text-white py-3">Voltar</button>
                                        <button
                                            onClick={handleSubmit}
                                            className="w-full sm:w-auto btn-primary font-bold uppercase tracking-wide px-12 py-3 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transform hover:-translate-y-1 transition-all flex justify-center"
                                        >
                                            Confirmar
                                        </button>
                                    </div>

                                    {isSubmitting && (
                                        <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50">
                                            <div className="flex flex-col items-center">
                                                <Loader className="w-10 h-10 text-primary animate-spin mb-4" />
                                                <p className="text-white font-bold">Processando agendamento...</p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {step === 5 && (
                                <motion.div
                                    key="step5"
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                    className="text-center py-12"
                                >
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 text-green-500 mb-6 border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                        <Check className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-3xl font-heading font-bold text-white mb-4">Agendamento Confirmado!</h2>
                                    <p className="text-gray-300 mb-8 max-w-md mx-auto">
                                        Obrigado, <span className="text-primary font-bold">{user?.user_metadata?.nome || 'Cliente'}</span>. O seu horário para <span className="text-white font-bold">{selectedService?.nome}</span> foi reservado com sucesso.
                                    </p>
                                    <button onClick={() => navigate('/')} className="btn-primary">
                                        Voltar para o Início
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Booking;
