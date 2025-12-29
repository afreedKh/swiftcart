const dotenv = require("dotenv").config();
const axios = require('axios');

const loadContact = async(req,res)=>{
    try {

        res.render("contact")
        
    } catch (error) {
        console.log('contact us page error',error.message);
        return res.status(404).redirect('/404')

        
    }
}







const sendContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const errors = {};

    const validateEmail = (email) => {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    if (!name || name.trim().length < 3) {
      errors.name = "Name must be at least 3 characters long.";
    }

    if (!email || !validateEmail(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!subject || subject.trim().length < 3) {
      errors.subject = "Subject must be at least 3 characters long.";
    }

    if (!message || message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters long.";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "SwiftCart Contact",
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email: process.env.BREVO_SENDER_EMAIL, 
          },
        ],
        replyTo: {
          email: email, // user email for reply
          name: name,
        },
        subject: subject || "New Contact Form Submission",
        htmlContent: `
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("CONTACT EMAIL SENT:", response.data);
    res.status(200).json({ message: "Contact form submitted successfully" });

  } catch (error) {
    console.error(
      "CONTACT EMAIL ERROR:",
      error.response?.data || error.message
    );
    res.status(500).json({ message: "Failed to send contact form" });
  }
};

module.exports={
    loadContact,
    sendContact
}