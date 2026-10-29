# ⚡ SyncUp — Modern Multi-Tenant Agile Workspace (Frontend)

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active_Development-success?style=for-the-badge)

**SyncUp Frontend** is a high-performance web client designed for fast-moving agile development teams and multi-tenant organizations. It bridges Jira-grade sprint workflows, real-time collaboration, and enterprise organization management into one seamless, bi-directional (RTL/LTR) experience.

---

## ✨ Features

- 🏢 **Multi-Tenant Control Plane:** Centralized management for organizations, tenant credential provisioning, and role guards (Super Admin, Org Admin, Member).
- 📋 **Agile Sprint & Backlog Engine:** Full sprint lifecycle (Planning, Active, Completed), drag-and-drop Kanban boards, story point estimation, and task categorization (Bugs, Tasks, Issues).
- 🌐 **Bi-directional i18n:** Built-in seamless switching between Arabic (RTL) and English (LTR) with persistent state.
- 💬 **Real-Time Collaboration:** In-workspace team channels and meeting scheduler.
- 🎨 **Dark / Light Mode:** Pixel-perfect ergonomic theme engine.
- 🛡️ **Protected Navigation & Route Guards:** Persistent session handling with role-based routing.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Lucide Icons
- **State Management:** Zustand
- **Real-Time:** Socket.io Client
- **Date Utilities:** date-fns

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/95658/SyncUp-frontend.git
cd SyncUp-frontend
npm install
```

### 2. Configure Environment
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Mobile Companion
Cross-platform companion mobile app built with **Flutter** (in active development).
