export function isToday(dateStr: string): boolean {
    const eventDate = new Date(dateStr);
    const today = new Date();
    return eventDate.getFullYear() === today.getFullYear() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getDate() === today.getDate();
}

export function isThisWeek(dateStr: string): boolean {
    const eventDate = new Date(dateStr);
    const today = new Date();

    // Get the first day of the week (Sunday)
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    firstDayOfWeek.setHours(0, 0, 0, 0);

    // Get the last day of the week (Saturday)
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);

    return eventDate >= firstDayOfWeek && eventDate <= lastDayOfWeek;
}

export function isThisMonth(dateStr: string): boolean {
    const eventDate = new Date(dateStr);
    const today = new Date();
    return eventDate.getFullYear() === today.getFullYear() &&
        eventDate.getMonth() === today.getMonth();
}