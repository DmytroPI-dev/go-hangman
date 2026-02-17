# 🎮 Hangman Game

A modern, multilingual Hangman game built with Go, React, and Firebase. Features responsive design, multiple difficulty levels, and support for English, Ukrainian, and Polish languages.

![Hangman Game](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Features

* 🌍 **Multilingual Support**: English, Ukrainian, and Polish
* 🎯 **Three Difficulty Levels**: Easy, Normal, and Hard
* 💡 **Hint System**: Get contextual clues for words
* 🔤 **Letter Reveal**: Open letters strategically (difficulty-based)
* ⌨️ **Keyboard Support**: Play with physical keyboard or on-screen buttons
* 📱 **Fully Responsive**: Optimized for mobile and desktop
* 🎨 **Beautiful UI**: Built with Chakra UI
* ☁️ **Cloud-Native**: Deployed on Firebase Hosting and Google Cloud Run

---

## 🚀 Game webpage

Try the game live: [https://hgame.i-dmytro.org](https://hgame.i-dmytro.org)
---

## 🏗️ Architecture

### **Tech Stack**

**Frontend:**
* React >= 19.0 with TypeScript
* Vite (build tool)
* Chakra UI 2.x (component library)
* react-i18next (internationalization)
* Deployed on Firebase Hosting

**Backend:**
* Go 1.25
* GIN (Go web framework)
* Deployed on Google Cloud Run

**Database:**
* Firebase Firestore (NoSQL database)

---

## 📁 Project Structure

```
go-hangman/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── i18n/              # Internationalization configuration
│   │   ├── locales/           # i18n translations
│   │   │   ├── en/            # English translations
│   │   │   ├── ua/            # Ukrainian translations
│   │   │   └── pl/            # Polish translations
│   │   ├── types/             # TypeScript type definitions
│   │   ├── services/          # Frontend API services
│   │   ├── theme/             # Custom theme configuration
│   │   ├── main.ts            # Application entry point
│   │   └── App.tsx            # Main application component
│   ├── dist/                  # Production build output
│   ├── firebase.json          # Firebase Hosting configuration
│   └── package.json           # Project dependencies
│
├── backend/                   # Go backend application
│   ├── handlers/              # HTTP request handlers
│   ├── game/                  # Game logic
│   ├── session/               # Session management
│   ├── utils/                 # Utility functions and helpers
│   │    ├── db_connection/    # Database connection checker
│   │    └── seeder/           # Database seeding scripts
│   │    
│   ├── database.example.json  # Example database structure
│   ├── Dockerfile             # Dockerfile for backend application
│   ├── go.mod                 # Go module configuration
│   ├── go.sum                 # Go module checksum file
│   └── main.go                # Application entry point
│
├── .github/
│   └── workflows/
│       └── deploy.yaml        # CI/CD pipeline configuration
│
└── README.md
```

---

## 🛠️ Local Development

### **Prerequisites**

* Node.js 22.20.0 or higher
* Go 1.25 or higher
* Firebase CLI (`npm install -g firebase-tools`)
* Docker (optional, for containerized development)

### **1. Clone the Repository**

```bash
git clone https://github.com/dmytropi-dev/go-hangman.git
cd go-hangman
```

### **2. Set Up Firebase**

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Download service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `backend/serviceAccountKey.json` IMPORTANT: Keep this file secure and do not commit it to version control!
4. Initialize Firebase in frontend:

```bash
cd frontend
firebase login
firebase init hosting
# Select your Firebase project
# Set public directory to: dist
# Configure as single-page app: Yes
```

### **3. Populate Database**

Use the example database structure (see [database.example.json](backend/database.example.json )) to create collections for each language (`en`, `ua`, `pl`) and add word documents with the required fields.:

```bash
# Import words to Firestore
# You can use Firebase Console or upload via script
```

### **4. Set Up Backend**

```bash
cd backend

# Install dependencies
go mod download
go mod tidy

# Run backend
go run main.go
```

Backend will be available at `http://localhost:8080`

### **5. Set Up Frontend**

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8080" > .env

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## 🎮 Game Rules

### **Difficulty Levels**

| Difficulty | Attempts | Hints | Open Letters |
|------------|----------|-------|--------------|
| **Easy**   | 7        | ✅    | 2            |
| **Normal** | 5        | ✅    | 1            |
| **Hard**   | 3        | ✅    | 0            |

### **How to Play**

1. Select your preferred language and difficulty
2. Click letters on the keyboard or type on your physical keyboard
3. Use hint to get clue about the word
4. On Easy/Normal, you can reveal letters (costs 1 attempt each)
5. Guess the word before running out of attempts!

---

## 🗃️ Database Structure

See `database.example.json` for the complete structure. Each language has its own collection with words containing:

* **word**: The word to guess
* **hint**: A clue about the word

Example:

```json
{
  "word": "elephant",
  "hint": "A large mammal with a trunk",    
}
```

---

## 🚀 Deployment

### **Automated Deployment (CI/CD)**

The project uses GitHub Actions for automated deployment:

1. **On PR merge to `main`**:
   - Frontend → Firebase Hosting
   - Backend → Google Cloud Run

2. **Required GitHub Secrets**:
   - `FIREBASE_SERVICE_ACCOUNT` : Firebase service account key
   - `GCP_SA_KEY` : Google Cloud service account key
   - `BACKEND_URL` : Backend URL for frontend configuration
   - `GCP_PROJECT_ID` : Your GCP project ID
   - `DOCKERHUB_USERNAME` : Docker Hub username
   - `DOCKERHUB_PASSWORD` : Docker Hub access password
   - `GITHUB_TOKEN` : GitHub token for actions (automatically provided)


### **Manual Deployment**

**Frontend:**

```bash
cd frontend
npm run build
firebase deploy --only hosting
```

**Backend:**

```bash
cd backend
gcloud run deploy hangman-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 🌍 Internationalization

The game supports three languages with full UI translation:

* **English** (`en`)
* **Ukrainian** (`ua`)
* **Polish** (`pl`)

### **Adding a New Language**

1. Create translation file: `frontend/src/locales/[lang]/translation.json`
2. Add language to `frontend/src/i18n/config.ts`
3. Add words to Firestore: `data/[lang]/` collection
4. Update language selector in `GameSetup.tsx`

---

## 📝 Environment Variables

### **Frontend**

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-backend.run.app` |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Dmytro Pishchenkov**

* GitHub: [@DmytroPI-dev](https://github.com/DmytroPI-dev)

---

## 🙏 Acknowledgments

* Chakra UI for the beautiful component library
* Firebase for hosting and database
* Google Cloud Platform for serverless backend
* The Open Source community

---

## 📞 Support

If you have any questions or issues, please open an issue on GitHub.

---

**Happy Gaming! 🎮🎉**
