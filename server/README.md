# ⚙️ CrypInvest (Backend)

This is the Node.js Express API for the CrypInvest platform. Built with TypeScript and Mongoose, it powers the investor frontend and admin panel.

## 🚀 Getting Started

1.  **Install dependencies**:

    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Create a `.env` file with the following:

    ```env
    PORT=8000
    MONGO_URI=your_mongodb_uri
    ALCHEMY_API_KEY=your_alchemy_key
    HELIUS_API_KEY=your_helius_key
    ```

3.  **Run Dev Server**:

    ```bash
    npm run dev
    ```

4.  **Build**:
    ```bash
    npm run build
    ```

## 🛠 Features

- **API Routing**: Clear, modular routing for auth, users, investments, and more.
- **MongoDB Integration**: Robust data modeling with Mongoose schemas.
- **Blockchain Hooks**: Solana Web3.js integration for wallet verification.
- **Security**: CORS-protected endpoints and environment-based configuration.

For full project documentation, see the [Root README](../README.md).
