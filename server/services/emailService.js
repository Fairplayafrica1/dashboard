// const nodemailer = require('nodemailer');
// const dotenv = require('dotenv');
// dotenv.config();
// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
//   family: 4, // force IPv4
// });

const dotenv = require('dotenv');
dotenv.config();
const { Resend } = require('resend');
const nodemailer = require('nodemailer');

const resend = new Resend(process.env.RESEND_API_KEY);

// Gmail fallback transporter using port 465 (SSL)
const gmailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4,
});



const sendEmail = async ({ to, subject, html }) => {
  // try Resend first, fall back to Gmail
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'FairPlay Africa <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    if (error) throw new Error(error.message);
    console.log('Email sent via Resend to:', to);
    return data;
  } catch (resendError) {
    console.log('Resend failed, trying Gmail:', resendError.message);
    try {
      await gmailTransporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
      });
      console.log('Email sent via Gmail to:', to);
    } catch (gmailError) {
      console.error('Gmail also failed:', gmailError.message);
      throw gmailError;
    }
  }
};

const sendTakedownEmail = async ({ to, ownerName, movieTitle, youtubeVideoUrl, youtubeChannel }) => {
  const dmcaBody = `
Dear YouTube Copyright Team,

I am writing to report a copyright infringement under the Digital Millennium Copyright Act (DMCA).

I am the original creator and copyright owner of the film titled "${movieTitle}". 
I have discovered that this content has been uploaded without my authorization to the following URL:

Infringing URL: ${youtubeVideoUrl}
Channel: ${youtubeChannel}

I have a good faith belief that the use of the material is not authorized by the copyright owner, 
its agent, or the law.

I request that you immediately remove or disable access to the infringing material.

Signed,
${ownerName}
  `.trim();

  await sendEmail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `DMCA Takedown Notice — ${movieTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #111A18; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h2 style="color: #1B9E85; margin: 0;">FairPlay Africa</h2>
          <p style="color: #6B8F82; margin: 8px 0 0;">Takedown Notice Ready</p>
        </div>
        <p style="color: #333;">Hi ${ownerName},</p>
        <p style="color: #333;">Your DMCA takedown notice for <strong>${movieTitle}</strong> has been prepared. 
        Copy the text below and submit it to YouTube's copyright complaint form at 
        <a href="https://www.youtube.com/copyright_complaint_form">youtube.com/copyright_complaint_form</a>.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #1B9E85;">
          <pre style="white-space: pre-wrap; font-family: sans-serif; color: #333; margin: 0;">${dmcaBody}</pre>
        </div>
        <p style="color: #333; margin-top: 24px;">
          <strong>Infringing video:</strong> <a href="${youtubeVideoUrl}">${youtubeVideoUrl}</a>
        </p>
        <hr style="border: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">FairPlay Africa — Protecting African filmmakers</p>
      </div>
    `,
  });
};

