// ================= SUPABASE CONFIG =================
const SUPABASE_URL = "https://pmtlxyaoyvajebgioczg.supabase.co";
const SUPABASE_KEY = "sb_publishable_idsO_hLQIPfH0JJBj0BTAA_EgR-wmrQ";

const _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const sb = {

    // ── USERS ──────────────────────────────────────────────────────
    async getUsers() {
        const { data, error } = await _sb.from("users").select("*").order("name");
        if (error) { console.error("getUsers error:", error); return []; }
        return data;
    },

    async updateUserLeave(name, leave) {
        const { error } = await _sb.from("users").update({ leave }).eq("name", name);
        if (error) console.error("updateUserLeave error:", error);
    },

    async post(table, body) {
        const { data, error } = await _sb.from(table).insert(body).select();
        if (error) console.error(`post ${table} error:`, error);
        return data;
    },

    async delete(table, match) {
        // parse match string like "name=eq.John" into .eq("name", "John")
        const eqIdx = match.indexOf("=eq.");
        const col = match.slice(0, eqIdx);
        const val = decodeURIComponent(match.slice(eqIdx + 4));
        const { error } = await _sb.from(table).delete().eq(col, val);
        if (error) console.error(`delete ${table} error:`, error);
    },

    // ── REQUESTS ──────────────────────────────────────────────────
    async getRequests() {
        const { data, error } = await _sb.from("requests").select("*").order("id", { ascending: false });
        if (error) { console.error("getRequests error:", error); return []; }
        return data;
    },

    async upsertRequest(req) {
        const row = {
            id: req.id,
            user: req.user,
            team: req.team,
            type: req.type,
            start: req.start,
            end: req.end,
            reason: req.reason || null,
            status: req.status,
            deducted: req.deducted || false,
            archived: req.archived || false,
            archived_at: req.archivedAt || null,
            half_day: req.halfDay || null,
            chargeable_days: req.chargeableDays || null
        };
        const { error } = await _sb.from("requests").upsert(row);
        if (error) console.error("upsertRequest error:", error);
    },

    async deleteRequest(id) {
        const { error } = await _sb.from("requests").delete().eq("id", id);
        if (error) console.error("deleteRequest error:", error);
    },

    // ── PINS (server-side via Edge Functions) ──────────────────────
    async verifyPinRemote(name, pin) {
        try {
            const { data, error } = await _sb.functions.invoke("verify-pin", {
                body: { name: name.toLowerCase().trim(), pin }
            });
            if (error) { console.error("verify-pin error:", error); return false; }
            return data?.valid === true;
        } catch (err) { console.error("PIN verify error:", err); return false; }
    },

    async setPinRemote(name, pin) {
        try {
            const { data, error } = await _sb.functions.invoke("set-pin", {
                body: { name: name.toLowerCase().trim(), pin }
            });
            if (error) { console.error("set-pin error:", error); return false; }
            return data?.success === true;
        } catch (err) { console.error("PIN set error:", err); return false; }
    },

    async deletePinRemote(name) {
        try {
            const { data, error } = await _sb.functions.invoke("delete-pin", {
                body: { name: name.toLowerCase().trim() }
            });
            if (error) { console.error("delete-pin error:", error); return false; }
            return data?.success === true;
        } catch (err) { console.error("PIN delete error:", err); return false; }
    },

    async userHasPinRemote(name) {
        try {
            const { data, error } = await _sb.from("pins")
                .select("name")
                .eq("name", name.toLowerCase().trim())
                .maybeSingle();
            if (error) { console.error("userHasPin error:", error); return false; }
            return !!data;
        } catch { return false; }
    },

    // ── NOTIFICATIONS ──────────────────────────────────────────────
    async getNotifications(recipient) {
        const { data, error } = await _sb.from("notifications")
            .select("*")
            .eq("recipient", recipient)
            .order("created_at", { ascending: false })
            .limit(50);
        if (error) { console.error("getNotifications error:", error); return []; }
        return data;
    },

    async addNotification(notif) {
        const { data, error } = await _sb.from("notifications").insert(notif).select();
        if (error) console.error("addNotification error:", error);
        return data;
    },

    async markNotificationRead(id) {
        const { error } = await _sb.from("notifications").update({ read: true }).eq("id", id);
        if (error) console.error("markNotificationRead error:", error);
    },

    async markAllNotificationsRead(recipient) {
        const { error } = await _sb.from("notifications").update({ read: true }).eq("recipient", recipient);
        if (error) console.error("markAllNotificationsRead error:", error);
    },

    async deleteNotification(id) {
        const { error } = await _sb.from("notifications").delete().eq("id", id);
        if (error) console.error("deleteNotification error:", error);
    }
};
