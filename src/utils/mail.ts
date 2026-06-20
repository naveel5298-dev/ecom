import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

interface mailOptons {
  to: string,
  subject: string,
  text?: string,
  html?: string
}

// interface SendMailOptions{
//   to:string,
//   name?:string,
//   verificationURL?:string
// }

let transporter:nodemailer.Transporter | null = null;

async function getTransporter() {
  if (transporter)
    return transporter;

const host = process.env.SMTP_HOST;
// const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
console.log(host,user,pass)
//const secure = process.env.SMTP_SECURE === 'true';

if (host && user && pass) {
  console.error(`test pass`)
 transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { 
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS, // Gmail App Password
    },
  });
 
}
 return transporter;
}



export async function sendMailFun({ to, subject, text, html }: mailOptons) {
  const t:any = await getTransporter();
  const from = process.env.EMAIL_USER || `no-reply@${process.env.APP_DOMAIN || 'localhost'}`;
  const info = await t.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
  console.log("Message sent:", info.messageId);
};

export async function sendSignupMail(to:string,name?:string,verificationURL?:string) {
     const subject ="Welcome to Our App — Please confirm your email"
     const safeName = name || 'there'

     const html = `
       <p>Hi ${safeName},</p>
    <p>Thanks for signing up! Please confirm your email by clicking the link below:</p>
    <p><a href="${verificationURL || '#'}">Confirm your email</a></p>
    <p>If you didn't create an account, you can safely ignore this message.</p>
    <p>— The Team</p>`;

const text = `Hi ${safeName},\n\nThanks for signing up! Confirm your email: ${verificationURL || '#'}\n\n— The Team`;

return sendMailFun({to,subject,text,html})
     
}








// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS, // Gmail App Password
//   },
// });


// export const sendMailer = async (to: string) => {
//   const info = await transporter.sendMail({
//     from: '"Maddison Foo Koch" <naveel51210@gmail.com>',
//     to: to,
//     subject: "Hello ✔",
//     text: "Hello world?", // Plain-text version of the message
//     html: "<b>Hello world?</b>", // HTML version of the message
//   });

//   console.log("Message sent:", info.messageId);
// };




