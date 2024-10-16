const nodemailer = require('nodemailer');
const dotenv = require("dotenv").config();

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

        // Basic validation for each field
        if (!name || name.trim().length < 3) {
            errors.name = 'Name must be at least 3 characters long.';
        }

        if (!email || !validateEmail(email)) {
            errors.email = 'Please enter a valid email address.';
        }

        if (!subject || subject.trim().length < 3) {
            errors.subject = 'Subject must be at least 3 characters long.';
        }

        if (!message || message.trim().length < 10) {
            errors.message = 'Message must be at least 10 characters long.';
        }

        // If there are errors, send them back to the frontend
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }


        // Setup Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: process.env.NODEMAILER_EMAIL,  
                pass: process.env.NODEMAILER_PASSWORD,
            },
        });

        
        const mailOptions = {
            from: email,  
            to: process.env.NODEMAILER_EMAIL, 
            subject: subject || 'New Contact Form Submission',  
            text: `You have a new message from ${name} (${email}):\n\n${message}`,
        };

        
        const info = await transporter.sendMail(mailOptions);

        if (info.accepted.length > 0) {
            res.status(200).json({ message: 'Contact form submitted successfully' });
        } else {
            res.status(500).json({ message: 'Failed to send contact form' });   
        }
    } catch (error) {
        console.log('Error sending contact form:', error.message);
        return res.status(404).redirect('/404')

    }
};

module.exports={
    loadContact,
    sendContact
}