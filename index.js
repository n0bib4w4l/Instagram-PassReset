const express = require('express');
const axios = require('axios');

const app = express();

app.get('/insta-reset', async (req, res) => {
  const username = req.query.username?.trim();
  const mail = req.query.mail?.trim();

  if (!username && !mail) {
    return res.status(400).send("❌ Error: Provide ?username=USERNAME or ?mail=EMAIL");
  }

  const loginOrMail = username || mail;

  try {
    // Instagram password reset AJAX endpoint
    const url = 'https://www.instagram.com/api/v1/web/accounts/account_recovery_send_ajax/';

    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
      "X-CSRFToken": "VihZjKuiwi9a7QoiHm7p3VUaWsrUZT9w",  // This token is often required, might need updating in real use
      "Referer": "https://www.instagram.com/accounts/password/reset/",
      "X-Requested-With": "XMLHttpRequest",
      // Cookies are sometimes required, update as per session if needed
      "Cookie": "mid=Z-ajEgALAAGJkoXjxeU4zcKwv2hv; ig_did=A1AE3F95-E2DB-40E0-B6C0-B1297A03102D; csrftoken=VihZjKuiwi9a7QoiHm7p3VUaWsrUZT9w;",
      "Content-Type": "application/x-www-form-urlencoded"
    };

    // POST data
    const data = new URLSearchParams();
    data.append('email_or_username', loginOrMail);
    data.append('recaptcha_challenge_field', '');

    const response = await axios.post(url, data.toString(), { headers, decompress: true });

    const json = response.data;

    if (json.status === 'ok') {
      const maskedEmail = json.obfuscated_email || null;
      const maskedPhone = json.phone_number || null;
      const contact = maskedEmail || maskedPhone || 'Unknown';

      return res.send(
        `• Password Reset Link Sent Successfully! ✅\n\n` +
        `≭ Email / Phone Associated: ${contact}\n` +
        `≭ Requested For: ${loginOrMail}\n` +
        `≭ Message: We sent an email or SMS with a link to get back into your account.`
      );
    } else {
      return res.status(400).send(`❌ Failed to send reset link. Reason: ${json.message || 'Unknown error'}`);
    }
  } catch (error) {
    return res.status(500).send(`❌ Request error: ${error.message}`);
  }
});

// Run server only if called directly
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Instagram password reset API listening on port ${port}`);
  });
}

module.exports = app;
