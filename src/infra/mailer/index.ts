import axios from "axios";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

interface SendInviteEmailParams {
  from: string;
  to: string;
  formTitle: string;
  link: string;
}

function buildHtml({ from, to, formTitle, link }: SendInviteEmailParams) {
  return `
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background-color:#f6f5fb;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f5fb; padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:#ffffff; border-radius:12px; border:1px solid #e5e3f0; overflow:hidden;">

            <tr>
              <td style="padding:28px 32px; border-bottom:1px solid #f0eefa;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:28px; height:28px; border-radius:8px; background-color:#7c3aed; text-align:center; vertical-align:middle; font-size:14px;">
                      <span style="color:#ffffff; font-weight:700;">✦</span>
                    </td>
                    <td style="padding-left:10px; font-size:15px; font-weight:600; color:#18132e; font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
                      Atlas Forms
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:32px; font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
                <p style="margin:0 0 4px; font-size:13px; color:#8b87a3;">You've received a form invitation</p>
                <h1 style="margin:0 0 16px; font-size:20px; line-height:1.4; color:#18132e; font-weight:600;">
                  ${from} invited you to fill out<br />&ldquo;${formTitle}&rdquo;
                </h1>
                <p style="margin:0 0 24px; font-size:14px; line-height:1.6; color:#544f6b;">
                  This link is unique to <strong>${to}</strong> and can only be submitted once — once you send your
                  response, the link stops working, so please complete it in one sitting.
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:8px; background-color:#7c3aed;">
                      <a href="${link}"
                        style="display:inline-block; padding:12px 24px; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:8px;">
                        Fill out the form
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:28px 0 0; font-size:12px; line-height:1.6; color:#a7a3ba;">
                  Or paste this link into your browser:<br />
                  <a href="${link}" style="color:#7c3aed; word-break:break-all;">${link}</a>
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 32px; background-color:#faf9fd; border-top:1px solid #f0eefa;">
                <p style="margin:0; font-size:12px; line-height:1.6; color:#a7a3ba; font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
                  Sent via Atlas Forms. If you weren't expecting this invitation, you can safely ignore this email.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}

function buildText({ from, to, formTitle, link }: SendInviteEmailParams) {
  return `${from} invited you to fill out "${formTitle}"

This link is unique to ${to} and can only be submitted once — it stops working after you respond, so please complete it in one sitting.

Open the form: ${link}

Sent via Atlas Forms. If you weren't expecting this invitation, you can safely ignore this email.`;
}

export async function sendInviteEmail(params: SendInviteEmailParams) {
  const { to, formTitle, from } = params;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME ?? "Atlas Forms";
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey || !senderEmail) {
    throw new Error("brevo_not_configured");
  }

  await axios.post(
    BREVO_ENDPOINT,
    {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject: `${from} invited you to fill out "${formTitle}"`,
      htmlContent: buildHtml(params),
      textContent: buildText(params),
    },
    { headers: { "api-key": apiKey, "Content-Type": "application/json" } }
  );
}
