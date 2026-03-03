# /i18n-localization

**Internationalization (i18n) and localization (l10n) strategies for global applications.**

Use this skill when building multi-language applications, handling different locales, or global market entry.

---

## What This Skill Does

Teaches **localization thinking**. Covers:
- 🌍 i18n vs l10n concepts
- 🗣️ Translation workflows and tools
- 🌐 Locale detection and selection
- 📅 Date, time, and number formatting
- 💱 Currency and region-specific formatting
- 📝 Pluralization rules by language
- ↔️ RTL (right-to-left) language support
- 🛠️ i18n libraries and frameworks

---

## When to Use

✅ Building multi-language applications
✅ Global market entry
✅ Date/time/number formatting
✅ Supporting RTL languages
✅ Managing translation workflows

❌ Specific library tutorials (use library docs)

---

## i18n vs l10n

### Internationalization (i18n)

**Definition:** Making your application capable of supporting multiple languages

**Scope:**
- Code structure that supports multiple languages
- Locale detection
- Date/time/number formatting APIs
- Text direction (LTR/RTL) handling
- Fallback language support

**Example:**
```javascript
// i18n: Application can support any language
const locale = navigator.language;  // 'en-US', 'fr-FR', 'ar-SA'
const formatter = new Intl.DateTimeFormat(locale);
```

### Localization (l10n)

**Definition:** Translating and adapting your application for a specific locale

**Scope:**
- Translating UI text
- Adapting images/colors for culture
- Local payment methods
- Local business hours
- Cultural references

**Example:**
```javascript
// l10n: Specific translation for fr-FR
const messages = {
  'fr-FR': { hello: 'Bonjour' },
  'en-US': { hello: 'Hello' }
};
```

---

## Locale Detection and Selection

### Browser Locale Detection

```javascript
// Get user's browser language
const locale = navigator.language;  // 'en-US', 'fr-FR', etc.

// More detailed
const locales = navigator.languages;  // ['en-US', 'en', 'fr']

// Get full list of locales
const language = new Intl.DisplayNames(['en'], { type: 'language' });
console.log(language.of('fr'));  // 'French'
```

### Priority Order for Locale Selection

```javascript
function selectLocale() {
  // 1. User preference (if logged in)
  if (user.preferredLocale) {
    return user.preferredLocale;
  }

  // 2. URL parameter
  const urlParams = new URLSearchParams(location.search);
  if (urlParams.has('lang')) {
    return urlParams.get('lang');
  }

  // 3. Cookie
  const cookieLang = getCookie('language');
  if (cookieLang) {
    return cookieLang;
  }

  // 4. Browser language
  const browserLang = navigator.language;
  if (supportedLocales.includes(browserLang)) {
    return browserLang;
  }

  // 5. Fallback
  return 'en-US';
}
```

### Supported Locales Structure

```javascript
const supportedLocales = [
  'en-US',     // English (United States)
  'en-GB',     // English (United Kingdom)
  'fr-FR',     // French
  'de-DE',     // German
  'es-ES',     // Spanish
  'ja-JP',     // Japanese
  'zh-CN',     // Chinese (Simplified)
  'ar-SA',     // Arabic (Saudi Arabia)
  'pt-BR',     // Portuguese (Brazil)
];

// Group by language
const localesByLanguage = {
  'en': ['en-US', 'en-GB'],
  'fr': ['fr-FR', 'fr-CA'],
  'es': ['es-ES', 'es-MX'],
  // ...
};
```

---

## Translation Management

### Key-Value Translation Structure

```javascript
// en-US.json
{
  "greeting": "Hello",
  "farewell": "Goodbye",
  "welcome": "Welcome, {name}!",
  "itemCount": "You have {count} items",
  "error": {
    "notFound": "Page not found",
    "unauthorized": "Access denied"
  }
}

// fr-FR.json
{
  "greeting": "Bonjour",
  "farewell": "Au revoir",
  "welcome": "Bienvenue, {name}!",
  "itemCount": "Vous avez {count} articles",
  "error": {
    "notFound": "Page non trouvée",
    "unauthorized": "Accès refusé"
  }
}
```

### Translation Function Implementation

