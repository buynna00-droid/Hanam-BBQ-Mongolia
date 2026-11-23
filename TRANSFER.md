# Өөр компьютерт ажиллуулах

Энэ багцад код, зураг, нийтлэгдсэн цэсийн `menu-backup.json` нөөц багтсан. Одоогийн хэрэглэгчийн нууц үг, session, `.env`, PostgreSQL-ийн дотоод файлууд ороогүй. Цэсийн нэр, орчуулга, үнэ, ангилал, нийтлэх төлөв хадгалагдана. Админ бүртгэлийг шинээр үүсгэнэ.

## 1. Бэлтгэл

- Node.js 24 LTS болон Docker Desktop (Linux containers) суулгана.
- Docker Desktop-ийг асаана.
- ZIP-ийг задлаад төслийн хавтсанд терминал нээнэ. Анхны суулгалтад интернэт шаардлагатай.

## 2. Суулгах

Дараах командуудыг дарааллаар ажиллуулна. Аль нэг нь алдаа өгвөл дараагийн командыг ажиллуулахаас өмнө засна.

```sh
node scripts/setup-transfer.mjs
docker compose up -d --wait
npm ci
npm run db:migrate
node --env-file=.env --import tsx scripts/import-menu.ts menu-backup.json
npm run dev
```

`http://localhost:3000/mn` хаягаар нээнэ. `setup-transfer` шинэ санамсаргүй нууц үгтэй `.env` үүсгэнэ; байгаа `.env`-ийг дарж бичихгүй. Import зөвхөн хоосон цэсийн санд ажиллана. Ердийн seed командыг дахин ажиллуулах шаардлагагүй.

## 3. Админ

`.env` дотор `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` утгыг өөрөө тохируулна. Нууц үг 12–72 тэмдэгт байна. Дараа нь:

```sh
npm run admin:create
```

`http://localhost:3000/admin` руу нэвтэрнэ. Үүсгэсний дараа `.env`-ээс `ADMIN_PASSWORD`-ийг арилгана.

## Дараа нь асаах

Компьютер асахад Docker Desktop автоматаар асах тохиргоог идэвхжүүлнэ. PostgreSQL контейнер `restart: unless-stopped` тохиргоотой.

```sh
docker compose up -d --wait
npm run dev
```

Терминалыг хаавал сайт зогсоно. Компьютер унтарсан үед бусдад нээлттэй 24/7 сайт болохгүй. Энэ багц deploy хийхгүй.

Өгөгдөл Docker-ийн `hanam_database` volume-д хадгалагдана. **`docker compose down -v` бүү ажиллуул** — өгөгдлийг устгана. Энгийн `docker compose stop` нь өгөгдлийг хадгална.

Docker ашиглахгүй бол PostgreSQL 16+ дээр шинэ хоосон сан үүсгэж, `DATABASE_URL`-ийг түүнд тохируулан, `LOCAL_POSTGRES_AUTOSTART=false` байлгана. Docker командуудыг алгасаад migration/import/run командыг ажиллуулна.

## Багцын агуулга

`menu-backup.json` нь зөвхөн MenuCategory, MenuItem, MenuItemImage, MenuItemVariant өгөгдлийг агуулна. Бүртгэл, session, өмнөх audit түүх шилжихгүй; import шинэ audit мөр үүсгэнэ. `public/uploads` байвал багцад багтана. Гадаад S3 зураг ашиглавал тухайн storage-ийн хандалт тусдаа тохируулагдана; S3 credentials ороогүй.
