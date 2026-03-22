// ================= GOOGLE CALENDAR =================
const GCAL_API_KEY = "AIzaSyA4fCtpXJtWHQZBz48Msj-N2YPLqPr5nek";
const GCAL_ID = "p31ajqo828188eje57ugg9op3o@group.calendar.google.com";

let gcalEvents = []; // cached events

async function loadGCalEvents() {
    try {
        const now = new Date();
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const threeMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 3, 1).toISOString();

        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GCAL_ID)}/events`
            + `?key=${GCAL_API_KEY}`
            + `&timeMin=${threeMonthsAgo}`
            + `&timeMax=${threeMonthsAhead}`
            + `&singleEvents=true`
            + `&orderBy=startTime`
            + `&maxResults=250`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.error) {
            console.error("Google Calendar error:", data.error);
            gcalEvents = [];
            return;
        }

        gcalEvents = (data.items || []).map(e => ({
            title: e.summary || "Event",
            start: e.start.date || e.start.dateTime?.slice(0, 10),
            end: e.end.date || e.end.dateTime?.slice(0, 10),
            allDay: !!e.start.date,
            description: e.description || ""
        }));

        console.log(`Loaded ${gcalEvents.length} Google Calendar events`);
    } catch (err) {
        console.error("Failed to load Google Calendar:", err);
        gcalEvents = [];
    }
}

function getGCalEventsOnDate(dateStr) {
    return gcalEvents.filter(e => {
        const days = dateRange(e.start, e.end || e.start);
        return days.includes(dateStr);
    });
}
