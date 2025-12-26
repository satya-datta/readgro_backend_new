const { sendEmail } = require('../emailService');
require('dotenv').config();

async function test() {
    console.log("Testing email service...");
    console.log("Using EMAIL_USER:", process.env.EMAIL_USER);

    const to = process.env.EMAIL_USER; // Send to self
    const subject = "Test Email from ReadGro Backend";
    const htmlContent = "<h1>It works!</h1><p>This is a test email to verify the SMTP configuration.</p>";

    const result = await sendEmail(to, subject, htmlContent);

    if (result) {
        console.log("Test email sent successfully!");
    } else {
        console.log("Test email failed. Check the logs for errors.");
    }
}

test();
