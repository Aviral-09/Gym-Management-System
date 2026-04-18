# 🏋️‍♂️ IronForge: Premium Gym Management Ecosystem

![IronForge Banner](https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop)

**IronForge** is a premium SaaS platform engineered for gym owners to build, manage, and scale their fitness legacy. It bridges modern aesthetics with a high-powered Firebase infrastructure to automate member data, construct subscription plans, and deploy public-facing template websites securely.

---

## ✨ Core Experience

### 1. Ironclad Onboarding Sequence
Designed as a strict state-machine flow ensuring zero data loss during the authentication lifecycle:
- **Aesthetic Selection**: Users choose a branded theme (Modern, Classic, Industrial) from the marketplace.
- **Data Persistence**: Selection is cached in `localStorage` and `location.state`, ensuring the `templateId` survives OAuth redirects.
- **Atomic Provisioning**: A `writeBatch` atomically creates the `franchise`, `branch`, and `user` profile in a single transaction.

### 2. Specialized Routing & Management
- **Intelligent Dashboard**: Clean `/dashboard` routes that derive context from an authenticated state container (`FranchiseProvider`).
- **Persistence Guards**: Proprietary `ProtectedRoute` logic prevents unonboarded users from accessing management features until a valid `franchiseId` is detected.
- **Real-time Synchronization**: Leveraging `onSnapshot` for instant updates across member rosters, plan configurations, and trainer schedules.

### 3. Dynamic Public Site Engine
- **Thematic Rendering**: Dynamic rendering at `/site/:franchiseId` using the gym's specific design tokens (colors, typography, layout).
- **Public Data Access**: Optimized security rules allow visitors to view plans and public info while keeping administrative data siloed.

---

## 🛠 Technical Architecture

### Frontend Engineering
- **Framework**: React 19 (using the latest concurrent features)
- **Tooling**: Vite for ultra-fast development and optimized production builds.
- **State Management**: 
  - **Derived State Patterns**: Intelligent synchronization of active branches and franchises without redundant `useEffect` triggers.
  - **Deferred State Updates**: Strategic use of timeouts for UI state resets to prevent cascading React renders.
- **Styling**: Tailwind CSS for utility-first design + Framer Motion for high-end micro-animations.

### Backend & DevOps
- **Database**: Cloud Firestore (NoSQL Document Modeling)
- **Auth**: Firebase Authentication (Google OAuth & Email/Password)
- **Security**: Granular Firestore Security Rules enforcing UID isolation and franchise-level read/write permissions.
- **Functions**: Server-side logic for complex provisioning and management tasks.

---

## 🚀 Development Setup

### Prerequisites
- Node.js (v20.x recommended)
- Firebase Account with project initialized

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/ironforge.git
   cd ironforge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Initialize Database (Optional):**
   ```bash
   node scripts/seed.js
   ```

5. **Run Development Server:**
   ```bash
   npm run dev
   ```

---

## 🔒 Security Standards

The platform implements **"Query-Rule Alignment"** (QRA):
- **Constraint-First Fetching**: Every query is strictly scoped by `franchiseId` to align with backend security rules.
- **Access Control**: UID-based pinning ensures users only interact with their own data.
- **Layered Validation**: Schema validation at both the application level (TypeScript) and the database level (Security Rules).

---

## 📄 License

Licensed under the MIT License. Built for fitness entrepreneurs who value speed, design, and absolute data integrity.
