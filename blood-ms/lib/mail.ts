import nodemailer from "nodemailer";

// Cache the transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER, // Your Gmail address
      pass: process.env.SMTP_PASS, // Your Gmail App Password
    },
  });

  return transporter;
}

export async function sendVerificationEmail(email: string, otp: string) {
  try {
    const t = getTransporter();

    const info = await t.sendMail({
      from: '"BloodLink Accounts" <no-reply@bloodlink.com>', // sender address
      to: email, // list of receivers
      subject: "Your BloodLink Verification Code", // Subject line
      text: `Your confirmation code is ${otp}. Please enter it to verify your account.`, // plain text body
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
          <h2 style="color: #e11d48; text-align: center;">BloodLink</h2>
          <p>Hello,</p>
          <p>Thank you for registering. Please use the following One-Time Password (OTP) to complete your account verification:</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px;">This code will expire in 15 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `, // html body
    });

    console.log("Message sent via Gmail: %s", info.messageId);

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

export async function sendRequestStatusEmail(email: string, status: string, bloodGroup: string, units: number) {
  try {
    const t = getTransporter();

    let subject = "Update on Your Blood Request";
    let message = "";
    let color = "#e11d48"; // default rose

    if (status === "APPROVED") {
      subject = "Blood Request Approved - Finding Donors";
      message = `Great news! Your request for <strong>${units} units of ${bloodGroup}</strong> has been approved by the administrators. We are currently locating donors or checking inventory to fulfill your request.`;
      color = "#3b82f6"; // blue
    } else if (status === "FULFILLED") {
      subject = "Blood Request FULFILLED - Blood is Available!";
      message = `Excellent news! Your request for <strong>${units} units of ${bloodGroup}</strong> has been fully fulfilled and the blood is now available for you. Please contact the administration immediately to coordinate pickup or delivery.`;
      color = "#22c55e"; // green
    } else if (status === "REJECTED") {
      subject = "Blood Request Rejected";
      message = `We regret to inform you that your request for <strong>${units} units of ${bloodGroup}</strong> has been rejected by the administration. Please contact support for further details or to clarify your requirements.`;
      color = "#64748b"; // slate
    } else {
      return false; // don't send emails for pending or other internal statuses
    }

    const info = await t.sendMail({
      from: '"BloodLink Notifications" <no-reply@bloodlink.com>',
      to: email,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
          <h2 style="color: ${color}; text-align: center;">BloodLink Update</h2>
          <p>Hello,</p>
          <p>${message}</p>
          <p style="margin-top: 30px;">Log in to your dashboard to view full details.</p>
          <p style="color: #64748b; font-size: 14px; margin-top: 20px;">If you have any questions, please contact our support team.</p>
        </div>
      `,
    });

    console.log("Status update email sent via Gmail: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending status email:", error);
    return false;
  }
}

