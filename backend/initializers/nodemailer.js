const config = require('config');
const nodemailer = require('nodemailer');

const mail = config.get('mail');

async function init() {
  const mailerFunction = () => {
    const transporter = nodemailer.createTransport(mail.transporter);
    return transporter;
  };
  return mailerFunction;
}

module.exports = init();
