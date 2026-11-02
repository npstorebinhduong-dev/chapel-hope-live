import { en } from "./en";
import { vi } from "./vi";
import { it } from "./it";
import type { GiftKey } from "@chapel/shared";
import type { Locale } from "../../../../packages/shared/src/production";
export const ui = { en, vi, it };
export const languageTags = { en: "en-GB", vi: "vi-VN", it: "it-IT" };
export const giftLabels: Record<Locale, Record<GiftKey, string>> = {
  en: {
    candle_1: "Candle",
    prayer_5: "Prayer",
    rose_5: "White Rose",
    bell_10: "Bell",
    altar_100: "Special Prayer",
    ceremony_500: "Grand Ceremony",
  },
  vi: {
    candle_1: "Thắp nến",
    prayer_5: "Cầu nguyện",
    rose_5: "Hoa trắng",
    bell_10: "Chuông",
    altar_100: "Cầu chúc riêng",
    ceremony_500: "Đại lễ",
  },
  it: {
    candle_1: "Candela",
    prayer_5: "Preghiera",
    rose_5: "Rosa bianca",
    bell_10: "Campana",
    altar_100: "Augurio speciale",
    ceremony_500: "Grande cerimonia",
  },
};
export { giftVoiceLines } from "../voice/lines";
