const nodemailer = require('nodemailer');
// const mailgen = require('mailgen');
const htmlToText = require('html-to-text').htmlToText;
const pug = require('pug');
const AppError = require('./AppError');

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Sujay Jami <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'development') {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      return 1;
    }
  }

  async send(template, subject) {
    // console.log('mf', this.url, this.to);
    // Render the html based on the pug template.
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: htmlToText(html),
    };

    // Create a trnasport and send the email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcomeEmail() {
    await this.send('welcomeEmailTemplate', 'Welcome to the natours family!');
  }

  async sendResetPasswordEmail() {
    await this.send(
      'resetPasswordEmailTemplate',
      `Your Password Reset Token (Valid for ${
        parseInt(process.env.RESET_PASSWORD_EXPIRY_TIME) / (1000 * 60)
      }) minutes`
    );
  }
}

// const sendmail = async (hostEmail, userName, hostURL) => {
//   let transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const emailTemplate = new mailgen({
//     theme: 'cerberus',
//     product: {
//       name: 'Natours Reset Password Email',
//       copyright: 'Copyright © 2020 NATOURS. All rights reserved.',
//       link: hostURL,
//       //logo:
//     },
//   });

//   const emailContent = {
//     body: {
//       name: userName,
//       intro: 'Password Reset Mail  ',
//       action: {
//         instructions: 'Please click on the below button to do nothing',
//         button: {
//           color: '#22BC66', // Optional action button color
//           text: 'click me!!!',
//           link: hostURL,
//         },
//       },
//     },
//   };

//   const emailHTMLForm = emailTemplate.generate(emailContent);

//   const nodeMailerTemplate = {
//     from: 'Sujay Jami <sujayjami99999@gmail.com>',
//     to: hostEmail,
//     subject: 'NATOURS EMAIL',
//     html: emailHTMLForm,
//   };
//   await transporter.sendMail(nodeMailerTemplate);
//   //   } catch (err) {
//   //     throw new AppError(500, 'Some error with the emailing process.');
//   //   }
// };

module.exports = Email;