```javascript
class i18n {
  constructor(translations) {
    this.translations = translations;
    this.currentLocale = 'en-US';
  }

  setLocale(locale) {
    this.currentLocale = locale;
  }

  t(key, params = {}) {
    let value = this.translations[this.currentLocale]?.[key];

    if (!value) {
      // Fallback to English
      value = this.translations['en-US']?.[key] || key;
    }

    // Replace parameters
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(`{${k}}`, v);
    });

    return value;
  }
}

// Usage
const i18n = new i18n(translations);
i18n.t('greeting');  // 'Hello'
i18n.t('welcome', { name: 'John' });  // 'Welcome, John!'
```

---

## Date and Time Formatting

### Intl.DateTimeFormat API

```javascript
// Different locales, same date
const date = new Date('2025-03-03');

// US: Month/Day/Year
new Intl.DateTimeFormat('en-US').format(date);  // '3/3/2025'

// UK: Day/Month/Year
new Intl.DateTimeFormat('en-GB').format(date);  // '03/03/2025'

// German: Day.Month.Year
new Intl.DateTimeFormat('de-DE').format(date);  // '03.03.2025'

// Japanese: Year/Month/Day
new Intl.DateTimeFormat('ja-JP').format(date);  // '2025/3/3'
```

### Custom Date Formatting

```javascript
const options = {
  weekday: 'long',    // 'Monday', 'Lundi'
  year: 'numeric',    // '2025'
  month: 'long',      // 'March', 'Mars'
  day: 'numeric'      // '3'
};

new Intl.DateTimeFormat('en-US', options).format(date);
// 'Monday, March 3, 2025'

new Intl.DateTimeFormat('fr-FR', options).format(date);
// 'lundi 3 mars 2025'
```

### Time Formatting

```javascript
const time = new Date('2025-03-03T14:30:00');

// Time only
new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true
}).format(time);
// '02:30:00 PM'

// 24-hour format
new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}).format(time);
// '14:30'
```

---

## Number and Currency Formatting

### Intl.NumberFormat API

```javascript
const number = 1234567.89;

// US English
new Intl.NumberFormat('en-US').format(number);
// '1,234,567.89'

// German
new Intl.NumberFormat('de-DE').format(number);
// '1.234.567,89'

// French
new Intl.NumberFormat('fr-FR').format(number);
// '1 234 567,89'
```

### Currency Formatting

```javascript
const amount = 99.99;

// US Dollar
new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
}).format(amount);
// '$99.99'

// Euro (Germany)
new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR'
}).format(amount);
// '99,99 €'

// British Pound
new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP'
}).format(amount);
// '£99.99'

// Japanese Yen (no decimals)
new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY'
}).format(amount);
// '￥100'
```

### Percentage Formatting

```javascript
const ratio = 0.35;

new Intl.NumberFormat('en-US', {
  style: 'percent'
}).format(ratio);
// '35%'

// With decimals
new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 2
}).format(ratio);
// '35.00%'
```

---

## Pluralization Rules

### Simple Plural Handling

```javascript
// English: singular/plural
function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
}

pluralize(1, 'item', 'items');      // 'item'
pluralize(5, 'item', 'items');      // 'items'
pluralize(0, 'item', 'items');      // 'items'
```

### Intl.PluralRules API

```javascript
// Different languages have different plural rules

// English: one, other
const enRules = new Intl.PluralRules('en-US');
enRules.select(0);   // 'other'
enRules.select(1);   // 'one'
enRules.select(2);   // 'other'

// French: one, other (1 is singular)
const frRules = new Intl.PluralRules('fr-FR');
frRules.select(1);   // 'one'
frRules.select(0);   // 'other'
frRules.select(2);   // 'other'

// Polish: one, few, many, other
const plRules = new Intl.PluralRules('pl-PL');
plRules.select(1);   // 'one'
plRules.select(2);   // 'few'
plRules.select(5);   // 'many'
plRules.select(25);  // 'other'
```

### i18n Library Pluralization

```javascript
// Using i18next library
i18n.t('itemCount', { count: 1 });   // '1 item'
i18n.t('itemCount', { count: 5 });   // '5 items'

// Translation file
{
  "itemCount": "{{count}} item",
  "itemCount_plural": "{{count}} items"
}
```

---

## RTL (Right-to-Left) Language Support

### Languages Using RTL

- Arabic (العربية)
- Hebrew (עברית)
- Persian (فارسی)
- Urdu (اردو)

