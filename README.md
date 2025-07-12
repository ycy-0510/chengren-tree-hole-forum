# Tree Hole Forum (成仁樹洞)

> **⚠️ DISCLAIMER**: This is a demonstration project for portfolio purposes only. All content, users, and posts are fictional and for display purposes. This is not a real forum platform.

A modern, anonymous forum platform built with Vue.js and TypeScript, showcasing a complete frontend application with simulated backend data. This project demonstrates a safe space concept where users can share thoughts, seek advice, and connect with others anonymously.

## 🌟 Features

- **Complete Anonymity**: Users can post and interact without revealing their identity (simulated)
- **Multiple Boards**: Organized discussion boards for different topics (Academic, Food, Life, etc.)
- **AI Chat Integration**: Built-in AI assistant for user support (demo feature)
- **Responsive Design**: Optimized for both desktop and mobile devices
- **User Profiles**: Optional profile system for those who want to maintain consistency
- **Real-time Updates**: Live content updates for better user experience (simulated)
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **Security**: Built-in CAPTCHA protection and content moderation (demo features)
- **Mock Data**: Realistic forum content using JSON data files for demonstration

## 🛠️ Tech Stack

- **Frontend**: Vue.js 3 + TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Font Awesome
- **Build Tool**: Vite
- **Router**: Vue Router
- **Data**: Static JSON files (simulating backend API)
- **Deployment**: Netlify/Vercel ready

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ycy-0510/chengren-tree-hole-forum.git
cd chengren-tree-hole-forum
```

2. Install dependencies:
```bash
yarn
```

3. Start the development server:
```bash
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

> **Note**: The application uses static JSON files located in `public/data/` to simulate backend functionality. All user interactions and data are for demonstration purposes only.

### Building for Production

```bash
yarn build
```

## 📱 Available Pages

- **Home**: Welcome page with forum statistics and overview (demo data)
- **Board View**: Category-specific discussion boards with mock posts
- **Profile**: User profile management (demonstration only)
- **Login**: User authentication system (simulation for demo purposes)

## 🏗️ Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── AiChat.vue      # AI chat assistant (demo)
│   ├── Header.vue      # Navigation header
│   ├── Footer.vue      # Site footer
│   ├── Post.vue        # Individual post component
│   └── ...
├── views/              # Page components
│   ├── HomeView.vue    # Home page
│   ├── BoardView.vue   # Board listing page
│   ├── LoginView.vue   # Login page
│   └── ProfileView.vue # User profile page
├── router/             # Vue Router configuration
├── data/               # Type definitions and data utilities
└── style.css          # Global styles
public/
└── data/               # Mock data files
    ├── post.json       # Sample forum posts
    ├── user.json       # Sample user data
    └── board.json      # Forum categories
```

## 🎨 Design Philosophy

The Tree Hole Forum embraces the concept of a "tree hole" - a safe, anonymous space where people can share their thoughts without judgment. This demonstration project focuses on:

- **Safety First**: Anonymous posting concept to encourage honest sharing
- **Community**: Fostering supportive interactions between users (simulated)
- **Accessibility**: Clean, readable interface for all users
- **Privacy**: Protecting user data and maintaining anonymity (conceptual demonstration)
- **Modern Frontend**: Showcasing Vue.js 3 best practices and component architecture

## 🔧 Configuration

The project uses several configuration files:

- `vite.config.ts`: Vite build configuration
- `tailwind.config.ts`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `netlify.toml`/`vercel.json`: Deployment configuration

## 🌐 Deployment

This project is configured for deployment on:

- **Netlify**: Configuration available in `netlify.toml`
- **Vercel**: Configuration available in `vercel.json`

## 🤝 Contributing

This is a demonstration project, but contributions are welcome for educational purposes:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Roadmap

- [x] Make AI agent hyperlinks clickable
- [x] Hide private info in user profiles (visible only to user and admin)
- [x] Make avatar on posts clickable to user profile
- [ ] Add more realistic mock data
- [ ] Implement dark mode theme
- [ ] Add mobile-specific optimizations

## 📧 Contact

This is a portfolio project created for demonstration purposes. If you have any questions or suggestions, please feel free to reach out through the repository's issues page.

---

Made with ❤️ for educational and demonstration purposes