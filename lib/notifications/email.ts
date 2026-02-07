// Email service using Postmark (primary) or SendGrid (fallback)

export interface EmailPayload {
  to: string[]
  subject: string
  html: string
  text?: string
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  // Try Postmark first
  if (process.env.POSTMARK_API_KEY) {
    return sendPostmarkEmail(payload)
  }
  
  // Fallback to SendGrid
  if (process.env.SENDGRID_API_KEY) {
    return sendSendGridEmail(payload)
  }
  
  console.error('No email service configured')
  return false
}

async function sendPostmarkEmail(payload: EmailPayload): Promise<boolean> {
  try {
    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': process.env.POSTMARK_API_KEY!,
      },
      body: JSON.stringify({
        From: process.env.POSTMARK_FROM_EMAIL,
        To: payload.to.join(', '),
        Subject: payload.subject,
        HtmlBody: payload.html,
        TextBody: payload.text,
        MessageStream: 'outbound',
      }),
    })

    if (!response.ok) {
      throw new Error(`Postmark API error: ${response.statusText}`)
    }

    return true
  } catch (error) {
    console.error('Failed to send email via Postmark:', error)
    return false
  }
}

async function sendSendGridEmail(payload: EmailPayload): Promise<boolean> {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: payload.to.map(email => ({ email })),
            subject: payload.subject,
          },
        ],
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
        },
        content: [
          {
            type: 'text/html',
            value: payload.html,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.statusText}`)
    }

    return true
  } catch (error) {
    console.error('Failed to send email via SendGrid:', error)
    return false
  }
}

export async function sendStaffEmail(subject: string, html: string, text?: string): Promise<boolean> {
  const recipients = process.env.DEFAULT_EMAIL_RECIPIENTS?.split(',') || []
  
  if (recipients.length === 0) {
    console.warn('No email recipients configured')
    return false
  }

  return sendEmail({ to: recipients, subject, html, text })
}
