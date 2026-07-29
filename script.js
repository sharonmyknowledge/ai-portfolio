// script.js — modular, ES module
// Features:
// - Nav toggle (accessible)
// - Smooth scrolling + ScrollSpy
// - Page fade-in
// - Particles background (adaptive, performant)
// - Waveform behind hero (lightweight)

const SELECTORS = {
  navToggle: '#nav-toggle',
  primaryNav: '#primary-nav',
  navLinks: '.nav-list a',
  sections: 'main section[id]',
  body: 'body',
  particlesCanvas: '#particles-canvas',
  waveformCanvas: '#waveform-canvas'
};

// ---------------- Nav toggle ----------------
class NavToggle {
  constructor(toggleSelector, navSelector) {
    this.btn = document.querySelector(toggleSelector);
    this.nav = document.querySelector(navSelector);
    if (!this.btn || !this.nav) return;
    this.btn.addEventListener('click', () => this.toggle());
    // close on outside click
    document.addEventListener('click', (e) => {
      if (!this.nav.contains(e.target) && !this.btn.contains(e.target)) {
        this.close();
      }
    });
  }
  open(){ this.nav.classList.add('open'); this.btn.setAttribute('aria-expanded','true') }
  close(){ this.nav.classList.remove('open'); this.btn.setAttribute('aria-expanded','false') }
  toggle(){ this.nav.classList.toggle('open'); const expanded = this.nav.classList.contains('open'); this.btn.setAttribute('aria-expanded', String(expanded)); }
}

// ---------------- ScrollSpy ----------------
class ScrollSpy {
  constructor(linksSelector, sectionsSelector) {
    this.links = Array.from(document.querySelectorAll(linksSelector));
    this.sections = Array.from(document.querySelectorAll(sectionsSelector));
    if (!this.links.length || !this.sections.length) return;
    this.onScroll = this.onScroll.bind(this);
    window.addEventListener('scroll', this.onScroll, { passive:true });
    this.onScroll();
  }

  onScroll(){
    let currentId = '';
    const offset = Math.max(120, window.innerHeight * 0.12);
    this.sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top + window.pageYOffset - offset;
      if (window.pageYOffset >= top) {
        currentId = sec.id;
      }
    });
    this.links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
  }
}

// ---------------- UI Init ----------------
function initUI(){
  document.body.classList.remove('preload');
  // resume button fallback - ensure the resume link works (already points to resume.pdf)
  const resumeBtn = document.getElementById('resume-btn');
  if (resumeBtn) resumeBtn.addEventListener('click', ()=>{ /* semantics only — link navigates */ });

  // attach smooth click handler to in-page links for browsers that need enhancement
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target){
        e.preventDefault();
        target.scrollIntoView({ behavior:'smooth', block:'start' });
        history.replaceState(null, '', href);
      }
    });
  });

  new NavToggle(SELECTORS.navToggle, SELECTORS.primaryNav);
  new ScrollSpy(SELECTORS.navLinks, SELECTORS.sections);
}

// ---------------- Particles ----------------
class Particles {
  constructor(canvasSelector){
    this.canvas = document.querySelector(canvasSelector);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d', { alpha:true });
    this.particles = [];
    this.ticking = false;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.resize();
    this.createParticles();
    this.raf = requestAnimationFrame(()=>this.animate());
    window.addEventListener('resize', ()=>this.onResize());
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.stop();
    }
  }
  resize(){
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.floor(rect.width * this.dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * this.dpr));
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.scale(this.dpr, this.dpr);
  }
  onResize(){
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.resize();
  }
  createParticles(){
    const area = this.canvas.width * this.canvas.height / (this.dpr * 1000);
    const count = Math.max(14, Math.round(area)); // adaptive
    this.particles = [];
    for (let i=0;i<count;i++){
      this.particles.push({
        x: Math.random()*this.canvas.width/this.dpr,
        y: Math.random()*this.canvas.height/this.dpr,
        r: Math.random()*1.6 + 0.6,
        vx: (Math.random()-0.5)*0.2,
        vy: (Math.random()-0.5)*0.2,
        alpha: 0.08 + Math.random()*0.16
      });
    }
  }
  draw(){
    const ctx = this.ctx;
    ctx.clearRect(0,0,this.canvas.width/this.dpr,this.canvas.height/this.dpr);
    for (const p of this.particles){
      ctx.beginPath();
      ctx.fillStyle = `rgba(212,175,55,${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }
  }
  step(){
    const w = this.canvas.width/this.dpr;
    const h = this.canvas.height/this.dpr;
    for (const p of this.particles){
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;
    }
  }
  animate(){
    this.step();
    this.draw();
    this.raf = requestAnimationFrame(()=>this.animate());
  }
  stop(){ if (this.raf) cancelAnimationFrame(this.raf); }
}

// ---------------- Waveform ----------------
class Waveform {
  constructor(canvasSelector){
    this.canvas = document.querySelector(canvasSelector);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d', { alpha:true });
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.resize();
    this.time = 0;
    this.raf = requestAnimationFrame(()=>this.draw());
    window.addEventListener('resize', ()=>this.resize());
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.stop();
    }
  }
  resize(){
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.floor(rect.width * this.dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * this.dpr));
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.scale(this.dpr, this.dpr);
    this.width = rect.width;
    this.height = rect.height;
  }
  draw(){
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    ctx.clearRect(0,0,w,h);
    this.time += 0.02;
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 2;
    // two layered sine waves
    for (let layer=0; layer<2; layer++){
      ctx.beginPath();
      const amp = (layer===0? 18 : 8);
      const freq = (layer===0? 0.9 : 1.6);
      const phase = this.time * (layer===0? 0.9 : -1.2);
      for (let x=0;x<w;x+=4){
        const norm = x / w;
        const y = h*0.5 + Math.sin(norm * Math.PI * 2 * freq + phase) * amp * Math.sin(this.time*0.3 + norm*Math.PI);
        if (x === 0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
      }
      // gradient stroke
      const grad = ctx.createLinearGradient(0,0,w,0);
      grad.addColorStop(0, 'rgba(212,175,55,0.06)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.02)');
      grad.addColorStop(1, 'rgba(212,175,55,0.06)');
      ctx.strokeStyle = grad;
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    this.raf = requestAnimationFrame(()=>this.draw());
  }
  stop(){ if (this.raf) cancelAnimationFrame(this.raf); }
}

// ---------------- Boot ----------------
document.addEventListener('DOMContentLoaded', ()=>{
  initUI();
  // small delay for better perceived performance
  setTimeout(()=>{
    // Create visual effects if not reduced motion and screen big enough
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced && window.innerWidth > 560){
      try{
        new Particles(SELECTORS.particlesCanvas);
        new Waveform(SELECTORS.waveformCanvas);
      }catch(e){
        // fail gracefully if canvas not supported
        console.warn('Visual effects unavailable', e);
      }
    }
  }, 250);
  // Fade-in body (remove preload)
  requestAnimationFrame(()=> document.body.classList.remove('preload'));
});
