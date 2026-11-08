# ExamVault-USM

A modern, community-driven past-year examination paper repository built for Computer Science undergraduates. ExamVault simplifies revision by providing a centralized, developer-friendly interface to search, filter, and access exam papers and marking schemes.

> ### ⚠️ Institutional Legal Disclaimer
>
> **Important Notice:** To respect intellectual property rights and comply with institutional academic regulations, **no actual, proprietary university examination papers or official marking schemes are currently hosted or distributed on this platform.**
>
> All documents currently present are mock/sample placeholder files used strictly for technical demonstration, development, and portfolio purposes. Live publication of curriculum papers will remain suspended pending formal review and written approval from the University Legal Department and respective academic boards.

## ✨ Features

* **Instant Search:** Real-time search across course codes (`CPT111`, `CPT212`, etc.), subject titles, and exam categories.

* **Dynamic Multi-Filtering:** Filter by Academic Year, Exam Type (Final Exam, Midterm, Quiz), and Semester with values queried dynamically from the database.

* **Direct PDF Previews:** View papers and attached solution schemes directly in a browser tab without intrusive downloads.

* **Community Contribution Portal:** Streamlined upload modal with automated pre-flight duplicate validation to prevent redundant submissions.

* **Developer-Focused UI:** Responsive, minimalist interface supporting both Dark and Light modes with quick keyboard shortcuts (`⌘ K` / `Ctrl + K`).

## 🛠️ Tech Stack

* **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)

* **Build Tool:** [Vite](https://vitejs.dev/)

* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)

* **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL + Row-Level Security)

* **Object Storage:** Supabase Storage (Public PDF bucket)

* **Deployment:** [Vercel](https://vercel.com/)

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or later recommended)

* A [Supabase](https://supabase.com/) project with configured tables and storage bucket

### Installation

1. **Clone the repository:**

   ```
   git clone https://github.com/Aresiususes/ExamVault-USM.git
   cd ExamVault-USM
   
   ```

2. **Install dependencies:**

   ```
   npm install
   
   ```

3. **Configure environment variables:**
   Create a `.env` file in the project root:

   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   
   ```

   *(Ensure there is no trailing slash on `VITE_SUPABASE_URL`)*

4. **Run the local development server:**

   ```
   npm run dev
   
   ```

   Open `http://localhost:5173` in your browser.

## 🗄️ Database Architecture

The application is backed by PostgreSQL with three relational tables and an optimized display view:

* `courses`: Curriculum subject directory (`code`, `name`, `semester`).

* `academic_years`: Catalog of indexed academic sessions (`year_label`).

* `papers`: Uploaded document metadata, storage links, and solution flags.

  * Enforces `UNIQUE(course_id, academic_year_id, exam_type, semester)` to prevent duplicate uploads.

* `view_papers_display`: Flattened SQL view joining courses and years for client queries.

## 🔒 Security

All client interactions are authenticated via Supabase's public `anon` key and strictly governed by PostgreSQL **Row-Level Security (RLS)** policies:

* Read access (`SELECT`) is publicly accessible for courses, sessions, and papers.

* Write access (`INSERT`) is validated against storage bucket constraints and database table rules.

## 📄 License

This project is open-source under the [MIT License](LICENSE).
