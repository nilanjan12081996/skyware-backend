require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first'); // Force IPv4 to fix Render's IPv6 issue with Gmail

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required fields.' });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'dskyware@gmail.com', // Destination email address
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #0f172a;">New Project Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <h3 style="color: #0f172a;">Message:</h3>
          <p style="white-space: pre-wrap; color: #475569; line-height: 1.6;">${message}</p>
        </div>
      `,
    };

    // Send the email wrapped in a Promise
    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error('Error sending email:', err);
          reject(err);
        } else {
          resolve(info);
        }
      });
    });

    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send the email. Please try again later.' });
  }
});

app.get('/', (req, res) => {
  res.send('Skyware API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
