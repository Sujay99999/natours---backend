const nodemailer = require('nodemailer');
const mailgen = require('mailgen');
const AppError = require('./AppError');

const sendmail = async (hostEmail, userName, hostURL) => {
  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const emailTemplate = new mailgen({
    theme: 'cerberus',
    product: {
      name: 'Natours Reset Password Email',
      copyright: 'Copyright © 2020 NATOURS. All rights reserved.',
      link: hostURL,
      //logo:
    },
  });

  const emailContent = {
    body: {
      name: userName,
      intro: 'Password Reset Mail  ',
      action: {
        instructions: 'Please click on the below button to do nothing',
        button: {
          color: '#22BC66', // Optional action button color
          text: 'click me!!!',
          link: hostURL,
        },
      },
    },
  };

  const emailHTMLForm = emailTemplate.generate(emailContent);

  const nodeMailerTemplate = {
    from: 'Sujay Jami <sujayjami99999@gmail.com>',
    to: hostEmail,
    subject: 'NATOURS EMAIL',
    html: emailHTMLForm,
  };
  await transporter.sendMail(nodeMailerTemplate);
  //   } catch (err) {
  //     throw new AppError(500, 'Some error with the emailing process.');
  //   }
};

module.exports = sendmail;
