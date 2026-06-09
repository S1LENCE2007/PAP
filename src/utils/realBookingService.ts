import { supabase } from './supabase';
import { addMinutes, format, isBefore, isAfter, set } from 'date-fns';

export interface TimeSlot {
    time: string;
    available: boolean;
    barberId?: string; // If 'any' was selected, this suggests a barber who is free
}

const OPENING_HOUR = 9;
const SLOT_INTERVAL = 30; // minutes

export const getRealAvailableSlots = async (
    dateStr: string,
    serviceDuration: number,
    barberId: string | 'any',
    excludeAppointmentId?: string
): Promise<TimeSlot[]> => {
    // Determine closing time based on day of week
    const dayOfWeek = new Date(dateStr).getDay();
    
    // Sunday (0): Closed, return no slots
    if (dayOfWeek === 0) {
        return [];
    }

    // Weekdays (1-5): close at 19:00 (so 18:30 is the last 30m slot)
    // Saturdays (6): close at 18:30 (so 18:00 is the last 30m slot)
    const closeHours = dayOfWeek === 6 ? 18 : 19;
    const closeMinutes = dayOfWeek === 6 ? 30 : 0;
    // 1. Fetch necessary data
    // If specific barber, fetch only their appointments.
    // If 'any', fetch ALL appointments for that date.

    // Parse date range for the query (Start of day to End of day)
    const startOfDay = `${dateStr}T00:00:00`;
    const endOfDay = `${dateStr}T23:59:59`;

    const query = supabase
        .from('Marcacoes')
        .select(`
            id,
            data_hora,
            barbeiro_id,
            servicos (nome, duracao)
        `)
        .gte('data_hora', startOfDay)
        .lte('data_hora', endOfDay)
        .neq('status', 'cancelado'); // Ignore cancelled

    // Wait, we need to check if there is a BLOQUEIO_DIA for ANY barber on this date.
    // So we fetch all appointments for this date first.
    const { data: allAppointmentsForDate, error: allAptsError } = await query;

    if (allAptsError) {
        console.error('Error fetching appointments:', allAptsError);
        return [];
    }

    // Check if the day is blocked
    const isDayBlocked = allAppointmentsForDate?.some(apt => {
        const servicoData = Array.isArray(apt.servicos) ? apt.servicos[0] : apt.servicos;
        return (servicoData as any)?.nome === 'BLOQUEIO_DIA';
    });

    if (isDayBlocked) {
        return []; // Whole day is blocked, no slots available
    }

    // Now filter appointments for the specific barber if needed
    let appointments = allAppointmentsForDate;
    if (barberId !== 'any') {
        appointments = appointments?.filter(apt => apt.barbeiro_id === barberId);
    }

    if (excludeAppointmentId) {
        appointments = appointments?.filter(apt => apt.id !== excludeAppointmentId);
    }

    // If 'any', we also need the list of all active barbers to check them one by one
    let allBarbers: string[] = [];
    if (barberId === 'any') {
        const { data: barbers } = await supabase
            .from('barbeiros')
            .select('id')
            .eq('disponivel', true);
        allBarbers = barbers?.map(b => b.id) || [];
    } else {
        allBarbers = [barberId];
    }

    // 2. Generate all potential slots
    const slots: TimeSlot[] = [];
    let currentTime = set(new Date(dateStr), { hours: OPENING_HOUR, minutes: 0, seconds: 0 });
    const closeTime = set(new Date(dateStr), { hours: closeHours, minutes: closeMinutes, seconds: 0 });

    // Helper to check overlap
    const isBarberBusy = (bId: string, slotStart: Date, slotEnd: Date) => {
        return appointments?.some(apt => {
            if (apt.barbeiro_id !== bId) return false;

            // Calculate apt start and end
            const aptStart = new Date(apt.data_hora);
            // Default to 30 min if service duration missing (shouldn't happen)
            const serviceData = Array.isArray(apt.servicos) ? apt.servicos[0] : apt.servicos;
            const duration = (serviceData as any)?.duracao || 30;
            const aptEnd = addMinutes(aptStart, duration);

            // Check overlap: (StartA < EndB) and (EndA > StartB)
            return isBefore(slotStart, aptEnd) && isAfter(slotEnd, aptStart);
        });
    };

    while (isBefore(currentTime, closeTime)) {
        const timeLabel = format(currentTime, 'HH:mm');
        const slotEnd = addMinutes(currentTime, serviceDuration);

        // Check if slot exceeds closing time
        if (isAfter(slotEnd, closeTime)) {
            // Skip if service duration pushes past closing
            currentTime = addMinutes(currentTime, SLOT_INTERVAL);
            continue;
        }

        const now = new Date();
        let isAvailable = false;
        let candidateBarber: string | undefined = undefined;

        if (isBefore(currentTime, now)) {
            isAvailable = false; // Cannot book in the past
        } else {
            // Check availability logic
            // We look for ONE barber who is free for the entire duration [currentTime, slotEnd]
            for (const bId of allBarbers) {
                if (!isBarberBusy(bId, currentTime, slotEnd)) {
                    isAvailable = true;
                    candidateBarber = bId;
                    break; // Found one, that's enough to show the slot as available
                }
            }
        }

        slots.push({
            time: timeLabel,
            available: isAvailable,
            barberId: candidateBarber // Keep track of who is free
        });

        currentTime = addMinutes(currentTime, SLOT_INTERVAL);
    }

    return slots;
};
