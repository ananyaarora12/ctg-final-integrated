from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app)

EMAIL_SENDER = os.getenv("EMAIL_SENDER", "samarthanamdemo@gmail.com")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "jraa plzu vxya xlvn")

PDF_PATH = r"C:\Users\Riya\OneDrive\Desktop\morgan stanley final codes\ctg-final-integrated\backend\certificate_demo.pdf"
# PDF_PATH1 = r"C:\Users\Riya\OneDrive\Desktop\morgan stanley final codes\ctg-final-integrated\backend\business-financial-data-december-2024-quarter-csv.csv"

DOWNLOAD_FOLDER = "downloads"
app.config["DOWNLOAD_FOLDER"] = DOWNLOAD_FOLDER


@app.route("/download/<filename>")
def download_file(filename):
    """Endpoint to download a file."""
    try:
        return send_from_directory(app.config["DOWNLOAD_FOLDER"], filename, as_attachment=True)
    except FileNotFoundError:
        return "File not found", 404


def send_email(recipient_email, subject, body, attachment_path=None):
    try:
        msg = MIMEMultipart()
        msg["Subject"] = subject
        msg["From"] = EMAIL_SENDER
        msg["To"] = recipient_email

        msg.attach(MIMEText(body, "plain"))

        if attachment_path and os.path.exists(attachment_path):
            with open(attachment_path, "rb") as attachment:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                part.add_header("Content-Disposition", f"attachment; filename={os.path.basename(attachment_path)}")
                msg.attach(part)

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_SENDER, recipient_email, msg.as_string())

        print(f"✅ Email sent successfully to {recipient_email}!")
        return True
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return False


def send_event_registration_email(email):
    """Send event registration confirmation email."""
    subject = "Event Registration Confirmation"
    body = "Dear Volunteer,\n\nThank you for registering for the event as a Volunteer.\n\nBest regards,\nThe Samarthanam Team"
    return send_email("arora.anaya05@gmail.com", subject, body)


def send_login_email(user):
    """Send login notification email."""
    subject = "Login Notification - Samarthanam"
    body = f"Dear {user['name']},\n\nWe noticed a login to your Samarthanam account.\n\nLogin Details:\n- Email: {user['email']}\n\nIf this wasn't you, please contact us immediately.\n\nBest regards,\nThe Samarthanam Team"
    return send_email("arora.anaya05@gmail.com", subject, body)


def send_welcome_participant(user):
    """Send welcome email to participant with attachment."""
    subject = "Welcome to Samarthanam - Registration"
    body = f"Dear {user['name']},\n\nThank you for registering as a participant with Samarthanam. We're excited to have you join our community!\n\nBest regards,\nThe Samarthanam Team"
    return send_email("arora.anaya05@gmail.com", subject, body, PDF_PATH)


def send_welcome(user):
    """Send welcome email with attachment."""
    subject = "Welcome to Samarthanam"
    body = f"Dear {user['name']},\n\nPlease find the attached welcome guide for more information.\n\nBest regards,\nThe Samarthanam Team"
    return send_email("arora.anaya05@gmail.com", subject, body, PDF_PATH)


def send_evs(user):
    """Send EVS attachment email."""
    subject = "Welcome to Samarthanam"
    body = f"Dear {user['name']},\n\nHere is your EVS.\n\nBest regards,\nThe Samarthanam Team"
    return send_email("arora.anaya05@gmail.com", subject, body, PDF_PATH1)


@app.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        print("📩 Received Data:", data)

        if not data or "email" not in data:
            return jsonify({"error": "Email is required"}), 400

        user = {"name": data.get("name", "User"), "email": data["email"], "role": data.get("role", "Member")}
        email_sent = send_login_email(user)

        if email_sent:
            return jsonify({"message": "Login successful, notification email sent", "email": data["email"]}), 200
        else:
            return jsonify({"error": "Failed to send email"}), 500

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route('/events/participant', methods=['POST'])
def register_participant():
    try:
        data = request.get_json()
        print("📩 Received Data:", data)

        if not data or "email" not in data:
            return jsonify({"error": "Email is required"}), 400

        user = {"name": data.get("name", "User"), "email": data["email"], "role": data.get("role", "Participant")}
        email_sent = send_welcome_participant(user)

        if email_sent:
            return jsonify({"message": "Participant registration successful, email sent", "email": data["email"]}), 200
        else:
            return jsonify({"error": "Failed to send email"}), 500

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route('/events/register', methods=['POST'])
def register_for_event():
    try:
        data = request.get_json()
        print("📩 Received Data:", data)

        if not data or "email" not in data:
            return jsonify({"error": "Email is required"}), 400

        email_sent = send_event_registration_email(data["email"])

        if email_sent:
            return jsonify({"message": "Event registration successful, email sent", "email": data["email"]}), 200
        else:
            return jsonify({"error": "Failed to send email"}), 500

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route('/auth/send_attachment', methods=['POST'])
def send_attachment():
    try:
        data = request.get_json()
        print("📩 Received Data:", data)

        if not data or "email" not in data:
            return jsonify({"error": "Email is required"}), 400

        user = {"name": data.get("name", "User"), "email": data["email"], "role": data.get("role", "Member")}
        email_sent = send_welcome(user)

        if email_sent:
            return jsonify({"message": "Welcome email sent successfully", "email": data["email"]}), 200
        else:
            return jsonify({"error": "Failed to send email"}), 500

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route('/auth/send_evs', methods=['POST'])
def send_evs_email():
    try:
        data = request.get_json()
        print("📩 Received Data:", data)

        if not data or "email" not in data:
            return jsonify({"error": "Email is required"}), 400

        user = {"name": data.get("name", "User"), "email": data["email"]}
        email_sent = send_evs(user)

        if email_sent:
            return jsonify({"message": "EVS email sent successfully", "email": data["email"]}), 200
        else:
            return jsonify({"error": "Failed to send email"}), 500

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)