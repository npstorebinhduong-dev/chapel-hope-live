/** Admin locale is always Vietnamese; never selected by the broadcast locale. */
export const adminVi = {
  title: "Bảng điều hành Chapel of Hope",
  edition: "PHIÊN BẢN 1.9 · QUẢN TRỊ TIẾNG VIỆT",
  openLive: "Mở màn hình LIVE",
  tabs: [
    "Tổng quan",
    "Kết nối LIVE",
    "Quà tặng & Hiệu ứng",
    "Âm thanh & Lời chúc",
    "Tương tác cộng đồng",
    "Kiểm thử & Cài đặt",
  ],
  pending: "Đang xử lý…",
  ack: "Đã áp dụng",
  error: "Không thể thực hiện. Kiểm tra kết nối và thử lại.",
  ready: "Đã kết nối máy chủ",
  connecting: "Đang kết nối máy chủ…",
  mock: "Giả lập · DEMO",
  live: "TikFinity thực",
  source: "Nguồn sự kiện",
  endpoint: "Địa chỉ WebSocket TikFinity",
  connect: "Kết nối",
  disconnect: "Ngắt kết nối",
  retry: "Thử lại",
  save: "Lưu cấu hình",
  sourceReset:
    "Đổi nguồn sẽ xóa phiên thử hiện tại, gồm người chờ và các bộ đếm. Tiếp tục?",
  connection: {
    connected: "Đã kết nối WebSocket",
    connecting: "Đang kết nối",
    reconnecting: "Đang thử kết nối lại",
    disconnected: "Mất kết nối",
  },
  sourceNote:
    "TikFinity Desktop phải chạy trên cùng máy Windows. Đã kết nối WebSocket chưa có nghĩa là đã kiểm chứng phát LIVE.",
  verification: "Chờ kiểm chứng Windows và phiên LIVE thật",
  verificationHelp:
    "Chỉ xác nhận LIVE VERIFIED sau khi thấy bình luận, quà, tim/chia sẻ thật và nghe được âm thanh trong nguồn phát. Ứng dụng không tự bấm GO LIVE.",
  demoHelp:
    "Các nút giả lập chỉ dùng trong nguồn Giả lập và không được cộng vào số liệu TikFinity thực.",
  waiting: "Đang chờ",
  inside: "Trong lễ đường",
  seated: "Đã ngồi",
  entering: "Đang vào",
  viewers: "Người trong phiên",
  npc: "NPC nền (không tính người xem)",
  hearts: "Tổng tim",
  shares: "Lượt chia sẻ",
  follows: "Lượt theo dõi",
  comments: "Bình luận hợp lệ",
  amen: "Lượt AMEN",
  accepted: "Quà đã nhận",
  completed: "Quà đã diễn",
  queue: "Quà đang chờ",
  duplicates: "Sự kiện trùng đã bỏ qua",
  rejected: "Sự kiện chưa nhận",
  fps: "FPS đo tại màn hình LIVE",
  unknownMetric: "Chưa có dữ liệu",
  retention: "Thời gian xem / tỷ lệ giữ chân",
  rates: "Sự kiện trong phút hiện tại (chưa đủ phút không suy ra tốc độ)",
  delay: "Độ trễ quà đang chờ",
  seconds: "giây",
  hidden: "Người chờ chưa vẽ chi tiết",
  compactWaiting: "Người chờ lưu gọn trong RAM",
  capacityRefusals: "AMEN từ chối do hết bộ nhớ phiên",
  events: "Nhật ký sự kiện",
  received: "Gói tin đã nhận",
  ignored: "Gói tin bỏ qua",
  unknownGifts: "Quà chưa ánh xạ",
  likesReceived: "Đã nhận tim có số lượng xác minh",
  sharesReceived: "Đã nhận sự kiện chia sẻ",
  waitingData: "Chờ dữ liệu thật",
  unverifiedLikes: "Gói tim chưa xác minh",
  unverifiedShares: "Gói chia sẻ chưa xác minh",
  giftIntro:
    "Đây là sáu hoạt động trong game. Chỉ nhập ID quà thực tế từ TikFinity; hai quà 5 xu cần hai ID khác nhau. Chưa xác minh tên/giá theo tài khoản thì không gọi đó là quà TikTok đã xác minh.",
  action: "Loại hoạt động",
  coins: "Xu dự kiến",
  giftId: "ID quà TikTok",
  giftName: "Tên quà quan sát được",
  status: "Trạng thái",
  test: "Thử hiệu ứng",
  saveMapping: "Lưu ánh xạ quà",
  unmapped: "Chưa ánh xạ quà thật",
  mapped: "Đã cấu hình ID · cần xác minh tài khoản",
  observed: "Đã nhận metadata · cần đối chiếu tài khoản",
  duplicateMapping:
    "ID này đã dùng cho hoạt động khác. Hai quà 5 xu phải có ID riêng.",
  combo: "Số lần trong combo",
  camera: "Camera tập trung người tặng",
  quality: "Chất lượng hình ảnh",
  low: "Thấp",
  balanced: "Cân bằng",
  high: "Cao",
  locale: "Ngôn ngữ phát LIVE",
  languages: { en: "Tiếng Anh", vi: "Tiếng Việt", it: "Tiếng Ý" },
  provider: "Nguồn giọng đọc",
  browser: "Giọng cài trên máy",
  recorded: "Bản thu cục bộ có quyền sử dụng",
  voice: "Giọng đọc đúng ngôn ngữ",
  automatic: "Tự chọn giọng phù hợp",
  missingVoice:
    "Thiếu giọng cho ngôn ngữ này. Cài giọng tương ứng trong Windows hoặc cung cấp bản thu; hiện chỉ có phụ đề.",
  voiceReady: "Có giọng phù hợp",
  voiceNote:
    "Tên giọng là tên do hệ điều hành cung cấp. Không dùng giọng khác ngôn ngữ. Không gọi API trả phí.",
  rate: "Tốc độ đọc",
  voiceEnabled: "Bật lời cầu chúc",
  thanksEnabled: "Bật lời cảm ơn",
  bannerEnabled: "Hiện phụ đề lời đọc",
  readNames: "Đọc tên an toàn (tùy chọn)",
  sample: "Nghe thử",
  stopVoice: "Ngắt lời đang đọc",
  resumeVoice: "Đọc lại lời vừa ngắt",
  stopAll: "DỪNG TOÀN BỘ ÂM THANH",
  unlock: "Bật âm thanh trong cửa sổ này",
  audioUnlocked: "Đã mở âm thanh cửa sổ này",
  muted: "Tắt toàn bộ âm thanh",
  audioNote:
    "Chỉ bật âm thanh tại cửa sổ LIVE được OBS thu. Trình duyệt khóa một cửa sổ phát âm thanh để tránh phát đôi; đóng/dừng âm ở cửa sổ đang giữ khóa trước khi nghe thử tại đây.",
  musicEnabled: "Bật nhạc nền",
  track: "Đoạn nhạc nền",
  tracks: {
    playlist: "Luân phiên ba đoạn",
    peace: "Bình an · organ và piano",
    hope: "Hy vọng · giai điệu nhẹ",
    evening: "Chiều tĩnh lặng · organ ấm",
  },
  musicNote:
    "Ba giai điệu tổng hợp nguyên tác. Đổi đoạn ở ranh giới ô nhịp, hòa chuyển 1,2 giây; đây không phải bản thu organ thật.",
  mix: {
    master: "Âm lượng tổng",
    music: "Nhạc nền",
    ambient: "Môi trường",
    sfx: "Hiệu ứng",
    voice: "Giọng đọc",
  },
  meter: "Mức tín hiệu đo được",
  voiceMeter:
    "Giọng đọc: chỉ báo hoạt động, không đo RMS của giọng hệ điều hành",
  speaking: "Đang đọc",
  silent: "Đang nghỉ",
  dropped: "Lời đọc đã gộp/bỏ qua (không mất quà)",
  audioTest: "Kiểm tra tất cả âm thanh",
  audioTestNote:
    "Chuỗi thử sáu quà, bước chân, ghế, quỳ và bồ câu dài khoảng 23 giây; không tạo quà hoặc cộng bộ đếm. Dừng toàn bộ để hủy.",
  heartGoal: "Mốc tim",
  shareGoal: "Mốc chia sẻ",
  heartsEnabled: "Bật hiệu ứng mốc tim",
  sharesEnabled: "Bật bồ câu khi chia sẻ",
  idleEnabled: "Bật chuyển động nền",
  communityEnabled: "Hoạt cảnh cầu nguyện miễn phí mỗi khoảng 5 phút",
  promptsEnabled: "Bật lời mời AMEN / tim / chia sẻ",
  quiet: "Chế độ yên tĩnh (dừng lời mời)",
  cooldown: "Khoảng nghỉ tối thiểu giữa lời mời",
  inactivity: "Thời gian ít tương tác trước lời mời",
  promptVariant: "Nhóm câu thử nghiệm A/B",
  invite: "Phát lời mời tiếp theo khi đủ điều kiện",
  inviteNote:
    "Chỉ khi ít hoạt động, không có quà/lời đọc và nguồn âm sẵn sàng. Tối thiểu 90 giây giữa hai lời mời, tối đa 3 lần/10 phút. Nút thủ công cũng giữ giới hạn.",
  invitations: "Lời mời trong 10 phút",
  experiment: "Quan sát A/B (không kết luận quan hệ nhân quả)",
  before: "Trước lời mời",
  after: "Tăng thêm sau 60 giây",
  guideTitle: "Bảng hướng dẫn trên LIVE",
  guideEnabled: "Bật bảng hướng dẫn",
  opacity: "Độ rõ bảng",
  scale: "Kích thước bảng",
  position: "Vị trí trong vùng an toàn",
  upper: "Phía trên",
  compact: "Phía trên thu gọn",
  cycle: "Chu kỳ đổi nhóm hướng dẫn",
  preview: "Xem trước nhóm hướng dẫn",
  guideGroups: {
    auto: "Tự luân phiên",
    join: "AMEN và nam/nữ",
    social: "Tim và chia sẻ",
    gifts: "Sáu hoạt động quà",
  },
  renderLimit: "Giới hạn avatar vẽ chi tiết",
  memoryLimit: "Giới hạn avatar đầy đủ trong RAM",
  resourceNote:
    "Người chờ vượt mức vẽ vẫn được đếm và có thể tặng quà. Tầng dự phòng chỉ giữ dữ liệu phiên tối thiểu; khi quá tải thật sẽ báo rõ, không bịa số người.",
  username: "Tên hiển thị thử",
  userId: "Mã người thử trong phiên",
  guest: "Khách thử",
  sendAmen: "Gửi AMEN",
  male: "1 · Nam",
  female: "2 · Nữ",
  addPeople: "Thêm người chờ",
  like1: "Thử 1 tim",
  like100: "Thử 100 tim",
  like1000: "Thử mốc 1.000 tim",
  share1: "Thử 1 chia sẻ",
  follow1: "Thử 1 theo dõi",
  idle60: "Giả lập ít tương tác 60 giây",
  idle120: "Giả lập ít tương tác 120 giây",
  acceptance: "Thử 50 AMEN + 5 quà",
  fullSeats: "Lấp đầy ghế bằng quà giả lập",
  confirmFixture: "Xóa phiên giả lập hiện tại và chạy tình huống kiểm thử này?",
  selectViewer: "Chọn người đang có trong phiên",
  empty: "Chưa có người trong phiên",
  gender: { male: "Nam", female: "Nữ" },
  admission: {
    waiting: "Đang chờ",
    invited: "Được gọi vào",
    inside: "Trong lễ đường",
  },
  noSeat: "Chưa có ghế",
  seat: "Ghế",
  npcs: "Bật giáo dân NPC nền",
  reset: "Xóa phiên",
  confirmReset:
    "Xóa người chờ, quà đang xếp hàng, nến/hoa và bộ đếm tương tác?",
  defaults: "Khôi phục cấu hình mặc định",
  confirmDefaults:
    "Khôi phục cấu hình âm thanh, hướng dẫn và tương tác? Không xóa người xem hoặc ánh xạ quà.",
  preflight: "Kiểm tra sẵn sàng LIVE",
  pass: "Đạt",
  fail: "Cần xử lý",
  pendingVerify: "Chưa kiểm chứng",
  preflightItems: {
    server: "Máy chủ game",
    canvas: "Hình ảnh canvas",
    ratio: "Khung dọc 9:16",
    audio: "Âm thanh tại cửa sổ LIVE",
    voice: "Giọng đúng ngôn ngữ tại LIVE",
    mapping: "Đủ sáu ánh xạ quà",
    socket: "Kết nối TikFinity",
    like: "Sự kiện tim thật",
    share: "Sự kiện chia sẻ thật",
    capture: "Hình và tiếng trong OBS/LIVE Studio",
    windows: "Bộ khởi chạy Windows",
    live: "Phiên LIVE thật",
  },
  captureNote:
    "Ghi thử 20–30 giây trong OBS/LIVE Studio; chỉ giữ một nguồn tiếng. Khung xuất 1080×1920. Người vận hành tự quyết định phát sóng.",
  footer:
    "Không gian thánh đường ảo. Quà tạo hoạt cảnh, không bảo đảm kết quả tâm linh. Không lưu hồ sơ tín ngưỡng.",
};
export const voiceStatusVi: Record<string, string> = {
  ended: "Đã đọc xong",
  missing: "Thiếu giọng phù hợp",
  blocked: "Giọng đang tắt hoặc bị trình duyệt chặn",
  error: "Lỗi phát giọng; kiểm tra giọng cài trên máy",
  timeout: "Giọng đọc quá thời gian cho phép",
  speaking: "Đang đọc",
  "Not enabled": "Chưa bật giọng",
};
export function adminError(error: unknown) {
  const value = String(error).replace(/^Error: /, "");
  const errors: Record<string, string> = {
    capacity:
      "Phiên đã đạt giới hạn bộ nhớ người chờ. AMEN này chưa được nhận; chờ dữ liệu cũ hết hạn hoặc tăng giới hạn RAM.",
    audio_other_tab:
      "Cửa sổ khác đang phát âm thanh. Dừng hoặc đóng cửa sổ đó trước khi nghe thử ở đây.",
    invalid_production_settings:
      "Cấu hình chưa hợp lệ. Kiểm tra các giới hạn và thử lại.",
    invalid_source_loopback_or_mapping:
      "Địa chỉ phải là WebSocket cục bộ; ID quà phải là số hợp lệ.",
    invalid_engagement:
      "Dữ liệu tương tác chưa hợp lệ; số tim phải là số nguyên dương.",
    rate_limit: "Thao tác quá nhanh. Đợi một giây rồi thử lại.",
    "Switch to Mock before sending test events":
      "Chuyển sang Giả lập trước khi thử sự kiện.",
    "Confirm reset before changing source":
      "Cần xác nhận xóa phiên trước khi đổi nguồn.",
    queue_full: "Hàng quà đã đầy. Quà này chưa được nhận; thử lại sau.",
    invalid_inactivity: "Chỉ chọn khoảng giả lập 60 hoặc 120 giây.",
  };
  return (
    errors[value] ??
    (value.includes("queue full")
      ? errors.queue_full
      : value.includes("fetch")
        ? "Không liên lạc được máy chủ. Mở lại bộ khởi chạy và kiểm tra kết nối."
        : adminVi.error)
  );
}
export function eventVi(event: string) {
  if (event.startsWith("gift "))
    return event
      .replace("gift ", "Quà ")
      .replace("streak progress", "combo chưa kết thúc")
      .replace("duplicate", "trùng lặp")
      .replace("accepted", "đã nhận")
      .replace("queue_full", "hàng quà đầy")
      .replace("repeat capped at 20", "giới hạn combo 20");
  if (event.startsWith("like +"))
    return event.replace("like", "Tim").replace("accepted", "đã nhận");
  if (event.startsWith("share +"))
    return event.replace("share", "Chia sẻ").replace("accepted", "đã nhận");
  if (event.startsWith("follow +"))
    return event.replace("follow", "Theo dõi").replace("accepted", "đã nhận");
  if (event.startsWith("chat"))
    return (
      "Bình luận đã nhận · " +
      (event.endsWith("other") ? "nội dung khác" : event.split(" · ").at(-1))
    );
  const labels: Record<string, string> = {
    "socket connected": "Đã kết nối WebSocket",
    "socket disconnected; reconnect scheduled":
      "Mất kết nối; đang lên lịch thử lại",
    "Malformed JSON": "Gói JSON sai định dạng",
    "Unsupported event": "Loại sự kiện chưa hỗ trợ",
    "Missing stable sender ID": "Thiếu ID người gửi ổn định",
    "Invalid chat": "Bình luận sai định dạng",
    "Missing gift ID": "Thiếu ID quà",
    "Invalid repeat count": "Số combo không hợp lệ",
    "Gift missing transaction ID; inspect Desktop payload":
      "Quà thiếu mã giao dịch; kiểm tra dữ liệu Desktop",
    "LIKE COUNT UNVERIFIED": "Chưa xác minh được số tim",
    "LIKE BASELINE RECORDED": "Đã ghi mốc tim lũy kế ban đầu",
    "LIKE COUNTER RESET": "Bộ đếm tim nguồn đã đặt lại",
    "LIKE DUPLICATE": "Bỏ qua số tim lặp",
    "LIKE JUMP UNVERIFIED": "Bỏ qua bước tăng tim chưa xác minh",
    "SOCIAL DUPLICATE": "Bỏ qua tương tác trùng",
    "SOCIAL DUPLICATE WINDOW": "Bỏ qua tương tác lặp trong cửa sổ chống trùng",
    "SHARE/FOLLOW ID UNVERIFIED": "Chia sẻ/theo dõi chưa có ID xác minh",
    "SOCIAL COUNT UNVERIFIED": "Số tương tác chưa xác minh",
  };
  return (
    labels[event] ??
    (event.startsWith("Unknown Gift")
      ? event.replace("Unknown Gift", "Quà chưa ánh xạ")
      : "Dữ liệu chưa xử lý được; xem cấu hình nguồn.")
  );
}
