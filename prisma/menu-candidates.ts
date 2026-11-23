// User-supplied transcription. NOT verified against the missing Word document.
import { categoryNamesEn, itemNamesEn } from "./menu-english";
export type Candidate = {
  slug: string;
  nameMn: string;
  nameKo: string | null;
  nameEn: string | null;
  price: number | null;
  size: string | null;
  descriptionMn: string | null;
};
export type CandidateCategory = {
  slug: string;
  nameMn: string;
  nameKo: string | null;
  nameEn: string | null;
  group: "FOOD" | "DRINKS";
  items: Candidate[];
};
function items(
  prefix: string,
  rows: [string, string | null, number | null, string?, string?][],
): Candidate[] {
  return rows.map(([nameMn, nameKo, price, size, descriptionMn], i) => ({
    slug: `${prefix}-${i + 1}`,
    nameMn,
    nameKo,
    nameEn: itemNamesEn[`${prefix}-${i + 1}`] ?? null,
    price,
    size: size ?? null,
    descriptionMn: descriptionMn ?? null,
  }));
}
const soup =
  "Сонголттой шөл: Кимчитэй, Шар буурцагны, Гүчүжантай, Дүпүтэй шөл.";
export const candidates: CandidateCategory[] = [
  {
    slug: "pork-bbq",
    nameMn: "Үндсэн хоол — Гахайн BBQ мах",
    nameKo: "메인 메뉴",
    nameEn: null,
    group: "FOOD",
    items: items("pork", [
      ["Самгёопсал", "생삼겹살", 27900, "200 гр"],
      ["Мугсаль", "특목살", 28900, "200 гр"],
      ["Гальмэгисаль", "갈매기살", 30900, "200 гр"],
      ["Габрисаль", "가브리살", 29900, "200 гр"],
      ["Ханжонсаль", "항정살", 31900, "200 гр"],
      ["Кальби", "생갈비", 26900, "200 гр"],
      [
        "Холимог мах",
        "모듬한판",
        75900,
        "600 гр",
        "хэвлий 200 + хүзүү 200 + холбоос 200",
      ],
      [
        "Hanam нэрийн холимог мах",
        "특별모듬",
        85900,
        "600 гр",
        "холбоос 200 + өрцний 200 + сээрний 200",
      ],
    ]),
  },
  {
    slug: "sets",
    nameMn: "Сет меню",
    nameKo: "세트 메뉴",
    nameEn: null,
    group: "FOOD",
    items: items("set", [
      [
        "SET A",
        null,
        96900,
        "2 хүн",
        `хэвлий 200 + хүзүү 200 + 1 сонголттой шөл + бяслагтай жигнэсэн өндөг + 2 будаа. ${soup}`,
      ],
      [
        "SET B",
        null,
        119900,
        "3 хүн",
        `хэвлий 200 + хавирга 200 + холбоос 200 + 1 сонголттой шөл + бяслагтай жигнэсэн өндөг + 3 будаа. ${soup}`,
      ],
      [
        "SET C",
        null,
        179900,
        "4 хүн",
        `хэвлий 400 + өрцний 200 + сээрний 200 + хавирга 200 + 1 сонголттой шөл + жигнэсэн өндөг + 4 будаа. ${soup}`,
      ],
    ]),
  },
  {
    slug: "soups",
    nameMn: "Шөл",
    nameKo: "국/탕류",
    nameEn: null,
    group: "FOOD",
    items: items("soup", [
      ["Гахайн махтай кимчитэй шөл", "돼지고기 김치찌개", 27900],
      ["Шар буурцагны шөл", "된장찌개", 27900],
      ["Гүчүжантай шөл", "고추장찌개", 27900],
      ["Дүпүтэй шөл", "순두부찌개", 27900],
    ]),
  },
  {
    slug: "noodles",
    nameMn: "Гоймон",
    nameKo: "면류",
    nameEn: null,
    group: "FOOD",
    items: items("noodle", [
      ["Хүйтэн гоймон", "물냉면", 19000],
      ["Халуун ногоотой хүйтэн гоймон", "비빔냉면", 19000],
      ["Халуун шөлтэй гоймон", "잔치국수", 19000],
    ]),
  },
  {
    slug: "sides",
    nameMn: "Хачир, нэмэлт хоол",
    nameKo: "곁들임 메뉴",
    nameEn: null,
    group: "FOOD",
    items: items("side", [
      ["Бяслагтай жигнэсэн өндөг", "치즈 계란찜", 16000],
      ["Мөөгний цуглуулга", "모듬 버섯", 13000],
      ["Кимчитэй будаатай хуурга", "도시락 김치볶음밥", 19000],
      ["Будааны бөмбөлөг (өөрөө урлах)", "주먹밥", 19000],
      ["Будаа", "공깃밥", 4000],
    ]),
  },
  {
    slug: "signature-side",
    nameMn: "Hanam BBQ-ийн нэрийн хачир",
    nameKo: null,
    nameEn: null,
    group: "FOOD",
    items: items("signature", [
      [
        "Мёнгинамуль",
        "명이나물",
        null,
        undefined,
        "Солонгос жороор даршилсан зэрлэг сармисны навч.",
      ],
    ]),
  },
  {
    slug: "soju",
    nameMn: "Сожу",
    nameKo: "소주",
    nameEn: null,
    group: "DRINKS",
    items: items("soju", [
      [
        "Good Day, Jinro, Chum Churum — энгийн",
        "좋은데이, 진로, 처음처럼",
        23000,
      ],
      ["Jinro / Good Day жимстэй сожу", "참이슬 / 좋은데이 과일소주", 23000],
    ]),
  },
  {
    slug: "beer",
    nameMn: "Шар айраг",
    nameKo: "맥주",
    nameEn: null,
    group: "DRINKS",
    items: items("beer", [
      ["Cass", "카스", 13000],
      ["Terra", "테라", 13000],
      ["Asahi", "아사히 맥주", 15000],
      ["Chinggis Beer", "칭기즈 맥주", 14000],
    ]),
  },
  {
    slug: "traditional",
    nameMn: "Солонгос уламжлалт ундаа",
    nameKo: "전통주",
    nameEn: null,
    group: "DRINKS",
    items: items("traditional", [
      ["Макголли Original", "막걸리 오리지널", 27000],
      ["Ногоон усан үзэм", "청포도 막걸리", 27000],
      ["Тоор", "복숭아 막걸리", 27000],
    ]),
  },
  {
    slug: "spirits",
    nameMn: "Архи, виски, коньяк",
    nameKo: null,
    nameEn: null,
    group: "DRINKS",
    items: items("spirit", [
      ["Finlandia Vodka", null, 180000, "0.75 л"],
      ["Shiguderi Shimi", null, 150000, "0.75 л"],
      ["Chinggis Khaan Vodka", null, 380000, "0.75 л"],
      ["Johnnie Walker Black Label", null, 240000, "0.75 л"],
      ["Johnnie Walker Double Black", null, 340000, "0.75 л"],
      ["Hennessy VS", null, 320000, "0.7 л"],
      ["Hennessy VSOP", null, 410000, "0.7 л"],
    ]),
  },
  {
    slug: "soft-drinks",
    nameMn: "Алкогольгүй ундаа",
    nameKo: "음료",
    nameEn: null,
    group: "DRINKS",
    items: items("soft-drink", [
      ["Coca-Cola", "콜라", 8000],
      ["Sprite", "스프라이트", 8000],
      ["Fanta Orange", "환타 오렌지", 8000],
      ["Fanta Grape", "환타 포도", 8000],
      ["Calpis", "칼피스", 8000],
      ["Del Monte Orange Juice", "델몬트 오렌지주스", 5000],
      ["Millennia ус", "밀레니아 생수", 4500],
      ["Millennia хийжүүлсэн ус", "밀레니아 탄산수", 4500],
    ]),
  },
];
for (const category of candidates) {
  category.nameEn = categoryNamesEn[category.slug] ?? null;
}
