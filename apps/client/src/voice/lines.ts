import { giftKeys, type GiftKey } from "@chapel/shared";
import type { Locale } from "../../../../packages/shared/src/production";
export const giftVoiceLines: Record<
  Locale,
  Record<GiftKey, readonly [string, string]>
> = {
  en: {
    candle_1: [
      "May a gentle light bring you peace.",
      "May this little flame brighten a quiet moment.",
    ],
    prayer_5: [
      "May you find strength and calm today.",
      "May patience and courage accompany your next step.",
    ],
    rose_5: [
      "May love and kindness surround you.",
      "May kindness blossom in your home.",
    ],
    bell_10: [
      "May this moment fill you with hope.",
      "May this bell remind us to care for one another.",
    ],
    altar_100: [
      "Wishing you and your family peace.",
      "May you and your loved ones find comfort and hope.",
    ],
    ceremony_500: [
      "May peace and hope unite us all.",
      "Together, we wish every family peace and brighter days.",
    ],
  },
  vi: {
    candle_1: [
      "Mong ánh sáng dịu dàng mang đến bình an cho bạn.",
      "Mong ngọn nến nhỏ sưởi ấm phút giây tĩnh lặng của bạn.",
    ],
    prayer_5: [
      "Chúc bạn tìm thấy sức mạnh và sự an yên hôm nay.",
      "Mong lòng kiên nhẫn và can đảm đồng hành cùng bạn.",
    ],
    rose_5: [
      "Mong tình yêu và lòng nhân ái luôn ở bên bạn.",
      "Cầu chúc lòng nhân ái nở hoa trong mái ấm của bạn.",
    ],
    bell_10: [
      "Mong khoảnh khắc này mang đến nhiều hy vọng.",
      "Mong tiếng chuông nhắc chúng ta quan tâm đến nhau.",
    ],
    altar_100: [
      "Cầu chúc bạn và gia đình luôn bình an.",
      "Mong bạn và người thân tìm thấy niềm an ủi và hy vọng.",
    ],
    ceremony_500: [
      "Cầu mong bình an và hy vọng kết nối mọi người.",
      "Cùng cầu chúc mọi gia đình bình an và những ngày tươi sáng.",
    ],
  },
  it: {
    candle_1: [
      "Che una luce gentile porti pace nel tuo cuore.",
      "Che questa piccola fiamma illumini un momento di quiete.",
    ],
    prayer_5: [
      "Che tu possa trovare forza e serenità oggi.",
      "Che pazienza e coraggio accompagnino il tuo prossimo passo.",
    ],
    rose_5: [
      "Che amore e gentilezza siano sempre con te.",
      "Che la gentilezza fiorisca nella tua casa.",
    ],
    bell_10: [
      "Che questo momento ti riempia di speranza.",
      "Che questa campana ci ricordi di prenderci cura gli uni degli altri.",
    ],
    altar_100: [
      "Auguro pace a te e alla tua famiglia.",
      "Che tu e i tuoi cari troviate conforto e speranza.",
    ],
    ceremony_500: [
      "Che la pace e la speranza ci uniscano tutti.",
      "Insieme auguriamo a ogni famiglia pace e giorni più luminosi.",
    ],
  },
};
export class LineRotation {
  private turns = new Map<GiftKey, number>();
  constructor(private seed = 0) {}
  next(locale: Locale, key: GiftKey) {
    const variant = ((this.turns.get(key) ?? this.seed) + 2) % 2;
    this.turns.set(key, variant + 1);
    return { text: giftVoiceLines[locale][key][variant], variant };
  }
}
export { giftKeys };
