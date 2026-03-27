const verificationCodeEmailTemplate = (title: string, name: string | undefined, text: string, code: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          .container {
            font-family: system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji;
            max-width: 600px;
            margin: 0 auto;
            padding: 1.5rem;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            color: #111827;
          }
          .title {
            font-size: 1.5rem;
            margin-top: 0;
          }
          p {
            font-size: 1rem;
            line-height: 1.5;
          }
          .text {
            color: #374151;
          }
          .code-container {
            background-color: #f3f4f6;
            padding: 1.25rem;
            text-align: center;
            border-radius: 8px;
            margin: 1.5rem 0;
          }
          .code {
            font-size: 2rem;
            font-weight: bold;
            letter-spacing: 0.375rem;
          }
          .expiry-text {
            font-size: 0.875rem;
            color: #4b5563;
          }
          .divider {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 1.25rem 0;
          }
          .footer-text {
            font-size: 0.75rem;
            color: #6b7280;
            margin-bottom: 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="title">${title}</h2>
          <p>Hello${name ? ` <strong>${name}</strong>` : ''},</p>
          <p class="text">${text}</p>
          <div class="code-container">
            <span class="code">${code}</span>
          </div>
          <p class="expiry-text">This code will expire in <strong>15 minutes</strong>.</p>
          <hr class="divider" />
          <p class="footer-text">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
  `;
};

export default verificationCodeEmailTemplate;