const sendWelcomeEmail = async ({ to, name }) => {
  await sendEmail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Welcome to FairPlay Africa',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #111A18; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h2 style="color: #1B9E85; margin: 0;">FairPlay Africa</h2>
        </div>
        <p style="color: #333;">Hi ${name},</p>
        <p style="color: #333;">Welcome to FairPlay Africa! Your account is ready.</p>
        <p style="color: #333;">Start by uploading your first movie and we'll automatically scan YouTube for pirated copies.</p>
        <a href="${process.env.CLIENT_URL}/dashboard" 
          style="display: inline-block; background: #1B9E85; color: white; padding: 12px 24px; 
          border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
          Go to Dashboard
        </a>
        <hr style="border: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">FairPlay Africa — Protecting African filmmakers</p>
      </div>
    `,
  });
};
const sendFraudAlertEmail = async ({
  fraudUserName, fraudUserEmail,
  originalOwnerName, originalOwnerEmail,
  movieTitle, ownerCode, fraudFlags, accountStatus,
}) => {
  await sendEmail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_USER, // sends to you (admin)
    subject: `🚨 Fraud Detected — ${fraudUserName} uploaded protected content`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #7f1d1d; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h2 style="color: #fca5a5; margin: 0;">🚨 Fraud Alert — FairPlay Africa</h2>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; color: #666; width: 40%;">Fraudulent User</td>
            <td style="padding: 10px; color: #333;"><strong>${fraudUserName}</strong> (${fraudUserEmail})</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; color: #666;">Original Owner</td>
            <td style="padding: 10px; color: #333;"><strong>${originalOwnerName}</strong> (${originalOwnerEmail})</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; color: #666;">Movie Title</td>
            <td style="padding: 10px; color: #333;">${movieTitle}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; color: #666;">Owner Code</td>
            <td style="padding: 10px; color: #333; font-family: monospace;">${ownerCode}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; color: #666;">Fraud Flags</td>
            <td style="padding: 10px; color: #e11d48;">${fraudFlags} flag(s)</td>
          </tr>
          <tr>
            <td style="padding: 10px; color: #666;">Account Status</td>
            <td style="padding: 10px; color: ${accountStatus === 'banned' ? '#e11d48' : '#f59e0b'};">
              <strong>${accountStatus.toUpperCase()}</strong>
            </td>
          </tr>
        </table>
        <div style="margin-top: 24px; padding: 16px; background: #fef3c7; border-radius: 8px;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            Log into your admin panel to review and take action on this account.
          </p>
        </div>
      </div>
    `,
  });
};
const sendVerificationRequestEmail = async ({ adminEmail, userName, userEmail, movieTitle, evidenceUrl }) => {
  await sendEmail({
    from: process.env.EMAIL_FROM,
    to: adminEmail,
    subject: `📋 Ownership Verification Request — ${movieTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #111A18; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h2 style="color: #1B9E85; margin: 0;">FairPlay Africa</h2>
          <p style="color: #6B8F82; margin: 8px 0 0;">Ownership Verification Request</p>
        </div>
        <p style="color: #333;"><strong>${userName}</strong> (${userEmail}) has submitted ownership evidence for:</p>
        <p style="color: #333; font-size: 18px;"><strong>${movieTitle}</strong></p>
        <a href="${evidenceUrl}" style="display: inline-block; background: #1B9E85; color: white; 
          padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          View Evidence
        </a>
        <p style="color: #666; font-size: 13px;">Log into your admin panel to approve or reject this request.</p>
      </div>
    `,
  });
};
const sendVerificationApprovedEmail = async ({ to, name }) => {
  await sendEmail({
    from: process.env.EMAIL_FROM,
    to,
    subject: '✅ Ownership Verified — FairPlay Africa',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #111A18; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h2 style="color: #1B9E85; margin: 0;">FairPlay Africa</h2>
        </div>
        <p style="color: #333;">Hi ${name},</p>
        <p style="color: #333;">Your ownership has been <strong style="color: #16a34a;">verified</strong>. 
        Your account now has full protection privileges on FairPlay Africa.</p>
        <a href="${process.env.CLIENT_URL}/dashboard" 
          style="display: inline-block; background: #1B9E85; color: white; padding: 12px 24px; 
          border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
          Go to Dashboard
        </a>
      </div>
    `,
  });
};

const sendVerificationRejectedEmail = async ({ to, name, note }) => {
  await sendEmail({
    from: process.env.EMAIL_FROM,
    to,
    subject: '❌ Ownership Verification — Additional Information Required',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #111A18; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h2 style="color: #1B9E85; margin: 0;">FairPlay Africa</h2>
        </div>
        <p style="color: #333;">Hi ${name},</p>
        <p style="color: #333;">We were unable to verify your ownership at this time.</p>
        ${note ? `<div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; color: #92400e;"><strong>Reason:</strong> ${note}</p>
        </div>` : ''}
        <p style="color: #333;">Please upload additional evidence and resubmit for review.</p>
        <a href="${process.env.CLIENT_URL}/dashboard/upload" 
          style="display: inline-block; background: #1B9E85; color: white; padding: 12px 24px; 
          border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
          Upload Evidence
        </a>
      </div>
    `,
  });
};


