export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ 
      error: 'Username required',
      usage: `${req.headers.host}/?username=your_username`
    });
  }

  try {
    const sessionData = generateSessionData();
    const resetUrl = 'https://www.instagram.com/api/v1/web/accounts/account_recovery_send_ajax/';
    
    const headers = {
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://www.instagram.com',
      'Referer': 'https://www.instagram.com/accounts/password/reset/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'X-Csrftoken': sessionData.csrfToken,
      'X-Ig-App-Id': '936619743392459',
      'X-Instagram-Ajax': sessionData.ajaxId,
      'X-Requested-With': 'XMLHttpRequest'
    };

    const formData = new URLSearchParams({
      'email_or_username': username.trim(),
      'recaptcha_challenge_field': ''
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(resetUrl, {
      method: 'POST',
      headers: headers,
      body: formData.toString(),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw_response: responseText.substring(0, 500) };
    }

    if (response.ok) {
      return res.status(200).json({
        success: true,
        message: `Password reset sent for: ${username}`,
        data: responseData
      });
    } else {
      return res.status(200).json({
        success: false,
        message: `Failed for: ${username}`,
        status: response.status,
        data: responseData
      });
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(408).json({
        success: false,
        error: 'Request timeout'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
}

function generateSessionData() {
  const timestamp = Math.floor(Date.now() / 1000);
  
  return {
    csrfToken: generateRandomString(32),
    ajaxId: timestamp.toString()
  };
}

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
