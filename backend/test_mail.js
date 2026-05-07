const nodemailer = require('nodemailer');
require('dotenv').config();

async function testMail() {
  console.log('Testing mail with:', process.env.EMAIL_USER);
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful');
    
    const info = await transporter.sendMail({
      from: `"Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Test Email',
      text: 'This is a test email.',
    });
    console.log('✅ Email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testMail();