const sendVerificationEmail = async ({ to, name, token }) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail({
    from: process.env.EMAIL_FROM,
    to,
    subject: '✉️ Verify your FairPlay Africa email',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #111A18; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h2 style="color: #1B9E85; margin: 0;">FairPlay Africa</h2>
        </div>
        <p style="color: #333;">Hi ${name},</p>
        <p style="color: #333;">Click the button below to verify your email address. This link expires in 24 hours.</p>
        <a href="${verifyUrl}"
          style="display: inline-block; background: #1B9E85; color: white; padding: 14px 28px;
          border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          Verify Email Address
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          If you didn't create this account, ignore this email.
        </p>
      </div>
    `,
  });
};


const sendAppealDecisionEmail = async ({ to, name, status, adminNote, appealType }) => {
  const isApproved = status === 'approved';
  const typeLabels = {
    fraud_flag: 'Fraud flag dispute',
    suspension: 'Account suspension',
    ban: 'Account ban',
    false_infringement: 'False infringement claim',
  };

  await sendEmail({
    from: process.env.EMAIL_FROM,
    to,
    subject: isApproved
      ? '✅ Your Appeal Has Been Approved — FairPlay Africa'
      : '❌ Appeal Decision — FairPlay Africa',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #111A18; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h2 style="color: #1B9E85; margin: 0;">FairPlay Africa</h2>
          <p style="color: #6B8F82; margin: 8px 0 0;">Appeal Decision</p>
        </div>

        <p style="color: #333;">Hi ${name},</p>
        <p style="color: #333;">
          We have reviewed your appeal regarding: <strong>${typeLabels[appealType] || appealType}</strong>
        </p>

        <div style="padding: 20px; border-radius: 12px; margin: 20px 0;
          background: ${isApproved ? '#f0fdf4' : '#fef2f2'};
          border-left: 4px solid ${isApproved ? '#22C55E' : '#EF4444'};">
          <p style="margin: 0; font-size: 18px; font-weight: bold;
            color: ${isApproved ? '#16a34a' : '#dc2626'};">
            ${isApproved ? '✓ Appeal Approved' : '✗ Appeal Rejected'}
          </p>
          <p style="margin: 8px 0 0; color: #555;">
            ${isApproved
              ? 'Your account has been fully reinstated. You can now log in and access all features.'
              : 'After careful review, we were unable to approve your appeal at this time.'}
          </p>
        </div>

        ${adminNote ? `
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; font-weight: bold; color: #333;">Decision Note:</p>
          <p style="margin: 8px 0 0; color: #555;">${adminNote}</p>
        </div>
        ` : ''}

        ${isApproved ? `
        <a href="${process.env.CLIENT_URL}/dashboard"
          style="display: inline-block; background: #1B9E85; color: white; padding: 14px 28px;
          border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          Go to Dashboard
        </a>
        ` : `
        <p style="color: #555;">
          If you believe this decision is incorrect, you may submit a new appeal with
          additional evidence or contact us at
          <a href="mailto:appeals@fairplayafrica.com" style="color: #1B9E85;">
            appeals@fairplayafrica.com
          </a>
        </p>
        `}

        <hr style="border: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">FairPlay Africa — Protecting African filmmakers</p>
      </div>
    `,
  });
};

module.exports = { sendTakedownEmail, sendWelcomeEmail, sendFraudAlertEmail, sendVerificationRequestEmail, sendVerificationApprovedEmail, sendVerificationRejectedEmail, sendVerificationEmail, sendAppealDecisionEmail };


// const dotenv = require('dotenv');
// dotenv.config();
// const { Resend } = require('resend');

// const resend = new Resend(process.env.RESEND_API_KEY);

// const sendEmail = async ({ to, subject, html }) => {
//   const { data, error } = await resend.emails.send({
//     from: process.env.EMAIL_FROM || 'FairPlay Africa <onboarding@resend.dev>',
//     to,
//     subject,
//     html,
//   });

//   if (error) {
//     console.error('Resend error:', error);
//     throw new Error(error.message);
//   }

//   return data;
// };


