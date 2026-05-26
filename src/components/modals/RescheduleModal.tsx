import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, Scissors, Sun } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { format } from 'date-fns';
import clsx from 'clsx';
import { getRealAvailableSlots, type TimeSlot } from '../../utils/realBookingService';

interface RescheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointmentId: string;
    currentBarberId: string;
    currentServiceId: string;
    currentDateHora: string;
    onSuccess: () => void;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
    isOpen,
    onClose,
    appointmentId,
    currentBarberId,
    currentServiceId,
    currentDateHora,
    onSuccess
}) => {
    interface Barber { id: string; nome: string; }
    interface Service { id: string; nome: string; duracao: number; }

    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [services, setServices] = useState<Service[]>([]);

    const [selectedBarberId, setSelectedBarberId] = useState<string>(currentBarberId);
    const [selectedServiceId, setSelectedServiceId] = useState<string>(currentServiceId);

    // Parse current date/time to initialize state
    const d = new Date(currentDateHora);
    const initialDate = isNaN(d.getTime()) ? '' : format(d, 'yyyy-MM-dd');
    const initialTime = isNaN(d.getTime()) ? '' : format(d, 'HH:mm');

    const [selectedDate, setSelectedDate] = useState<string>(initialDate);
    const [selectedTime, setSelectedTime] = useState<string>(initialTime);

    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial load
    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            try {
                const [barbersRes, servicesRes] = await Promise.all([
                    supabase.from('barbeiros').select('*').eq('disponivel', true),
                    supabase.from('servicos').select('*').eq('ativo', true)
                ]);

                if (barbersRes.data) setBarbers(barbersRes.data);
                if (servicesRes.data) setServices(servicesRes.data);

                // Reset state when modal opens
                setSelectedBarberId(currentBarberId);
                setSelectedServiceId(currentServiceId);
                const d2 = new Date(currentDateHora);
                if (!isNaN(d2.getTime())) {
                    setSelectedDate(format(d2, 'yyyy-MM-dd'));
                    setSelectedTime(format(d2, 'HH:mm'));
                }
            } catch (err) {
                console.error('Error fetching data for modal', err);
            }
        };

        fetchData();
    }, [isOpen, currentBarberId, currentServiceId, currentDateHora]);

    // Fetch slots when date, barber or service changes
    useEffect(() => {
        if (!isOpen || !selectedDate || !selectedServiceId || !selectedBarberId) return;

        const fetchSlots = async () => {
            setIsLoadingSlots(true);
            try {
                const service = services.find(s => s.id === selectedServiceId);
                const duration = service ? service.duracao : 30; // default to 30 min just in case

                const slots = await getRealAvailableSlots(
                    selectedDate,
                    duration,
                    selectedBarberId,
                    appointmentId // ignore this specific booking to free up its slot!
                );

                setAvailableSlots(slots);

                // Keep the selected time if it's still available, otherwise reset
                setSelectedTime((prev) => {
                    const stillAvailable = slots.some(s => s.time === prev && s.available);
                    return stillAvailable ? prev : '';
                });
            } catch (err) {
                console.error('Error fetching slots:', err);
            } finally {
                setIsLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [selectedDate, selectedBarberId, selectedServiceId, isOpen, services, appointmentId]);

    const handleSubmit = async () => {
        if (!selectedDate || !selectedTime || !selectedBarberId || !selectedServiceId) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        setIsSubmitting(true);
        try {
            const dateTimeString = `${selectedDate}T${selectedTime}:00`;
            const dateObj = new Date(dateTimeString);

            const { error } = await supabase
                .from('Marcacoes')
                .update({
                    barbeiro_id: selectedBarberId,
                    servico_id: selectedServiceId,
                    data_hora: dateObj.toISOString(),
                    status: 'pendente' // Remarcando volta para pendente
                })
                .eq('id', appointmentId);

            if (error) throw error;

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Erro ao remarcar:', error);
            alert('Ocorreu um erro ao realizar a remarcação. Por favor, tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const morningSlots = availableSlots.filter(s => parseInt(s.time.split(':')[0]) < 12 && s.available);
    const afternoonSlots = availableSlots.filter(s => parseInt(s.time.split(':')[0]) >= 12 && s.available);
    const hasAnySlots = morningSlots.length > 0 || afternoonSlots.length > 0;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 custom-scrollbar"
                >
                    <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-md p-6 border-b border-white/5 z-20 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-white font-heading tracking-wide">Remarcar Horário</h2>
                            <p className="text-sm text-gray-400 mt-1">Atualize qualquer detalhe do seu marcação.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Selections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Barber */}
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-400 mb-2">
                                    <User className="w-4 h-4 mr-2 text-primary" />
                                    Profissional
                                </label>
                                <select
                                    value={selectedBarberId}
                                    onChange={(e) => setSelectedBarberId(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary/50 transition-colors"
                                >
                                    <option value="" disabled>Selecione um profissional</option>
                                    {barbers.map(b => (
                                        <option key={b.id} value={b.id}>{b.nome}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Service */}
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-400 mb-2">
                                    <Scissors className="w-4 h-4 mr-2 text-primary" />
                                    Serviço
                                </label>
                                <select
                                    value={selectedServiceId}
                                    onChange={(e) => setSelectedServiceId(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary/50 transition-colors"
                                >
                                    <option value="" disabled>Selecione um serviço</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.nome} ({s.duracao} min)</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Date selection */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-400 mb-2">
                                <Calendar className="w-4 h-4 mr-2 text-primary" />
                                Data
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]} // from today onwards
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary/50 transition-colors cursor-pointer"
                            />
                        </div>

                        {/* Time selection */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-400 mb-3">
                                <Clock className="w-4 h-4 mr-2 text-primary" />
                                Horários Disponíveis
                            </label>

                            {isLoadingSlots ? (
                                <div className="py-8 text-center text-gray-400 animate-pulse">
                                    A carregar horários...
                                </div>
                            ) : !hasAnySlots ? (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl text-center">
                                    <p className="font-bold mb-1">Sem horários disponíveis</p>
                                    <p className="text-sm">Por favor, selecione outra data ou profissional.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {morningSlots.length > 0 && (
                                        <div>
                                            <div className="flex items-center mb-3 text-gray-300">
                                                <Sun className="w-4 h-4 mr-2 text-yellow-500" />
                                                <span className="text-xs font-bold uppercase tracking-wider">Manhã</span>
                                            </div>
                                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                                {morningSlots.map((slot) => (
                                                    <button
                                                        key={slot.time}
                                                        onClick={() => setSelectedTime(slot.time)}
                                                        className={clsx(
                                                            "py-2 px-1 rounded-lg text-sm font-medium transition-all duration-200",
                                                            selectedTime === slot.time
                                                                ? "bg-primary text-black font-bold shadow-md shadow-primary/20 scale-105"
                                                                : "bg-black/40 border border-white/10 text-gray-300 hover:border-primary/50 hover:text-white"
                                                        )}
                                                    >
                                                        {slot.time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {afternoonSlots.length > 0 && (
                                        <div>
                                            <div className="flex items-center mb-3 text-gray-300">
                                                <Sun className="w-4 h-4 mr-2 text-orange-500" />
                                                <span className="text-xs font-bold uppercase tracking-wider">Tarde</span>
                                            </div>
                                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                                {afternoonSlots.map((slot) => (
                                                    <button
                                                        key={slot.time}
                                                        onClick={() => setSelectedTime(slot.time)}
                                                        className={clsx(
                                                            "py-2 px-1 rounded-lg text-sm font-medium transition-all duration-200",
                                                            selectedTime === slot.time
                                                                ? "bg-primary text-black font-bold shadow-md shadow-primary/20 scale-105"
                                                                : "bg-black/40 border border-white/10 text-gray-300 hover:border-primary/50 hover:text-white"
                                                        )}
                                                    >
                                                        {slot.time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="sticky bottom-0 bg-zinc-900/95 backdrop-blur-md p-6 border-t border-white/5 z-20 flex flex-col-reverse sm:flex-row justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors font-medium w-full sm:w-auto text-center"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedTime || !selectedDate || isSubmitting}
                            className="bg-primary text-black px-6 py-3 rounded-xl font-bold uppercase tracking-wide hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed w-full sm:w-auto text-center"
                        >
                            {isSubmitting ? 'A Atualizar...' : 'Confirmar Remarcação'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RescheduleModal;
