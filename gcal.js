// ================= GOOGLE CALENDAR =================
const GCAL_FUNCTION_URL = "https://pmtlxyaoyvajebgioczg.supabase.co/functions/v1/gcal-events";
const SUPABASE_ANON_KEY = "de62daed772a5d38ee91a49a672866922edb24de78879a10c5fb2b88db72e878"; 

let gcalEvents = [];

async function loadGCalEvents() {
    try {
        const res = await fetch(GCAL_FUNCTION_URL, {
            headers: { "Authorization": "Bearer " + SUPABASE_ANON_KEY }
        });
        const data = await res.json();
        if (data.error) { console.error("GCal error:", data.error); gcalEvents = []; return; }
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
