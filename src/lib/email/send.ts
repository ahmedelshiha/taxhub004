interface SendEmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  console.log('Sending email:', options)
  // Stub implementation
  return Promise.resolve()
}
