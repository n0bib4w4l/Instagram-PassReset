export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Username required', usage: '?username=your_username' });

  const generateSessionId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array(3).fill().map(() => Array(6).fill().map(() => chars[Math.floor(Math.random() * chars.length)]).join('')).join(':');
  };

  const generateCSRF = () => Array(32).fill().map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('');

  try {
    const csrfToken = generateCSRF();
    const sessionId = generateSessionId();
    
    const formData = new URLSearchParams({
      'email_or_username': username,
      'recaptcha_challenge_field': ''
    });

    const response = await fetch('https://www.instagram.com/api/v1/web/accounts/account_recovery_send_ajax/', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'content-type': 'application/x-www-form-urlencoded',
        'referer': 'https://www.instagram.com/accounts/password/reset/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'x-asbd-id': '359341',
        'x-csrftoken': csrfToken,
        'x-ig-app-id': '936619743392459',
        'x-instagram-ajax': '1025588585',
        'x-requested-with': 'XMLHttpRequest',
        'x-web-session-id': sessionId
      },
      body: formData
    });

    const data = await response.json();
    
    if (data.status === 'ok' || response.status === 200) {
      res.status(200).json({
        success: true,
        message: `Password reset link sent to ${username}`,
        username: username,
        status: 'ok'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Reset failed. Check username/email.',
        error: data.message || 'Unknown error'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}
