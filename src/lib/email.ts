import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export interface CallSheetEmailData {
  projectName: string
  dayNumber: number
  date: string
  generalCallTime: string
  location: string
  weather?: string
  nearestHospital?: string
  parking?: string
  prayerFocus?: {
    scripture: string
    reference: string
    prayer: string
  }
  entries: Array<{
    contactName: string
    role: string
    callTime: string
    onSetTime?: string
    makeupTime?: string
    notes?: string
  }>
  advanceSchedule?: string
}

export async function sendCallSheet(
  to: string[],
  data: CallSheetEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = generateCallSheetHTML(data)
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'production@nurulifeproductions.com',
      to,
      subject: `📋 Call Sheet — ${data.projectName} — Day ${data.dayNumber} — ${data.date}`,
      html,
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

function generateCallSheetHTML(data: CallSheetEmailData): string {
  const entriesHTML = data.entries.map(entry => `
    <tr style="border-bottom: 1px solid #F0F0F0;">
      <td style="padding: 10px; font-family: 'Open Sans', sans-serif; color: #333333;">${entry.contactName}</td>
      <td style="padding: 10px; font-family: 'Open Sans', sans-serif; color: #666666;">${entry.role}</td>
      <td style="padding: 10px; font-family: 'Open Sans', sans-serif; color: #730E20; font-weight: bold;">${entry.callTime}</td>
      <td style="padding: 10px; font-family: 'Open Sans', sans-serif; color: #333333;">${entry.makeupTime || '—'}</td>
      <td style="padding: 10px; font-family: 'Open Sans', sans-serif; color: #333333;">${entry.onSetTime || '—'}</td>
      <td style="padding: 10px; font-family: 'Open Sans', sans-serif; color: #666666; font-size: 12px;">${entry.notes || ''}</td>
    </tr>
  `).join('')

  const prayerHTML = data.prayerFocus ? `
    <div style="background: #FFF8F0; border-left: 4px solid #F27D16; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <h3 style="color: #730E20; font-family: 'Montserrat', sans-serif; margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">🙏 Prayer Focus for Today</h3>
      <p style="color: #032940; font-family: 'Open Sans', sans-serif; font-style: italic; margin: 0 0 8px 0; font-size: 15px;">"${data.prayerFocus.scripture}"</p>
      <p style="color: #730E20; font-family: 'Open Sans', sans-serif; font-size: 13px; margin: 0 0 12px 0; font-weight: bold;">— ${data.prayerFocus.reference}</p>
      <p style="color: #333333; font-family: 'Open Sans', sans-serif; font-size: 14px; margin: 0;">${data.prayerFocus.prayer}</p>
    </div>
  ` : ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Call Sheet — ${data.projectName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F0F0F0; font-family: 'Open Sans', Arial, sans-serif;">
  <div style="max-width: 700px; margin: 0 auto; background: #FFFFFF;">
    
    <!-- Header -->
    <div style="background: #032940; padding: 30px; text-align: center;">
      <h1 style="color: #FFFFFF; font-family: 'Montserrat', Arial, sans-serif; font-size: 28px; margin: 0 0 4px 0; letter-spacing: 2px;">NURULIFE</h1>
      <p style="color: #F27D16; font-family: 'Montserrat', Arial, sans-serif; font-size: 12px; margin: 0; letter-spacing: 3px; text-transform: uppercase;">Productions</p>
      <div style="border-top: 2px solid #F27D16; margin: 16px 0;"></div>
      <h2 style="color: #FFFFFF; font-family: 'Montserrat', Arial, sans-serif; font-size: 20px; margin: 0;">CALL SHEET</h2>
      <p style="color: #F0F0F0; font-size: 14px; margin: 4px 0 0 0;">${data.projectName} — Day ${data.dayNumber}</p>
    </div>

    <!-- Key Info Bar -->
    <div style="background: #730E20; padding: 16px 30px; display: flex; justify-content: space-between;">
      <div style="color: #FFFFFF; font-size: 13px;">
        <strong>DATE:</strong> ${data.date}
      </div>
      <div style="color: #F27D16; font-size: 16px; font-weight: bold;">
        GENERAL CALL: ${data.generalCallTime}
      </div>
      <div style="color: #FFFFFF; font-size: 13px;">
        <strong>LOCATION:</strong> ${data.location}
      </div>
    </div>

    <!-- Body -->
    <div style="padding: 30px;">

      ${prayerHTML}

      <!-- Info Grid -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="padding: 10px; background: #F5F5F5; border-radius: 4px; margin: 4px;">
            <strong style="color: #730E20; font-size: 11px; text-transform: uppercase; display: block;">Weather</strong>
            <span style="color: #333333; font-size: 14px;">${data.weather || 'Check local forecast'}</span>
          </td>
          <td style="padding: 10px; width: 16px;"></td>
          <td style="padding: 10px; background: #F5F5F5; border-radius: 4px;">
            <strong style="color: #730E20; font-size: 11px; text-transform: uppercase; display: block;">Nearest Hospital</strong>
            <span style="color: #333333; font-size: 14px;">${data.nearestHospital || 'See location brief'}</span>
          </td>
          <td style="padding: 10px; width: 16px;"></td>
          <td style="padding: 10px; background: #F5F5F5; border-radius: 4px;">
            <strong style="color: #730E20; font-size: 11px; text-transform: uppercase; display: block;">Parking</strong>
            <span style="color: #333333; font-size: 14px;">${data.parking || 'TBC'}</span>
          </td>
        </tr>
      </table>

      <!-- Cast & Crew Table -->
      <h3 style="color: #730E20; font-family: 'Montserrat', Arial, sans-serif; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #730E20; padding-bottom: 8px;">Cast & Crew Call Times</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background: #032940;">
            <th style="padding: 10px; text-align: left; color: #FFFFFF; font-size: 12px; font-family: 'Montserrat', Arial, sans-serif;">Name</th>
            <th style="padding: 10px; text-align: left; color: #FFFFFF; font-size: 12px; font-family: 'Montserrat', Arial, sans-serif;">Role</th>
            <th style="padding: 10px; text-align: left; color: #F27D16; font-size: 12px; font-family: 'Montserrat', Arial, sans-serif;">Call Time</th>
            <th style="padding: 10px; text-align: left; color: #FFFFFF; font-size: 12px; font-family: 'Montserrat', Arial, sans-serif;">Makeup</th>
            <th style="padding: 10px; text-align: left; color: #FFFFFF; font-size: 12px; font-family: 'Montserrat', Arial, sans-serif;">On Set</th>
            <th style="padding: 10px; text-align: left; color: #FFFFFF; font-size: 12px; font-family: 'Montserrat', Arial, sans-serif;">Notes</th>
          </tr>
        </thead>
        <tbody>
          ${entriesHTML}
        </tbody>
      </table>

      ${data.advanceSchedule ? `
      <!-- Advance Schedule -->
      <div style="background: #F0F0F0; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
        <h3 style="color: #032940; font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; text-transform: uppercase; margin: 0 0 8px 0;">Tomorrow's Advance Schedule</h3>
        <p style="color: #333333; font-size: 14px; margin: 0;">${data.advanceSchedule}</p>
      </div>
      ` : ''}

    </div>

    <!-- Footer -->
    <div style="background: #032940; padding: 20px 30px; text-align: center;">
      <p style="color: #F27D16; font-family: 'Montserrat', Arial, sans-serif; font-size: 12px; margin: 0 0 4px 0; font-style: italic;">"Shining Light, Transforming Lives."</p>
      <p style="color: #FFFFFF; font-size: 11px; margin: 0;">NuruLife Productions | nurulifeproduction@gmail.com</p>
      <p style="color: #666666; font-size: 10px; margin: 8px 0 0 0;">This call sheet is confidential. Please do not share outside the production team.</p>
    </div>

  </div>
</body>
</html>
  `
}

export async function sendWelcomeEmail(
  to: string,
  name: string,
  role: string
): Promise<void> {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'production@nurulifeproductions.com',
    to,
    subject: 'Welcome to NuruLife Production Studio',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: #032940; padding: 30px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0;">NURULIFE</h1>
          <p style="color: #F27D16; margin: 4px 0 0 0;">Production Studio</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #730E20;">Welcome, ${name}!</h2>
          <p style="color: #333333;">You have been added to NuruLife Production Studio as <strong>${role}</strong>.</p>
          <p style="color: #333333;">Log in at <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #F27D16;">${process.env.NEXT_PUBLIC_APP_URL}</a> to get started.</p>
          <p style="color: #333333; font-style: italic;">"Shining Light, Transforming Lives." — Matthew 5:14-16</p>
        </div>
      </div>
    `,
  })
}