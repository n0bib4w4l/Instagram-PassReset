import axios from 'axios';
import qs from 'qs';

export default async function handler(req, res) {
    const { username, mail } = req.query;

    if (!username && !mail) {
        return res.status(400).json({ success: false, error: 'Provide ?username=USERNAME or ?mail=EMAIL' });
    }

    const username_or_email = username ? username.trim() : mail.trim();

    const startTime = Date.now();

    try {
        const response = await axios.post(
            'https://www.instagram.com/api/v1/web/accounts/account_recovery_send_ajax/',
            qs.stringify({
                email_or_username: username_or_email,
                recaptcha_challenge_field: ''
            }),
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
                    'X-CSRFToken': 'VihZjKuiwi9a7QoiHm7p3VUaWsrUZT9w',
                    'Referer': 'https://www.instagram.com/accounts/password/reset/',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Cookie': 'mid=Z-ajEgALAAGJkoXjxeU4zcKwv2hv; ig_did=A1AE3F95-E2DB-40E0-B6C0-B1297A03102D; csrftoken=VihZjKuiwi9a7QoiHm7p3VUaWsrUZT9w; ds_user_id=74837220727; sessionid=74837220727%3APY6244MH2BKl7c%3A18%3AAYclOXI-9zaMvyYbOj-4owDlNImX4rhh8unEzogzHQ;'
                }
            }
        );

        const data = response.data;

        if (data.status === 'ok') {
            const masked_email = data.obfuscated_email || null;
            const masked_phone = data.obfuscated_phone || null;
            const phone_number = data.phone_number || null;

            const contact_info = masked_email || masked_phone || phone_number || 'Unknown';
            const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);

            return res.status(200).json({
                success: true,
                contact_info: contact_info,
                time_taken: `${elapsedTime} seconds`,
                requested_by: "Kunal×͜×",
                bot_by: "@luciInVain"
            });
        } else {
            const errorMsg = data.message || 'Unknown error';
            return res.status(200).json({
                success: false,
                error: errorMsg
            });
        }

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
}

