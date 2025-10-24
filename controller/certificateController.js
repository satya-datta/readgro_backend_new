const { sendEmail } = require('../emailService');

// Function to generate email content for certificate request
const generateCertificateRequestEmail = (requestData) => {
  return `
    <h2>New Certificate Request</h2>
    <p>A user has requested a certificate. Please find the details below:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-family: Arial, sans-serif;">
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 30%;">User Name:</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${requestData.userName}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">User Email:</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${requestData.userEmail}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Course Name:</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${requestData.courseName}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Start Date:</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${new Date(requestData.startDate).toLocaleDateString()}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Internship Duration:</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${requestData.durationMonths} months</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Request Date:</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td>
      </tr>
    </table>
    
    <p>Please process this certificate request at your earliest convenience.</p>
    <p>Thank you,<br>ReadGro System</p>
  `;
};

// Function to send certificate request to admin
exports.requestCertificate = async (req, res) => {
  try {
    const { userId, courseId, startDate, durationMonths, userName, courseName, userEmail } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@readgro.com'; // Default admin email

    // Validate required fields
   

    // Prepare request data
    const requestData = {
      userId,
      courseId,
      userName,
      userEmail,
      courseName,
      startDate,
      durationMonths,
      requestDate: new Date().toISOString()
    };

    // Generate email content
    const emailSubject = `Certificate Request: ${userName} - ${courseName}`;
    const emailContent = generateCertificateRequestEmail(requestData);

    // Send email to admin
    const emailSent = await sendEmail(
      adminEmail,
      emailSubject,
      emailContent
    );

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send certificate request email'
      });
    }

    // Here you could also save the request to your database if needed
    // await CertificateRequest.create(requestData);

    return res.status(200).json({
      success: true,
      message: 'Certificate request sent to admin successfully',
      request: requestData
    });

  } catch (error) {
    console.error('Error processing certificate request:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
