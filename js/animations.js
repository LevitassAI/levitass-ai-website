'use strict';

/**
 * Levitass AI — Animations
 * IntersectionObserver scroll animations + Canvas particles + Counter animation
 */

(function() {
  // ── Scroll Animations (IntersectionObserver) ──
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var animationClasses = [
    { selector: '.fade-in',       activeClass: 'fade-in--visible' },
    { selector: '.fade-in-left',  activeClass: 'fade-in-left--visible' },
    { selector: '.fade-in-right', activeClass: 'fade-in-right--visible' },
    { selector: '.scale-in',      activeClass: 'scale-in--visible' }
  ];

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add(entry.target.dataset.animClass);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    animationClasses.forEach(function(config) {
      document.querySelectorAll(config.selector).forEach(function(el, index) {
        el.dataset.animClass = config.activeClass;
        el.style.transitionDelay = (index % 4) * 0.1 + 's';
        observer.observe(el);
      });
    });
  } else {
    // Show everything immediately if reduced motion or no IntersectionObserver
    animationClasses.forEach(function(config) {
      document.querySelectorAll(config.selector).forEach(function(el) {
        el.classList.add(config.activeClass);
      });
    });
  }

  // ── Canvas Particle Effect (Hero only) ──
  var canvas = document.getElementById('heroCanvas');
  if (!canvas || prefersReducedMotion) return;

  var ctx = canvas.getContext('2d');
  var particles = [];
  var mouseX = -999;
  var mouseY = -999;
  var maxParticles = window.innerWidth < 768 ? 35 : 70;
  var animationId = null;

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    var colors = [
      { r: 108, g: 99, b: 255 },   // Purple
      { r: 0, g: 194, b: 255 },     // Cyan
      { r: 130, g: 120, b: 255 }    // Light purple
    ];
    var color = colors[Math.floor(Math.random() * colors.length)];
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.6 + 0.1,
      color: color
    };
  }

  function initParticles() {
    particles = [];
    for (var i = 0; i < maxParticles; i++) {
      particles.push(createParticle());
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];

      // Mouse interaction - push particles away
      var dx = p.x - mouseX;
      var dy = p.y - mouseY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        var force = (150 - dist) / 150;
        p.x += dx * force * 0.02;
        p.y += dy * force * 0.02;
      }

      // Draw particle with glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.color.r + ', ' + p.color.g + ', ' + p.color.b + ', ' + p.opacity + ')';
      ctx.shadowColor = 'rgba(' + p.color.r + ', ' + p.color.g + ', ' + p.color.b + ', ' + (p.opacity * 0.5) + ')';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Update position
      p.x += p.speedX;
      p.y += p.speedY;

      // Gentle oscillation
      p.opacity += Math.sin(Date.now() * 0.001 + i) * 0.002;
      p.opacity = Math.max(0.05, Math.min(0.7, p.opacity));

      // Wrap around
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
    }

    // Draw connectors
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          var lineOpacity = (1 - distance / 150) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          
          // Gradient line
          var gradient = ctx.createLinearGradient(
            particles[i].x, particles[i].y,
            particles[j].x, particles[j].y
          );
          gradient.addColorStop(0, 'rgba(' + particles[i].color.r + ', ' + particles[i].color.g + ', ' + particles[i].color.b + ', ' + lineOpacity + ')');
          gradient.addColorStop(1, 'rgba(' + particles[j].color.r + ', ' + particles[j].color.g + ', ' + particles[j].color.b + ', ' + lineOpacity + ')');
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(drawParticles);
  }

  // Mouse tracking
  canvas.addEventListener('mousemove', function(e) {
    var rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', function() {
    mouseX = -999;
    mouseY = -999;
  });

  // Init
  resizeCanvas();
  initParticles();
  drawParticles();

  // Resize handler
  var resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      resizeCanvas();
      maxParticles = window.innerWidth < 768 ? 35 : 70;
      initParticles();
    }, 250);
  });

  // Pause when out of view
  var heroObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        if (!animationId) drawParticles();
      } else {
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      }
    });
  }, { threshold: 0 });

  var heroSection = document.getElementById('hero');
  if (heroSection) {
    heroObserver.observe(heroSection);
  }
})();
