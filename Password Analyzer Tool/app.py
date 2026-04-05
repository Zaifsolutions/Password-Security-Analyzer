from flask import Flask, render_template, jsonify, request
import re
import random
import string

app = Flask(__name__)

def analyze_logic(pwd):
    if not pwd: return {"score": 0, "status": "Waiting...", "color": "#888", "time": "N/A"}
    
    score = 0
    if len(pwd) >= 8: score += 20
    if len(pwd) >= 12: score += 20
    if re.search(r"\d", pwd): score += 20
    if re.search(r"[A-Z]", pwd): score += 20
    if re.search(r"[!@#$%^&*(),.?\":{}|<>]", pwd): score += 20

    if score <= 40: return {"score": score, "status": "Weak ⚠️", "color": "#ff4d4d", "time": "Instantly"}
    if score <= 70: return {"score": score, "status": "Medium ⚡", "color": "#ffa500", "time": "Few Hours"}
    if score <= 90: return {"score": score, "status": "Strong ✅", "color": "#00ff41", "time": "Years"}
    return {"score": score, "status": "Elite 🛡️", "color": "#00d4ff", "time": "Centuries"}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    pwd = request.json.get('password', '')
    result = analyze_logic(pwd)
    
    hints = []
    if len(pwd) < 12: hints.append("Length should be 12+ characters.")
    if not re.search(r"\d", pwd): hints.append("Include at least one number.")
    if not re.search(r"[!@#$%^&*]", pwd): hints.append("Add special symbols (@, #, $).")
    
    return jsonify({"data": result, "hints": hints if hints else ["System Secure. Excellent work!"]})

@app.route('/generate_password')
def generate_pwd():
    chars = string.ascii_letters + string.digits + "!@#$%^&*"
    new_pwd = ''.join(random.choice(chars) for _ in range(16))
    return jsonify({"password": new_pwd})

@app.route('/scan_file', methods=['POST'])
def scan_file():
    # Simulation of a professional virus/malware scan
    import time
    return jsonify({"status": "Clean", "details": "No threats detected. File is encrypted and safe."})

if __name__ == '__main__':
    app.run(debug=True)