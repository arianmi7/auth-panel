# Auth Panel · پنل ورود و ثبت‌نام

[فارسی](#فارسی) · [English](#english)

A bilingual (Persian / English) sign-in and sign-up page with a 4-digit SMS code step.
Purple, electronics-inspired theme. Built with **Vite**, **Tailwind CSS v4** and vanilla **JavaScript**.

---

## English

### Features

- Sign-in and sign-up tabs (sign-up adds a name field)
- Mobile number validation (`09xxxxxxxxx`), accepts Persian and Arabic digits
- **4-digit code with no confirm button.** It is checked automatically after the 4th digit
- Verification animation:
  - the four digits lift out of the row and spin fast in a circle (whirlwind)
  - **correct code:** digits turn green and stop
  - **wrong code:** digits turn red, shake, and the message "Wrong code. Enter it again." appears
- Supports typing, paste, backspace, arrow keys and SMS autofill (`autocomplete="one-time-code"`)
- Resend timer (30 seconds) and "Change number" button
- Header with a logo slot linking to the home page
- **FA / EN switch** in the header. It changes all text and flips the page between RTL and LTR. The choice is saved in `localStorage`
- Responsive, visible keyboard focus, respects `prefers-reduced-motion`

### Quick start

Requirements: Node.js 18 or newer.

```bash
npm install
npm run dev       # development server
npm run build     # production build in /dist
npm run preview   # preview the production build
```

### Project structure

```
auth-panel/
├─ index.html        # page markup: header, tabs, phone form, OTP step
├─ package.json
├─ vite.config.js    # Vite + Tailwind v4 plugin
└─ src/
   ├─ main.js        # logic: tabs, validation, OTP, vortex animation, language
   ├─ style.css      # Tailwind import, theme colors, circuit background, animations
   └─ i18n.js        # Persian and English texts
```

### Connect your backend

Open `src/main.js` and replace the two placeholder functions:

```js
async function sendCode(phone, mode, name) {
  await fetch('/api/auth/send-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, mode, name }),
  });
}

async function verifyCode(phone, code) {
  const res = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });
  return res.ok; // true = correct code, false = wrong code
}
```

Then:

1. Set `REDIRECT_AFTER_VERIFY` (for example `'/dashboard'`) to choose where users go after a correct code.
2. Delete the demo hint line (`data-i18n="demo_hint"`) in `index.html`.
3. In the demo, the correct code is `1234`. Remove `DEMO_CODE` when you connect a real backend.

### Customize

| What | Where |
| --- | --- |
| Logo | Replace the SVG inside `.logo-slot` in `index.html` with your `<img>` |
| Brand name and all texts | `src/i18n.js` |
| Colors | `@theme` block at the top of `src/style.css` |
| Spin speed and duration | `W`, `SPIN_UP`, `MIN_SPIN`, `SETTLE` inside `runVortex()` in `src/main.js` |
| Resend delay | `RESEND_SECONDS` in `src/main.js` |
| Add another language | Add a new key in `src/i18n.js` and a button with `data-lang` in the header |

### Security note

This project is only the front end. Validate the code, limit attempts, and rate-limit SMS requests on your server.

### License

MIT. See [LICENSE](./LICENSE).

---

## فارسی

### امکانات

- تب ورود و ثبت‌نام (در ثبت‌نام فیلد نام هم اضافه می‌شود)
- اعتبارسنجی شماره موبایل (`09xxxxxxxxx`) با پشتیبانی از اعداد فارسی و عربی
- **کد ۴ رقمی بدون دکمه‌ی تایید.** بعد از وارد شدن رقم چهارم، خودکار بررسی می‌شود
- انیمیشن بررسی کد:
  - چهار رقم از ردیف بلند می‌شوند و با سرعت دور یک دایره می‌چرخند (گردباد)
  - **کد درست:** رقم‌ها سبز می‌شوند و می‌ایستند
  - **کد غلط:** رقم‌ها قرمز می‌شوند، تکان می‌خورند و پیام «کد اشتباه است. دوباره وارد کن.» نمایش داده می‌شود
- پشتیبانی از تایپ، paste، backspace، کلیدهای جهت‌نما و پر شدن خودکار از پیامک
- تایمر ارسال مجدد (۳۰ ثانیه) و دکمه‌ی ویرایش شماره
- هدر با جای لوگو که به صفحه‌ی اصلی لینک می‌شود
- **دکمه‌ی فارسی / English** در هدر: همه‌ی متن‌ها را عوض می‌کند و جهت صفحه را بین راست‌چین و چپ‌چین برمی‌گرداند. انتخاب کاربر در `localStorage` ذخیره می‌شود
- ریسپانسیو، فوکوس واضح برای کیبورد، و رعایت `prefers-reduced-motion`

### اجرای سریع

پیش‌نیاز: Node.js نسخه‌ی ۱۸ یا بالاتر.

```bash
npm install
npm run dev       # سرور توسعه
npm run build     # ساخت نسخه‌ی نهایی در پوشه‌ی dist
npm run preview   # پیش‌نمایش نسخه‌ی نهایی
```

### اتصال به بک‌اند

فایل `src/main.js` را باز کن و دو تابع `sendCode` و `verifyCode` را با API خودت جایگزین کن (نمونه‌ی کد در بخش انگلیسی بالا آمده است). بعد:

1. مقدار `REDIRECT_AFTER_VERIFY` را مثلاً `'/dashboard'` بگذار تا بعد از کد درست کاربر به آنجا برود.
2. خط راهنمای نمایشی (`data-i18n="demo_hint"`) را از `index.html` حذف کن.
3. در حالت نمایشی کد درست `1234` است. هنگام اتصال به بک‌اند واقعی، `DEMO_CODE` را پاک کن.

### شخصی‌سازی

| چه چیزی | کجا |
| --- | --- |
| لوگو | SVG داخل `.logo-slot` در `index.html` را با `<img>` خودت عوض کن |
| نام برند و همه‌ی متن‌ها | `src/i18n.js` |
| رنگ‌ها | بلوک `@theme` در ابتدای `src/style.css` |
| سرعت و مدت چرخش | `W` و `SPIN_UP` و `MIN_SPIN` و `SETTLE` داخل تابع `runVortex()` در `src/main.js` |
| زمان ارسال مجدد | `RESEND_SECONDS` در `src/main.js` |
| افزودن زبان جدید | یک کلید جدید در `src/i18n.js` و یک دکمه با `data-lang` در هدر |

### نکته‌ی امنیتی

این پروژه فقط فرانت‌اند است. بررسی کد، محدودیت تعداد تلاش و محدودیت ارسال پیامک باید سمت سرور انجام شود.

### مجوز

MIT. فایل [LICENSE](./LICENSE) را ببین.

---

### Publish on GitHub

```bash
git init
git add .
git commit -m "Initial commit: auth panel"
git branch -M main
git remote add origin https://github.com/<your-username>/auth-panel.git
git push -u origin main
```

To host it for free on GitHub Pages, set `base: '/auth-panel/'` in `vite.config.js`, run `npm run build`, and publish the `dist` folder.
