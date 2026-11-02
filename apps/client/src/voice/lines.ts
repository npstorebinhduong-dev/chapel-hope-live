import { giftKeys, type GiftKey } from "@chapel/shared";
import type { Locale } from "../../../../packages/shared/src/production";
export const giftVoiceLines: Record<
  Locale,
  Record<GiftKey, readonly string[]>
> = {
  en: {
    candle_1: [
      "May a gentle light bring you peace.",
      "May this little flame brighten a quiet moment.",
      "May this light be a reminder of kindness today.",
    ],
    prayer_5: [
      "May you find strength and calm today.",
      "May patience and courage accompany your next step.",
      "May a quiet prayer bring rest to your heart.",
    ],
    rose_5: [
      "May love and kindness surround you.",
      "May kindness blossom in your home.",
      "May this white flower carry a thought of friendship.",
    ],
    bell_10: [
      "May this moment fill you with hope.",
      "May this bell remind us to care for one another.",
      "May the sound of this bell invite a peaceful pause.",
    ],
    altar_100: [
      "Wishing you and your family peace.",
      "May you and your loved ones find comfort and hope.",
      "May peace and hope accompany you and your family.",
    ],
    ceremony_500: [
      "May peace and hope unite us all.",
      "Together, we wish every family peace and brighter days.",
      "May our shared moment inspire compassion for one another.",
    ],
  },
  vi: {
    candle_1: [
      "Mong ánh sáng dịu dàng mang đến bình an cho bạn.",
      "Mong ngọn nến nhỏ sưởi ấm phút giây tĩnh lặng của bạn.",
      "Mong ánh nến nhắc chúng ta sống tử tế hôm nay.",
    ],
    prayer_5: [
      "Chúc bạn tìm thấy sức mạnh và sự an yên hôm nay.",
      "Mong lòng kiên nhẫn và can đảm đồng hành cùng bạn.",
      "Cầu chúc phút cầu nguyện giúp lòng bạn được nghỉ ngơi.",
    ],
    rose_5: [
      "Mong tình yêu và lòng nhân ái luôn ở bên bạn.",
      "Cầu chúc lòng nhân ái nở hoa trong mái ấm của bạn.",
      "Mong đóa hoa trắng gửi trao một lời thân ái.",
    ],
    bell_10: [
      "Mong khoảnh khắc này mang đến nhiều hy vọng.",
      "Mong tiếng chuông nhắc chúng ta quan tâm đến nhau.",
      "Mong tiếng chuông mời bạn dừng lại trong bình an.",
    ],
    altar_100: [
      "Cầu chúc bạn và gia đình luôn bình an.",
      "Mong bạn và người thân tìm thấy niềm an ủi và hy vọng.",
      "Cầu chúc bạn và gia đình luôn bình an, nhiều hy vọng.",
    ],
    ceremony_500: [
      "Cầu mong bình an và hy vọng kết nối mọi người.",
      "Cùng cầu chúc mọi gia đình bình an và những ngày tươi sáng.",
      "Mong khoảnh khắc chung nuôi dưỡng lòng cảm thông giữa mọi người.",
    ],
  },
  it: {
    candle_1: [
      "Che una luce gentile porti pace nel tuo cuore.",
      "Che questa piccola fiamma illumini un momento di quiete.",
      "Che questa luce ci ricordi la gentilezza di ogni giorno.",
    ],
    prayer_5: [
      "Che tu possa trovare forza e serenità oggi.",
      "Che pazienza e coraggio accompagnino il tuo prossimo passo.",
      "Che una preghiera silenziosa porti riposo al tuo cuore.",
    ],
    rose_5: [
      "Che amore e gentilezza siano sempre con te.",
      "Che la gentilezza fiorisca nella tua casa.",
      "Che questo fiore bianco porti un pensiero di amicizia.",
    ],
    bell_10: [
      "Che questo momento ti riempia di speranza.",
      "Che questa campana ci ricordi di prenderci cura gli uni degli altri.",
      "Che il suono della campana inviti a una pausa serena.",
    ],
    altar_100: [
      "Auguro pace a te e alla tua famiglia.",
      "Che tu e i tuoi cari troviate conforto e speranza.",
      "Che la pace e la speranza accompagnino te e la tua famiglia.",
    ],
    ceremony_500: [
      "Che la pace e la speranza ci uniscano tutti.",
      "Insieme auguriamo a ogni famiglia pace e giorni più luminosi.",
      "Che questo momento condiviso ispiri compassione reciproca.",
    ],
  },
};
export class LineRotation {
  private turns = new Map<GiftKey, number>();
  constructor(private seed = 0) {}
  next(locale: Locale, key: GiftKey) {
    const variant =
      (this.turns.get(key) ?? this.seed) % giftVoiceLines[locale][key].length;
    this.turns.set(key, variant + 1);
    return { text: giftVoiceLines[locale][key][variant], variant };
  }
}
export { giftKeys };
