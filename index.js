// index.js
// Masking function for emails, phone numbers, and usernames
function maskEmailOrPhone(text) {
  if (!text || typeof text !== 'string') return '****';
  
  // Email masking
  if (text.includes('@')) {
    const [user, domain] = text.split('@');
    const userLen = user.length;
    
    if (userLen <= 2) {
      return user[0] + '*'.repeat(Math.max(1, userLen - 1)) + '@' + domain;
    } else if (userLen <= 4) {
      return user[0] + '*'.repeat(userLen - 2) + user[userLen - 1] + '@' + domain;
    } else {
      return user.substring(0, 2) + '*'.repeat(userLen - 4) + user.substring(userLen - 2) + '@' + domain;
    }
  }
  
  // Phone number masking
  if (/^\+?[\d\s-()]+$/.test(text)) {
    const cleaned = text.replace(/[\s-()]/g, '');
    const len = cleaned.length;
    
    if (len <= 4) {
      return '*'.repeat(len);
    } else if (len <= 7) {
      return cleaned.substring(0, 2) + '*'.repeat(len - 4) + cleaned.substring(len - 2);
    } else {
      return cleaned.substring(0, 3) + '*'.repeat(len - 6) + cleaned.substring(len - 3);
    }
  }
  
  // General text masking (for usernames)
  const len = text.length;
  if (len <= 2) {
    return text[0] + '*'.repeat(Math.max(1, len - 1));
  } else if (len <= 4) {
    return text[0] + '*'.repeat(len - 2) + text[len - 1];
  } else {
    return text.substring(0, 2) + '*'.repeat(len - 4) + text.substring(len - 2);
  }
}

