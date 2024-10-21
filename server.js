

import nodemailer from 'nodemailer';
console.log("Server is ready to take our messages");
const transporter = nodemailer.createTransport({
    host: "imap.aeroproject.site",
    localAddress: "192.168.6.56",
    
    port: 587*1,
    secure: false, // true for port 465, false for other ports
    secureConnection: false,
    requireTLS: true,
    tls: {
        rejectUnauthorized: false,
        //ciphers:'SSLv3',
        secureProtocol: "TLS_method"
    },
    auth: {
        type: "OAuth2",
        user: "guminskii@aeroproject.ru", // generated ethereal user
        pass: "GOS-30081987",
    },
    logger: true,
    debug: true,
    // ignoreTLS: true,
    
    
    
});
// verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("Server is ready to take our messages");
    }
});
// async..await is not allowed in global scope, must use a wrapper
async function main() {
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '<guminskii@aeroproject.ru>', // sender address
        to: "guminskii@aeroproject.ru", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
    });
    
    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

main().catch(console.error);