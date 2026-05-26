export const getGoogleCalendarUrl = (title: string, startDate: string | Date, durationMinutes: number = 60, location: string = 'Barbearia Dourado') => {
    const start = new Date(startDate);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    
    // Format to Google Calendar string: YYYYMMDDTHHMMSSZ
    const formatStr = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');
    
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${formatStr(start)}/${formatStr(end)}`,
        details: 'Marcação confirmado. Pode gerir as suas marcações no nosso website.',
        location: location,
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
