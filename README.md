# 🎓 Alumni Connect Hub

<div align="center">

![Alumni Connect Hub](https://img.shields.io/badge/Alumni-Connect%20Hub-6366f1?style=for-the-badge&logo=graduation-cap&logoColor=white)

**A comprehensive alumni networking platform that connects graduates, fosters professional relationships, and builds thriving alumni communities.**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[Live Demo](https://alumni-portal-hazel-tau.vercel.app) • [API Docs](https://alumni-portal-yw7q.onrender.com/docs) • [Report Bug](../../issues) • [Request Feature](../../issues)

</div>

---

## ✨ Features

### 👥 For Alumni

| Feature | Description |
|---------|-------------|
| **📰 Social Feed** | Share updates, achievements, job opportunities, and connect with fellow alumni |
| **🎉 Events** | Discover and register for alumni events, reunions, and networking meetups |
| **👔 Mentorship** | AI-powered mentorship matching based on career goals and expertise |
| **🗺️ AI Career Roadmap** | Get personalized career guidance and development paths |
| **💬 Direct Messaging** | Connect privately with other alumni |
| **📚 Knowledge Base** | AI-powered Q&A system for university-related queries |
| **📄 Document Requests** | Request official documents (transcripts, certificates) |
| **🔔 Notifications** | Stay updated with relevant activities and announcements |
| **🌐 Global Alumni Map** | Visualize the worldwide alumni network with interactive heatmaps |

### 🏛️ For University Admins

| Feature | Description |
|---------|-------------|
| **🎨 Custom Branding** | Configure university colors, logos, and themes |
| **👥 User Management** | Manage alumni accounts, roles, and permissions |
| **📊 Analytics Dashboard** | Track engagement, events, and user activity |
| **📄 Document Processing** | Review and approve document requests |
| **📝 Content Moderation** | Manage posts, events, and user-generated content |

### 🔐 For Super Admins

| Feature | Description |
|---------|-------------|
| **🏢 Multi-University Support** | Manage multiple universities from a single dashboard |
| **📈 Lead Intelligence** | AI-powered insights on alumni engagement and career interests |
| **🎯 Ad Analytics** | Track ad performance and user engagement metrics |
| **⚙️ Platform Settings** | Configure global platform settings and features |

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS + Shadcn/UI components
- **State Management:** TanStack React Query
- **Routing:** React Router v6
- **3D Effects:** Three.js + React Three Fiber
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Maps:** MapLibre GL

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Database:** PostgreSQL 15+
- **ORM:** SQLAlchemy 2.0
- **Migrations:** Alembic
- **Authentication:** JWT (python-jose)
- **File Storage:** AWS S3
- **AI Integration:** OpenAI API

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Neon.tech (Free PostgreSQL cloud hosting)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│                        Vercel                                │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                          │
│                      Render                                  │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
│  │    Auth     │   Events    │    Posts    │  Knowledge  │  │
│  │   Service   │   Service   │   Service   │    Base     │  │
│  └─────────────┴─────────────┴─────────────┴─────────────┘  │
└──────────┬────────────────┬─────────────────────┬───────────┘
           │                │                     │
           ▼                ▼                     ▼
    ┌─────────────┐  ┌─────────────┐      ┌─────────────┐
    │ PostgreSQL  │  │   AWS S3    │      │   OpenAI    │
    │  (Neon.tech)│  │   Storage   │      │     API     │
    └─────────────┘  └─────────────┘      └─────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/bun
- **Python** 3.11+
- **PostgreSQL** 15+ (or use [Neon.tech](https://neon.tech) for free cloud hosting)

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/your-username/Alumni_Connect_Hub.git
cd Alumni_Connect_Hub

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
# or
bun dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Run database migrations
alembic upgrade head

# Seed initial data (optional)
python seed_data.py

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 🔧 Environment Variables

### Frontend (`.env`)

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Backend (`.env`)

```env
# Database
DATABASE_URL=postgresql://user:password@host/database

# Security
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AWS S3 (for media uploads)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your-bucket-name

# OpenAI (optional, for AI features)
OPENAI_API_KEY=your-openai-key

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Auto seed database on startup
AUTO_SEED=true
```

---

## 📁 Project Structure

```
Alumni_Connect_Hub/
├── src/                          # Frontend source
│   ├── components/               # React components
│   │   ├── ui/                   # Shadcn UI components
│   │   ├── admin/                # Admin-specific components
│   │   └── superadmin/           # Super admin components
│   ├── pages/                    # Page components
│   │   ├── admin/                # Admin pages
│   │   └── superadmin/           # Super admin pages
│   ├── lib/                      # Utilities and API client
│   └── hooks/                    # Custom React hooks
│
├── backend/                      # Backend source
│   └── app/
│       ├── api/
│       │   └── routes/           # API endpoints
│       ├── models/               # SQLAlchemy models
│       ├── schemas/              # Pydantic schemas
│       ├── services/             # Business logic
│       └── core/                 # Config and utilities
│
├── public/                       # Static assets
├── dist/                         # Production build
└── alembic/                      # Database migrations
```

---

## 👤 User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Alumni** | Standard user | Personal features, events, posts, connections |
| **University Admin** | University administrator | User management, branding, content moderation |
| **Super Admin** | Platform administrator | Full access, multi-university management, analytics |

---

## 🧪 Testing

### Frontend

```bash
npm run lint        # Run ESLint
npm run build       # Build for production
```

### Backend

```bash
cd backend
pytest                              # Run all tests
pytest --cov=app --cov-report=html  # With coverage report
```

---

## 🚢 Deployment

### Deploy to Vercel (Frontend)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy!

### Deploy to Render (Backend)

1. Connect your repository to Render
2. Create a new Web Service
3. Configure environment variables
4. Use the provided `render.yaml` for automatic configuration

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

---

## 📚 API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI:** `/docs`
- **ReDoc:** `/redoc`
- **OpenAPI JSON:** `/openapi.json`

### Key API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/login` | POST | User authentication |
| `/api/v1/auth/register` | POST | User registration |
| `/api/v1/posts` | GET/POST | Feed posts |
| `/api/v1/events` | GET/POST | Events management |
| `/api/v1/users` | GET | User directory |
| `/api/v1/knowledge-base/chat` | POST | AI-powered Q&A |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Shadcn/UI](https://ui.shadcn.com/) for the beautiful UI components
- [FastAPI](https://fastapi.tiangolo.com/) for the excellent Python framework
- [Neon.tech](https://neon.tech) for free PostgreSQL hosting
- [Vercel](https://vercel.com) & [Render](https://render.com) for hosting

---

<div align="center">

**Made with ❤️ for Alumni Communities**

</div>
