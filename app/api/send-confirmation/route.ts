import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Si no hay API key, solo registrar en consola (modo dev)
    if (!resend) {
      console.log('Resend API key not configured. Email would be sent to:', body.clientEmail);
      return NextResponse.json({ success: true, dev_mode: true });
    }
    const {
      clientName,
      clientEmail,
      professionalName,
      professionalEmail,
      serviceName,
      datetime,
      price,
      appointmentId
    } = body;

    const appointmentDate = parseISO(datetime);
    const formattedDate = format(appointmentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    const formattedTime = format(appointmentDate, "HH:mm");

    // Email al cliente
    const clientEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; border-left: 4px solid #a855f7; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .info-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #6b7280; }
            .value { color: #111827; }
            .button { display: inline-block; background: #a855f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">✅ Cita Confirmada</h1>
              <p style="margin: 10px 0 0 0;">Tu reserva ha sido registrada exitosamente</p>
            </div>
            <div class="content">
              <p>Hola <strong>${clientName}</strong>,</p>
              <p>Tu cita ha sido confirmada. A continuación los detalles:</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">🩺 Profesional:</span>
                  <span class="value">${professionalName}</span>
                </div>
                <div class="info-row">
                  <span class="label">📋 Servicio:</span>
                  <span class="value">${serviceName}</span>
                </div>
                <div class="info-row">
                  <span class="label">📅 Fecha:</span>
                  <span class="value">${formattedDate}</span>
                </div>
                <div class="info-row">
                  <span class="label">🕐 Hora:</span>
                  <span class="value">${formattedTime}</span>
                </div>
                <div class="info-row">
                  <span class="label">💰 Precio:</span>
                  <span class="value">S/${price.toFixed(2)}</span>
                </div>
                <div class="info-row">
                  <span class="label">🔖 ID de Reserva:</span>
                  <span class="value">${appointmentId.substring(0, 8).toUpperCase()}</span>
                </div>
              </div>

              <p><strong>Importante:</strong></p>
              <ul>
                <li>Te recomendamos llegar 10 minutos antes</li>
                <li>Si necesitas cancelar, por favor hazlo con 24 horas de anticipación</li>
                <li>Guarda este email como comprobante</li>
              </ul>

              <p>¿Tienes preguntas? Responde a este email.</p>
              
              <p>Saludos,<br><strong>Equipo BookFlow</strong></p>
            </div>
            <div class="footer">
              <p>BookFlow - Sistema de Reservas Profesional</p>
              <p style="font-size: 12px; color: #9ca3af;">Este es un email automático, por favor no responder.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Email al profesional
    const professionalEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; border-left: 4px solid #a855f7; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .info-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #6b7280; }
            .value { color: #111827; }
            .button { display: inline-block; background: #a855f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">📅 Nueva Cita Registrada</h1>
              <p style="margin: 10px 0 0 0;">Tienes una nueva reserva</p>
            </div>
            <div class="content">
              <p>Hola <strong>${professionalName}</strong>,</p>
              <p>Se ha registrado una nueva cita en tu agenda:</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">👤 Cliente:</span>
                  <span class="value">${clientName}</span>
                </div>
                <div class="info-row">
                  <span class="label">📧 Email:</span>
                  <span class="value">${clientEmail}</span>
                </div>
                <div class="info-row">
                  <span class="label">📋 Servicio:</span>
                  <span class="value">${serviceName}</span>
                </div>
                <div class="info-row">
                  <span class="label">📅 Fecha:</span>
                  <span class="value">${formattedDate}</span>
                </div>
                <div class="info-row">
                  <span class="label">🕐 Hora:</span>
                  <span class="value">${formattedTime}</span>
                </div>
                <div class="info-row">
                  <span class="label">💰 Valor:</span>
                  <span class="value">S/${price.toFixed(2)}</span>
                </div>
                <div class="info-row">
                  <span class="label">🔖 ID:</span>
                  <span class="value">${appointmentId.substring(0, 8).toUpperCase()}</span>
                </div>
              </div>

              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/professional/dashboard" class="button">Ver en Dashboard</a>
              
              <p>Saludos,<br><strong>Sistema BookFlow</strong></p>
            </div>
            <div class="footer">
              <p>BookFlow - Sistema de Reservas Profesional</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Enviar email al cliente
    await resend.emails.send({
      from: 'BookFlow <onboarding@resend.dev>', // Cambiar después por tu dominio
      to: [clientEmail],
      subject: '✅ Confirmación de Cita - BookFlow',
      html: clientEmailHtml,
    });

    // Enviar email al profesional
    await resend.emails.send({
      from: 'BookFlow <onboarding@resend.dev>',
      to: [professionalEmail],
      subject: '📅 Nueva Cita Registrada - BookFlow',
      html: professionalEmailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Error al enviar emails' },
      { status: 500 }
    );
  }
}