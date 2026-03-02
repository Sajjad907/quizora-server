const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * @desc    Send HTML notification to admin about new lead
 */
exports.sendLeadNotification = async ({ to, lead, quizTitle }) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 40px 30px 40px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 8px;">QUIZORA</div>
                    <div style="height: 2px; width: 40px; background: rgba(255,255,255,0.3); margin: 0 auto 20px auto;"></div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; line-height: 1.2;">New Lead Captured! 🚀</h1>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #475569;">
                      High five! Someone just finished your quiz <strong style="color: #1e293b;">"${quizTitle}"</strong>. Here are the details of your new potential customer:
                    </p>
                    
                    <div style="background-color: #f1f5f9; border-radius: 20px; padding: 30px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="padding-bottom: 20px;">
                            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Full Name</div>
                            <div style="font-size: 18px; font-weight: 700; color: #1e293b;">${lead.firstName || ''} ${lead.lastName || 'Guest'}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: 20px;">
                            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Email Address</div>
                            <div style="font-size: 18px; font-weight: 700; color: #4f46e5;">${lead.email}</div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Outcome Matched</div>
                            <div style="font-size: 18px; font-weight: 700; color: #1e293b; background: #ffffff; display: inline-block; padding: 4px 12px; border-radius: 8px; border: 1px solid #e2e8f0;">${lead.finalOutcomeTitle || 'Completed'}</div>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <div style="text-align: center;">
                      <a href="https://quizora-admin.vercel.app/leads" style="display: inline-block; background: #1e293b; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; transition: all 0.2s shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">View Leads Dashboard</a>
                    </div>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding: 0 40px 40px 40px; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.5;">
                      You received this because email notifications are enabled for your account.<br>
                      © 2026 Quizora Intelligence Platform. All rights reserved.
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

    const mailOptions = {
      from: `"Quizora Alerts" <${process.env.EMAIL_FROM}>`,
      to: Array.isArray(to) ? to.join(",") : to,
      subject: `🔥 New Lead: ${lead.email} matched in ${quizTitle}`,
      html: htmlContent,
    };

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      return await transporter.sendMail(mailOptions);
    } else {
      console.log("--- EMAIL MOCK ---");
      return { status: "mocked" };
    }
  } catch (error) {
    console.error("Email Service Error:", error);
    return { error: error.message };
  }
};

/**
 * @desc    Send HTML result to the user who took the quiz
 */
exports.sendLeadResult = async ({ to, lead, quizTitle, outcome, products }) => {
  try {
    const productsHtml = products && products.length > 0 
      ? products.map(p => `
          <!-- Product Tile -->
          <div style="display: inline-block; width: 250px; margin: 10px; background-color: #ffffff; border-radius: 20px; border: 1px solid #f1f5f9; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); text-align: left; vertical-align: top;">
            ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.title}" style="width: 100%; height: 180px; object-fit: cover; display: block;" />` : ''}
            <div style="padding: 20px;">
              <h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px; font-weight: 800; height: 40px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${p.title}</h4>
              <div style="color: #6366f1; font-weight: 800; font-size: 18px;">${p.price || 'View Details'}</div>
            </div>
          </div>
        `).join('')
      : '<div style="text-align: center; padding: 40px; background: #f8fafc; border-radius: 20px; color: #64748b; font-style: italic;">We couldn\'t find specific products for your match, but explore our collections for more!</div>';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px 40px; text-align: center;">
                    <div style="font-size: 14px; font-weight: 800; color: #6366f1; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">${quizTitle}</div>
                    <h1 style="margin: 0; color: #1e293b; font-size: 32px; font-weight: 800; line-height: 1.2; letter-spacing: -1px;">Your Personalized Match is Ready! ✨</h1>
                  </td>
                </tr>
                
                <!-- Main Outcome Card -->
                <tr>
                  <td style="padding: 0 40px 40px 40px;">
                    <div style="background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%); padding: 40px; border-radius: 24px; border: 2px solid #6366f1; text-align: center;">
                      <div style="display: inline-block; padding: 6px 16px; background: rgba(99,102,241,0.1); color: #6366f1; border-radius: 100px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">Top Match</div>
                      <h2 style="font-size: 32px; font-weight: 900; color: #1e293b; margin: 0 0 16px 0; line-height: 1.1;">${outcome.title || 'Your Result'}</h2>
                      ${outcome.description ? `<p style="color: #475569; line-height: 1.6; margin: 0; font-size: 16px;">${outcome.description}</p>` : ''}
                    </div>
                  </td>
                </tr>
                
                <!-- Products Grid -->
                <tr>
                  <td style="padding: 0 30px 40px 30px; text-align: center;">
                    <h3 style="color: #1e293b; font-size: 20px; font-weight: 800; margin: 0 0 10px 0; text-align: left; padding: 0 10px;">
                      Recommended for You 
                    </h3>
                    <p style="margin: 0 0 24px 0; font-size: 14px; color: #94a3b8; text-align: left; padding: 0 10px;">Handpicked products that match your profile.</p>
                    
                    <div style="text-align: center;">
                      ${productsHtml}
                    </div>
                  </td>
                </tr>
                
                <!-- CTA -->
                <tr>
                  <td style="padding: 0 40px 60px 40px; text-align: center;">
                    <div style="padding: 40px; background-color: #f8fafc; border-radius: 24px; border: 1px dashed #e2e8f0;">
                      <h4 style="margin: 0 0 12px 0; color: #1e293b; font-size: 18px; font-weight: 800;">Want to explore more?</h4>
                      <p style="margin: 0 0 24px 0; color: #64748b; font-size: 14px;">Shop our full collection based on your unique skin profile.</p>
                      <a href="#" style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 16px; font-weight: 800; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);">Visit Our Store</a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #1e293b; padding: 40px; text-align: center;">
                    <div style="font-size: 18px; font-weight: 800; color: #ffffff; margin-bottom: 10px;">QUIZORA</div>
                    <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin-bottom: 24px;">
                      Generated with AI-powered skin analysis by Quizora.<br>
                      If you have any questions, just reply to this email.
                    </p>
                    <div style="height: 1px; background: rgba(255,255,255,0.1); margin-bottom: 24px;"></div>
                    <p style="color: #64748b; font-size: 11px; margin: 0;">
                      © 2026 Quizora Intelligence Platform. All rights reserved.<br>
                      You received this because you completed a quiz on one of our partner stores.
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

    const mailOptions = {
      from: `"Quizora" <${process.env.EMAIL_FROM}>`,
      to: to,
      subject: `✨ Your ${quizTitle} Results: ${outcome.title}`,
      html: htmlContent,
    };

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      return await transporter.sendMail(mailOptions);
    } else {
      console.log("--- USER RESULT EMAIL MOCK ---");
      return { status: "mocked" };
    }
  } catch (error) {
    console.error("User Email Result Error:", error);
    return { error: error.message };
  }
};


