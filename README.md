# Yordanova Transport – Rechnungssystem

Alman vergi sistemine uyumlu, profesyonel fatura yönetim sistemi.

## Özellikler

- ✅ §14 UStG uyumlu Almanca faturalar (Leistungsdatum, Steuernummer, USt-IdNr, IBAN/BIC)
- ✅ ZUGFeRD / Factur-X e-Rechnung (PDF içine gömülü EN 16931 XML)
- ✅ DIN 5008 tarzı profesyonel PDF şablonu
- ✅ Müşteri, ürün/hizmet ve fatura yönetimi (CRUD)
- ✅ E-posta ile PDF fatura gönderimi (Almanca HTML şablon)
- ✅ KDV oranları: %0, %7, %19 + Kleinunternehmerregelung (§19 UStG) desteği
- ✅ Otomatik fatura numaralama (RE-YYYY-NNNN)
- ✅ Dashboard: ciro, bekleyen/geciken faturalar, grafikler
- ✅ Mobil ve tablet uyumlu arayüz (Almanca)
- ✅ İmzalı oturum çerezi ile PIN tabanlı giriş

## Teknoloji

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Veritabanı**: PostgreSQL (Supabase) + Prisma 7
- **Styling**: Tailwind CSS 4
- **PDF**: @react-pdf/renderer + pdf-lib (ZUGFeRD)
- **E-posta**: Nodemailer (SMTP)

## Kurulum (Lokal)

```bash
npm install
cp .env.example .env   # değerleri doldur
npm run db:generate
npx prisma migrate deploy
npm run db:seed        # sadece boş veritabanı için
npm run dev
```

`.env` içinde gerekli değişkenler: `DATABASE_URL` (Supabase Postgres),
`SESSION_SECRET` (en az 32 karakter), SMTP bilgileri (e-posta gönderimi için).

## Eski SQLite verilerini taşıma

Eski `dev.db` dosyasındaki tüm veriler tek komutla Postgres'e taşınır:

```bash
npx tsx scripts/migrate-from-sqlite.ts
```

## Vercel'e Deploy

1. Bu repo'yu GitHub'a push et
2. [vercel.com/new](https://vercel.com/new) → repo'yu seç → Import
3. Environment Variables ekle: `DATABASE_URL`, `SESSION_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`
4. Deploy

> **Not:** `DATABASE_URL` için Supabase'in **Transaction Pooler** bağlantısını
> (port 6543) kullan. Migration çalıştırırken direkt bağlantı (port 5432) gerekir:
> `DATABASE_URL="postgresql://...:5432/postgres" npx prisma migrate deploy`

## Veritabanı Komutları

```bash
npm run db:generate    # Prisma Client üret
npx prisma migrate deploy  # Migration'ları uygula
npm run db:seed        # Örnek veri (boş kurulum)
npm run db:studio      # Veritabanı görüntüleyici
```

## Giriş

İlk kurulumda seed kullanıcısı: `admin@invoice.com` / PIN `1234`.
**Canlıya çıkmadan önce PIN'i değiştirmeyi unutma.**
