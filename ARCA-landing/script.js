/* ============================================
   ARCA — Landing Interactions
   ============================================ */

(function(){
  'use strict';

  /* ---------- Helpers ---------- */
  const $  = (s,ctx=document)=>ctx.querySelector(s);
  const $$ = (s,ctx=document)=>[...ctx.querySelectorAll(s)];
  const fmtMoney = n => new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₽';

  /* ---------- Header scroll + progress ---------- */
  const header   = $('#header');
  const progress = $('#scrollProgress');
  const floatCta = $('#floatCta');

  function onScroll(){
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    floatCta.classList.toggle('show', y > 700);

    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = $('#burger');
  const menu   = $('#mobileMenu');
  function closeMenu(){
    burger.classList.remove('active');
    menu.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }
  burger.addEventListener('click', ()=>{
    burger.classList.toggle('active');
    menu.classList.toggle('open');
    document.body.classList.toggle('no-scroll', menu.classList.contains('open'));
  });
  $$('.mobile-menu__link, .mobile-menu__cta').forEach(l=>l.addEventListener('click', closeMenu));

  /* ---------- Smooth scroll for in-page anchors ---------- */
  $$('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const id = a.getAttribute('href');
      if(id.length<2) return;
      const target = document.querySelector(id);
      if(!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({top, behavior:'smooth'});
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        const delay = (parseInt(en.target.dataset.delay,10)||0) * 120;
        setTimeout(()=>en.target.classList.add('visible'), delay);
        io.unobserve(en.target);
      }
    });
  }, {threshold:0.12, rootMargin:'0px 0px -60px 0px'});
  revealEls.forEach(el=>io.observe(el));

  /* ---------- Animated counters ---------- */
  const counters = $$('[data-count]');
  const counterIO = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(!en.isIntersecting) return;
      animateCount(en.target);
      counterIO.unobserve(en.target);
    });
  }, {threshold:0.5});
  counters.forEach(c=>counterIO.observe(c));

  function animateCount(el){
    const target = parseInt(el.dataset.count,10);
    const suffix = el.dataset.suffix || '';
    const dur = 1800;
    const start = performance.now();
    function tick(now){
      const p = Math.min((now-start)/dur, 1);
      const eased = 1 - Math.pow(1-p, 3); // easeOutCubic
      el.textContent = Math.round(target * eased).toLocaleString('ru-RU') + suffix;
      if(p<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Hero parallax ---------- */
  const heroBg = $('#heroBg');
  if(heroBg){
    window.addEventListener('scroll', ()=>{
      const y = window.scrollY;
      if(y < window.innerHeight){
        heroBg.style.transform = `scale(1.1) translateY(${y*0.35}px)`;
      }
    }, {passive:true});
  }

  /* ---------- FAQ accordion ---------- */
  $$('.faq-item').forEach(item=>{
    const q = $('.faq-item__q', item);
    q.addEventListener('click', ()=>{
      const isOpen = item.classList.contains('open');
      $$('.faq-item').forEach(i=>i.classList.remove('open'));
      if(!isOpen) item.classList.add('open');
    });
  });

  /* ---------- Calculator ---------- */
  const areaRange   = $('#areaRange');
  const areaVal     = $('#areaVal');
  const levelBtns   = $$('#levelToggles .calc-toggle');
  const options     = $$('#calcOptions input[type="checkbox"]');
  const calcTotal   = $('#calcTotal');

  let currentPrice = 14500; // «Комфорт» по умолчанию

  function recalc(){
    const area = parseInt(areaRange.value,10);
    let add = 0;
    options.forEach(o=>{ if(o.checked) add += parseInt(o.dataset.add,10); });
    add = add * area; // доп. опции тоже за м²
    const total = currentPrice * area + add;
    calcTotal.textContent = 'от ' + fmtMoney(total);
    areaVal.textContent = area + ' м²';
  }

  areaRange.addEventListener('input', recalc);
  levelBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      levelBtns.forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentPrice = parseInt(btn.dataset.price,10);
      recalc();
    });
  });
  options.forEach(o=>o.addEventListener('change', recalc));
  recalc();

  /* ---------- Toast ---------- */
  const toast = $('#toast');
  let toastTimer;
  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>toast.classList.remove('show'), 4000);
  }

  /* ---------- Forms ---------- */
  function handleSubmit(form, msg){
    form.addEventListener('submit', e=>{
      e.preventDefault();
      const name = (form.querySelector('[name="name"]')||{}).value || 'друг';
      showToast(`✓ Спасибо, ${name}! Заявка принята — перезвоним в течение 15 минут.`);
      form.reset();
      // вернуть кнопку CTA калькулятора в дефолт, если это та форма
    });
  }
  handleSubmit($('#leadForm'));
  handleSubmit($('#contactForm'));

  /* ---------- Tilt effect on tariff cards ---------- */
  $$('.tariff').forEach(card=>{
    card.addEventListener('mousemove', e=>{
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = (card.classList.contains('tariff--featured') ? 'scale(1.03) ' : '') +
        `perspective(900px) rotateY(${x*5}deg) rotateX(${-y*5}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', ()=>{
      card.style.transform = '';
    });
  });

  /* ---------- Current year in footer ---------- */
  // (в HTML уже указан год, при необходимости обновлять здесь)

  console.log('%cARCA','color:#d4af37;font-size:24px;font-weight:bold','— премиальный лендинг загружен');
})();
