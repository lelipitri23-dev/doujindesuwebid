'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

export default function CaptchaWrapper({ children }) {
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      {children}
    </GoogleReCaptchaProvider>
  );
}
