// index.js - Single file Instagram Password Reset API for Vercel
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
  }

  // Extract username from query parameters
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ 
      error: 'Username or email is required',
      usage: `Use: ${req.headers.host}/?username=your_username_or_email`,
      example: `${req.headers.host}/?username=john_doe`
    });
  }

  try {
    console.log(`🔄 Processing reset request for: ${username}`);

    // Generate fresh session data to avoid cookie issues
    const sessionData = generateSessionData();
    
    // Try multiple endpoints - Instagram may have updated
    const endpoints = [
      'https://www.instagram.com/api/v1/web/accounts/account_recovery_send_ajax/',
      'https://www.instagram.com/accounts/password/reset/ajax/',
      'https://i.instagram.com/api/v1/accounts/account_recovery_send_ajax/'
    ];
    
    // Enhanced headers for better success rate
    const baseHeaders = {
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://www.instagram.com',
      'Referer': 'https://www.instagram.com/accounts/password/reset/',
      'Priority': 'u=1, i',
      'Sec-Ch-Ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
      'Sec-Ch-Ua-Full-Version-List': '"Not)A;Brand";v="8.0.0.0", "Chromium";v="138.0.7204.184", "Google Chrome";v="138.0.7204.184"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Model': '""',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Ch-Ua-Platform-Version': '"15.0.0"',
      'Sec-Ch-Prefers-Color-Scheme': 'light',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      'X-Asbd-Id': '359341',
      'X-Csrftoken': sessionData.csrfToken,
      'X-Ig-App-Id': '936619743392459',
      'X-Ig-Www-Claim': sessionData.wwwClaim,
      'X-Instagram-Ajax': sessionData.ajaxId,
      'X-Requested-With': 'XMLHttpRequest',
      'X-Web-Session-Id': sessionData.sessionId
    };

    // Enhanced form data with additional fields
    const formData = new URLSearchParams({
      'email_or_username': username.trim(),
      'recaptcha_challenge_field': '',
      'source': 'auth_switcher_account',
      'next': '/'
    });

    let lastError = null;
    let attempts = 0;

    // Try multiple endpoints
    for (const resetUrl of endpoints) {
      attempts++;
      console.log(`🔄 Attempt ${attempts}: Trying endpoint ${resetUrl}`);
      
      try {

        // Make request to Instagram
        const response = await fetch(resetUrl, {
          method: 'POST',
          headers: baseHeaders,
          body: formData.toString()
        });

        const responseText = await response.text();
        let responseData;

        // Parse response
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          responseData = { raw_response: responseText.substring(0, 500) };
        }

        console.log(`📊 Response from ${resetUrl}: ${response.status}`, responseData);

        // Handle successful response
        if (response.ok || response.status === 200) {
          return res.status(200).json({
            success: true,
            message: `✅ Password reset email sent successfully for "${username}"`,
            status: response.status,
            endpoint: resetUrl,
            data: responseData,
            instructions: '📧 Check the email associated with this Instagram account',
            note: 'If no email received, check spam folder or verify the username/email is correct'
          });
        }

        // Check for specific error conditions
        if (responseData.message && responseData.message.includes('challenge_required')) {
          return res.status(200).json({
            success: false,
            message: `🔐 Challenge Required for "${username}"`,
            error: 'Instagram requires additional verification',
            status: response.status,
            details: responseData,
            solutions: [
              'User needs to complete manual verification on Instagram',
              'Go to instagram.com and complete the security challenge',
              'Try again after completing verification'
            ]
          });
        }

        if (responseData.message && responseData.message.includes('user_not_found')) {
          return res.status(200).json({
            success: false,
            message: `❌ User not found: "${username}"`,
            error: 'Username or email does not exist',
            status: response.status,
            suggestions: [
              'Verify the username/email is correct',
              'Check if the account exists',
              'Try using email instead of username or vice versa'
            ]
          });
        }

        // Store error for potential retry
        lastError = { response, responseData, endpoint: resetUrl };

      } catch (error) {
        console.error(`❌ Error with endpoint ${resetUrl}:`, error);
        lastError = { error, endpoint: resetUrl };
        continue; // Try next endpoint
      }
    }

    // If all endpoints failed, return the last error
    if (lastError) {
      if (lastError.response) {
        const { response, responseData } = lastError;
        
        // Handle client errors (400-499)
        if (response.status >= 400 && response.status < 500) {
          return res.status(200).json({
            success: false,
            message: `❌ Failed to send reset for "${username}"`,
            error: 'All endpoints failed - possible rate limiting or account issue',
            status: response.status,
            details: responseData,
            endpoints_tried: endpoints,
            suggestions: [
              'Wait a few minutes and try again (rate limiting)',
              'Verify the username/email is correct',
              'Check if Instagram account exists',
              'Complete any pending challenges on Instagram'
            ]
          });
        }
        
        // Handle server errors (500+)
        else {
          return res.status(200).json({
            success: false,
            message: '⚠️ Instagram server error on all endpoints',
            error: 'Service temporarily unavailable',
            status: response.status,
            details: responseData,
            endpoints_tried: endpoints,
            retry: 'Please try again in a few minutes'
          });
        }
      } else {
        throw lastError.error;
      }
    }

  } catch (error) {
    console.error('❌ API Error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      type: error.name,
      suggestion: 'Please try again later or contact support',
      timestamp: new Date().toISOString()
    });
  }
}

// Helper function to generate session data
function generateSessionData() {
  const timestamp = Math.floor(Date.now() / 1000);
  
  return {
    csrfToken: generateRandomString(32, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'),
    sessionId: `s${Math.floor(Math.random() * 999999)}:${generateRandomString(6, 'abcdefghijklmnopqrstuvwxyz0123456789')}:${generateRandomString(6, 'abcdefghijklmnopqrstuvwxyz0123456789')}`,
    wwwClaim: `hmac.${generateRandomString(43, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_')}`,
    ajaxId: (timestamp + Math.floor(Math.random() * 1000000)).toString()
  };
}

// Utility function to generate random strings
function generateRandomString(length, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
