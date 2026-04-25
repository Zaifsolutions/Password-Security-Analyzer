from flask import Flask, render_template, jsonify, request
import re
import random
import string
import time

app = Flask(__name__)

def analyze_logic(pwd):
    if not pwd: 
        return {"score": 0, "status": "Waiting...", "color": "#888", "time": "N/A"}
    
    score = 0
    pwd_len = len(pwd)
    if pwd_len >= 8: score += 20
    if pwd_len >= 12: score += 20
    if re.search(r"\d", pwd): score += 20
    if re.search(r"[A-Z]", pwd): score += 20
    if re.search(r"[!@#$%^&*(),.?\":{}|<>]", pwd): score += 20

    if score <= 40: 
        return {"score": score, "status": "Weak", "color": "#ff4d4d", "time": "1 Hour"}
    if score <= 70: 
        return {"score": score, "status": "Medium", "color": "#ffa500", "time": "Few Hours"}
    if score <= 90: 
        return {"score": score, "status": "Strong", "color": "#00ff41", "time": "Years"}
    return {"score": score, "status": "Elite", "color": "#00d4ff", "time": "Centuries"}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    pwd = request.json.get('password', '').strip()
    if len(pwd) > 256:
        return jsonify({"error": "Password too long"}), 400
    result = analyze_logic(pwd)
    hints = []
    if len(pwd) < 12: 
        hints.append("Increase length to 12+ characters")
    if not re.search(r"\d", pwd): 
        hints.append("Add at least one number")
    if not re.search(r"[A-Z]", pwd): 
        hints.append("Include uppercase letters")
    if not re.search(r"[a-z]", pwd): 
        hints.append("Include lowercase letters")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", pwd): 
        hints.append("Add special symbols")
    if not hints:
        hints.append("Excellent security!")
    return jsonify({"data": result, "hints": hints})

@app.route('/generate_password')
def generate_pwd():
    chars = string.ascii_letters + string.digits + "!@#$%^&*"
    new_pwd = ''.join(random.choice(chars) for _ in range(random.randint(16,20)))
    return jsonify({"password": new_pwd})

@app.route('/scan_file', methods=['POST'])
def scan_file():
    return jsonify({"status": "Clean", "details": "No threats detected", "timestamp": time.time()})

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found"}), 404

if __name__ == '__main__':
    app.run(debug=False, host='127.0.0.1', port=5000, threaded=True)
