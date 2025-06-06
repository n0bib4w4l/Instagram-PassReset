const express = require('express');
const axios = require('axios');
const qs = require('qs');

const app = express();

// ✅ Home Route - Displays API Usage
app.get('/', (req, res) => {
  res.send(`
    <h2>🔐 Insta Pass Reset API</h2>
    <p>This API allows you to send an Instagram password reset link.</p>
    <h3>📌 Endpoints:</h3>
    <ul>
      <li><code>GET /reset-password?username=your_instagram_username</code></li>
      <li><code>GET /reset-password?mail=your_instagram_email</code></li>
    </ul>
    <h3>🧪 Example:</h3>
    <p><code>/reset-password?username=teamnobi</code></p>
    <hr>
    <p>Made with ❤️ by @nobi_shops</p>
  `);
});

function maskEmailOrPhone(text) {
  if (text.includes('@')) {
    const [user, domain] = text.split('@');
    const len = user.length;
    let maskedUser;
    if (len <= 2) {
      maskedUser = user[0] + '*'.repeat(Math.max(0, len - 1));
    } else {
      maskedUser = user[0] + '*'.repeat(len - 2) + user[len - 1];
    }
    return maskedUser + '@' + domain;
  } else {
    const len = text.length;
    if (len <= 4) {
      return '*'.repeat(len);
    }
    return '*'.repeat(len - 4) + text.slice(len - 4);
  }
}

app.get('/reset-password', async (req, res) => {
  const startTime = process.hrtime();

  const input = req.query.username || req.query.mail;
  if (!input) {
    return res.status(400).json({
      status: "failed",
      message: "Missing parameter: username or mail is required."
    });
  }

  const url = "https://www.instagram.com/api/v1/web/accounts/account_recovery_send_ajax/";
  const headers = {
    // trimmed for brevity – keep your original headers here
    'user-agent': 'Mozilla/5.0 ...',
    cookie: 'datr=...; rur=...'
  };

  const postData = qs.stringify({
    email_or_username: input,
    flow: 'fxcal'
  });

  try {
    const response = await axios.post(url, postData, { headers });
    const json = response.data;

    const timeTaken = process.hrtime(startTime);
    const secondsTaken = (timeTaken[0] + timeTaken[1] / 1e9).toFixed(2);

    let maskedContact = maskEmailOrPhone(input);
    const emailMatch = json.message?.match(/email to ([^ ]+) with/);
    const phoneMatch = json.message?.match(/phone number ([^ ]+) with/);
    if (emailMatch?.[1]) maskedContact = emailMatch[1];
    if (phoneMatch?.[1]) maskedContact = phoneMatch[1];

    if (json.status === 'ok' && json.message) {
      res.json({
        status: "success",
        message: json.message,
        "≭ Requested By": req.ip || 'Unknown',
        "≭ Bot By / Dev": "@nobi_shops",
        "≭ Time Taken": `${secondsTaken} seconds`,
        "≭ Password Reset Sent To": maskedContact
      });
    } else {
      res.json({
        status: "failed",
        message: "❌ Failed to send reset link.",
        reason: json.message || 'Unknown error',
        "≭ Time Taken": `${secondsTaken} seconds`
      });
    }
  } catch (error) {
    res.json({
      status: "failed",
      message: "Request error: " + error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
