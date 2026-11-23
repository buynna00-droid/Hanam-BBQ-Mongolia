export const languages = ["mn", "ko", "en"] as const;
export const footerCopy = {
  mn: {
    hours: "Цагийн хуваарь",
    phone: "Холбогдох дугаар",
    email: "Имэйл",
    days: "Өдөр бүр",
    sunday: "Ням",
    pending: "Лавлах",
    links: "Холбоосууд",
  },
  ko: {
    hours: "영업시간",
    phone: "연락처",
    email: "이메일",
    days: "매일",
    sunday: "일요일",
    pending: "문의",
    links: "바로가기",
  },
  en: {
    hours: "Opening hours",
    phone: "Contact number",
    email: "Email",
    days: "Every day",
    sunday: "Sunday",
    pending: "Please enquire",
    links: "Links",
  },
};
export type Lang = (typeof languages)[number];
export const copy = {
  mn: {
    home: "Нүүр",
    about: "Бидний тухай",
    menu: "Цэс",
    gallery: "Зургийн цомог",
    branches: "Салбарууд",
    special: "Яагаад Hanam BBQ онцгой вэ?",
    food: "ХООЛНЫ ЦЭС",
    drinks: "УУХ ЗҮЙЛСИЙН ЦЭС",
    all: "Бүгд",
    viewAll: "Бүгдийг үзэх",
    showLess: "Хураах",
    aboutTag: "Солонгос BBQ",
    specialTag: "Ширээн дээр шарах",
    pending: "Баталгаажуулалт хүлээгдэж байна",
    empty: "Цэсийг баталгаажуулж байна.",
    map: "Газрын зургийн байршлыг баталгаажуулж байна",
    price: "Үнэ хүлээгдэж байна",
    featured: "Онцлох",
    photo: "Зураг хүлээгдэж байна",
    logo: "Албан ёсны лого хүлээгдэж байна",
    translation: "Орчуулга хүлээгдэж байна",
    scroll: "Доош гүйлгэх",
    contact: "Холбоо барих",
    openMenu: "Цэс нээх",
    closeMenu: "Цэс хаах",
    original: "Монгол эх",
  },
  ko: {
    home: "홈",
    about: "소개",
    menu: "메뉴",
    gallery: "갤러리",
    branches: "매장",
    special: "Hanam BBQ의 특별함",
    food: "음식 메뉴",
    drinks: "음료 메뉴",
    all: "전체",
    viewAll: "전체 보기",
    showLess: "접기",
    aboutTag: "한국식 BBQ",
    specialTag: "테이블에서 굽는 BBQ",
    pending: "확인 대기 중",
    empty: "메뉴 확인 중입니다.",
    map: "지도 위치 확인 대기 중",
    price: "가격 확인 대기 중",
    featured: "추천",
    photo: "사진 준비 중",
    logo: "공식 로고 준비 중",
    translation: "번역 대기 중",
    scroll: "아래로 스크롤",
    contact: "연락처",
    openMenu: "메뉴 열기",
    closeMenu: "메뉴 닫기",
    original: "몽골어 원문",
  },
  en: {
    home: "Home",
    about: "About",
    menu: "Menu",
    gallery: "Gallery",
    branches: "Locations",
    special: "What makes Hanam BBQ special?",
    food: "FOOD MENU",
    drinks: "DRINKS MENU",
    all: "All",
    viewAll: "View all",
    showLess: "Show less",
    aboutTag: "Korean BBQ",
    specialTag: "Tableside grilling",
    pending: "Verification pending",
    empty: "The menu is awaiting verification.",
    map: "Map coordinates pending verification",
    price: "Price pending",
    featured: "Featured",
    photo: "Photo pending",
    logo: "Official logo pending",
    translation: "Translation pending",
    scroll: "Scroll to explore",
    contact: "Contact",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    original: "Mongolian source",
  },
};
export const aboutMn =
  "Солонгосын №1 Hanam BBQ рестораны Монгол дахь анхны франчайз салбар.\nЖинхэнэ Солонгос BBQ амт, чанартай үйлчилгээ, тав тухтай орчин, орчин үеийн интерьерийг хослуулсан Hanam BBQ нь Монголын хэрэглэгчдэд шинэ түвшний хооллох соёлын туршлагыг хүргэж байна.";
export const specialMn =
  "Махыг эхлээд урьдчилан модны нүүрсэн дээр шарж, дараа нь роастинг тогооч нар ширээн дээр үргэлжлүүлэн шарж, идэхэд бэлэн болгож өгдөг.";
export const editorialCopy: Record<Lang, { about: string; special: string }> = {
  mn: { about: aboutMn, special: specialMn },
  ko: {
    about:
      "한국 No.1 Hanam BBQ의 몽골 첫 프랜차이즈 매장입니다.\n정통 한국 BBQ의 맛, 수준 높은 서비스, 편안한 분위기와 현대적인 인테리어를 갖춘 Hanam BBQ는 몽골 고객들에게 한 차원 높은 외식 문화를 선사합니다.",
    special:
      "고기를 먼저 숯불에 초벌구이한 뒤, 로스팅 셰프가 테이블에서 이어서 구워 바로 드실 수 있도록 준비해 드립니다.",
  },
  en: {
    about:
      "The first Mongolian franchise of Hanam BBQ, Korea’s No. 1 BBQ restaurant.\nCombining authentic Korean BBQ flavors, quality service, a comfortable atmosphere and modern interiors, Hanam BBQ brings a new level of dining culture to guests in Mongolia.",
    special:
      "The meat is first pre-grilled over wood charcoal, then our roasting chefs continue grilling it at your table until it is ready to enjoy.",
  },
};
export const branches = [
  "River Plaza, 512B байр, 1 давхар",
  "Энх тайвaны өргөн чөлөө, СБД - 1 хороо, Улаанбаатар 14240, Rome Center, 3 давхар (Төв номын сангийн урд)",
];
export function localized(
  record: object,
  field: string,
  lang: Lang,
): string | null {
  return (
    (record as Record<string, string | null>)[
      field + lang[0].toUpperCase() + lang.slice(1)
    ] ?? null
  );
}
