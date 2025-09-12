package com.daniel.backend.auth.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.*;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    public void sendVerificationEmail(String to, String verificationCode) {
        String subject = "Verify your account";
        String htmlMessage =
                "<!DOCTYPE html>" +
                "<html lang=\"en\">" +
                "<head>" +
                "  <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />" +
                "  <title>Verify your account</title>" +
                "  <style>" +
                "    /* Client-specific resets */" +
                "    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }" +
                "    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }" +
                "    img { -ms-interpolation-mode: bicubic; }" +
                "    /* Reset */" +
                "    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }" +
                "    table { border-collapse: collapse !important; }" +
                "    body { margin: 0 !important; padding: 0 !important; background-color: #f5f7fb; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color: #1f2937; }" +
                "    a { color: #2563eb; text-decoration: none; }" +
                "    .container { width: 100%; }" +
                "    .content { max-width: 600px; margin: 0 auto; }" +
                "    .card { background: #ffffff; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04); }" +
                "    .header { padding: 24px; text-align: center; background: #0f172a; color: #ffffff; border-top-left-radius: 10px; border-top-right-radius: 10px; }" +
                "    .header h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.3px; }" +
                "    .body { padding: 24px; }" +
                "    .title { font-size: 18px; margin: 0 0 8px 0; font-weight: 600; }" +
                "    .subtitle { font-size: 14px; margin: 0 0 20px 0; color: #4b5563; line-height: 1.6; }" +
                "    .code-wrap { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; }" +
                "    .code-label { font-size: 12px; color: #6b7280; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.08em; }" +
                "    .code { font-size: 28px; font-weight: 700; letter-spacing: 0.25em; color: #111827; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; }" +
                "    .help { font-size: 12px; color: #6b7280; margin-top: 16px; }" +
                "    .footer { text-align: center; color: #9ca3af; font-size: 12px; padding: 24px 12px; }" +
                "    @media only screen and (max-width: 600px) { .content, .body { padding: 16px !important; } .code { font-size: 24px !important; } }" +
                "  </style>" +
                "</head>" +
                "<body>" +
                "  <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"container\">" +
                "    <tr>" +
                "      <td align=\"center\" style=\"padding: 24px;\">" +
                "        <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"content\">" +
                "          <tr>" +
                "            <td class=\"card\">" +
                "              <div class=\"header\">" +
                "                <h1>CloudStore</h1>" +
                "              </div>" +
                "              <div class=\"body\">" +
                "                <p class=\"title\">Verify your email</p>" +
                "                <p class=\"subtitle\">Thanks for creating an account with CloudStore. Use the verification code below to complete your sign‑in. This code expires shortly for your security.</p>" +
                "                <div class=\"code-wrap\">" +
                "                  <p class=\"code-label\">Your verification code</p>" +
                "                  <div class=\"code\">" + verificationCode + "</div>" +
                "                </div>" +
                "                <p class=\"help\">If you did not request this, you can safely ignore this email.</p>" +
                "              </div>" +
                "            </td>" +
                "          </tr>" +
                "          <tr>" +
                "            <td class=\"footer\">" +
                "              © " + java.time.Year.now() + " CloudStore. All rights reserved." +
                "            </td>" +
                "          </tr>" +
                "        </table>" +
                "      </td>" +
                "    </tr>" +
                "  </table>" +
                "</body>" +
                "</html>";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setFrom(from);
            helper.setSubject(subject);
            helper.setText(htmlMessage, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    public void sendPasswordResetEmail(String to, String token) {
        String subject = "Verify your Email for Password Reset";
        String htmlMessage =
                "<!DOCTYPE html>" +
                "<html lang=\"en\">" +
                "<head>" +
                "  <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />" +
                "  <title>Password reset</title>" +
                "  <style>" +
                "    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }" +
                "    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }" +
                "    img { -ms-interpolation-mode: bicubic; }" +
                "    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }" +
                "    table { border-collapse: collapse !important; }" +
                "    body { margin: 0 !important; padding: 0 !important; background-color: #f5f7fb; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color: #1f2937; }" +
                "    a { color: #2563eb; text-decoration: none; }" +
                "    .container { width: 100%; }" +
                "    .content { max-width: 600px; margin: 0 auto; }" +
                "    .card { background: #ffffff; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04); }" +
                "    .header { padding: 24px; text-align: center; background: #0f172a; color: #ffffff; border-top-left-radius: 10px; border-top-right-radius: 10px; }" +
                "    .header h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.3px; }" +
                "    .body { padding: 24px; }" +
                "    .title { font-size: 18px; margin: 0 0 8px 0; font-weight: 600; }" +
                "    .subtitle { font-size: 14px; margin: 0 0 20px 0; color: #4b5563; line-height: 1.6; }" +
                "    .code-wrap { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; }" +
                "    .code-label { font-size: 12px; color: #6b7280; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.08em; }" +
                "    .code { font-size: 28px; font-weight: 700; letter-spacing: 0.25em; color: #111827; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; }" +
                "    .help { font-size: 12px; color: #6b7280; margin-top: 16px; }" +
                "    .footer { text-align: center; color: #9ca3af; font-size: 12px; padding: 24px 12px; }" +
                "    @media only screen and (max-width: 600px) { .content, .body { padding: 16px !important; } .code { font-size: 24px !important; } }" +
                "  </style>" +
                "</head>" +
                "<body>" +
                "  <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"container\">" +
                "    <tr>" +
                "      <td align=\"center\" style=\"padding: 24px;\">" +
                "        <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" class=\"content\">" +
                "          <tr>" +
                "            <td class=\"card\">" +
                "              <div class=\"header\">" +
                "                <h1>CloudStore</h1>" +
                "              </div>" +
                "              <div class=\"body\">" +
                "                <p class=\"title\">Password reset verification</p>" +
                "                <p class=\"subtitle\">We received a request to reset your CloudStore password. Use the verification code below to continue. If you did not request a reset, you can safely ignore this message.</p>" +
                "                <div class=\"code-wrap\">" +
                "                  <p class=\"code-label\">Your verification code</p>" +
                "                  <div class=\"code\">" + token + "</div>" +
                "                </div>" +
                "                <p class=\"help\">For your security, this code expires shortly and can only be used once.</p>" +
                "              </div>" +
                "            </td>" +
                "          </tr>" +
                "          <tr>" +
                "            <td class=\"footer\">" +
                "              © " + java.time.Year.now() + " CloudStore. All rights reserved." +
                "            </td>" +
                "          </tr>" +
                "        </table>" +
                "      </td>" +
                "    </tr>" +
                "  </table>" +
                "</body>" +
                "</html>";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setFrom(from);
            helper.setSubject(subject);
            helper.setText(htmlMessage, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send verification email", e);
        }
    }
}