// const dotenv = require('dotenv');
// dotenv.config();
// const { Resend } = require('resend');
// const nodemailer = require('nodemailer');

// const resend = new Resend(process.env.RESEND_API_KEY);

// // Gmail fallback transporter using port 465 (SSL)
// const gmailTransporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure: true, // SSL
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   family: 4,
// });

// const sendEmail = async ({ to, subject, html }) => {
//   // try Resend first, fall back to Gmail
//   try {
//     const { data, error } = await resend.emails.send({
//       from: process.env.EMAIL_FROM || 'FairPlay Africa <onboarding@resend.dev>',
//       to,
//       subject,
//       html,
//     });
//     if (error) throw new Error(error.message);
//     console.log('Email sent via Resend to:', to);
//     return data;
//   } catch (resendError) {
//     console.log('Resend failed, trying Gmail:', resendError.message);
//     try {
//       await gmailTransporter.sendMail({
//         from: process.env.EMAIL_FROM,
//         to,
//         subject,
//         html,
//       });
//       console.log('Email sent via Gmail to:', to);
//     } catch (gmailError) {
//       console.error('Gmail also failed:', gmailError.message);
//       throw gmailError;
//     }
//   }
// };

// const sendWelcomeEmail = async ({ to, name }) => {
//   await sendEmail({
//     to,
//     subject: 'Welcome to FairPlay Africa',
//     html: `
//       <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: #111A18; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
//           <h2 style="color: #1B9E85; margin: 0;">FairPlay Africa</h2>
//         </div>
//         <p style="color: #333;">Hi ${name},</p>
//         <p style="color: #333;">Welcome to FairPlay Africa! Your account is ready.</p>
//         <p style="color: #333;">Start by uploading your first movie and we'll automatically scan YouTube for pirated copies.</p>
//         <a href="${process.env.CLIENT_URL}/dashboard"
//           style="display: inline-block; background: #1B9E85; color: white; padding: 12px 24px;
//           border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
//           Go to Dashboard
//         </a>
//         <hr style="border: 1px solid #eee; margin: 24px 0;" />
//         <p style="color: #999; font-size: 12px;">FairPlay Africa — Protecting African filmmakers</p>
//       </div>
//     `,
//   });
// };

// const sendVerificationEmail = async ({ to, name, token }) => {
//   const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
//   await sendEmail({
//     to,
//     subject: '✉️ Verify your FairPlay Africa email',
//     html: `
//       <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: #111A18; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
//           <h2 style="color: #1B9E85; margin: 0;">FairPlay Africa</h2>
//         </div>
//         <p style="color: #333;">Hi ${name},</p>
//         <p style="color: #333;">Click the button below to verify your email address. This link expires in 72 hours.</p>
//         <a href="${verifyUrl}"
//           style="display: inline-block; background: #1B9E85; color: white; padding: 14px 28px;
//           border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
//           Verify Email Address
//         </a>
//         <p style="color: #999; font-size: 12px; margin-top: 24px;">
//           If you didn't create this account, ignore this email.
//         </p>
//         <hr style="border: 1px solid #eee; margin: 24px 0;" />
//         <p style="color: #999; font-size: 12px;">FairPlay Africa — Protecting African filmmakers</p>
//       </div>
//     `,
//   });
// };

// const sendTakedownEmail = async ({ to, ownerName, movieTitle, youtubeVideoUrl, youtubeChannel }) => {
//   const dmcaBody = `
// Dear YouTube Copyright Team,

// I am the original creator and copyright owner of "${movieTitle}".
// This content has been uploaded without my authorization to: ${youtubeVideoUrl}
// Channel: ${youtubeChannel}

// I request immediate removal of this infringing content.

// Signed, ${ownerName}
//   `.trim();

