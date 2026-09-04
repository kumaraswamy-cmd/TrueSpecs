# TrueSpecs 📱⚡

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**The Ultimate Next-Generation Smartphone Discovery, Comparison & Specification Platform**

[Explore Features](#-key-features) • [Getting Started](#-getting-started) • [Tech Stack](#-tech-stack) • [Project Structure](#-project-structure) • [Admin Portal](#-admin-portal)

</div>

---

## 🌟 Overview

**TrueSpecs** is a high-performance web application designed for smartphone enthusiasts, buyers, and reviewers. It offers in-depth device specifications, a side-by-side comparison engine, proprietary **SpecsScore™** ratings, interactive camera sample galleries, and an administrative suite for managing phone catalogs and affiliate redirects.

Built on the latest **Next.js 16 (Turbopack)**, **React 19**, and **Tailwind CSS v4**, TrueSpecs delivers an ultra-fast, visually stunning, glassmorphism-inspired user interface with full dark/light theme support.

---

## ✨ Key Features

### 🔍 1. Smart Discovery & Filtering
- **Multi-Factor Filtering**: Filter devices seamlessly by Brand, Price Range, RAM, Storage, Screen Size, Battery Capacity, 5G support, and Refresh Rate.
- **Instant Search**: Real-time debounced search across device models, chipsets, and brands.
- **Sorting Options**: Sort by SpecsScore, Price (Low to High / High to Low), Release Date, and Popularity.

### ⚖️ 2. Deep Side-by-Side Comparison Engine
- **Multi-Device Matrix**: Compare up to 4 smartphones simultaneously.
- **Difference Highlighting**: Quickly highlight winning specs and key divergences in display, camera sensors, processors, and battery life.
- **Persistent Compare Tray**: Add devices to compare from any page with a floating bottom tray.

### 📊 3. Proprietary SpecsScore™ System
- **Comprehensive Benchmarks**: Visual score dials and radar breakdowns evaluating:
  - 🚀 **Performance** (CPU, GPU, RAM, Thermal management)
  - 📸 **Camera** (Main sensor, Ultrawide, Telephoto, Video capabilities)
  - 🖥️ **Display** (OLED/AMOLED, Refresh Rate, Peak Brightness, Resolution)
  - 🔋 **Battery & Charging** (Capacity, Fast Charging, Wireless Charging)
  - 💎 **Value for Money** (Feature-to-price ratio)

### 🎨 4. Rich Media & Bento Grid Layouts
- **Interactive Image Galleries**: High-resolution device showcases with colorway pickers.
- **Camera Sample Showcases**: Real-world photo test samples categorized by Daylight, Night Mode, Portrait, and Macro.
- **Bento Grid Highlights**: Modular visual presentation of key selling points.

### 💾 5. User Wishlist / Saved Phones
- Save favorite smartphones for quick access.
- LocalStorage state persistence across browsing sessions.

### 🔐 6. Administrative Dashboard
- **Catalog Management**: Add, update, or remove smartphone specifications with a robust multi-tab form.
- **Affiliate Link Redirection**: Built-in redirect tracker (`/go/[slug]`) for monetization links.
- **Authentication**: Protected admin portal for content management.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16.2](https://nextjs.org/) (App Router & Turbopack) |
| **UI Library** | [React 19.2](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) & Custom Modern CSS Tokens |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Fonts** | Google Fonts ([Outfit](https://fonts.google.com/specimen/Outfit), [Inter](https://fonts.google.com/specimen/Inter)) |

---

## 📁 Project Structure

```text
TrueSpecs/
├── public/                 # Static assets, icons, and phone sample images
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── admin/          # Admin Dashboard & Phone Management
│   │   ├── compare/        # Smartphone Comparison Engine
│   │   ├── go/             # Affiliate link redirect handlers
│   │   ├── phones/         # Phone list & dynamic detail routes ([slug])
│   │   ├── saved/          # Saved / Wishlist page
│   │   ├── layout.tsx      # Root layout & providers
│   │   ├── page.tsx        # Homepage (Hero, Featured, Top Rated, Bento)
│   │   └── globals.css     # Design tokens, theme variables, glassmorphism
│   ├── components/         # Reusable UI components
│   │   ├── BentoGrid.tsx
│   │   ├── CameraGallery.tsx
│   │   ├── CompareTray.tsx
│   │   ├── FilterSidebar.tsx
│   │   ├── Navbar.tsx
│   │   ├── PhoneCard.tsx
│   │   ├── PhoneForm.tsx
│   │   ├── SpecsScoreDial.tsx
│   │   ├── SpecsTable.tsx
│   │   └── ThemeToggle.tsx
│   ├── context/            # Context providers (Theme, Compare, Saved)
│   ├── data/               # Seed dataset (phones.json)
│   ├── types/              # TypeScript interfaces (Phone, Specs, Filter)
│   └── utils/              # Scoring algorithms, formatters & helpers
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.18+` or `v20+` (Node 20+ recommended)
- **Package Manager**: `npm`, `yarn`, `pnpm`, or `bun`

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/kumaraswamy-cmd/TrueSpecs.git
   cd TrueSpecs
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the app.

---

## ⚙️ Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with Turbopack |
| `npm run build` | Builds the optimized production application |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint to check for code quality and syntax errors |

---

## 🛡️ Admin Portal

To access the administrative panel:
1. Navigate to `/admin` in your browser.
2. Enter the administrator credentials to manage phone specifications, add new models, or configure affiliate links.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  Crafted with ❤️ by <a href="https://github.com/kumaraswamy-cmd">Kumaraswamy</a>
</div>
