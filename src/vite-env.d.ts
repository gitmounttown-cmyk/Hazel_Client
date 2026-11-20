interface ImportmetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_API_URL: string;
  readonly VITE_UPLOAD_URL: string;
  readonly VITE_RAZORPAY_KEY_ID: string;
  readonly VITE_RAZORPAY_KEY_SECRET: string;
  readonly VITE_RAZORPAY_WEBHOOK_SECRET: string;
  readonly VITE_RAZORPAY_WEBHOOK_URL: string;
  readonly VITE_RAZORPAY_WEBHOOK_SECRET_KEY: string;
}

interface ImportMeta {
  readonly env: ImportmetaEnv;
}

declare module "*.css";