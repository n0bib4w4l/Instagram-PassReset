export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { username } = req.query;
  if (!username) return res.status(400).json({ 
    error: 'Username/Email required', 
    usage: 'GET /?username=your_username_or_email' 
  });

  try {
    // First get CSRF token from Instagram
    const initResponse = await fetch('https://www.instagram.com/accounts/password/reset/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });
    
    const html = await initResponse.text();
    const csrfMatch = html.match(/"csrf_token":"([^"]+)"/);
    const rolloutMatch = html.match(/"rollout_hash":"([^"]+)"/);
    
    if (!csrfMatch) {
      return res.status(500).json({ 
        success: false, 
        error: 'Could not get CSRF token' 
      });
    }

    const csrfToken = csrfMatch[1];
    const rolloutHash = rolloutMatch ? rolloutMatch[1] : '';
    
    // Generate session ID
    const generateSessionId = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      return Array(3).fill().map(() => 
        Array(6).fill().map(() => 
          chars[Math.floor(Math.random() * chars.length)]
        ).join('')
      ).join(':');
    };

    const sessionId = generateSessionId();
    
    // Form data for password reset
    const formData = new URLSearchParams({
      'email_or_username': username,
      'recaptcha_challenge_field': ''
    });

    // Send password reset request
    const resetResponse = await fetch('https://www.instagram.com/api/v1/web/accounts/account_recovery_send_ajax/', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://www.instagram.com',
        'Referer': 'https://www.instagram.com/accounts/password/reset/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-CSRFToken': csrfToken,
        'X-IG-App-ID': '936619743392459',
        'X-Instagram-AJAX': '1010054725',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Web-Session-ID': sessionId,
        'Cookie': `csrftoken=${csrfToken}; rur="NAO\\05454321\\0541704067200:1hkKjN:abcd1234"; sessionid=${sessionId}`
      },
      body: formData
    });

    const resetData = await resetResponse.json();
    
    // Handle response
    if (resetResponse.ok && (resetData.status === 'ok' || resetData.email_sent || resetData.sms_sent)) {
      return res.status(200).json({
        success: true,
        message: `Password reset link sent successfully!`,
        username: username,
        details: resetData.email_sent ? 'Check your email' : resetData.sms_sent ? 'Check your SMS' : 'Reset link sent'
      });
    } else if (resetData.message) {
      return res.status(400).json({
        success: false,
        error: resetData.message,
        username: username
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Username/Email not found or invalid',
        username: username
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error occurred',
      details: error.message
    });
  }
}
