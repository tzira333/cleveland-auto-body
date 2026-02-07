import Twilio from 'twilio'

const twilioClient = Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export interface SMSPayload {
  to: string[]
  body: string
}

export async function sendSMS(payload: SMSPayload): Promise<boolean> {
  try {
    const promises = payload.to.map((number) =>
      twilioClient.messages.create({
        body: payload.body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: number,
      })
    )

    await Promise.all(promises)
    return true
  } catch (error) {
    console.error('Failed to send SMS:', error)
    return false
  }
}

export async function sendStaffSMS(body: string): Promise<boolean> {
  const recipients = process.env.STAFF_SMS_RECIPIENTS?.split(',') || []
  
  if (recipients.length === 0) {
    console.warn('No staff SMS recipients configured')
    return false
  }

  return sendSMS({ to: recipients, body })
}
