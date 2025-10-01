# SeeChain 👁️

**Making VeChain transactions readable for everyone**

SeeChain is an AI-powered web application that translates cryptic VeChain transaction data into plain English explanations. No more hex codes and technical jargon - just clear, human-readable transaction summaries.

## 🎯 Problem Statement

Blockchain transactions are incomprehensible to average users. When you look at a VeChain transaction, you see:
- Cryptic hex data
- Technical function calls
- Unclear gas calculations
- Complex contract interactions

This creates barriers to adoption, trust issues, and debugging nightmares for both users and developers.

## 💡 Solution

SeeChain provides:
- **Plain English explanations** - AI translates what actually happened
- **Key details highlighted** - Amounts, addresses, contract interactions
- **Complete transparency** - Full technical breakdown alongside explanations
- **Educational value** - Learn blockchain by seeing real examples

## ✨ Features

### Core Functionality
- 🔍 **Transaction Analysis** - Paste any VeChain transaction hash for instant analysis
- 🤖 **AI-Powered Explanations** - Mistral AI generates human-friendly summaries
- 🔗 **Network Support** - Works with both VeChain Mainnet and Testnet
- 📊 **Technical Details** - Complete breakdown of gas, addresses, values, and timing

### User Experience
- 📱 **Mobile Responsive** - Clean interface that works on all devices
- ⚡ **Auto-fetch** - Automatically analyzes valid transaction hashes as you type
- 🔗 **VeChainStats Integration** - Direct links to block explorer for deeper analysis
- 🎨 **Clean Design** - Minimal black and white theme for optimal readability

## 🛠️ Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Blockchain**: VeChain Thor REST API
- **AI**: Mistral AI API for transaction explanations
- **Deployment**: Static site (Vercel/Netlify ready)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Mistral AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Intellihackz/seechain.git
   cd seechain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**
   
   Open `src/App.tsx` and replace the placeholder with your Mistral AI key:
   ```typescript
   const MISTRAL_API_KEY = "your-mistral-api-key-here";
   ```
   
   Get your API key from [console.mistral.ai](https://console.mistral.ai/)

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   
   Navigate to `http://localhost:5173`

### Usage

1. **Select Network**: Choose between VeChain Mainnet or Testnet
2. **Enter Transaction Hash**: Paste a VeChain transaction hash (starts with 0x...)
3. **Get Explanation**: The app automatically fetches and explains the transaction
4. **Explore Details**: View both AI explanation and technical breakdown
5. **Learn More**: Click "VeChainStats" to view the transaction in the block explorer

## 📋 Example Transaction Hashes

Try these sample transactions:

**Mainnet:**
- `0xfc99fe103fccbe61b3c042c1da3499b883d1b17fb40160ed1170ad5e63751e07` (VTHO transfer)

**Testnet:**
- Use any valid testnet transaction hash

## 🏗️ Project Structure

```
seechain/
├── src/
│   ├── App.tsx          # Main application component
│   ├── App.css          # Custom styles
│   ├── index.css        # Global styles with Tailwind
│   ├── main.tsx         # Application entry point
│   └── assets/          # Logo and static assets
├── public/              # Static files
├── README.md           # Project documentation
├── package.json        # Dependencies and scripts
├── tailwind.config.js  # Tailwind configuration
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## 🎯 Key Components

### Transaction Fetching
- Uses VeChain Thor REST API directly (no SDK dependencies)
- Supports both mainnet (`https://mainnet.vechain.org`) and testnet
- Fetches transaction details and receipts simultaneously
- Handles errors gracefully with user-friendly messages

### AI Integration
- Sends complete transaction and receipt data to Mistral AI
- Uses carefully crafted prompts for accurate explanations
- Includes fallback explanations if AI is unavailable
- Formats responses with markdown support

### UI/UX Features
- Responsive design with mobile-first approach
- Auto-debounced input for smooth user experience
- Loading states and error handling
- Clean, accessible interface

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory, ready for deployment to any static hosting service.

## 🌟 Future Roadmap

- [ ] **Batch Analysis** - Explain multiple transactions at once
- [ ] **Wallet Integration** - Connect VeWorld wallet for personal transaction history
- [ ] **Browser Extension** - Explain transactions directly on block explorers
- [ ] **Educational Library** - "Transaction of the Day" learning content
- [ ] **Multi-chain Support** - Expand beyond VeChain
- [ ] **Advanced Analytics** - Transaction patterns and insights

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **VeChain Foundation** for the robust blockchain infrastructure
- **Mistral AI** for powerful language model capabilities
- **React Team** for the excellent development framework
- **Tailwind CSS** for the utility-first styling approach

---

**SeeChain** - Making blockchain transparent, one transaction at a time. 👁️
