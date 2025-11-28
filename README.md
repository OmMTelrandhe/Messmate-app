# MessMate 🍴

**MessMate** helps students and mess/tiffin owners connect, find, and review local messes. Discover the best tiffin services nearby, compare prices, and share your experiences!

---

## 🚀 Features

- 🔍 **Search & Filter:** Find messes by name, address, rating, or price.
- ⭐ **Reviews:** Read and write reviews for each mess.
- 🏷️ **Pricing:** Compare one-time, two-time, and monthly rates.
- 🗺️ **Google Maps Integration:** Get directions to messes.
- 👤 **Authentication:** Login with Google to add messes or reviews.
- 🏠 **Owner Mode:** Mess owners can add their own listings.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Tailwind CSS
- **Backend:** Firebase (Firestore, Auth)
- **Icons:** Heroicons
- **Tooling:** Vite, TypeScript

---

## 📦 Project Structure

```
messmate/
├── components/           # React UI components
├── modals/               # Modal dialogs (login, add mess, details)
├── firebase.ts           # Firebase config & exports
├── types.ts              # TypeScript types/interfaces
├── App.tsx               # Main app logic
├── index.tsx             # Entry point
├── index.html            # HTML template
├── index.css             # Global styles
├── .env.local            # API keys (not committed)
└── ...
```

---

## ⚡ Getting Started

### 1. **Clone the repository**

```bash
git clone https://github.com/OmMTelrandhe/Messmate
```

### 2. **Install dependencies**

```bash
npm install
```

### 3. **Configure Firebase**

- Go to [Firebase Console](https://console.firebase.google.com/), create a project, and add a web app.
- Copy your Firebase config and replace the placeholder in `firebase.ts`.

### 4. **Set up Gemini API Key (if needed)**

- Add your Gemini API key to `.env.local`:
  ```
  GEMINI_API_KEY=your_key_here
  ```

### 5. **Run the app locally**

```bash
npm run dev
```

- Visit [http://localhost:5173](http://localhost:5173) (or as shown in your terminal).

---

## 🏗️ Build & Deploy

### **Build for production**

```bash
npm run build
```

### **Preview production build**

```bash
npm run preview
```

### **Deploy**

- You can deploy the `dist/` folder to any static hosting (Vercel, Netlify, Firebase Hosting, etc.).

---

## 🔑 Environment Variables

- `.env.local` (not committed):
  ```
  GEMINI_API_KEY=your_gemini_api_key
  ```

---

## 📚 Useful Links

- [Firebase Docs](https://firebase.google.com/docs)
- [React Docs](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Heroicons](https://heroicons.com/)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 👨‍💻 Author

- [Om Telrandhe](https://github.com/OmMTelrandhe)

---

## 🌟 Show your support

Give a ⭐️ if you like this project!
