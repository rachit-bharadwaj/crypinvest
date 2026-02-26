# 🏦 CrypInvest

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.9-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Solana](https://img.shields.io/badge/Solana-Web3.js-14F195?style=for-the-badge&logo=solana)](https://solana.com/)

**CrypInvest** is a premium, high-performance cryptocurrency investment platform. Built with a modern tech stack centered around Next.js 15, Solana, and Express, it provides users with a seamless experience for managing crypto portfolios, exploring investment pools, and tracking earnings through a stunning, animated dashboard.

---

## 🚀 Key Features

- **🔐 Secure Authentication**: Multi-layered auth system including Wallet Connection (Solana) and traditional methods.
- **📊 Advanced Dashboards**: Real-time data visualization using Chart.js, Recharts, and Highcharts.
- **📁 Investment Pools**: Diverse investment categories and pools managed via a dedicated admin panel.
- **📈 Portfolio Tracking**: Detailed insights into currency composition, stats, and investment performance.
- **🧬 Referral System**: Built-in referral mechanisms to incentivize platform growth.
- **💸 Seamless Withdrawals**: Streamlined withdrawal request process for users.
- **🛠 Comprehensive Admin Panel**: Full control over users, investments, categories, and withdrawals.
- **🎨 Premium UI/UX**: Cinematic animations with Framer Motion and 3D elements using Three.js (React Three Fiber).

---

## 🛠 Tech Stack

### Frontend (Client & Admin)

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Components**: [Radix UI](https://www.radix-ui.com/), [Sonner](https://sonner.emilkowal.ski/)
- **Animations**: [Motion (formerly Framer Motion)](https://motion.dev/), [Three.js](https://threejs.org/)
- **State/Data**: [Solana Wallet Adapter](https://solana.com/developers/wallets), [Axios](https://axios-http.com/)
- **Charts**: [Chart.js](https://www.chartjs.org/), [Recharts](https://recharts.org/), [Highcharts](https://www.highcharts.com/)

### Backend (Server)

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Blockchain**: [@solana/web3.js](https://solana-labs.github.io/solana-web3.js/), BS58, TweetNaCl

---

## 📂 Project Structure

```text
crypinvest/
├── client/           # Next.js frontend for investors
│   ├── app/          # App Router (Dashboard, Plans, Withdrawals, etc.)
│   ├── components/   # UI & Dashboard components
│   └── contexts/     # Wallet & Auth contexts
├── server/           # Express backend API
│   ├── controllers/  # Business logic
│   ├── models/       # Mongoose schemas
│   └── routes/       # API endpoints
├── admin/            # Next.js internal management dashboard
│   ├── app/          # Admin routes (Users, Pools, Withdrawals)
│   └── components/   # Admin-specific UI components
└── README.md         # Documentation
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)
- Solana Wallet (e.g., Phantom)

### Installation

1.  **Clone the Repository**:

    ```bash
    git clone <repository-url>
    cd crypinvest
    ```

2.  **Setup the Server**:

    ```bash
    cd server
    npm install
    # Create .env and add MONGO_URI, PORT, etc.
    npm run dev
    ```

3.  **Setup the Client**:

    ```bash
    cd ../client
    npm install
    # Create .env and add NEXT_PUBLIC_SERVER_URL, etc.
    npm run dev
    ```

4.  **Setup the Admin Panel**:
    ```bash
    cd ../admin
    npm install
    # Create .env and add NEXT_PUBLIC_SERVER_URL
    npm run dev
    ```

---

## 🔑 Environment Variables

### Server (`/server/.env`)

```env
PORT=8000
MONGO_URI=your_mongodb_uri
ALCHEMY_API_KEY=your_alchemy_key
HELIUS_API_KEY=your_helius_key
```

### Client (`/client/.env`)

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:8000
NEXT_PUBLIC_PUBLIC_KEY=your_imagekit_public_key
NEXT_PUBLIC_URL_ENDPOINT=your_imagekit_endpoint
PRIVATE_KEY=your_imagekit_private_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id
```

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Rachit Bharadwaj**

- [GitHub](https://github.com/rachit-bharadwaj)
- [LinkedIn](https://linkedin.com/in/rachit-bharadwaj)

---

_Created with ❤️ for the future of decentralized finance._
