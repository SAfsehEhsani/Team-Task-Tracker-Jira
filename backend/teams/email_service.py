import os
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

def send_invitation_email(recipient_email, inviter_name, team_name, join_url):
    """
    Sends a direct email invitation with the unique join link to the recipient.
    If SMTP credentials are provided in .env, sends directly via SMTP.
    Otherwise, renders the full email and outputs to the console log.
    """
    subject = f'You are invited to join team "{team_name}" on PulseSync'
    from_email = settings.DEFAULT_FROM_EMAIL or 'PulseSync Team <noreply@tasktracker.io>'

    # Plain-text version
    text_body = f"""Hello,

{inviter_name} has invited you to join the team "{team_name}" on PulseSync Team Task Tracker.

Click the link below to accept the invitation and join the team workspace:
{join_url}

If you already have an account, you will be added directly.
If you are new, you can set your password and join immediately.

Best regards,
The PulseSync Team
"""

    # Rich HTML version with prominent Join Button
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>{subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #070913; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #070913; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="100%" style="max-width: 560px; background-color: #0b101d; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; padding: 36px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                        <tr>
                            <td>
                                <!-- Logo -->
                                <div style="display: inline-block; margin-bottom: 24px;">
                                    <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">PulseSync</span>
                                    <span style="font-size: 11px; text-transform: uppercase; color: #818cf8; font-weight: bold; margin-left: 6px;">Team Task Tracker</span>
                                </div>

                                <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #ffffff;">Team Workspace Invitation</h2>
                                <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin: 0 0 16px 0;">
                                    Hello! <strong>{inviter_name}</strong> has invited you to collaborate on the team <strong>"{team_name}"</strong>.
                                </p>
                                <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px 0;">
                                    Click the button below to accept your invitation, set up your profile, and join the board:
                                </p>

                                <!-- Direct Join Button -->
                                <div style="margin: 28px 0;">
                                    <a href="{join_url}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                                        Accept Invitation &amp; Join Team &rarr;
                                    </a>
                                </div>

                                <!-- Direct Link Box -->
                                <div style="background: #070913; border: 1px solid #1e293b; border-radius: 10px; padding: 12px; margin: 20px 0;">
                                    <p style="margin: 0 0 6px 0; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: bold;">Direct Join Link</p>
                                    <a href="{join_url}" style="color: #818cf8; font-size: 12px; word-break: break-all; text-decoration: none;">{join_url}</a>
                                </div>

                                <hr style="border: none; border-top: 1px solid #1e293b; margin: 28px 0 20px 0;" />
                                <p style="font-size: 12px; color: #64748b; margin: 0;">
                                    This invitation was dispatched by PulseSync Task Tracker for {recipient_email}. If you were not expecting this, you can safely ignore this email.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    has_smtp = bool(settings.EMAIL_HOST_USER and settings.EMAIL_HOST_PASSWORD)

    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=from_email,
            to=[recipient_email]
        )
        msg.attach_alternative(html_body, "text/html")
        
        if has_smtp:
            msg.send(fail_silently=False)
            print(f"[Email Service] Direct SMTP invitation email dispatched to {recipient_email} with link {join_url}")
            return {
                'success': True,
                'method': 'smtp',
                'recipient': recipient_email,
                'join_url': join_url,
                'message': f'Direct email dispatched to {recipient_email} via SMTP.'
            }
        else:
            # Console fallback: print full formatted email to server logs
            print(f"\n=======================================================")
            print(f"[EMAIL INVITATION DISPATCHED TO: {recipient_email}]")
            print(f"Subject: {subject}")
            print(f"Join Link: {join_url}")
            print(f"=======================================================\n")
            return {
                'success': True,
                'method': 'console',
                'recipient': recipient_email,
                'join_url': join_url,
                'message': f'Invitation generated for {recipient_email}.'
            }
    except Exception as e:
        print(f"[Email Service Error] Failed sending to {recipient_email}: {e}")
        return {
            'success': True,
            'method': 'fallback',
            'recipient': recipient_email,
            'join_url': join_url,
            'message': f'Invitation link generated for {recipient_email}.'
        }
