import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const port = Number(process.env.PORT || 8787);
const adminEmail = process.env.ACCESS_REQUEST_ADMIN_EMAIL || 'asi@live.se';
const gmailSender = process.env.ACCESS_REQUEST_SENDER_EMAIL || 'jarvis.vong@gmail.com';
const localGoogleEnvPath = process.env.GOOGLE_ENV_FILE || '/home/asi/.openclaw/workspace/.google.env';

const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  return raw.split('\n').reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return acc;
    }
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) {
      return acc;
    }
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    acc[key] = value;
    return acc;
  }, {});
};

const loadGoogleCredentials = () => {
  const fileValues = parseEnvFile(localGoogleEnvPath);

  return {
    clientId: process.env.GOOGLE_CLIENT_ID || fileValues.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || fileValues.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || fileValues.GOOGLE_REFRESH_TOKEN,
  };
};

const getGmailClient = () => {
  const creds = loadGoogleCredentials();
  if (!creds.clientId || !creds.clientSecret || !creds.refreshToken) {
    throw new Error('Missing Gmail OAuth credentials');
  }

  const auth = new google.auth.OAuth2(creds.clientId, creds.clientSecret, 'http://localhost');
  auth.setCredentials({ refresh_token: creds.refreshToken });
  return google.gmail({ version: 'v1', auth });
};

const encodeHeader = (value = '') => Buffer.from(value, 'utf8').toString('base64');

const buildEmailMessage = ({ requesterEmail, requesterName, message }) => {
  const requestDate = new Date().toISOString();
  const textBody = [
    'Nuova richiesta accesso Crossplanner',
    '',
    `Email: ${requesterEmail}`,
    `Nome: ${requesterName || '-'}`,
    `Applicazione: crossplanner`,
    `Richiesta inviata: ${requestDate}`,
    '',
    'Messaggio:',
    message || '-',
  ].join('\n');

  const htmlBody = `
    <div style="font-family:Arial,sans-serif;background:#07111a;color:#e5edf5;padding:24px">
      <div style="max-width:640px;margin:0 auto;background:#0f1b2a;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:24px">
        <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#ff9a5c;margin-bottom:12px">Crossplanner</div>
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.05;color:#ffffff">Nuova richiesta di accesso</h1>
        <p style="margin:0 0 20px;color:#b7c6d8">È arrivata una nuova richiesta di accesso all'app Crossplanner.</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <tr><td style="padding:8px 0;color:#8da0b5;width:150px">Email</td><td style="padding:8px 0;color:#ffffff">${requesterEmail}</td></tr>
          <tr><td style="padding:8px 0;color:#8da0b5">Nome</td><td style="padding:8px 0;color:#ffffff">${requesterName || '-'}</td></tr>
          <tr><td style="padding:8px 0;color:#8da0b5">App</td><td style="padding:8px 0;color:#ffffff">crossplanner</td></tr>
          <tr><td style="padding:8px 0;color:#8da0b5">Data richiesta</td><td style="padding:8px 0;color:#ffffff">${requestDate}</td></tr>
        </table>
        <div style="border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px;background:#09121c">
          <div style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8da0b5;margin-bottom:8px">Messaggio</div>
          <div style="white-space:pre-wrap;color:#ffffff">${message || '-'}</div>
        </div>
      </div>
    </div>
  `.trim();

  const lines = [
    `From: Crossplanner Access <${gmailSender}>`,
    `To: ${adminEmail}`,
    `Reply-To: ${requesterEmail}`,
    `Subject: =?UTF-8?B?${encodeHeader(`Crossplanner access request: ${requesterEmail}`)}?=`,
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="crossplanner-boundary"',
    '',
    '--crossplanner-boundary',
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    textBody,
    '',
    '--crossplanner-boundary',
    'Content-Type: text/html; charset="UTF-8"',
    '',
    htmlBody,
    '',
    '--crossplanner-boundary--',
  ];

  return Buffer.from(lines.join('\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
};

const sendAccessRequestEmail = async ({ requesterEmail, requesterName, message }) => {
  const gmail = getGmailClient();
  const raw = buildEmailMessage({ requesterEmail, requesterName, message });
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });
};

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/access-request-email', async (req, res) => {
  const requesterEmail = String(req.body?.email || '').trim().toLowerCase();
  const requesterName = String(req.body?.name || '').trim();
  const message = String(req.body?.message || '').trim();

  if (!requesterEmail || !message) {
    return res.status(400).json({ ok: false, error: 'Missing email or message' });
  }

  try {
    await sendAccessRequestEmail({ requesterEmail, requesterName, message });
    return res.json({ ok: true });
  } catch (error) {
    console.error('[access-request-email] send failed:', error);
    return res.status(500).json({ ok: false, error: 'Email delivery failed' });
  }
});

app.use(express.static(distDir));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`[server] listening on ${port}`);
});
