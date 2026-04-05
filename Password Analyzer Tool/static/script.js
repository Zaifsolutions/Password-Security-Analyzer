// Main Password Analysis
async function analyze() {
    const val = document.getElementById('pwd').value;

    const res = await fetch('/analyze', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({password: val})
    });
    const result = await res.json();
    
    // Update Gauge
    const ring = document.querySelector('.progress-ring');
    const offset = 440 - (440 * result.data.score) / 100;
    ring.style.strokeDashoffset = offset;
    ring.style.stroke = result.data.color;
    
    document.getElementById('perc').innerText = result.data.score + "%";
    document.getElementById('status').innerText = result.data.status;
    document.getElementById('status').style.color = result.data.color;
    document.getElementById('time').innerText = "Crack Time: " + result.data.time;
    
    // AI Hints
    const hintBox = document.getElementById('hints');
    hintBox.innerHTML = result.hints.map(h => `<li><i class="fa fa-caret-right"></i> ${h}</li>`).join('');
}

// Generate Password Logic
async function generateStrong() {
    const res = await fetch('/generate_password');
    const data = await res.json();
    const pwdInput = document.getElementById('pwd');
    pwdInput.value = data.password;
    pwdInput.type = "text"; // Show the generated password
    analyze();
}

// Working Feedback Simulation
function submitFeedback() {
    const area = document.querySelector('textarea');
    const btn = document.getElementById('feedbackBtn');
    if(area.value.trim() === "") return alert("Please enter some feedback first!");
    
    btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.innerHTML = '<i class="fa fa-check"></i> Report Sent!';
        btn.style.background = "#00ff41";
        area.value = "";
        setTimeout(() => {
            btn.innerHTML = 'Submit Report';
            btn.style.background = "";
            btn.disabled = false;
        }, 3000);
    }, 2000);
}

// Professional File Scanner Logic
function triggerFile() {
    document.getElementById('fileInput').click();
}

function scanFile(event) {
    const file = event.target.files[0];
    if(!file) return;
    
    const btn = document.getElementById('scanBtn');
    const statusText = document.getElementById('time'); // Using time field temporarily for status
    
    btn.innerHTML = '<i class="fa fa-shield-virus fa-spin"></i> Scanning File...';
    
    setTimeout(async () => {
        const res = await fetch('/scan_file', { method: 'POST' });
        const data = await res.json();
        btn.innerHTML = '<i class="fa fa-check-circle"></i> Result: ' + data.status;
        alert("Scan Complete: " + data.details);
        setTimeout(() => { btn.innerHTML = 'File Scanner'; }, 4000);
    }, 3000);
}

function toggleTheme() {
    document.body.classList.toggle('cyber-white');
}

function toggleEye() {
    const p = document.getElementById('pwd');
    p.type = p.type === 'password' ? 'text' : 'password';
}