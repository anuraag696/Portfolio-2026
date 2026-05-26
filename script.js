document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     CUSTOM POINTER CURSOR
     ========================================================================== */
  const cursorDot = document.getElementById('cursor-dot');
  const cursorOutline = document.getElementById('cursor-outline');
  
  let mouseX = -1000, mouseY = -1000; // Mouse actual position
  let dotX = 0, dotY = 0;     // Dot position
  let outlineX = 0, outlineY = 0; // Outline position
  
  // Speed factors for smooth interpolation (lerp)
  const dotSpeed = 1; // Instant
  const outlineSpeed = 0.15; // Sleek lag
  
  // Track mouse coordinates
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  // Interpolation loop
  function animateCursor() {
    // Lerp dot
    dotX += (mouseX - dotX) * dotSpeed;
    dotY += (mouseY - dotY) * dotSpeed;
    
    // Lerp outline
    outlineX += (mouseX - outlineX) * outlineSpeed;
    outlineY += (mouseY - outlineY) * outlineSpeed;
    
    // Set styles
    cursorDot.style.left = `${dotX}px`;
    cursorDot.style.top = `${dotY}px`;
    
    cursorOutline.style.left = `${outlineX}px`;
    cursorOutline.style.top = `${outlineY}px`;
    
    requestAnimationFrame(animateCursor);
  }
  
  // Start cursor animation
  requestAnimationFrame(animateCursor);
  
  // Hover target effects
  const hoverTargets = document.querySelectorAll('.hover-target');
  
  hoverTargets.forEach(target => {
    target.addEventListener('mouseenter', () => {
      cursorDot.classList.add('cursor-hover');
      cursorOutline.classList.add('cursor-hover');
    });
    
    target.addEventListener('mouseleave', () => {
      cursorDot.classList.remove('cursor-hover');
      cursorOutline.classList.remove('cursor-hover');
    });
  });

  /* ==========================================================================
     DYNAMIC CANVAS BACKGROUND (PARTICLE CONSTELLATION SYSTEM)
     ========================================================================== */
  const canvas = document.getElementById('canvas-bg');
  const ctx = canvas.getContext('2d');
  
  let particles = [];
  let connectionDistance = 110;
  let particleCount = 75;
  let mouseRadius = 130;
  
  // Set canvas scale relative to display density
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Adjust density based on screen size
    if (window.innerWidth < 768) {
      particleCount = 35;
      connectionDistance = 80;
    } else {
      particleCount = 80;
      connectionDistance = 110;
    }
    
    initParticles();
  }
  
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1; // particle radius
      this.baseSpeedX = Math.random() * 0.4 - 0.2;
      this.baseSpeedY = Math.random() * 0.4 - 0.2;
      this.speedX = this.baseSpeedX;
      this.speedY = this.baseSpeedY;
      
      // Assign either Cyan or Indigo tint
      this.color = Math.random() > 0.45 ? 'rgba(0, 229, 255, 0.6)' : 'rgba(83, 69, 247, 0.5)';
    }
    
    update() {
      // Handle boundary collision
      if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
      if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;
      
      // Move particles
      this.x += this.speedX;
      this.y += this.speedY;
      
      // Interactive mouse attraction/repulsion
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const distance = Math.hypot(dx, dy);
      
      if (distance < mouseRadius) {
        // Slow force towards pointer
        const force = (mouseRadius - distance) / mouseRadius;
        this.x += (dx / distance) * force * 0.5;
        this.y += (dy / distance) * force * 0.5;
      }
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }
  
  function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }
  
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist < connectionDistance) {
          // Opacity decreases as distance increases
          const opacity = (connectionDistance - dist) / connectionDistance;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 229, 255, ${opacity * 0.08})`; // cyan connection
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }
  
  function animateBG() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    drawConnections();
    requestAnimationFrame(animateBG);
  }
  
  // Initialize Background Canvas
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  requestAnimationFrame(animateBG);

  /* ==========================================================================
     TYPEWRITER EFFECT (HERO TAGLINE)
     ========================================================================== */
  const typewriterText = document.getElementById('typewriter');
  const taglines = [
    "Building Technology, Leading Communities.",
    "Aspiring Data Scientist • Loves Diving into AI",
    "Full Stack Developer • IEEE Chairperson",
    "Code. Design. Lead."
  ];
  
  let currentWordIndex = 0;
  let currentCharIndex = 0;
  let isDeleting = false;
  let typingSpeed = 70;
  let deletingSpeed = 40;
  let wordDelay = 2000;
  
  function type() {
    const currentWord = taglines[currentWordIndex];
    
    if (isDeleting) {
      // Remove character
      typewriterText.textContent = currentWord.substring(0, currentCharIndex - 1);
      currentCharIndex--;
    } else {
      // Add character
      typewriterText.textContent = currentWord.substring(0, currentCharIndex + 1);
      currentCharIndex++;
    }
    
    let timer = isDeleting ? deletingSpeed : typingSpeed;
    
    if (!isDeleting && currentCharIndex === currentWord.length) {
      // Pause at full word
      timer = wordDelay;
      isDeleting = true;
    } else if (isDeleting && currentCharIndex === 0) {
      isDeleting = false;
      // Cycle to next word
      currentWordIndex = (currentWordIndex + 1) % taglines.length;
      timer = 500;
    }
    
    setTimeout(type, timer);
  }
  
  // Start Typewriter
  setTimeout(type, 1000);

  /* ==========================================================================
     INTERACTIVE PROFILE TERMINAL CLI
     ========================================================================== */
  const terminalInput = document.getElementById('terminal-input');
  const terminalHistory = document.getElementById('terminal-history');
  const terminalBody = document.getElementById('terminal-body');
  const cursorOverlay = document.querySelector('.input-cursor');
  
  // Maintain focus on terminal input when terminal container clicked
  terminalBody.addEventListener('click', () => {
    terminalInput.focus();
  });
  
  // Custom terminal cursor tracking
  function updateTerminalCursor() {
    // Rough character width (px) in mono font
    const charWidth = 8.2; 
    const currentText = terminalInput.value;
    cursorOverlay.style.left = `${currentText.length * charWidth}px`;
  }
  
  terminalInput.addEventListener('input', updateTerminalCursor);
  terminalInput.addEventListener('keydown', (e) => {
    // Align cursor instantly on key events
    setTimeout(updateTerminalCursor, 10);
    
    if (e.key === 'Enter') {
      const command = terminalInput.value.trim().toLowerCase();
      processCommand(command);
      terminalInput.value = '';
      setTimeout(updateTerminalCursor, 10);
    }
  });
  
  const commands = {
    help: () => `
      <table class="terminal-table">
        <tr><td>about</td><td>Display summary of my academic background and profile</td></tr>
        <tr><td>skills</td><td>Display technical skillset grid</td></tr>
        <tr><td>projects</td><td>List highlight projects and source credentials</td></tr>
        <tr><td>experience</td><td>Display professional internships details</td></tr>
        <tr><td>film</td><td>Retrieve information on creative arts & acting credentials</td></tr>
        <tr><td>contact</td><td>Display communication nodes (Phone, Email, LinkedIn, etc.)</td></tr>
        <tr><td>clear</td><td>Clear the terminal display buffer</td></tr>
      </table>
    `,
    about: () => `
      <p><strong>Name:</strong> Anuraag Gupta</p>
      <p><strong>Affiliation:</strong> Amity University Rajasthan, Jaipur</p>
      <p><strong>Discipline:</strong> B.Tech Computer Science & Engineering (2023 - 2027)</p>
      <p><strong>Academic Score:</strong> CGPA 7.59</p>
      <p><strong>Core Positions:</strong> Chairperson, IEEE Student Branch AUR</p>
      <p><strong>Profile:</strong> An aspiring Data Science student who loves diving into AI, blending strategic community leadership as the IEEE Student Branch Chairperson with full-stack development expertise.</p>
    `,
    skills: () => `
      <table class="terminal-table">
        <tr><td>Languages</td><td>HTML5/CSS3 (Advanced), JavaScript (Intermediate), Python (Intermediate), C/C++ (Intermediate), Java (Basic)</td></tr>
        <tr><td>Databases</td><td>MySQL (Intermediate)</td></tr>
        <tr><td>Tools & Platforms</td><td>Git/GitHub, VS Code, AWS (Basic), Linux (Ubuntu/Kali), Nmap, Figma</td></tr>
        <tr><td>Concepts</td><td>REST API Integration, Component Architecture, Responsive Web Design, Network Security Basics</td></tr>
      </table>
    `,
    projects: () => `
      <div style="margin-bottom: 8px;"><strong>1. IEEE Student Branch Official Website</strong> (React.js, React Router, CSS3)</div>
      <div style="margin-left: 12px; margin-bottom: 8px;">- Deployed website for 500+ member student branch (ieeeaur.com). Features dynamic events tagging, workshops catalog, testimonials, and contact hooks.</div>
      
      <div style="margin-bottom: 8px;"><strong>2. React News Blogging Web App</strong> (React.js, REST APIs, Router)</div>
      <div style="margin-left: 12px; margin-bottom: 8px;">- News aggregator application utilizing Axios API loading, category-based rendering, and responsive viewports.</div>
      
      <div style="margin-bottom: 8px;"><strong>3. Personal Cybersecurity Toolkit</strong> (Python)</div>
      <div style="margin-left: 12px;">- A GUI tool carrying 5 cyber modules: Password strength auditor, port scanner, keylogger, file encryption engine, and network scanning utilities.</div>
    `,
    experience: () => `
      <div style="margin-bottom: 8px;"><strong>Front-End Developer Intern</strong> @ Codebucket Solutions Pvt. Ltd., Patna</div>
      <div style="margin-left: 12px; margin-bottom: 12px; color: var(--text-secondary);">- June 2025 - August 2025 (On-site)<br>- Built a news aggregator layout, implemented API loaders, and customized a modular components library.</div>
      
      <div style="margin-bottom: 8px;"><strong>Cyber Security Intern</strong> @ Prodigy InfoTech</div>
      <div style="margin-left: 12px; color: var(--text-secondary);">- April 2025 - May 2025 (Remote)<br>- Engineered Python toolkit security modules and built phishing awareness testing simulation tools.</div>
    `,
    film: () => `
      <p style="color: #a5b4fc;"><i class="fa-solid fa-film"></i> <strong>Creative Highlight - Odyssey Film Festival 2025</strong></p>
      <p style="margin-left: 12px;">Played the lead acting role in the short film <strong>"Asli Pehchaan"</strong> which won the <strong>Best Film Award</strong> at the Odyssey Film Festival 2025. Showcases creative adaptability, public presentation strength, and dynamic communication skills beyond tech frameworks.</p>
    `,
    contact: () => `
      <table class="terminal-table">
        <tr><td>Email</td><td>anuraaggupta2004@gmail.com</td></tr>
        <tr><td>Phone</td><td>+91-85294 85483</td></tr>
        <tr><td>GitHub</td><td>github.com/anuraag696</td></tr>
        <tr><td>LinkedIn</td><td>linkedin.com/in/anuraag-gupta</td></tr>
      </table>
    `
  };
  
  function processCommand(cmd) {
    // Append command echoed
    const cmdEcho = document.createElement('div');
    cmdEcho.className = 'terminal-line terminal-command-echo';
    cmdEcho.innerHTML = `<span class="terminal-prompt">anuraag@aur-server:~$</span> ${cmd}`;
    terminalHistory.appendChild(cmdEcho);
    
    if (cmd === '') return;
    
    // Command handler matching
    if (cmd === 'clear') {
      terminalHistory.innerHTML = '';
      return;
    }
    
    const responseLine = document.createElement('div');
    responseLine.className = 'terminal-line terminal-response';
    
    if (commands[cmd]) {
      responseLine.innerHTML = commands[cmd]();
    } else {
      responseLine.innerHTML = `<span style="color: #ef4444;">Command not found: "${cmd}". Type <span class="cmd-highlight">help</span> for system capabilities.</span>`;
    }
    
    terminalHistory.appendChild(responseLine);
    
    // Scroll terminal to base
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  /* ==========================================================================
     TIMELINE CATEGORY SWITCHER (DUAL MODE TIMELINE)
     ========================================================================== */
  const timelineButtons = document.querySelectorAll('.timeline-toggle-btn');
  const timelineContents = document.querySelectorAll('.timeline-content');
  
  timelineButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active classes
      timelineButtons.forEach(b => b.classList.remove('active'));
      timelineContents.forEach(c => c.classList.remove('active'));
      
      // Set active classes
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
      
      // Retrigger intersection observer animations in the new view
      setTimeout(triggerAnimationsOnScroll, 100);
    });
  });

  /* ==========================================================================
     PROJECTS FILTER CONTROLS
     ========================================================================== */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active filter styling
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.getAttribute('data-filter');
      
      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          // Smooth fade in
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          // Hide from DOM layout
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  /* ==========================================================================
     INTERSECTION OBSERVER (ANIMATE ELEMENTS ON SCROLL)
     ========================================================================== */
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.12
  };
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        
        // Special case: if target is a skills card, animate the skill fills inside it
        if (entry.target.classList.contains('skills-card')) {
          const fills = entry.target.querySelectorAll('.skill-bar-fill');
          fills.forEach(fill => {
            const width = fill.getAttribute('data-width');
            fill.style.width = width;
          });
        }
        
        observer.unobserve(entry.target); // Trigger once
      }
    });
  }, observerOptions);
  
  function triggerAnimationsOnScroll() {
    const fadeElements = document.querySelectorAll('.fade-in-element');
    fadeElements.forEach(el => {
      observer.observe(el);
    });
  }
  
  // Run scroll trigger check
  triggerAnimationsOnScroll();

  /* ==========================================================================
     MOBILE NAVIGATION OVERLAY
     ========================================================================== */
  const mobileToggleBtn = document.querySelector('.mobile-nav-toggle');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  
  function toggleMobileMenu() {
    mobileToggleBtn.classList.toggle('active');
    mobileMenuOverlay.classList.toggle('active');
    document.body.classList.toggle('overflow-hidden'); // Prevent background scrolling
  }
  
  mobileToggleBtn.addEventListener('click', toggleMobileMenu);
  
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenuOverlay.classList.contains('active')) {
        toggleMobileMenu();
      }
    });
  });

  /* ==========================================================================
     NAVBAR TRANSLUCENCY ON SCROLL & SCROLL SPY
     ========================================================================== */
  const header = document.querySelector('.nav-container');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  
  window.addEventListener('scroll', () => {
    // 1. Add background blur and border on scroll down
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // 2. Scroll Spy (Highlight active nav link)
    let currentActiveId = '';
    
    sections.forEach(sec => {
      const sectionTop = sec.offsetTop;
      const sectionHeight = sec.clientHeight;
      
      // Triggers slightly before element touches the header height
      if (window.scrollY >= (sectionTop - varHeightAdjustment())) {
        currentActiveId = sec.getAttribute('id');
      }
    });
    
    if (currentActiveId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentActiveId}`) {
          link.classList.add('active');
        }
      });
    }
  });
  
  function varHeightAdjustment() {
    return window.innerWidth < 768 ? 120 : 150;
  }
  
});
