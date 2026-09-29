# Dezhyne Labs - Client Shopify Onboarding Form

A responsive, accessible, and high-converting client onboarding website and form for **Dezhyne Labs**, designed to streamline information collection for new Shopify store setups.

## 🚀 Features

- **Intuitive Multi-Section Flow**: Clean steps for Client & Order, Shopify Store, Brand & Design, Store Setup, Content & Pages, Social & Assets, Products, and Final Instructions.
- **Dynamic Conditional Fields**:
  - Existing Store URL appears when "I already have a Shopify store" is selected.
  - Custom Currency text input appears when "Other" is chosen.
  - Domain Name input appears when custom domain is set to "Yes".
  - Product Quantity selection appears when client indicates they'll provide product information.
- **Accessible Validation & Feedback**: Inline ARIA-described error states, required field checks, and animated loading/success/error statuses.
- **Google Sheets & Webhook Ready**: Submits directly to Google Sheets via Google Apps Script (or any REST endpoint).
- **Responsive & Modern Styling**: Mobile-first responsive layout, smooth micro-interactions, custom styled checkboxes/radios, and Google Fonts typography.

---

## 📁 Project Structure

```text
├── assets/
│   └── dezhyne-logo.png        # Brand mark and favicon
├── index.html                  # Main onboarding form and landing page
├── style.css                   # Responsive design system and styles
├── script.js                   # Form logic, validation, and submission handler
├── google-sheets-setup.js      # Google Apps Script code for Google Sheets integration
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

---

## 🛠️ Setup & Deployment

### 1. Local Testing
You can serve the static files with any local web server:

```bash
# Using Python
python -m http.server 8000

# Using Node (npx)
npx serve .
```

### 2. Google Sheets Integration
To direct form submissions to your own Google Sheet:
1. Create a new Google Sheet.
2. Navigate to **Extensions** > **Apps Script**.
3. Paste the contents of [`google-sheets-setup.js`](./google-sheets-setup.js).
4. Click **Deploy** > **New deployment**.
5. Select **Web app**, set **Execute as** to `Me`, and set **Who has access** to `Anyone`.
6. Copy the generated Web App URL (`.../exec`).
7. Paste this URL into [`script.js`](./script.js) under `SUBMISSION_ENDPOINT`.

---

## 🌐 Deploy to GitHub Pages / Hosting
This repository is completely static and can be deployed instantly to:
- **GitHub Pages**: Go to **Settings** > **Pages** > Select branch `main` / `root`.
- **Vercel / Netlify / Cloudflare Pages**: Connect the repository and deploy with default static settings.

---

## 📄 License
© Dezhyne Labs. All rights reserved.