module.exports = async (req, res) => {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).set(corsHeaders).send();
  }

  const url = new URL(req.url, `https://${req.headers.host}`);

  // Utility function to create HTML responses
  const createHTMLResponse = (html) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  };

  // Home Page
  if (url.pathname === '/') {
    const homePage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔐 Insta Pass Reset API</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Orbitron:wght@700&family=Poppins:wght@300;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #8338ec;
      --secondary: #3a86ff;
      --dark: #1a1a2e;
      --light: #f8f9fa;
      --success: #06d6a0;
      --danger: #ef476f;
      --warning: #ffd166;
    }
    body {
      font-family: 'Poppins', sans-serif;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      color: var(--light);
      line-height: 1.6;
      margin: 0;
      padding: 0;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    header {
      text-align: center;
      margin-bottom: 3rem;
      padding: 3rem 0;
      background: rgba(26, 26, 46, 0.7);
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    h1 {
      font-family: 'Orbitron', sans-serif;
      font-size: 3.5rem;
      margin-bottom: 1rem;
      background: linear-gradient(to right, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      text-shadow: 0 0 10px rgba(131, 56, 236, 0.3);
      animation: glow 2s ease-in-out infinite alternate;
    }
    @keyframes glow {
      from { text-shadow: 0 0 5px rgba(131, 56, 236, 0.5); }
      to { text-shadow: 0 0 15px rgba(131, 56, 236, 0.8), 0 0 20px rgba(58, 134, 255, 0.6); }
    }
    p {
      font-size: 1.2rem;
      max-width: 600px;
      margin: 0 auto;
      color: rgba(255, 255, 255, 0.9);
    }
    .cta-buttons {
      margin-top: 2rem;
      display: flex;
      justify-content: center;
      gap: 1.5rem;
    }
    .btn {
      background: linear-gradient(to right, var(--primary), var(--secondary));
      color: white;
      padding: 0.8rem 1.5rem;
      border-radius: 50px;
      text-decoration: none;
      font-weight: bold;
      font-family: 'Montserrat', sans-serif;
      box-shadow: 0 4px 15px rgba(131, 56, 236, 0.4);
      transition: all 0.3s ease;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(131, 56, 236, 0.6);
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin: 3rem 0;
    }
    .feature-card {
      background: rgba(26, 26, 46, 0.7);
      border-radius: 10px;
      padding: 1.5rem;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border-left: 4px solid var(--primary);
    }
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }
    .feature-card h3 {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.5rem;
      color: var(--warning);
      margin-top: 0;
    }
    footer {
      text-align: center;
      margin-top: 3rem;
      padding: 2rem 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
    }
    @media (max-width: 768px) {
      h1 { font-size: 2.5rem; }
      .container { padding: 1rem; }
      .cta-buttons { flex-direction: column; }
      .btn { width: 100%; text-align: center; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🔐 Insta Pass Reset API</h1>
      <p>Programmatically send Instagram password reset links using our fast and secure API, built for Vercel.</p>
      <div class="cta-buttons">
        <a href="/test" class="btn">Try Live Demo</a>
        <a href="/docs" class="btn">View Documentation</a>
      </div>
    </header>
    <section class="features">
      <div class="feature-card">
        <h3>⚡ Instant Delivery</h3>
        <p>Send password reset links in seconds using our edge network infrastructure.</p>
      </div>
      <div class="feature-card">
        <h3>🔒 Secure Processing</h3>
        <p>Protects sensitive information with automatic masking and secure handling.</p>
      </div>
      <div class="feature-card">
        <h3>📧 Email & Username</h3>
        <p>Supports both email and username inputs for maximum flexibility.</p>
      </div>
      <div class="feature-card">
        <h3>🛠 Easy Integration</h3>
        <p>Simple API endpoints with clear documentation for quick setup.</p>
      </div>
    </section>
    <footer>
      <p>Made with ❤️ by @nobi_shops | Powered by Vercel</p>
    </footer>
  </div>
</body>
</html>`;
    return createHTMLResponse(homePage);
  }

  // Documentation Page
  if (url.pathname === '/docs') {
    const docsPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔐 Insta Pass Reset API - Documentation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Orbitron:wght@700&family=Poppins:wght@300;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #8338ec;
      --secondary: #3a86ff;
      --dark: #1a1a2e;
      --light: #f8f9fa;
      --success: #06d6a0;
      --danger: #ef476f;
      --warning: #ffd166;
    }
    body {
      font-family: 'Poppins', sans-serif;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      color: var(--light);
      line-height: 1.6;
      margin: 0;
      padding: 0;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    header {
      text-align: center;
      margin-bottom: 3rem;
      padding: 2rem 0;
      background: rgba(26, 26, 46, 0.7);
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    h1, h2, h3 {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      background: linear-gradient(to right, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      font-family: 'Orbitron', sans-serif;
      text-shadow: 0 0 10px rgba(131, 56, 236, 0.3);
    }
    h2 {
      font-size: 2rem;
      color: var(--secondary);
      margin-top: 2rem;
      border-bottom: 2px solid var(--primary);
      padding-bottom: 0.5rem;
    }
    h3 {
      font-size: 1.5rem;
      color: var(--warning);
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 50px;
      font-size: 0.8rem;
      font-weight: bold;
      margin-right: 0.5rem;
    }
    .badge.get {
      background-color: var(--success);
      color: var(--dark);
    }
    .badge.post {
      background-color: var(--secondary);
      color: white;
    }
    .endpoint {
      background: rgba(26, 26, 46, 0.7);
      border-radius: 10px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      border-left: 4px solid var(--primary);
    }
    .code-block {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      padding: 1rem;
      font-family: monospace;
      overflow-x: auto;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .example {
      background: rgba(58, 134, 255, 0.1);
      border-left: 4px solid var(--secondary);
      padding: 1rem;
      border-radius: 0 8px 8px 0;
      margin: 1rem 0;
    }
    .response {
      background: rgba(6, 214, 160, 0.1);
      border-left: 4px solid var(--success);
      padding: 1rem;
      border-radius: 0 8px 8px 0;
      margin: 1rem 0;
    }
    .error {
      background: rgba(239, 71, 111, 0.1);
      border-left: 4px solid var(--danger);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin: 2rem 0;
    }
    .card {
      background: rgba(26, 26, 46, 0.7);
      border-radius: 10px;
      padding: 1.5rem;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }
    .card h3 {
      margin-top: 0;
    }
    footer {
      text-align: center;
      margin-top: 3rem;
      padding: 2rem 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
    }
    .glow {
      animation: glow 2s ease-in-out infinite alternate;
    }
    @keyframes glow {
      from {
        text-shadow: 0 0 5px rgba(131, 56, 236, 0.5);
      }
      to {
        text-shadow: 0 0 15px rgba(131, 56, 236, 0.8), 0 0 20px rgba(58, 134, 255, 0.6);
      }
    }
    .test-btn {
      display: inline-block;
      background: linear-gradient(to right, var(--primary), var(--secondary));
      color: white;
      padding: 0.8rem 1.5rem;
      border-radius: 50px;
      text-decoration: none;
      font-weight: bold;
      margin-top: 1rem;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
      font-family: 'Montserrat', sans-serif;
      box-shadow: 0 4px 15px rgba(131, 56, 236, 0.4);
    }
    .test-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(131, 56, 236, 0.6);
    }
    @media (max-width: 768px) {
      h1 {
        font-size: 2rem;
      }
      h2 {
        font-size: 1.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1 class="glow">🔐 Insta Pass Reset API</h1>
      <p>Powerful API to send Instagram password reset links programmatically</p>
      <a href="/test" class="test-btn">Live Test Page →</a>
    </header>
    <section>
      <h2>✨ Features</h2>
      <div class="grid">
        <div class="card">
          <h3>⚡ Fast & Reliable</h3>
          <p>Built on Vercel's serverless platform for lightning-fast response times globally.</p>
        </div>
        <div class="card">
          <h3>🔒 Secure</h3>
          <p>Proper masking of sensitive information in responses for privacy protection.</p>
        </div>
        <div class="card">
          <h3>📧 Flexible Input</h3>
          <p>Send reset links using either Instagram username or registered email address.</p>
        </div>
        <div class="card">
          <h3>📊 Detailed Responses</h3>
          <p>Comprehensive success and error responses with debugging information.</p>
        </div>
      </div>
    </section>
    <section>
      <h2>📚 API Endpoints</h2>
      <div class="endpoint">
        <div class="badge get">GET</div>
        <h3>/reset-password</h3>
        <p>Send an Instagram password reset link to a username or email.</p>
        <h4>Parameters</h4>
        <div class="code-block">
          <p>username - Instagram username (optional)</p>
          <p>mail - Instagram email (optional)</p>
          <p><em>Note: One of these parameters is required</em></p>
        </div>
        <h4>Example Requests</h4>
        <div class="code-block example">
          GET /reset-password?username=teamnobi
          <br>GET /reset-password?mail=example@email.com
        </div>
        <h4>Success Response</h4>
        <div class="code-block response">
{
  "status": "success",
  "message": "Password reset email sent successfully.",
  "≭ Requested By": "123.45.67.89",
  "≭ Bot By / Dev": "@nobi_shops",
  "≭ Time Taken": "1.23 seconds",
  "≭ Password Reset Sent To": "t*****i@example.com"
}
        </div>
        <h4>Error Response</h4>
        <div class="code-block response error">
{
  "status": "failed",
  "message": "❌ Failed to send reset link.",
  "reason": "No user found with that username or email.",
  "≭ Time Taken": "0.45 seconds",
  "≭ Suggestions": [
    "Verify the username or email is correct.",
    "Try using an email address instead of a username, or vice versa."
  ]
}
        </div>
      </div>
    </section>
    <section>
      <h2>🚀 Getting Started</h2>
      <div class="card">
        <h3>Quick Integration</h3>
        <p>Here's how to use the API in your JavaScript code:</p>
        <div class="code-block">
async function sendResetLink(input) {
  const param = input.includes('@') ? 'mail' : 'username';
  const response = await fetch('/reset-password?' + param + '=' + encodeURIComponent(input));
  const data = await response.json();
  console.log(data);
}
sendResetLink('teamnobi');
// or
sendResetLink('example@email.com');
        </div>
      </div>
    </section>
    <footer>
      <p>Made with ❤️ by @nobi_shops | Powered by Vercel</p>
    </footer>
  </div>
</body>
</html>`;
    return createHTMLResponse(docsPage);
  }

  // Live Test Page
  if (url.pathname === '/test') {
    const testPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔐 Insta Pass Reset API - Live Test</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Orbitron:wght@700&family=Poppins:wght@300;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #8338ec;
      --secondary: #3a86ff;
      --dark: #1a1a2e;
      --light: #f8f9fa;
      --success: #06d6a0;
      --danger: #ef476f;
      --warning: #ffd166;
    }
    body {
      font-family: 'Poppins', sans-serif;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      color: var(--light);
      line-height: 1.6;
      margin: 0;
      padding: 0;
      min-height: 100vh;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    header {
      text-align: center;
      margin-bottom: 2rem;
      padding: 2rem 0;
    }
    h1, h2, h3 {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      background: linear-gradient(to right, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      font-family: 'Orbitron', sans-serif;
      text-shadow: 0 0 10px rgba(131, 56, 236, 0.3);
    }
    .test-form {
      background: rgba(26, 26, 46, 0.7);
      border-radius: 15px;
      padding: 2rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 2rem;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: bold;
      color: var(--secondary);
    }
    input[type="text"] {
      width: 100%;
      padding: 0.8rem;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(0, 0, 0, 0.3);
      color: white;
      font-family: 'Poppins', sans-serif;
      font-size: 1rem;
      transition: all 0.3s ease;
    }
    input[type="text"]:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(131, 56, 236, 0.3);
    }
    .btn {
      background: linear-gradient(to right, var(--primary), var(--secondary));
      color: white;
      padding: 0.8rem 1.5rem;
      border-radius: 50px;
      text-decoration: none;
      font-weight: bold;
      border: none;
      cursor: pointer;
      font-family: 'Montserrat', sans-serif;
      box-shadow: 0 4px 15px rgba(131, 56, 236, 0.4);
      transition: all 0.3s ease;
      font-size: 1rem;
      width: 100%;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(131, 56, 236, 0.6);
    }
    .result {
      background: rgba(26, 26, 46, 0.7);
      border-radius: 15px;
      padding: 2rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      margin-top: 2rem;
      display: none;
    }
    pre {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      padding: 1rem;
      overflow-x: auto;
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-family: monospace;
      white-space: pre-wrap;
    }
    .success {
      border-left: 4px solid var(--success);
    }
    .error {
      border-left: 4px solid var(--danger);
    }
    .loading {
      display: none;
      text-align: center;
      margin: 1rem 0;
    }
    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top: 4px solid var(--primary);
      width: 30px;
      height: 30px;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .docs-link {
      text-align: center;
      margin-top: 2rem;
    }
    .docs-link a {
      color: var(--secondary);
      text-decoration: none;
      transition: color 0.3s ease;
    }
    .docs-link a:hover {
      color: var(--primary);
      text-decoration: underline;
    }
    @media (max-width: 768px) {
      h1 {
        font-size: 2rem;
      }
      .container {
        padding: 1rem;
      }
      .test-form, .result {
        padding: 1.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🔐 Insta Pass Reset API</h1>
      <p>Live Test Interface</p>
    </header>
    <div class="test-form">
      <div class="form-group">
        <label for="input">Instagram Username or Email</label>
        <input type="text" id="input" placeholder="teamnobi or example@mail.com">
      </div>
      <button class="btn" onclick="testAPI()">Send Reset Link</button>
      <div class="loading" id="loading">
        <div class="spinner"></div>
        <p>Processing request...</p>
      </div>
    </div>
    <div class="result" id="result">
      <h3>API Response</h3>
      <pre id="response"></pre>
    </div>
    <div class="docs-link">
      <a href="/docs">← View Full Documentation</a>
      <br>
      <a href="/">← Back to Home</a>
    </div>
  </div>
  <script>
    async function testAPI() {
      const input = document.getElementById('input').value.trim();
      const resultDiv = document.getElementById('result');
      const responsePre = document.getElementById('response');
      const loadingDiv = document.getElementById('loading');
      
      if (!input) {
        alert('Please enter a username or email');
        return;
      }
      
      loadingDiv.style.display = 'block';
      resultDiv.style.display = 'none';
      
      try {
        const param = input.includes('@') ? 'mail' : 'username';
        const url = '/reset-password?' + param + '=' + encodeURIComponent(input);
        
        const response = await fetch(url);
        const data = await response.json();
        
        responsePre.textContent = JSON.stringify(data, null, 2);
        resultDiv.className = 'result ' + (data.status === 'success' ? 'success' : 'error');
        resultDiv.style.display = 'block';
      } catch (error) {
        responsePre.textContent = 'Error: ' + error.message;
        resultDiv.className = 'result error';
        resultDiv.style.display = 'block';
      } finally {
        loadingDiv.style.display = 'none';
      }
    }
    
    document.getElementById('input').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        testAPI();
      }
    });
  </script>
</body>
</html>`;
    return createHTMLResponse(testPage);
  }

  // Reset Password Route
  if (url.pathname === '/reset-password') {
    const startTime = Date.now();
    
    // Input validation and sanitization
    const input = (url.searchParams.get('username') || url.searchParams.get('mail') || '').trim();
    if (!input) {
      return res.status(400).set(corsHeaders).json({
        status: "failed",
        message: "Missing parameter: username or mail is required.",
        "≭ Time Taken": "0.00 seconds"
      });
    }

    // Enhanced input validation
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    const isUsername = /^[a-zA-Z0-9._]{1,30}$/.test(input);
    
    if (!isEmail && !isUsername) {
      return res.status(400).set(corsHeaders).json({
        status: "failed",
        message: "Invalid input: Provide a valid username or email.",
        "≭ Time Taken": "0.00 seconds"
      });
    }

    // Environment variables (add these in Vercel dashboard)
    const ENV = {
      CSRF_TOKEN: process.env.CSRF_TOKEN || 'lKqF2WKVCCn9Lu5kge7zGIgBrtRFcjRu',
      SESSION_ID: process.env.SESSION_ID || '76577379104%3ABgfcvHIY1DQmZf%3A13%3AAYcVfPQXwDugdeECuzpm4FpVimUSqbVllQfqsOMBgg',
      DS_USER_ID: process.env.DS_USER_ID || '76577379104',
      RUR: process.env.RUR || 'CCO\05476577379104\0541786096769:01fe2ce8022a1e662697b65ed66ecadd9832673f6774052875ec0d55479c41cdb8c333f3',
      IG_APP_ID: process.env.IG_APP_ID || '936619743392459',
      ASBD_ID: process.env.ASBD_ID || '129477'
    };

    // Function to get fresh CSRF token and cookies
    async function getInstagramTokens() {
      try {
        const response = await fetch('https://www.instagram.com/accounts/password/reset/', {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch reset page: ${response.status}`);
        }

        const html = await response.text();
        const setCookieHeaders = response.headers.get('set-cookie') || '';
        
        // Extract CSRF token from HTML
        let csrfToken = ENV.CSRF_TOKEN;
        const csrfMatch = html.match(/csrf_token":"([^"]+)"/);
        if (csrfMatch && csrfMatch[1]) {
          csrfToken = csrfMatch[1];
        }

        // Extract cookies
        const cookies = {};
        if (setCookieHeaders) {
          setCookieHeaders.split(',').forEach(cookie => {
            const [nameValue] = cookie.trim().split(';');
            if (nameValue) {
              const [name, value] = nameValue.split('=');
              if (name && value) {
                cookies[name.trim()] = value.trim();
              }
            }
          });
        }

        return { csrfToken, cookies };
      } catch (error) {
        console.error('Error getting Instagram tokens:', error);
        return { csrfToken: ENV.CSRF_TOKEN, cookies: {} };
      }
    }

    let csrfToken = ENV.CSRF_TOKEN;
    const baseHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://www.instagram.com',
      'Referer': 'https://www.instagram.com/accounts/password/reset/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'X-Requested-With': 'XMLHttpRequest'
    };

    // Build cookie string
    const cookieString = `datr=bSFDaFquU8O5Bthtj0VgVHA--; ig_did=D64F9750-706C-46CB-A1AA-874F3CC1B56F; mid=aEMhbQALAAFsGgbk_Uh9b9MvWrwx; ds_user_id=${ENV.DS_USER_ID}; ps_l=1; ps_n=1; csrftoken=${csrfToken}; sessionid=${ENV.SESSION_ID}; rur=${ENV.RUR}; wd=811x633`;

    const maxRetries = 3;
    let retryCount = 0;
    let response, json;

    // Main retry loop
    while (retryCount < maxRetries) {
      try {
        // Refresh tokens on retry
        if (retryCount > 0) {
          const tokens = await getInstagramTokens();
          csrfToken = tokens.csrfToken;
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        }

        const apiUrl = "https://www.instagram.com/api/v1/web/accounts/account_recovery_send_ajax/";
        
        const headers = {
          ...baseHeaders,
          'X-CSRFToken': csrfToken,
          'X-IG-App-ID': ENV.IG_APP_ID,
          'X-ASBD-ID': ENV.ASBD_ID,
          'X-IG-WWW-Claim': 'hmac.AR3GYR6M7qkLF-ksuxVbQaC5cJUvY9DzOkKYK6YQ2-rsBIyz',
          'X-Instagram-AJAX': '1014956690',
          'Cookie': cookieString.replace(`csrftoken=${ENV.CSRF_TOKEN}`, `csrftoken=${csrfToken}`)
        };

        const postData = new URLSearchParams({
          email_or_username: input,
          flow: 'fxcal'
        }).toString();

        response = await fetch(apiUrl, {
          method: 'POST',
          headers: headers,
          body: postData
        });

        const responseText = await response.text();
        
        try {
          json = JSON.parse(responseText);
        } catch (parseError) {
          if (responseText.includes('<html>')) {
            throw new Error('Instagram returned an error page. Session may be invalid.');
          }
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
        }

        if (response.status === 200 && json && json.status === 'ok') {
          break;
        }

        if (response.status === 403) {
          throw new Error('Access forbidden. CSRF token may be invalid or session expired.');
        }

        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after') || '60';
          throw new Error(`Rate limited. Try again after ${retryAfter} seconds.`);
        }

        if (response.status === 400 && json && json.message) {
          if (json.message.toLowerCase().includes('user') || 
              json.message.toLowerCase().includes('account') ||
              json.message.toLowerCase().includes('not found')) {
            break;
          }
        }

        retryCount++;
        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }

      } catch (error) {
        retryCount++;
        console.error(`Attempt ${retryCount} failed:`, error.message);
        
        if (retryCount >= maxRetries) {
          const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
          return res.status(500).set(corsHeaders).json({
            status: "failed",
            message: "❌ Failed to send reset link after multiple attempts.",
            reason: error.message,
            "≭ Time Taken": `${timeTaken} seconds`,
            "≭ Suggestions": [
              'Check your internet connection.',
              'Verify the username or email is correct.',
              'Try again in a few minutes.',
              'Session cookies may have expired - consider refreshing credentials.',
              'Instagram may be temporarily blocking requests.'
            ]
          });
        }
        
        const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
    const clientIp = req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || 'unknown';

    // Process successful response
    if (json && json.status === 'ok') {
      let maskedContact = maskEmailOrPhone(input);
      
      if (json.message) {
        const emailMatch = json.message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        const phoneMatch = json.message.match(/(\+?[\d\s-()]{10,})/);
        
        if (emailMatch && emailMatch[1]) {
          maskedContact = maskEmailOrPhone(emailMatch[1]);
        } else if (phoneMatch && phoneMatch[1]) {
          maskedContact = maskEmailOrPhone(phoneMatch[1]);
        }
      }

      return res.status(200).set(corsHeaders).json({
        status: "success",
        message: json.message || "Password reset email sent successfully.",
        "≭ Requested By": clientIp,
        "≭ Bot By / Dev": "@nobi_shops",
        "≭ Time Taken": `${timeTaken} seconds`,
        "≭ Password Reset Sent To": maskedContact
      });
    } else {
      let errorMessage = 'Unknown error occurred';
      let suggestions = [
        'Verify the username or email is correct.',
        'Try using an email address instead of a username, or vice versa.',
        'Ensure the Instagram account exists and has a valid email.',
        'Contact Instagram support if the issue persists.'
      ];

      if (json) {
        if (json.message) {
          errorMessage = json.message;
        } else if (json.errors) {
          errorMessage = Array.isArray(json.errors) ? json.errors.join(', ') : json.errors;
        } else if (json.error_title) {
          errorMessage = json.error_title;
        }
        
        if (errorMessage.toLowerCase().includes('user') || 
            errorMessage.toLowerCase().includes('account') ||
            errorMessage.toLowerCase().includes('not found')) {
          suggestions = [
            'Double-check the username or email spelling.',
            'Ensure the Instagram account exists.',
            'Try using the email address associated with the account.',
            'The account might be deactivated or deleted.'
          ];
        } else if (errorMessage.toLowerCase().includes('email')) {
          suggestions = [
            'Ensure the account has a valid email address registered.',
            'Try using the username instead of email.',
            'Check if the email is verified on Instagram.',
            'The account might not have an email associated.'
          ];
        } else if (errorMessage.toLowerCase().includes('rate') || 
                  errorMessage.toLowerCase().includes('limit')) {
          suggestions = [
            'Wait a few minutes before trying again.',
            'Too many requests have been made recently.',
            'Try again later when rate limits reset.',
            'Consider using a different IP address if possible.'
          ];
        }
      }

      return res.status(400).set(corsHeaders).json({
        status: "failed",
        message: "❌ Failed to send reset link.",
        reason: errorMessage,
        "≭ Time Taken": `${timeTaken} seconds`,
        "≭ Suggestions": suggestions
      });
    }
  }

  // Handle invalid routes
  return res.status(404).set(corsHeaders).json({
    status: "failed",
    message: "Route not found. Available endpoints: /, /docs, /test, /reset-password"
  });
};
