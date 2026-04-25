// ==================== ZAIF SECURITY - PREMIUM REDESIGN ====================
// Enhanced Password Analyzer with Multi-Theme System & Cinematic Animations

/* ============================================
   MULTI-THEME SYSTEM
   ============================================ */

const THEME_COLORS = {
    dark: {
        name: 'Dark',
        class: 'theme-dark',
        primary: '#00ff41',
        secondary: '#00d4ff'
    },
    light: {
        name: 'Light',
        class: 'theme-light',
        primary: '#0066cc',
        secondary: '#00a8e8'
    },
    cyan: {
        name: 'Neon Cyan',
        class: 'theme-cyan',
        primary: '#00f0ff',
        secondary: '#00ccff'
    },
    purple: {
        name: 'Electric Purple',
        class: 'theme-purple',
        primary: '#c800ff',
        secondary: '#9d4edd'
    },
    red: {
        name: 'Ink Red',
        class: 'theme-red',
        primary: '#ff3030',
        secondary: '#ff6b6b'
    }
};

function switchTheme(themeName) {
    const theme = THEME_COLORS[themeName];
    if (!theme) return;
    
    // Remove all theme classes
    Object.values(THEME_COLORS).forEach(t => {
        document.body.classList.remove(t.class);
    });
    
    // Add new theme class
    document.body.classList.add(theme.class);
    
    // Save preference
    localStorage.setItem('zaif-theme', themeName);
    
    // Show notification
    showToast(`Switched to ${theme.name} Theme`, 'success');
    
    // Close theme menu
    closeThemeMenu();
}

function openThemeMenu() {
    const menu = document.getElementById('themeMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function closeThemeMenu() {
    document.getElementById('themeMenu').style.display = 'none';
}

function loadSavedTheme() {
    const saved = localStorage.getItem('zaif-theme') || 'dark';
    switchTheme(saved);
}

/* ============================================
   PASSWORD ANALYSIS FUNCTION
   ============================================ */

async function analyze() {
    const inputValue = document.getElementById('pwd').value;
    
    if (!inputValue) {
        resetDisplay();
        return;
    }

    try {
        const response = await fetch('/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: inputValue }),
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) throw new Error('Analysis failed');
        const result = await response.json();
        
        updateDisplay(result.data, result.hints);
    } catch (error) {
        console.error('Error:', error);
        showToast('Analysis error - please try again', 'error');
    }
}

function updateDisplay(data, hints) {
    const offset = 440 - (440 * data.score) / 100;
    const progressRing = document.querySelector('.progress-ring');
    const strengthBar = document.getElementById('strengthBar');
    
    // Animate progress ring
    progressRing.style.stroke = data.color;
    progressRing.style.strokeDashoffset = offset;
    
    // Update strength bar with gradient
    strengthBar.style.width = data.score + '%';
    strengthBar.style.backgroundColor = data.color;
    
    // Update percentage and status
    const percElement = document.getElementById('perc');
    const statusElement = document.getElementById('status');
    const timeElement = document.getElementById('time');
    
    animateValue(percElement, parseInt(percElement.innerText), data.score, 700);
    statusElement.innerText = data.status;
    statusElement.style.color = data.color;
    timeElement.innerText = '⏱️ Crack Time: ' + data.time;
    
    // Update hints
    updateHints(hints);
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(start + (end - start) * progress);
        element.innerText = value + '%';
        
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    };
    
    requestAnimationFrame(step);
}

function resetDisplay() {
    document.querySelector('.progress-ring').style.strokeDashoffset = 440;
    document.getElementById('perc').innerText = '0%';
    document.getElementById('status').innerText = 'ANALYZING';
    document.getElementById('time').innerText = '⏱️ Crack Time: N/A';
    document.getElementById('strengthBar').style.width = '0%';
}

function updateHints(hints) {
    const hintsBox = document.getElementById('hints');
    hintsBox.innerHTML = hints.map((hint, index) => {
        const iconClass = hint.includes('Excellent') ? 'fa-check-circle' : 'fa-lightbulb';
        return `<li style="animation-delay: ${index * 0.1}s;"><i class="fas ${iconClass}"></i> ${hint}</li>`;
    }).join('');
}

/* ============================================
   PASSWORD GENERATION
   ============================================ */

