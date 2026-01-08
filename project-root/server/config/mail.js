const nodemailer = require('nodemailer');

/**
 * Send email with nodemailer.
 * @param {string} recipient
 * @param {string} subject
 * @param {string} html
 * @returns {Promise<Object>} info
 */
async function sendMail(recipient, subject, html) {
  try {
    const transporterConfig = {
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '587', 10),
      secure: process.env.MAIL_SECURE === 'true', // true for 465, false for other ports
    };

    // Only set auth if both user and pass are present to avoid "Missing credentials for PLAIN" errors
    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
      transporterConfig.auth = {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      };
    }

    // For development environments where TLS certificate validation may fail
    transporterConfig.tls = { rejectUnauthorized: process.env.MAIL_TLS_REJECT !== 'false' };

    const transporter = nodemailer.createTransport(transporterConfig);

    const info = await transporter.sendMail({
      from: `"No Reply" <${process.env.MAIL_FROM || 'no-reply@example.com'}>`,
      to: recipient,
      subject: subject || 'Please confirm your email',
      text: html.replace(/<[^>]+>/g, ''),
      html,
    });

    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (err) {
    console.error('sendMail error:', err && err.message ? err.message : err);
    throw err;
  }
}
module.exports = sendMail;