//   await sendEmail({
//     to,
//     subject: `DMCA Takedown Notice — ${movieTitle}`,
//     html: `
//       <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: #111A18; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
//           <h2 style="color: #1B9E85; margin: 0;">FairPlay Africa</h2>
//           <p style="color: #6B8F82; margin: 8px 0 0;">Takedown Notice Ready</p>
//         </div>
//         <p style="color: #333;">Hi ${ownerName},</p>
//         <p style="color: #333;">Your DMCA takedown notice for <strong>${movieTitle}</strong> has been prepared.</p>
//         <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #1B9E85;">
//           <pre style="white-space: pre-wrap; font-family: sans-serif; color: #333; margin: 0;">${dmcaBody}</pre>
//         </div>
//         <hr style="border: 1px solid #eee; margin: 24px 0;" />
//         <p style="color: #999; font-size: 12px;">FairPlay Africa — Protecting African filmmakers</p>
//       </div>
//     `,
//   });
// };

// const sendTakedownConfirmationEmail = async ({
//   to, ownerName, movieTitle, youtubeVideoUrl,
//   youtubeChannel, referenceId, ownerCode,
// }) => {
//   await sendEmail({
//     to,
//     subject: `✅ Takedown Submitted — ${movieTitle}`,
//     html: `
//       <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: #111A18; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
//           <h2 style="color: #1B9E85; margin: 0;">FairPlay Africa</h2>
//           <p style="color: #6B8F82; margin: 8px 0 0;">Takedown Confirmation</p>
//         </div>
//         <p style="color: #333;">Hi ${ownerName},</p>
//         <p style="color: #333;">Your DMCA takedown has been <strong>automatically submitted</strong>. No further action needed.</p>
//         <div style="background: #f0fdf4; border-left: 4px solid #22C55E; padding: 16px; border-radius: 8px; margin: 20px 0;">
//           <p style="margin: 0; color: #16a34a; font-weight: bold;">✓ Takedown Successfully Submitted</p>
//         </div>
//         <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 20px 0;">
//           <tr style="border-bottom: 1px solid #eee;">
//             <td style="padding: 10px; color: #666;">Your Movie</td>
//             <td style="padding: 10px;"><strong>${movieTitle}</strong></td>
//           </tr>
//           <tr style="border-bottom: 1px solid #eee;">
//             <td style="padding: 10px; color: #666;">Channel</td>
//             <td style="padding: 10px;">${youtubeChannel}</td>
//           </tr>
//           <tr style="border-bottom: 1px solid #eee;">
//             <td style="padding: 10px; color: #666;">Video URL</td>
//             <td style="padding: 10px;"><a href="${youtubeVideoUrl}" style="color: #1B9E85;">${youtubeVideoUrl}</a></td>
//           </tr>
//           <tr style="border-bottom: 1px solid #eee;">
//             <td style="padding: 10px; color: #666;">Owner Code</td>
//             <td style="padding: 10px; font-family: monospace;">${ownerCode}</td>
//           </tr>
//           <tr>
//             <td style="padding: 10px; color: #666;">Reference ID</td>
//             <td style="padding: 10px; font-family: monospace;"><strong>${referenceId}</strong></td>
//           </tr>
//         </table>
//         <div style="background: #fff8f0; border-left: 4px solid #F59E0B; padding: 16px; border-radius: 8px; margin: 20px 0;">
//           <p style="margin: 0; font-weight: bold; color: #92400e;">What happens next?</p>
//           <ul style="margin: 8px 0 0; padding-left: 20px; color: #555;">
//             <li>YouTube typically reviews takedowns within 24–48 hours</li>
//             <li>FairPlay Africa will automatically check if the video is removed</li>
//             <li>You will be notified when resolved</li>
//           </ul>
//         </div>
//         <hr style="border: 1px solid #eee; margin: 24px 0;" />
//         <p style="color: #999; font-size: 12px;">FairPlay Africa — Protecting African filmmakers</p>
//       </div>
//     `,
//   });
// };

