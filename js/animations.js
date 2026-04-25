'use strict';

/**
 * Levitass AI — Animations
 * IntersectionObserver scroll animations + Canvas particles
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
  var maxParticles = 50;
  var animationId = null;

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1
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
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(108, 99, 255, ' + p.opacity + ')';
      ctx.fill();

      // Update position
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap around
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
    }

    // Draw connectors (only for nearby particles)
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          var lineOpacity = (1 - distance / 120) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(108, 99, 255, ' + lineOpacity + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(drawParticles);
  }

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
