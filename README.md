# StoreForge — E-Commerce SaaS Frontend

A modern, responsive multi-tenant e-commerce SaaS frontend built with **Next.js 15**, **TypeScript**, **Redux Toolkit**, **RTK Query**, **Tailwind CSS**, and **Framer Motion**. Store owners can run their own shops, customers can browse and buy from any store, and platform admins manage packages, subscriptions, and manual payment verification — all from a single unified interface.

## 🔗 Live URLs

| Service | URL |
|---|---|
| 🌐 Frontend (Live) | [https://shakil-storely.luxuryloverpro.com/](https://shakil-storely.luxuryloverpro.com/) |
| ⚙️ Backend API (Live) | [https://shakil-storely-server.luxuryloverpro.com/](https://shakil-storely-server.luxuryloverpro.com/) |

---

## 📚 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Roles & Access](#-roles--access)
- [Routes Overview](#-routes-overview)
- [Payment Flow](#-payment-flow)
- [Multi-Tenancy](#-multi-tenancy)
- [Redux & State Management](#-redux--state-management)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Learn More](#-learn-more)

---

## ✨ Features

### Platform Level (Super Admin Dashboard)
- **Dashboard** — platform-wide stats and activity
- **Package Management** — create, edit, activate/deactivate subscription plans with pricing, duration, and limits
- **Payment Channels** — configure bKash, Nagad, Rocket, and bank accounts for manual subscription payments
- **Manual Payments** — review, verify, or reject store owners' submitted transactions
- **Store Management** — view, activate, suspend, and manage all stores
- **Subscriptions & Billing** — audit trail of every subscription and renewal
- **Store Owner Management** — list, create, edit, and delete store owners
- **Payment Channel Management** — full CRUD with animated modals

### Store Owner Dashboard
- **Store Overview** — KPIs for orders, revenue, and subscription status
- **Category Management** — add, edit, and organize product categories
- **Product Management** — add products with images, price, stock, SKU, and tags
- **Order Management** — view orders, update status (Confirmed → Processing → Shipped → Delivered)
- **Sales Reports** — revenue trends, top products, payment methods, sales by category
- **Store Settings** — update branding, contact info, and social links

### Public / Customer Experience
- **Landing page** with hero slider, featured categories, featured stores, featured products, and new arrivals
- **All stores** page — browse every active store on the platform
- **Individual store page** — `/store/[slug]` — view a store's products
- **Category page** — `/category/[slug]` — browse all products in a category
- **Product detail page** — `/product/[id]` — full gallery, quantity picker, add to cart
- **Cart** — client-side with Zustand + localStorage persistence
- **Checkout** — guest checkout form → SSLCommerz payment
- **Order confirmation** — success, fail, and cancel pages
- **Search** — across products and stores

### UI & UX
- Fully responsive (mobile-first)
- Animated modals, transitions, and micro-interactions using **Framer Motion**
- Rich design system with raw **Tailwind CSS**
- Toast notifications with **react-hot-toast**
- SEO-friendly metadata via `generateDynamicMetadata`
- Dark mode ready

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State Management | Redux Toolkit + RTK Query |
| Cart State | Zustand + localStorage |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Icons | Lucide React, React Icons |
| Notifications | React Hot Toast |
| Auth | JWT (cookies via `shareWithCookies`) |
| Payment | SSLCommerz |

---

## 📁 Project Structure
