import { useState, useEffect, useMemo } from "react";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

import { ORDER_SLOTS } from "../config/businessHours";

dayjs.extend(isBetween);

const PREP_BUFFER_MINUTES = 30;

export const useTimeSlots = () => {
  const [preferredTime, setPreferredTime] = useState<dayjs.Dayjs | null>(null);
  const [timeError, setTimeError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

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

    if (day === 0) {
      return generateSlots(sundayOpenStart.hour(), sundayOpenEnd.hour());
    }
    return [
      ...generateSlots(openMorningStart.hour(), openMorningEnd.hour()),
      ...generateSlots(openEveningStart.hour(), openEveningEnd.hour()),
    ];
  }, [day, nowDate, sundayOpenStart, sundayOpenEnd, openMorningStart, openMorningEnd, openEveningStart, openEveningEnd]);

  useEffect(() => {
    const minSelectableTime = nowDate.hour(9);
    if (day === 0 && now.isBefore(sundayOpenStart)) {
      setInfoMessage("La domenica mattina la pizzeria è chiusa. Orari disponibili dalle 18:00");
    } else if (now.isAfter(openEveningEnd) || now.isAfter(sundayOpenEnd)) {
      setInfoMessage("La pizzeria è chiusa o è troppo tardi per consegnare a domicilio. Gli ordini saranno disponibili dal giorno successivo");
    } else if (now.isBefore(minSelectableTime)) {
      setInfoMessage("Attendi le 9.00 per poter effettuare un ordine");
    } else {
      setInfoMessage("");
    }
  }, [now, day, nowDate, sundayOpenStart, openEveningEnd, sundayOpenEnd]);

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
  };
};