### HTML Setup

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <!-- Content flows right to left -->
  </body>
</html>
```

### CSS for RTL

```css
/* Margin/padding RTL-aware */
.container {
  margin-inline-start: 10px;   /* Left in LTR, Right in RTL */
  margin-inline-end: 20px;     /* Right in LTR, Left in RTL */
  padding-inline: 15px;        /* Both sides */
}

/* Text direction */
.text {
  direction: rtl;
  text-align: start;  /* Auto-aligns based on direction */
}

/* Flex layout (auto-reverses in RTL) */
.flex {
  display: flex;
  flex-direction: row;  /* Reverses in RTL */
}

/* Float (auto-reverses) */
.sidebar {
  float: inline-start;  /* Left in LTR, Right in RTL */
}

/* Transforms */
.icon {
  transform: scaleX(var(--rtl-multiplier));  /* -1 in RTL, 1 in LTR */
}
```

### JavaScript RTL Detection

```javascript
function isRTL(locale) {
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  const lang = locale.split('-')[0];
  return rtlLocales.includes(lang);
}

function setupRTL(locale) {
  const isRtl = isRTL(locale);
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.lang = locale;

  // Set CSS variable for transforms
  document.documentElement.style.setProperty(
    '--rtl-multiplier',
    isRtl ? '-1' : '1'
  );
}

setupRTL('ar-SA');  // Sets dir="rtl"
setupRTL('en-US');  // Sets dir="ltr"
```

---

## i18n Libraries Comparison

| Library | Best For | Complexity |
|---------|----------|-----------|
| **i18next** | Full-featured, mature | Medium |
| **react-intl** | React apps, FormattedX components | Medium |
| **next-i18next** | Next.js apps | Low-Medium |
| **vue-i18n** | Vue apps | Low |
| **Intl API** | Simple needs, no library | Low |

### i18next Example

```javascript
import i18next from 'i18next';
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';

i18next.init({
  lng: 'en-US',
  fallbackLng: 'en-US',
  resources: {
    'en-US': { translation: enTranslations },
    'fr-FR': { translation: frTranslations }
  }
});

i18next.t('greeting');  // 'Hello'
i18next.changeLanguage('fr-FR');
i18next.t('greeting');  // 'Bonjour'
```

---

## Translation Workflow

### Process for Teams

```
1. Developer writes English copy
   └─ Keys in code: t('greeting')

2. Extract strings
   └─ Tool extracts all keys and English text

3. Send to translators
   └─ Provide JSON/CSV with keys and English

4. Translators provide translations
   └─ Receive files for each locale

5. Integrate translations
   └─ Import translation files into app

6. Test all locales
   └─ QA tests each language

7. Deploy
   └─ Release multi-language version
```

### Tools for Translation Management

- **Crowdin** - Professional translation management
- **Lokalise** - Collaborative translation platform
- **Phrase** - Enterprise translation platform
- **Google Translate API** - Automated translation (as fallback)
- **Weblate** - Open-source translation platform

---

## i18n Checklist

- [ ] **Supported locales** - List of locales you support
- [ ] **Locale detection** - Auto-detect user locale
- [ ] **Translation files** - All strings externalized
- [ ] **Date/time formatting** - Using Intl API
- [ ] **Number/currency** - Locale-specific formatting
- [ ] **Pluralization** - Correct plural rules
- [ ] **RTL support** - HTML/CSS ready for RTL
- [ ] **Testing** - Test multiple locales
- [ ] **Translation workflow** - Team process defined
- [ ] **Fallback locale** - Handles missing translations

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Hardcode text in components
- Use string concatenation for i18n
- Ignore RTL support for Arabic/Hebrew
- Have untranslated strings in production
- Forget about date/time/number formatting
- Ignore pluralization rules
- Use auto-translation without review
- Treat i18n as afterthought

✅ **DO:**
- Externalize all user-facing text
- Use i18n library
- Plan for RTL from start
- Professional human translation
- Use Intl API for formatting
- Test all supported locales
- Have translation workflow
- Plan i18n early in development

---

## Related Skills

- `/frontend-expert` - Component internationalization
- `/nextjs-builder` - Next.js i18n patterns
- `/documentation-writer` - Multi-language docs
- `/performance-profiler` - i18n performance impact

