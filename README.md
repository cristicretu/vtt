Speech to Text for Medical Doctors

---

Go from recording to a `.docx` in seconds

## Features

- 🎙️ **Audio Recording Upload**: Upload patient consultation recordings
- 🗣️ **Speech-to-Text**: Automatic transcription using OpenAI Whisper (Romanian language support)
- 🤖 **AI Medical Analysis**: Structured medical data extraction using Google Gemini 2.5 Flash
- 📄 **DOCX Generation**: Generate professional Romanian medical documents ("Fișa Pacientului")
- 👥 **Patient Management**: Organize patients and their medical records
- 🔐 **Secure Authentication**: Multi-provider OAuth (Google, GitHub, Email OTP)
- 💳 **Subscription Plans**: Freemium model with Stripe integration

## Setup

### Prerequisites

- Node.js 18+ or Bun
- Convex account (https://convex.dev)
- OpenAI API key (for Whisper transcription)
- Google AI API key (for Gemini)
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vtt
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up environment variables in Convex:
```bash
# Required for transcription
npx convex env set OPENAI_API_KEY "your-openai-api-key"

# Authentication
npx convex env set AUTH_RESEND_KEY "your-resend-api-key"
npx convex env set AUTH_EMAIL "your-email@domain.com"
npx convex env set AUTH_GOOGLE_ID "your-google-oauth-id"
npx convex env set AUTH_GOOGLE_SECRET "your-google-oauth-secret"

# Stripe
npx convex env set STRIPE_SECRET_KEY "your-stripe-secret-key"
npx convex env set STRIPE_WEBHOOK_SECRET "your-stripe-webhook-secret"

# URLs
npx convex env set HOST_URL "http://localhost:5173"
npx convex env set SITE_URL "http://localhost:5173"
```

4. Start the development server:
```bash
npm run dev
# or
bun dev
```

## Workflow

1. **Create Patient**: Add a new patient with their details (name, date of birth, CNP, contact info)
2. **Upload Recording**: Upload an audio recording of the consultation session
3. **Automatic Transcription**: The system automatically transcribes the audio using OpenAI Whisper
4. **AI Analysis**: Google Gemini extracts structured medical data from the transcript
5. **Download DOCX**: Generate and download a professional Romanian medical document

## Tech Stack

- **Frontend**: React 18, TanStack Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Convex (serverless database + functions)
- **AI/ML**:
  - OpenAI Whisper (speech-to-text)
  - Google Gemini 2.5 Flash (medical data extraction)
  - ElevenLabs (voice AI conversation)
- **Payments**: Stripe
- **Authentication**: Convex Auth with multi-provider OAuth
- **Document Generation**: docx library

## Architecture

### Speech-to-Text Pipeline

1. Audio file uploaded to Convex Storage
2. `generateTranscript` action triggered (`/convex/transcript.ts`)
3. Audio sent to OpenAI Whisper API with Romanian language setting
4. Transcript stored in database with status tracking

### Medical Data Extraction

1. Transcript processed by `generateStructuredOutput` action (`/convex/structuredOutput.ts`)
2. Google Gemini extracts structured medical information
3. Output validated against Zod schema (`medicalOutputSchema`)
4. Structured data stored in database

### Document Generation

1. Frontend fetches structured medical data
2. `generateMedicalDocx` utility creates formatted DOCX (`/src/lib/docx-generator.ts`)
3. Document includes all medical sections: diagnosis, complaints, examination, investigations, treatment, recommendations
4. File automatically downloaded with formatted filename

## Database Schema

Key tables:
- `users` - Doctor accounts
- `patients` - Patient records
- `diagnosisDocuments` - Consultation recordings with transcripts and structured output
- `documentTemplates` - Reusable consultation templates
- `plans` & `subscriptions` - Payment plans and subscriptions

## Contributing

This project uses:
- Biome for code formatting and linting
- TypeScript for type safety
- Husky for git hooks

Run checks before committing:
```bash
npm run lint
npm run format
```
