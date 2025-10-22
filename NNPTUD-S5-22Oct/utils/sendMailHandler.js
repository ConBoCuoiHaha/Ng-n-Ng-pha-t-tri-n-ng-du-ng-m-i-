let nodemailer = require('nodemailer');
let path = require('path')
let fs = require('fs');
let handlebars = require('handlebars')
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 25,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "afb860a426d68e",
        pass: "d3964b7baf52ff",
    },
});

// Wrap in an async IIFE so we can use await.

module.exports = {
    sendMail: async function (url, user) {
        let data = fs.readFileSync(path.join(__dirname, '../templates/mailForgotpassword.html'),'utf-8');
        let template = handlebars.compile(data);
        const html = template({
            user_name: user.username,
            reset_link: url,
            expiry_hours:user.forgotPasswordTokenExp
        })
        await transporter.sendMail({
            from: '"Tungnt with love"<admin@hehehe.com>',
            to: user.email,
            subject: "Quen mat khau",
            html: html, // HTML body
        });
    }
}