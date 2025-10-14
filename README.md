<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/19cBECm-xMLZKEMz5qTVnppEErYebbik3

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key:
   ```bash
   GEMINI_API_KEY=your_actual_api_key_here
   ```
   **Important:** Replace `PLACEHOLDER_API_KEY` with your actual Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

3. Run the app:
   ```bash
   npm run dev
   ```

## Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. **Set environment variables in Vercel dashboard:**
   - Go to Project Settings → Environment Variables
   - Add `GEMINI_API_KEY` with your actual API key
   - **Important:** Do not use `PLACEHOLDER_API_KEY` in production
4. Deploy

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |

Get your API key from [Google AI Studio](https://aistudio.google.com/apikey)
