import type { Locale } from "../../../../packages/shared/src/production";
import type { GiftKey } from "@chapel/shared";
import type {
  NoticeKind,
  PromptKind,
} from "../../../../packages/shared/src/engagement";
export const gratitude: Record<Locale, Record<GiftKey, readonly string[]>> = {
  en: {
    candle_1: [
      "Thank you for adding a gentle light to this moment.",
      "Thank you for sharing the warmth of this candle.",
    ],
    prayer_5: [
      "Thank you for being part of this moment of peace.",
      "Thank you for joining this quiet reflection.",
    ],
    rose_5: [
      "Thank you for this thoughtful white flower.",
      "Thank you for bringing a sign of kindness.",
    ],
    bell_10: [
      "Thank you for sharing this peaceful sound.",
      "Thank you for inviting us to pause together.",
    ],
    altar_100: [
      "Thank you for sharing this special moment with us.",
      "Thank you for your thoughtful presence at this time of reflection.",
    ],
    ceremony_500: [
      "Thank you for bringing our virtual community together.",
      "Thank you for sharing this beautiful moment of light and hope.",
    ],
  },
  vi: {
    candle_1: [
      "Cảm ơn bạn đã thêm một ánh sáng dịu dàng.",
      "Cảm ơn bạn đã chia sẻ hơi ấm của ngọn nến.",
    ],
    prayer_5: [
      "Cảm ơn bạn đã cùng chia sẻ khoảnh khắc bình an này.",
      "Cảm ơn bạn đã dành một phút tĩnh lặng cùng chúng tôi.",
    ],
    rose_5: [
      "Cảm ơn bạn vì đóa hoa trắng đầy ý nghĩa.",
      "Cảm ơn bạn đã gửi trao một cử chỉ tử tế.",
    ],
    bell_10: [
      "Cảm ơn bạn đã chia sẻ tiếng chuông bình an.",
      "Cảm ơn bạn đã mời mọi người cùng lắng lại.",
    ],
    altar_100: [
      "Cảm ơn bạn đã chia sẻ khoảnh khắc đặc biệt này.",
      "Cảm ơn sự hiện diện đầy quan tâm của bạn.",
    ],
    ceremony_500: [
      "Cảm ơn bạn đã kết nối cộng đồng trong không gian ảo này.",
      "Cảm ơn bạn đã cùng chia sẻ ánh sáng và hy vọng.",
    ],
  },
  it: {
    candle_1: [
      "Grazie per aver aggiunto una luce gentile.",
      "Grazie per condividere il calore di questa candela.",
    ],
    prayer_5: [
      "Grazie per condividere con noi questo momento di pace.",
      "Grazie per unirti a questa riflessione silenziosa.",
    ],
    rose_5: [
      "Grazie per questo delicato fiore bianco.",
      "Grazie per questo segno di gentilezza.",
    ],
    bell_10: [
      "Grazie per condividere questo suono di pace.",
      "Grazie per invitarci a una pausa insieme.",
    ],
    altar_100: [
      "Grazie per condividere questo momento speciale.",
      "Grazie per la tua presenza attenta in questo momento di raccoglimento.",
    ],
    ceremony_500: [
      "Grazie per riunire la nostra comunità virtuale.",
      "Grazie per condividere questa luce e questa speranza.",
    ],
  },
};
export const invitations: Record<
  Locale,
  Record<PromptKind, readonly string[]>
