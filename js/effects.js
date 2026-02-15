// ============================================
// EFFECTS — Particles, confetti, background
// ============================================

function createBurstParticles(color, count) {
  const container = document.querySelector("#lootbox-container-ow");
  if (!container) return; // Prevention
  const rect = container.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    particle.className = "burst-particle";
    particle.style.background = color;
    particle.style.left = cx + "px";
    particle.style.top = cy + "px";
    particle.style.position = "fixed";
    particle.style.zIndex = "35";
    particle.style.width = 4 + Math.random() * 8 + "px";
    particle.style.height = particle.style.width;
    particle.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    document.body.appendChild(particle);

    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const distance = 100 + Math.random() * 200;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    gsap.to(particle, {
      x: dx,
      y: dy,
      opacity: 0,
      scale: 0,
      rotation: Math.random() * 720 - 360,
      duration: 0.8 + Math.random() * 0.6,
      ease: "power2.out",
      onComplete: () => particle.remove(),
    });
  }
}

function fireConfetti(tier) {
  const isSpecial = tier.id === "legendary" || tier.id === "epic";

  confetti({
    particleCount: isSpecial ? 150 : 60,
    spread: isSpecial ? 100 : 60,
    origin: { y: 0.5 },
    colors: [tier.color, tier.glowColor, "#ffd54f", "#fff"],
    gravity: 0.8,
    scalar: isSpecial ? 1.2 : 0.9,
    shapes: ["circle", "square"],
  });

  if (isSpecial) {
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.5 },
        colors: [tier.color, "#ffd54f"],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.5 },
        colors: [tier.color, "#ffd54f"],
      });
    }, 200);

    if (tier.id === "legendary") {
      setTimeout(() => {
        confetti({
          particleCount: 30,
          spread: 360,
          startVelocity: 30,
          ticks: 100,
          origin: { x: 0.5, y: 0.3 },
          colors: ["#ff9800", "#ffb74d", "#ffd54f", "#fff9c4"],
          shapes: ["star"],
          scalar: 1.5,
        });
      }, 400);
    }
  }
}

function startBackgroundParticles() {
  const symbols = ["🌸", "✨", "🏮", "💮", "⭐", "🎐"];
  const particlesBg = document.querySelector("#particles-bg");

  function createParticle() {
    const particle = document.createElement("div");
    particle.className = "floating-particle hoa-mai";
    particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    particle.style.left = Math.random() * 100 + "%";
    particle.style.fontSize = 16 + Math.random() * 20 + "px";
    particle.style.animationDuration = 8 + Math.random() * 12 + "s";
    particle.style.animationDelay = Math.random() * 2 + "s";
    particlesBg.appendChild(particle);

    setTimeout(() => particle.remove(), 22000);
  }

  for (let i = 0; i < 8; i++) {
    setTimeout(createParticle, i * 600);
  }

  setInterval(createParticle, 2500);
}