// const sendFraudAlertEmail = async ({
//   fraudUserName, fraudUserEmail,
//   originalOwnerName, originalOwnerEmail,
//   movieTitle, ownerCode, fraudFlags, accountStatus,
// }) => {
//   await sendEmail({
//     to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
//     subject: `🚨 Fraud Detected — ${fraudUserName} uploaded protected content`,
//     html: `
//       <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: #7f1d1d; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
//           <h2 style="color: #fca5a5; margin: 0;">🚨 Fraud Alert — FairPlay Africa</h2>
//         </div>
//         <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
//           <tr style="border-bottom: 1px solid #eee;">
//             <td style="padding: 10px; color: #666; width: 40%;">Fraudulent User</td>
//             <td style="padding: 10px;"><strong>${fraudUserName}</strong> (${fraudUserEmail})</td>
//           </tr>
//           <tr style="border-bottom: 1px solid #eee;">
//             <td style="padding: 10px; color: #666;">Original Owner</td>
//             <td style="padding: 10px;"><strong>${originalOwnerName}</strong> (${originalOwnerEmail})</td>
//           </tr>
//           <tr style="border-bottom: 1px solid #eee;">
//             <td style="padding: 10px; color: #666;">Movie Title</td>
//             <td style="padding: 10px;">${movieTitle}</td>
//           </tr>
//           <tr style="border-bottom: 1px solid #eee;">
//             <td style="padding: 10px; color: #666;">Owner Code</td>
//             <td style="padding: 10px; font-family: monospace;">${ownerCode}</td>
//           </tr>
//           <tr style="border-bottom: 1px solid #eee;">
//             <td style="padding: 10px; color: #666;">Fraud Flags</td>
//             <td style="padding: 10px; color: #e11d48;">${fraudFlags}</td>
//           </tr>
//           <tr>
//             <td style="padding: 10px; color: #666;">Account Status</td>
//             <td style="padding: 10px; color: ${accountStatus === 'banned' ? '#e11d48' : '#f59e0b'};">
//               <strong>${accountStatus.toUpperCase()}</strong>
//             </td>
//           </tr>
//         </table>
//         <hr style="border: 1px solid #eee; margin: 24px 0;" />
//         <p style="color: #999; font-size: 12px;">FairPlay Africa — Protecting African filmmakers</p>
//       </div>
//     `,
//   });
// };

// const sendVerificationRequestEmail = async ({ adminEmail, userName, userEmail, movieTitle, evidenceUrl }) => {
//   await sendEmail({
//     to: adminEmail,
//     subject: `📋 Ownership Verification Request — ${movieTitle}`,
//     html: `
//       <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: #111A18; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
//           <h2 style="color: #1B9E85; margin: 0;">FairPlay Africa</h2>
//           <p style="color: #6B8F82; margin: 8px 0 0;">Ownership Verification Request</p>
//         </div>
//         <p style="color: #333;"><strong>${userName}</strong> (${userEmail}) submitted ownership evidence for: <strong>${movieTitle}</strong></p>
//         <a href="${evidenceUrl}" style="display: inline-block; background: #1B9E85; color: white;
//           padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
//           View Evidence
//         </a>
//         <hr style="border: 1px solid #eee; margin: 24px 0;" />
//         <p style="color: #999; font-size: 12px;">FairPlay Africa — Protecting African filmmakers</p>
//       </div>
//     `,
//   });
// };

// const sendVerificationApprovedEmail = async ({ to, name }) => {
//   await sendEmail({
//     to,
//     subject: '✅ Ownership Verified — FairPlay Africa',
//     html: `
//       <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: #111A18; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
//           <h2 style="color: #1B9E85; margin: 0;">FairPlay Africa</h2>
//         </div>
//         <p style="color: #333;">Hi ${name},</p>
//         <p style="color: #333;">Your ownership has been <strong style="color: #16a34a;">verified</strong>.</p>
//         <a href="${process.env.CLIENT_URL}/dashboard"
//           style="display: inline-block; background: #1B9E85; color: white; padding: 12px 24px;
//           border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
//           Go to Dashboard
//         </a>
//         <hr style="border: 1px solid #eee; margin: 24px 0;" />
//         <p style="color: #999; font-size: 12px;">FairPlay Africa — Protecting African filmmakers</p>
//       </div>
//     `,
//   });
// };

