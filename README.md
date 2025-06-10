# Job Portal Web Application

A modern job portal built with Next.js and Supabase. Companies can post jobs and manage applicants. Applicants can apply with a resume and cover letter, which are analyzed and scored using an integrated AI microservice.

## Technologies Used

- Next.js (React framework)
- Tailwind CSS (UI styling)
- Supabase (Database, Auth, Storage)
- FastAPI microservice for resume/job analysis
- Google Gemini API (AI scoring and summaries)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Sseankzs/openprofile
cd openprofile
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

You can get these keys from your Supabase project dashboard. Or you may contact sseankong52@gmail.com for the supabase url and key to the existing prototype database

### 4. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Resume & Job Scoring Microservice

This app integrates with a separate Python microservice that analyzes resumes, cover letters, and job descriptions using the Google Gemini API.

### Microservice Repository

Clone the analyzer from:

```
https://github.com/Sseankzs/ApplicantAnalyzer
```

### 1. Install Python Dependencies

```bash
pip install fastapi uvicorn python-multipart pdfplumber google-generativeai python-dotenv
```

### 2. Set Up Environment Variables

Create a `.env` file in the root of the microservice project and add your Google API key:

```env
GOOGLE_API_KEY=your-google-gemini-api-key
```

### 3. Start the API Server

```bash
uvicorn gemini_applicant_analyzer:app --reload --port 8000
```

The service will be available at [http://localhost:8000](http://localhost:8000).

### 4. Optional: Test the API with curl

```bash
curl -X POST http://localhost:8000/analyze_candidate \
  -F "resume=@sample_resume.pdf" \
  -F "cover_letter=@sample_cover_letter.pdf" \
  -F "job_description=$(cat sample_job_description_1.txt)$"
```

---

## Notes

- Make sure the microservice is running locally before testing applications in the frontend.
- Authentication is handled by Supabase; users select their role (Applicant or Company) during signup.
- Files like resumes and profile images are stored using Supabase Storage.

---

## License

MIT License