> = {
  en: {
    amen: [
      "Welcome. Type AMEN to join the waiting line.",
      "You are welcome here. Write AMEN to wait with us.",
      "Join this quiet moment by typing AMEN.",
      "Type AMEN whenever you wish to join our waiting crowd.",
    ],
    like: [
      "If you enjoy this peaceful space, tap the heart to support our community.",
      "A heart is a free way to share a little hope.",
      "Tap the heart if you would like to brighten our virtual chapel.",
      "Your hearts can create a gentle moment of light together.",
    ],
    share: [
      "You can share this live with someone who might enjoy a quiet moment.",
      "You can share this peaceful moment with someone you care about.",
      "Invite a friend to pause with us by sharing this LIVE.",
      "Share this space if someone you know could enjoy a peaceful pause.",
    ],
  },
  vi: {
    amen: [
      "Chào mừng bạn. Hãy bình luận AMEN để tham gia hàng chờ.",
      "Bạn luôn được chào đón. Viết AMEN để cùng đứng chờ nhé.",
      "Bình luận AMEN để cùng chia sẻ phút bình yên này.",
      "Khi muốn tham gia hàng chờ, bạn có thể viết AMEN.",
    ],
    like: [
      "Nếu bạn yêu thích không gian bình an này, hãy thả tim để cổ vũ cộng đồng nhé.",
      "Một trái tim là cách miễn phí để chia sẻ chút hy vọng.",
      "Bạn có thể thả tim để thánh đường ảo thêm ánh sáng.",
      "Những trái tim có thể cùng tạo một khoảnh khắc ánh sáng dịu dàng.",
    ],
    share: [
      "Bạn có thể chia sẻ phiên LIVE này với người muốn có vài phút bình yên.",
      "Bạn có thể chia sẻ khoảnh khắc bình yên này với người mình quan tâm.",
      "Mời một người bạn cùng nghỉ ngơi bằng cách chia sẻ LIVE nhé.",
      "Nếu thấy phù hợp, hãy chia sẻ không gian yên bình này với người thân.",
    ],
  },
  it: {
    amen: [
      "Benvenuti. Scrivete AMEN per unirvi alla fila d’attesa.",
      "Siete i benvenuti. Scrivete AMEN per attendere con noi.",
      "Unitevi a questo momento tranquillo scrivendo AMEN.",
      "Scrivete AMEN quando desiderate unirvi alla nostra fila.",
    ],
    like: [
      "Se vi piace questo spazio di serenità, lasciate un cuore per sostenere la comunità.",
      "Un cuore è un modo gratuito per condividere un poco di speranza.",
      "Toccate il cuore per illuminare la nostra cappella virtuale.",
      "I vostri cuori possono creare insieme un delicato momento di luce.",
    ],
    share: [
      "Potete condividere questa diretta con qualcuno che desidera un momento di serenità.",
      "Puoi condividere questo momento di serenità con una persona cara.",
      "Invitate un amico a fermarsi con noi condividendo la diretta.",
      "Condividete questo spazio con chi potrebbe apprezzare una pausa tranquilla.",
    ],
  },
};
export const acknowledgements: Record<
  Locale,
  Record<NoticeKind, readonly string[]>
> = {
  en: {
    amen: [
      "Welcome to our waiting crowd.",
      "Thank you for joining this quiet moment.",
    ],
    like: ["Thank you for sharing a little hope.", "Thank you for being here."],
    share: [
      "Thank you for sharing this moment of peace.",
      "Thank you for inviting someone to pause with us.",
    ],
    follow: [
      "Welcome, and thank you for following.",
      "Thank you for staying connected to this quiet space.",
    ],
    heart: [
      "Together, your hearts have brought a moment of light.",
      "Thank you for sharing hope with our community.",
    ],
    community: [
      "A free moment of reflection, shared in this virtual chapel.",
      "Let us pause together with a peaceful thought.",
    ],
  },
  vi: {
    amen: [
      "Chào mừng bạn đến với hàng chờ.",
      "Cảm ơn bạn đã cùng chia sẻ phút yên bình.",
    ],
    like: [
      "Cảm ơn bạn đã gửi một chút hy vọng.",
      "Cảm ơn bạn đã có mặt ở đây.",
    ],
    share: [
      "Cảm ơn bạn đã chia sẻ khoảnh khắc bình an này.",
      "Cảm ơn bạn đã mời thêm một người cùng lắng lại.",
    ],
    follow: [
      "Chào mừng và cảm ơn bạn đã theo dõi.",
      "Cảm ơn bạn đã kết nối với không gian yên bình này.",
    ],
    heart: [
      "Những trái tim đã cùng tạo một khoảnh khắc ánh sáng.",
      "Cảm ơn bạn đã chia sẻ hy vọng với cộng đồng.",
    ],
    community: [
      "Một phút suy ngẫm miễn phí trong thánh đường ảo.",
      "Mời mọi người cùng lắng lại với một ý nghĩ bình an.",
    ],
  },
  it: {
    amen: [
      "Benvenuti nella nostra fila d’attesa.",
      "Grazie per unirvi a questo momento sereno.",
    ],
    like: [
      "Grazie per condividere un poco di speranza.",
      "Grazie per essere qui.",
    ],
    share: [
      "Grazie per condividere questo momento di pace.",
      "Grazie per invitare qualcuno a fermarsi con noi.",
    ],
    follow: [
      "Benvenuti e grazie per seguirci.",
      "Grazie per restare in contatto con questo spazio sereno.",
    ],
    heart: [
      "I vostri cuori hanno creato insieme un momento di luce.",
      "Grazie per condividere speranza con la comunità.",
    ],
    community: [
      "Un momento gratuito di riflessione nella cappella virtuale.",
      "Fermiamoci insieme con un pensiero di pace.",
    ],
  },
};