// const sendVerificationRejectedEmail = async ({ to, name, note }) => {
//   await sendEmail({
//     to,
//     subject: '❌ Ownership Verification — Additional Information Required',
//     html: `
//       <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: #111A18; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
//           <h2 style="color: #1B9E85; margin: 0;">FairPlay Africa</h2>
//         </div>
//         <p style="color: #333;">Hi ${name},</p>
//         <p style="color: #333;">We were unable to verify your ownership at this time.</p>
//         ${note ? `<div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0;">
//           <p style="margin: 0; color: #92400e;"><strong>Reason:</strong> ${note}</p>
//         </div>` : ''}
//         <a href="${process.env.CLIENT_URL}/dashboard/upload"
//           style="display: inline-block; background: #1B9E85; color: white; padding: 12px 24px;
//           border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
//           Upload Evidence
//         </a>
//         <hr style="border: 1px solid #eee; margin: 24px 0;" />
//         <p style="color: #999; font-size: 12px;">FairPlay Africa — Protecting African filmmakers</p>
//       </div>
//     `,
//   });
// };

// const sendAppealDecisionEmail = async ({ to, name, status, adminNote, appealType }) => {
//   const isApproved = status === 'approved';
//   const typeLabels = {
//     fraud_flag: 'Fraud flag dispute',
//     suspension: 'Account suspension',
//     ban: 'Account ban',
//     false_infringement: 'False infringement claim',
//   };

//   await sendEmail({
//     to,
//     subject: isApproved
//       ? '✅ Your Appeal Has Been Approved — FairPlay Africa'
//       : '❌ Appeal Decision — FairPlay Africa',
//     html: `
//       <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
//         <div style="background: #111A18; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
//           <h2 style="color: #1B9E85; margin: 0;">FairPlay Africa</h2>
//           <p style="color: #6B8F82; margin: 8px 0 0;">Appeal Decision</p>
//         </div>
//         <p style="color: #333;">Hi ${name},</p>
//         <p style="color: #333;">We reviewed your appeal: <strong>${typeLabels[appealType] || appealType}</strong></p>
//         <div style="padding: 20px; border-radius: 12px; margin: 20px 0;
//           background: ${isApproved ? '#f0fdf4' : '#fef2f2'};
//           border-left: 4px solid ${isApproved ? '#22C55E' : '#EF4444'};">
//           <p style="margin: 0; font-size: 18px; font-weight: bold;
//             color: ${isApproved ? '#16a34a' : '#dc2626'};">
//             ${isApproved ? '✓ Appeal Approved' : '✗ Appeal Rejected'}
//           </p>
//           <p style="margin: 8px 0 0; color: #555;">
//             ${isApproved
//               ? 'Your account has been fully reinstated. You can log in and access all features.'
//               : 'After careful review, we could not approve your appeal at this time.'}
//           </p>
//         </div>
//         ${adminNote ? `
//         <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin: 16px 0;">
//           <p style="margin: 0; font-weight: bold; color: #333;">Decision Note:</p>
//           <p style="margin: 8px 0 0; color: #555;">${adminNote}</p>
//         </div>` : ''}
//         ${isApproved ? `
//         <a href="${process.env.CLIENT_URL}/dashboard"
//           style="display: inline-block; background: #1B9E85; color: white; padding: 14px 28px;
//           border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
//           Go to Dashboard
//         </a>` : `
//         <p style="color: #555;">
//           To appeal again contact us at
//           <a href="mailto:appeals@fairplayafrica.com" style="color: #1B9E85;">
//             appeals@fairplayafrica.com
//           </a>
//         </p>`}
//         <hr style="border: 1px solid #eee; margin: 24px 0;" />
//         <p style="color: #999; font-size: 12px;">FairPlay Africa — Protecting African filmmakers</p>
//       </div>
//     `,
//   });
// };

// module.exports = {
//   sendTakedownEmail,
//   sendWelcomeEmail,
//   sendFraudAlertEmail,
//   sendVerificationRequestEmail,
//   sendVerificationApprovedEmail,
//   sendVerificationRejectedEmail,
//   sendVerificationEmail,
//   sendAppealDecisionEmail,
//   sendTakedownConfirmationEmail,
// };