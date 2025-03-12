# WLD-101

Welcome! 🎉

This repository provides a clear and straightforward template demonstrating how to build a Mini App using [Worldcoin's Mini Apps](https://docs.world.org/mini-apps).

The example Mini App uses **Next.js** and showcases various [commands](https://docs.world.org/mini-apps/quick-start/commands) supported by the MiniKit SDK. Start here to quickly experiment and integrate Worldcoin Mini Apps into your projects.

Let's dive in! 🚀

---

## Dependencies

- **[pnpm](https://pnpm.io/)**: Fast and efficient package manager.
- **[ngrok](https://ngrok.com/)**: Expose your local server publicly for easy testing.
- **[mini-kit-js](https://www.npmjs.com/package/@worldcoin/mini-kit-js)**: JavaScript SDK for Worldcoin Mini Apps.
- **[minikit-react](https://www.npmjs.com/package/@worldcoin/minikit-react)**: React bindings for MiniKit SDK.
- **[mini-apps-ui-kit-react](https://www.npmjs.com/package/@worldcoin/mini-apps-ui-kit-react)**: Pre-built UI components for Mini Apps.

---

## 🛠️ Setup

### 1. Clone the repository

```bash
git clone git@github.com:WLDing-blocks/wld-mini-apps-101.git
cd wld-101
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure your environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then fill in the required variables:

#### 🔑 APP_ID

Find your **App ID** in the [Developer Portal](https://developer.worldcoin.org/) (`Configuration > Basic`).

<img width="400" src="https://github.com/user-attachments/assets/695fc4cc-9f40-4cce-bf38-bc3187d70a27">

#### 🔑 DEV_PORTAL_API_KEY

Generate your **API Key** under the `API Keys` section.  
**Note:** Visible only once—copy it carefully!

<img width="400" src="https://github.com/user-attachments/assets/093891c3-dc8c-465e-a0d3-e75f3fb8dce6">

#### 🔑 WLD_CLIENT_ID & WLD_CLIENT_SECRET

Available under the `Sign in with World ID` tab in the [Developer Portal](https://developer.worldcoin.org/).

<img width="400" src="https://github.com/user-attachments/assets/304cf47f-44a6-43a5-91ec-d40bc89dc8b5">

#### 🌐 NEXTAUTH_URL

Set based on your environment:

- **Local:** `http://localhost:3000`
- **NGROK:** URL from NGROK (e.g., `https://example.ngrok-free.app`)
- **Production:** URL of your deployed app (e.g., `https://my-mini-app.vercel.app`)

---

## ▶️ Running the Project

Run your Mini App locally:

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Testing on Mobile

To test your Mini App directly on your phone, expose your app publicly using NGROK.

### 🚀 Using NGROK

Install [NGROK](https://ngrok.com/) and run:

```bash
ngrok http http://localhost:3000
```

NGROK provides a publicly accessible URL.

### 🌎 Configuring Your App (Developer Portal)

Go to the [Developer Portal](https://developer.worldcoin.org/) and configure:

- **App URL:** Set it to your NGROK-generated URL.

<img width="400" src="https://github.com/user-attachments/assets/695fc4cc-9f40-4cce-bf38-bc3187d70a27">

- **Redirect URL** (for Sign in with World ID): Set to your NGROK URL plus `/api/auth/callback/worldcoin`.

Example:
```
https://example.ngrok-free.app/api/auth/callback/worldcoin
```

<img width="400" src="https://github.com/user-attachments/assets/099ac1fb-f889-45b5-bd48-1c7126082ce7">

- **Incognito Actions**: Define an action and use it within `components/Verify/index.tsx`.

---

### 📱 Opening your Mini App in World App

From the [Developer Portal](https://developer.worldcoin.org/), navigate to `Configuration > Basic` and scan the generated QR code.

<img width="350" alt="image" src="https://github.com/user-attachments/assets/278d0f14-5e87-42e3-ba3d-ab7950ef0230" />

The World App will automatically launch your Mini App! 🎉

<img width="350" src="https://github.com/user-attachments/assets/3c07a76e-24fe-4fcd-9003-f16ac046d6e4">

---

## 🔗 Useful Links

- [Worldcoin Documentation](https://docs.world.org/)
- [Developer Portal](https://developer.worldcoin.org/)

---

## 📞 Contact

Questions or feedback? Feel free to reach out!

- **Telegram:** [@miguellalfaro](https://t.me/miguellalfaro)

---

## ℹ️ Notes

This repository is based on the official [minikit-next-template](https://github.com/worldcoin/minikit-next-template). Contributions are welcome—feel free to submit PRs!
