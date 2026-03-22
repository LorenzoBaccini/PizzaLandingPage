import { useState, useEffect, useMemo, useCallback } from "react";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

import { ORDER_SLOTS } from "../config/businessHours";
import { supabase } from "../lib/supabase";

dayjs.extend(isBetween);

const PREP_BUFFER_MINUTES = 30;
const DELIVERY_SKIP_SLOTS = 2;
const SUPABASE_TIMEOUT_MS = 3000;

export const useTimeSlots = (isDelivery = false) => {
  const [preferredTime, setPreferredTime] = useState<dayjs.Dayjs | null>(null);
  const [timeError, setTimeError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [disabledSlots, setDisabledSlots] = useState<Set<string>>(new Set());

  const now = useMemo(() => dayjs(), []);
  const day = now.day();
  const nowDate = now.startOf("day");

  const openMorningStart = nowDate.hour(ORDER_SLOTS.weekday.morning.start);
  const openMorningEnd = nowDate.hour(ORDER_SLOTS.weekday.morning.end);
  const openEveningStart = nowDate.hour(ORDER_SLOTS.weekday.evening.start);
  const openEveningEnd = nowDate.hour(ORDER_SLOTS.weekday.evening.end);
  const sundayOpenStart = nowDate.hour(ORDER_SLOTS.sunday.evening.start);
  const sundayOpenEnd = nowDate.hour(ORDER_SLOTS.sunday.evening.end);

  const slotsTimes = useMemo(() => {
    const generateSlots = (startHour: number, endHour: number) => {
      const slots: dayjs.Dayjs[] = [];
      for (let hour = startHour; hour < endHour; hour++) {
        for (let min = 0; min < 60; min += 15) {
          slots.push(nowDate.hour(hour).minute(min).second(0));
        }
      }
      return slots;
    };

    const skip = isDelivery ? DELIVERY_SKIP_SLOTS : 0;

    if (day === 0) {
      return generateSlots(sundayOpenStart.hour(), sundayOpenEnd.hour()).slice(skip);
    }
    return [
      ...generateSlots(openMorningStart.hour(), openMorningEnd.hour()).slice(skip),
      ...generateSlots(openEveningStart.hour(), openEveningEnd.hour()).slice(skip),
    ];
  }, [day, nowDate, sundayOpenStart, sundayOpenEnd, openMorningStart, openMorningEnd, openEveningStart, openEveningEnd, isDelivery]);

  useEffect(() => {
    const minSelectableTime = nowDate.hour(9);
    if (now.isBefore(minSelectableTime)) {
      setInfoMessage("Potrai ordinare a partire dalle ore 9:00");
    } else if (day === 0 && now.isBefore(sundayOpenStart)) {
      setInfoMessage("La domenica la pizzeria apre alle 18:00. Puoi già prenotare per stasera!");
    } else if ((day === 0 && now.isAfter(sundayOpenEnd)) || (day !== 0 && now.isAfter(openEveningEnd))) {
      setInfoMessage("È troppo tardi per ordinare oggi. Gli ordini saranno disponibili domani dalle 9:00");
    } else {
      setInfoMessage("");
    }
  }, [now, day, nowDate, sundayOpenStart, openEveningEnd, sundayOpenEnd]);

  const refreshDisabledSlots = useCallback(() => {
    const today = nowDate.format("YYYY-MM-DD");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);

    supabase
      .from("disabled_slots")
      .select("date, time_slot")
      .gte("date", today)
      .abortSignal(controller.signal)
      .then(({ data }) => {
        clearTimeout(timeout);
        if (data) {
          const selected = preferredTime
            ? `${preferredTime.format("YYYY-MM-DD")}_${preferredTime.format("HH:mm")}`
            : null;
          const newSet = new Set(data.map((row) => `${row.date}_${row.time_slot}`));
          setDisabledSlots(newSet);
          if (selected && newSet.has(selected)) {
            setPreferredTime(null);
            setTimeError("L'orario selezionato non è più disponibile. Scegline un altro.");
          }
        }
      })
      .catch(() => {
        clearTimeout(timeout);
      });
  }, [nowDate, preferredTime]);

  useEffect(() => {
    refreshDisabledSlots();
  }, []);

  const isSlotDisabled = (slot: dayjs.Dayjs) => {
    const minSelectableTime = nowDate.hour(9);
    if (now.isBefore(minSelectableTime)) return true;
    if (slot.isBefore(now.add(PREP_BUFFER_MINUTES, "minute"))) return true;

    if (day === 0) {
      if (slot.isBefore(sundayOpenStart) || slot.isAfter(sundayOpenEnd)) return true;
    } else {
      const inMorningRange = slot.isBetween(openMorningStart, openMorningEnd, null, "[)");
      const inEveningRange = slot.isBetween(openEveningStart, openEveningEnd, null, "[)");
      if (!inMorningRange && !inEveningRange) return true;
    }

    const slotKey = `${slot.format("YYYY-MM-DD")}_${slot.format("HH:mm")}`;
    if (disabledSlots.has(slotKey)) return true;

    return false;
  };

  const handleSelectTime = (slot: dayjs.Dayjs) => {
    setTimeError("");
    setPreferredTime(slot);
  };

  return {
    slotsTimes,
    preferredTime,
    timeError,
    setTimeError,
    infoMessage,
    isSlotDisabled,
    handleSelectTime,
    refreshDisabledSlots,
  };
};