async function generateStrong() {
    const btn = event.target.closest('.btn');
    const originalHTML = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    btn.disabled = true;
    
    try {
        const response = await fetch('/generate_password', {
            signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) throw new Error('Generation failed');
        const data = await response.json();
        
        const pwdInput = document.getElementById('pwd');
        pwdInput.value = data.password;
        pwdInput.type = 'text';
        
        btn.innerHTML = '<i class="fas fa-check"></i> Generated!';
        btn.style.background = 'var(--primary)';
        
        // Copy to clipboard
        navigator.clipboard.writeText(data.password).catch(e => console.log('Copy failed:', e));
        showToast('Password generated & copied!', 'success');
        
        analyze();
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            btn.disabled = false;
        }, 2000);
    } catch (error) {
        console.error('Error:', error);
        showToast('Generation failed', 'error');
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

/* ============================================
   FILE SCANNER
   ============================================ */

function triggerFile() {
    document.getElementById('fileInput').click();
}

async function scanFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const btn = document.getElementById('scanBtn');
    const originalHTML = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-search fa-spin"></i> Scanning...';
    btn.disabled = true;
    
    try {
        setTimeout(async () => {
            const response = await fetch('/scan_file', {
                method: 'POST',
                signal: AbortSignal.timeout(5000)
            });
            
            if (!response.ok) throw new Error('Scan failed');
            const data = await response.json();
            
            btn.innerHTML = '<i class="fas fa-check-circle"></i> Clean';
            btn.style.background = 'var(--secondary)';
            
            showToast(`✓ ${data.status} - ${data.details}`, 'success');
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.disabled = false;
            }, 3000);
        }, 1500);
    } catch (error) {
        console.error('Error:', error);
        showToast('Scan failed', 'error');
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

/* ============================================
   FEEDBACK SUBMISSION
   ============================================ */

function submitFeedback() {
    const area = document.getElementById('feedbackArea');
    const btn = document.getElementById('feedbackBtn');
    
    if (area.value.trim() === '') {
        showToast('Please enter feedback first!', 'warning');
        return;
    }
    
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-paper-plane fa-spin"></i> Sending...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
        btn.style.background = 'var(--primary)';
        area.value = '';
        
        showToast('✓ Report submitted successfully!', 'success');
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            btn.disabled = false;
        }, 2500);
    }, 1500);
}

/* ============================================
   UI INTERACTIONS
   ============================================ */

function toggleEye() {
    const pwd = document.getElementById('pwd');
    const btn = document.querySelector('.eye-toggle');
    pwd.type = pwd.type === 'password' ? 'text' : 'password';
    btn.classList.toggle('viewing');
}

function toggleTheme() {
    document.body.classList.toggle('cyber-white');
    const isDark = document.body.classList.contains('neon-dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    showToast(`Switched to ${isDark ? 'Dark' : 'Light'} Mode`, 'success');
}

/* ============================================
   TOAST NOTIFICATION SYSTEM
   ============================================ */

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

/* ============================================
   SCROLL-BASED REVEAL ANIMATIONS
   ============================================ */

function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    document.querySelectorAll('.reveal').forEach((element) => {
        observer.observe(element);
    });
}

/* ============================================
   PARTICLE SYSTEM
   ============================================ */

function createParticles() {
    const container = document.querySelector('.security-particles');
    if (!container) return;
    
    const particleCount = window.innerWidth > 768 ? 20 : 10;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const duration = Math.random() * 10 + 15;
        const delay = Math.random() * 5;
        const xOffset = (Math.random() - 0.5) * 100;
        
        particle.style.cssText = `
            position: fixed;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: radial-gradient(circle, var(--primary), transparent);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particleFloat ${duration}s linear infinite;
            pointer-events: none;
            z-index: 0;
            opacity: ${Math.random() * 0.5 + 0.2};
            box-shadow: 0 0 ${Math.random() * 10 + 5}px currentColor;
            animation-delay: ${delay}s;
            --xOffset: ${xOffset}px;
        `;
        container.appendChild(particle);
    }
}

/* ============================================
   KEYBOARD SHORTCUTS
   ============================================ */

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        document.getElementById('pwd').focus();
        showToast('Password input focused (Ctrl+K)', 'info');
    }
    if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        generateStrong();
    }
    if (e.key === 'Escape') {
        closeThemeMenu();
    }
});

/* ============================================
   INITIALIZATION
   ============================================ */

window.addEventListener('load', () => {
    // Load saved theme
    loadSavedTheme();
    
    // Create particles
    createParticles();
    
    // Observe elements for reveal animations
    observeElements();
    
    // Add particle animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes particleFloat {
            0% { 
                transform: translateY(0) translateX(0) scale(1);
                opacity: 1;
            }
            100% { 
                transform: translateY(-100vh) translateX(var(--xOffset)) scale(0);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

/* ============================================
   CLOSE THEME MENU ON OUTSIDE CLICK
   ============================================ */

document.addEventListener('click', (e) => {
    const themeMenu = document.getElementById('themeMenu');
    const themeToggle = document.querySelector('.theme-toggle');
    
    if (!themeMenu.contains(e.target) && !themeToggle.contains(e.target)) {
        closeThemeMenu();
    }
});

/* ============================================
   PREVENT CONSOLE EXPOSURE (SECURITY)
   ============================================ */

window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.shiftKey && e.key === 'I') || (e.key === 'F12')) {
        e.preventDefault();
    }
});