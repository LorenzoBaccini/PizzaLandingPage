import { useState, useEffect, useCallback } from "react";

import dayjs from "dayjs";
import "dayjs/locale/it";

import { supabase } from "../../lib/supabase";
import { ORDER_SLOTS } from "../../config/businessHours";
import styles from "../../style/AdminPanel.module.css";

import type { Session } from "@supabase/supabase-js";

dayjs.locale("it");

const DAYS_AHEAD = 3;

interface SlotRow {
  date: string;
  time_slot: string;
}

const generateDaySlots = (date: dayjs.Dayjs): string[] => {
  const slots: string[] = [];
  const isSunday = date.day() === 0;

  const addRange = (startHour: number, endHour: number) => {
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += 15) {
        slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      }
    }
  };

  if (isSunday) {
    addRange(ORDER_SLOTS.sunday.evening.start, ORDER_SLOTS.sunday.evening.end);
  } else {
    addRange(ORDER_SLOTS.weekday.morning.start, ORDER_SLOTS.weekday.morning.end);
    addRange(ORDER_SLOTS.weekday.evening.start, ORDER_SLOTS.weekday.evening.end);
  }

  return slots;
};

export const AdminPanel = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [disabledSlots, setDisabledSlots] = useState<Set<string>>(new Set());

  const today = dayjs().startOf("day");
  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => today.add(i, "day"));

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchDisabledSlots = useCallback(async () => {
    const { data } = await supabase
      .from("disabled_slots")
      .select("date, time_slot")
      .gte("date", today.format("YYYY-MM-DD"));

    if (data) {
      setDisabledSlots(new Set(data.map((row: SlotRow) => `${row.date}_${row.time_slot}`)));
    }
  }, [today]);

  useEffect(() => {
    if (session) fetchDisabledSlots();
  }, [session, fetchDisabledSlots]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError("Credenziali non valide");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const toggleSlot = (date: string, timeSlot: string) => {
    const key = `${date}_${timeSlot}`;
    const wasDisabled = disabledSlots.has(key);

    setDisabledSlots((prev) => {
      const next = new Set(prev);
      wasDisabled ? next.delete(key) : next.add(key);
      return next;
    });

    const request = wasDisabled
      ? supabase.from("disabled_slots").delete().eq("date", date).eq("time_slot", timeSlot)
      : supabase.from("disabled_slots").insert({ date, time_slot: timeSlot });

    request.then(({ error }) => {
      if (error) {
        setDisabledSlots((prev) => {
          const rollback = new Set(prev);
          wasDisabled ? rollback.add(key) : rollback.delete(key);
          return rollback;
        });
      }
    });
  };

  if (loading) {
    return <div className={styles.container}><p className={styles.loadingText}>Caricamento...</p></div>;
  }

  if (!session) {
    return (
      <div className={styles.container}>
        <div className={styles.loginCard}>
          <h1 className={styles.loginTitle}>La Teglia — Admin</h1>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              autoComplete="current-password"
            />
            {loginError && <p className={styles.error}>{loginError}</p>}
            <button type="submit" className={styles.btnLogin}>Accedi</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestione Orari</h1>
        <button onClick={handleLogout} className={styles.btnLogout}>Esci</button>
      </div>

      <p className={styles.hint}>
        Tocca uno slot per disabilitarlo. Toccalo di nuovo per riabilitarlo.
      </p>

      {days.map((day) => {
        const dateStr = day.format("YYYY-MM-DD");
        const slots = generateDaySlots(day);
        const dayLabel = day.format("dddd D MMMM");

        return (
          <div key={dateStr} className={styles.daySection}>
            <h2 className={styles.dayTitle}>{dayLabel}</h2>
            <div className={styles.slotsGrid}>
              {slots.map((slot) => {
                const key = `${dateStr}_${slot}`;
                const isDisabled = disabledSlots.has(key);

                return (
                  <button
                    key={key}
                    className={`${styles.slotBtn} ${isDisabled ? styles.slotDisabled : styles.slotEnabled}`}
                    onClick={() => toggleSlot(dateStr, slot)}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
