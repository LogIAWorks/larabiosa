/* ══════════════════════════════════════════════════════
   LA RABIOSA · comportamiento común
   ══════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── nav sólida al bajar ─────────────────── */
  var nav = document.querySelector('.nav');
  if(nav && !nav.classList.contains('nav--dark')){
    /* si el hero lleva data-nav-hold, el menú no se vuelve sólido hasta dejar el hero atrás */
    var navHold = document.querySelector('[data-nav-hold]');
    var onScroll = function(){
      var limit = 60;
      if(navHold) limit = Math.max(60, navHold.offsetHeight - nav.offsetHeight);
      nav.classList.toggle('solid', window.scrollY > limit);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  }

  /* ── menú móvil ──────────────────────────── */
  var burger = document.querySelector('.burger');
  var links  = document.querySelector('.nav-links');
  if(burger && links){
    burger.addEventListener('click', function(){
      var open = links.classList.toggle('open');
      burger.classList.toggle('active', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    links.addEventListener('click', function(e){
      if(e.target.tagName === 'A'){
        links.classList.remove('open');
        burger.classList.remove('active');
        burger.setAttribute('aria-expanded','false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── menú que se vuelve negro sobre los bloques negros (data-nav-adapt) ── */
  var navAdapt = document.querySelector('.nav[data-nav-adapt]');
  if(navAdapt){
    var oscuros = Array.prototype.slice.call(document.querySelectorAll('.sec--dark, .menus, .run, .pantry--dark, .foot:not(.foot--light), [data-nav-dark]'));
    var naTick = false;
    var navAdaptRun = function(){
      var h = navAdapt.offsetHeight, on = false;
      for(var i = 0; i < oscuros.length; i++){
        var r = oscuros[i].getBoundingClientRect();
        if(r.top <= h && r.bottom > h){ on = true; break; }   /* el bloque oscuro pasa por debajo del menú */
      }
      navAdapt.classList.toggle('nav--night', on);
    };
    window.addEventListener('scroll', function(){
      if(naTick) return; naTick = true;
      requestAnimationFrame(function(){ navAdaptRun(); naTick = false; });
    }, {passive:true});
    window.addEventListener('resize', navAdaptRun, {passive:true});
    window.addEventListener('load', navAdaptRun);
    navAdaptRun();
  }

  /* ── reveal al entrar ──────────────────────
     Regla de oro: el contenido NUNCA puede quedarse
     escondido. Tres capas de seguridad:
       1. lo que ya se ve al cargar, se muestra ya
       2. el observador se encarga del resto
       3. a los 2,5 s se muestra todo pase lo que pase
     ────────────────────────────────────────── */
  window.__revelar = function(sel, retardo){
    var els = Array.prototype.slice.call(document.querySelectorAll(sel));
    if(!els.length) return;

    var mostrar = function(el){ el.classList.add('in'); };

    if(!('IntersectionObserver' in window) || reduce){
      els.forEach(mostrar);
      return;
    }

    /* 1 · lo que ya está a la vista (con 250px de margen) */
    var alto = window.innerHeight || 800;
    els.forEach(function(el, i){
      if(retardo) el.style.transitionDelay = (Math.min(i % 5, 4) * 70) + 'ms';
      var r = el.getBoundingClientRect();
      if(r.top < alto + 250 && r.bottom > -250) mostrar(el);
    });

    /* 2 · el resto, según entran */
    var pend = els.filter(function(el){ return !el.classList.contains('in'); });
    if(pend.length){
      var ro = new IntersectionObserver(function(en){
        en.forEach(function(e){
          if(e.isIntersecting){ mostrar(e.target); ro.unobserve(e.target); }
        });
      }, {rootMargin:'0px 0px -5% 0px', threshold:0});
      pend.forEach(function(el){ ro.observe(el); });
    }

    /* 3 · red de seguridad */
    setTimeout(function(){ els.forEach(mostrar); }, 2500);
  };

  window.__revelar('.reveal', true);

  /* ── bloques que se animan al llegar a ellos (data-arrive), sin la red de los 2,5 s ── */
  var arrives = Array.prototype.slice.call(document.querySelectorAll('[data-arrive]'));
  if(arrives.length){
    var llegar = function(el){ el.classList.add('in'); };
    if(!('IntersectionObserver' in window) || reduce){ arrives.forEach(llegar); }
    else {
      var ao = new IntersectionObserver(function(en){
        en.forEach(function(e){ if(e.isIntersecting){ llegar(e.target); ao.unobserve(e.target); } });
      }, {threshold:.5});   /* arranca cuando el bloque está bien a la vista, no al asomar */
      arrives.forEach(function(el){ ao.observe(el); });
      var arrTick = false;
      window.addEventListener('scroll', function(){
        if(arrTick) return; arrTick = true;
        requestAnimationFrame(function(){ arrTick = false;
        arrives.forEach(function(el){
          if(el.classList.contains('in')) return;
          var r = el.getBoundingClientRect();
          if(r.top < window.innerHeight * .6 && r.bottom > 0){ llegar(el); ao.unobserve(el); }
        });
        });
      }, {passive:true});
    }
  }

  /* ── fotos que esperan al usuario (.mask--wait): la cortina se abre al llegar a SU apartado ── */
  var waits = Array.prototype.slice.call(document.querySelectorAll('.mask--wait'));
  if(waits.length){
    var grupoDe = function(el){ return el.closest('section') || el.parentElement; };
    var abrirGrupo = function(g){
      if(g.__abierto) return; g.__abierto = true;
      waits.filter(function(el){ return grupoDe(el) === g; }).forEach(function(el, i){
        el.style.transitionDelay = (i * 220) + 'ms'; el.classList.add('in');
      });
    };
    if(!('IntersectionObserver' in window) || reduce){ waits.forEach(function(el){ abrirGrupo(grupoDe(el)); }); }
    else {
      var wo = new IntersectionObserver(function(en){
        en.forEach(function(e){ if(e.isIntersecting){ abrirGrupo(grupoDe(e.target)); wo.unobserve(e.target); } });
      }, {threshold:.35});
      waits.forEach(function(el){ wo.observe(el); });
      /* seguridad: si no llega a cruzar el umbral, se abre igual al pasar por él */
      var wTick = false;
      window.addEventListener('scroll', function(){
        if(wTick) return; wTick = true;
        requestAnimationFrame(function(){ wTick = false;
        waits.forEach(function(el){
          var g = grupoDe(el); if(g.__abierto) return;
          var r = el.getBoundingClientRect();
          if(r.top < window.innerHeight * .9 && r.bottom > 0) abrirGrupo(g);
        });
        });
      }, {passive:true});
    }
  }

  /* ── vídeos: reproducir solo en pantalla ─── */
  var vids = document.querySelectorAll('[data-lazy-video]');
  /* cargar un vídeo (src + descarga) sin reproducirlo: se hace UNA pantalla antes de que asome,
     para que el arranque del descodificador no coincida con el scroll del usuario */
  window.__cargarVideo = function(v){
    if(v.__cargado) return; v.__cargado = true;
    if(!v.src && v.dataset.src){ v.src = (window.innerWidth >= 961 && v.dataset.srcHd) ? v.dataset.srcHd : v.dataset.src; }   /* HD en escritorio, 1080 en móvil */
    if(v.preload === 'none'){ v.preload = 'auto'; v.load(); }
  };
  if(vids.length && 'IntersectionObserver' in window){
    var vpre = new IntersectionObserver(function(en){
      en.forEach(function(e){ if(e.isIntersecting){ window.__cargarVideo(e.target); vpre.unobserve(e.target); } });
    }, {rootMargin:'100% 0px 100% 0px', threshold:0});
    var vo = new IntersectionObserver(function(en){
      en.forEach(function(e){
        var v = e.target;
        if(e.isIntersecting){
          window.__cargarVideo(v);
          var p = v.play(); if(p && p.catch) p.catch(function(){});
        } else { v.pause(); }
      });
    }, {threshold:.2});
    vids.forEach(function(v){ vpre.observe(v); vo.observe(v); });
  }

  /* ── año en el pie ───────────────────────── */
  var y = document.getElementById('year');
  if(y) y.textContent = new Date().getFullYear();

  /* ══════════════════════════════════════════
     GALERÍA: filtros + lightbox
     ══════════════════════════════════════════ */
  var mosaic = document.querySelector('.mosaic');
  if(mosaic){
    var tiles  = Array.prototype.slice.call(mosaic.querySelectorAll('.tile'));
    var chips  = Array.prototype.slice.call(document.querySelectorAll('.chip'));
    var counter= document.querySelector('.gal-count');
    var visible = tiles.slice();

    function updateCount(){
      if(counter) counter.textContent = visible.length + (visible.length === 1 ? ' pieza' : ' piezas');
    }

    /* contadores por categoría */
    chips.forEach(function(chip){
      var cat = chip.dataset.filter;
      var n = cat === 'all' ? tiles.length : tiles.filter(function(t){ return t.dataset.cat === cat; }).length;
      var c = chip.querySelector('.c');
      if(c) c.textContent = n;
    });

    chips.forEach(function(chip){
      chip.addEventListener('click', function(){
        var cat = chip.dataset.filter;
        chips.forEach(function(c){ c.setAttribute('aria-pressed', String(c === chip)); });
        visible = [];
        tiles.forEach(function(t){
          var show = (cat === 'all' || t.dataset.cat === cat);
          t.hidden = !show;
          if(show) visible.push(t);
        });
        updateCount();
      });
    });
    updateCount();

    /* lightbox */
    var lb = document.querySelector('.lb');
    if(lb){
      var lbImg  = lb.querySelector('.lb-img');
      var lbCap  = lb.querySelector('.lb-cap');
      var lbN    = lb.querySelector('.lb-n');
      var idx = 0;

      function show(i){
        if(!visible.length) return;
        idx = (i + visible.length) % visible.length;
        var t = visible[idx];
        var src = t.dataset.full || (t.querySelector('img') && t.querySelector('img').src);
        var title = t.dataset.title || '';
        var sub = t.dataset.sub || '';
        lbImg.src = src;
        lbImg.alt = title;
        lbCap.innerHTML = '<b>' + title + '</b>' + sub;
        lbN.textContent = (idx + 1) + ' / ' + visible.length;
      }
      function open(t){
        var i = visible.indexOf(t);
        if(i < 0) return;
        show(i);
        lb.classList.add('on');
        document.body.style.overflow = 'hidden';
        lb.querySelector('.lb-close').focus();
      }
      function close(){
        lb.classList.remove('on');
        document.body.style.overflow = '';
        lbImg.src = '';
      }

      tiles.forEach(function(t){
        t.addEventListener('click', function(){ open(t); });
      });
      lb.querySelector('.lb-close').addEventListener('click', close);
      lb.querySelector('.lb-prev').addEventListener('click', function(){ show(idx - 1); });
      lb.querySelector('.lb-next').addEventListener('click', function(){ show(idx + 1); });
      lb.addEventListener('click', function(e){ if(e.target === lb) close(); });
      document.addEventListener('keydown', function(e){
        if(!lb.classList.contains('on')) return;
        if(e.key === 'Escape') close();
        if(e.key === 'ArrowLeft') show(idx - 1);
        if(e.key === 'ArrowRight') show(idx + 1);
      });

      /* deslizar en móvil */
      var x0 = null;
      lb.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; }, {passive:true});
      lb.addEventListener('touchend', function(e){
        if(x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0;
        if(Math.abs(dx) > 55) show(idx + (dx < 0 ? 1 : -1));
        x0 = null;
      }, {passive:true});
    }
  }

  /* ══════════════════════════════════════════
     DESPENSA: imagen fija que cambia al bajar
     ══════════════════════════════════════════ */
  var pantry = document.querySelector('.pantry-grid');
  if(pantry && 'IntersectionObserver' in window){
    var items = Array.prototype.slice.call(pantry.querySelectorAll('.pantry-item'));
    var figs  = Array.prototype.slice.call(pantry.querySelectorAll('.pantry-figure img'));
    if(figs.length) figs[0].classList.add('on');
    if(items.length) items[0].classList.add('active');

    var po = new IntersectionObserver(function(en){
      en.forEach(function(e){
        if(!e.isIntersecting) return;
        var i = items.indexOf(e.target);
        if(i < 0) return;
        items.forEach(function(it,k){ it.classList.toggle('active', k === i); });
        figs.forEach(function(f,k){ f.classList.toggle('on', k === i); });
      });
    }, {rootMargin:'-45% 0px -45% 0px', threshold:0});
    items.forEach(function(it){ po.observe(it); });
  }

  /* ══════════════════════════════════════════
     CARTA: navegación de secciones activa
     ══════════════════════════════════════════ */
  var courseNav = document.querySelector('[data-course-nav]');
  if(courseNav && 'IntersectionObserver' in window){
    var navLinks = Array.prototype.slice.call(courseNav.querySelectorAll('a'));
    var secs = navLinks.map(function(a){ return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
    var co = new IntersectionObserver(function(en){
      en.forEach(function(e){
        if(!e.isIntersecting) return;
        navLinks.forEach(function(a){
          a.setAttribute('aria-pressed', String(a.getAttribute('href') === '#' + e.target.id));
        });
      });
    }, {rootMargin:'-25% 0px -60% 0px', threshold:0});
    secs.forEach(function(s){ co.observe(s); });

    navLinks.forEach(function(a){
      a.addEventListener('click', function(e){
        e.preventDefault();
        var t = document.querySelector(a.getAttribute('href'));
        if(t) window.scrollTo({top: t.offsetTop - 110, behavior: reduce ? 'auto' : 'smooth'});
      });
    });
  }

})();

/* ══════════════════════════════════════════════════════
   SISTEMA v2 · movimiento
   ══════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── revelado línea a línea y máscaras ──── */
  if(window.__revelar){
    window.__revelar('.rl', false);
    window.__revelar('.mask:not(.mask--wait)', false);
  } else {
    document.querySelectorAll('.rl,.mask').forEach(function(el){ el.classList.add('in'); });
  }

  /* ── transición al salir de la página ────
     Sin animación de entrada: cualquier fallo ahí
     dejaría la pantalla en negro. Solo al navegar.
     ──────────────────────────────────────── */
  if(!reduce){
    var pt = document.createElement('div');
    pt.className = 'pt';
    document.body.appendChild(pt);

    document.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('a');
      if(!a) return;
      var href = a.getAttribute('href') || '';
      if(a.target === '_blank' || a.hasAttribute('download')) return;
      if(href.indexOf('#') === 0 || href.indexOf('http') === 0) return;
      if(href.indexOf('tel:') === 0 || href.indexOf('mailto:') === 0) return;
      if(!/\.html($|[?#])/.test(href)) return;
      var aqui = location.pathname.split('/').pop() || 'index.html';
      if(href.split('#')[0] === aqui) return;

      e.preventDefault();
      pt.classList.add('in');
      /* red de seguridad: si algo falla, navega igual */
      setTimeout(function(){ location.href = href; }, 420);
    });

    /* si se vuelve atrás desde la caché, destapar */
    window.addEventListener('pageshow', function(){ pt.classList.remove('in'); });
  }

  /* ── hero con profundidad (galería) ─────── */
  var deep = document.querySelector('.phero--deep');
  if(deep && !reduce){
    var deepImg = deep.querySelector('picture img, img, video'), deepInner = deep.querySelector('.phero-inner, .stage-body');
    var deepTick = false;
    var deepRun = function(){
      var h = deep.offsetHeight || 1;
      var p = Math.min(1, Math.max(0, window.scrollY / h));   /* 0 = hero entero · 1 = tapado */
      if(deepImg) deepImg.style.transform = 'translate3d(0,' + (p * 18).toFixed(2) + '%,0) scale(' + (1 + p * .16).toFixed(3) + ')';
      deep.style.setProperty('--deep', p.toFixed(3));
      if(deepInner){
        deepInner.style.opacity = Math.max(0, 1 - p * 1.6).toFixed(3);
        deepInner.style.transform = 'translate3d(0,' + (p * -40).toFixed(1) + 'px,0)';
      }
    };
    window.addEventListener('scroll', function(){
      if(deepTick) return; deepTick = true;
      requestAnimationFrame(function(){ deepRun(); deepTick = false; });
    }, {passive:true});
    window.addEventListener('resize', deepRun, {passive:true});
    deepRun();
  }

  /* ── galería: la barra de categorías tapa el hueco bajo el menú ── */
  var fbar = document.querySelector('.gal-sec .filter-bar, .course-sticky');
  if(fbar){
    var fbNav = document.querySelector('.nav'), fbTick = false;
    var fbRun = function(){
      var nb = fbNav ? fbNav.getBoundingClientRect().bottom : 0;
      var gap = fbar.getBoundingClientRect().top - nb;
      /* pegada al menú (o casi): rellena exactamente el hueco; si no, nada */
      fbar.style.setProperty('--fb-gap', (gap > 0 && gap <= 14 ? Math.ceil(gap) + 1 : 0) + 'px');
    };
    var fbLate = null;
    window.addEventListener('scroll', function(){
      if(!fbTick){ fbTick = true; requestAnimationFrame(function(){ fbRun(); fbTick = false; }); }
      /* el menú cambia de altura con transición al volverse sólido: remedir cuando acabe */
      clearTimeout(fbLate); fbLate = setTimeout(fbRun, 450);
    }, {passive:true});
    if(fbNav) fbNav.addEventListener('transitionend', fbRun);
    window.addEventListener('resize', fbRun, {passive:true});
    fbRun();
  }

  /* ── The Table: la mesa larga (scroll vertical → recorrido horizontal) ── */
  var run = document.querySelector('.run');
  if(run){
    var runPin = run.querySelector('.run-pin'), runTrack = run.querySelector('.run-track');
    var runBar = run.querySelector('.run-bar i'), runNum = run.querySelector('.run-num');
    var runN = runTrack.children.length, runTick = false, runMq = window.matchMedia('(min-width: 961px)');
    var pad2 = function(n){ return (n < 10 ? '0' : '') + n; };
    var runScroll = function(){
      if(run.classList.contains('run--native')) return;
      var vh = window.innerHeight, r = runPin.getBoundingClientRect();
      var total = runPin.offsetHeight - vh; if(total <= 0) return;
      var p = Math.min(1, Math.max(0, -r.top / total));
      var max = runTrack.scrollWidth - window.innerWidth;
      runTrack.style.transform = 'translate3d(' + (-p * max).toFixed(1) + 'px,0,0)';
      if(runBar) runBar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
      if(runNum) runNum.textContent = pad2(Math.min(runN, Math.floor(p * runN) + 1));
    };
    var runLayout = function(){
      if(!runMq.matches || reduce){ run.classList.add('run--native'); runTrack.style.transform = ''; return; }
      run.classList.remove('run--native');
      /* recorrido vertical = lo que sobresale la mesa + una pantalla de remate */
      var extra = runTrack.scrollWidth - window.innerWidth;
      runPin.style.height = (window.innerHeight + Math.max(extra, 0) * 1.15) + 'px';
      runScroll();
    };
    window.addEventListener('scroll', function(){
      if(runTick) return; runTick = true;
      requestAnimationFrame(function(){ runScroll(); runTick = false; });
    }, {passive:true});
    window.addEventListener('resize', runLayout, {passive:true});
    window.addEventListener('load', runLayout);
    runLayout();
  }

  /* ── portada: bloques anclados que salen de debajo de la sección anterior ── */
  var unders = Array.prototype.slice.call(document.querySelectorAll('.stage--under, .bleed--under'));
  if(unders.length){
    var underTick = false;
    var underPast = function(){
      /* cuando lo siguiente ya lo ha tapado del todo, se suelta (position:relative) para que no asome bajo bloques más cortos */
      unders.forEach(function(u){
        /* offsetTop de un sticky devuelve la posición "pegada"; se calcula desde el hermano anterior, que no lo es */
        var prev = u.previousElementSibling; if(!prev) return;
        var flowTop = prev.offsetTop + prev.offsetHeight + parseFloat(u.style.marginTop || 0);
        var nxt = u.nextElementSibling, dwell = nxt ? parseFloat(nxt.style.marginTop || 0) : 0;
        var end = flowTop + u.offsetHeight + dwell;
        u.classList.toggle('under-past', window.scrollY > end + 20);
      });
    };
    var underLayout = function(){
      unders.forEach(function(u){
        var prev = u.previousElementSibling, h = u.offsetHeight;
        if(prev) h = Math.min(h, prev.offsetHeight);
        u.style.marginTop = (-h) + 'px';   /* escondido bajo la sección anterior; sticky lo destapa */
        /* el respiro va como margen superior del bloque SIGUIENTE: un margen inferior en el propio sticky
           recorta su rango de anclaje (Chrome lo resta del final del body) y lo empuja hacia arriba */
        u.style.marginBottom = '';
        var nxt = u.nextElementSibling;
        if(nxt) nxt.style.marginTop = (u.offsetHeight + Math.round(window.innerHeight * 0.25)) + 'px';
      });
      underPast();
    };
    window.addEventListener('scroll', function(){
      if(underTick) return; underTick = true;
      requestAnimationFrame(function(){ underPast(); underTick = false; });
    }, {passive:true});
    window.addEventListener('resize', underLayout, {passive:true});
    window.addEventListener('load', underLayout);
    underLayout();
  }

  /* ── parallax suave en escenarios ───────── */
  var stages = document.querySelectorAll('.stage:not(.phero--deep) > video,.stage:not(.phero--deep) > img');
  if(stages.length && !reduce){
    var tick = false;
    window.addEventListener('scroll', function(){
      if(tick) return;
      tick = true;
      requestAnimationFrame(function(){
        stages.forEach(function(el){
          var st = el.parentElement.getBoundingClientRect();
          if(st.bottom < 0 || st.top > window.innerHeight) return;
          var p = (st.top / window.innerHeight) * 14;
          el.style.transform = 'translate3d(0,' + p.toFixed(2) + 'px,0)';   /* sin escala: el vídeo a su tamaño */
        });
        tick = false;
      });
    }, {passive:true});
  }
})();

/* ══════════════════════════════════════════════════════
   PROFUNDIDAD · vídeo de fondo en 3D + carrusel que sube
   ══════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var zona = document.querySelector('.depth-rice');
  if(!zona) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pin  = zona.querySelector('.depth-pin');
  var bg   = document.querySelector('.depth-bg-in');
  var vid  = bg && bg.querySelector('video');

  /* sin movimiento: todo en su sitio y a correr */
  if(reduce){
    if(bg){ bg.style.setProperty('--z',0); bg.style.setProperty('--s',1.02); bg.style.setProperty('--rx',0); }
    return;
  }

  var lim = function(v,a,b){ return v < a ? a : (v > b ? b : v); };
  /* suavizado: entra y sale despacio */
  var suave = function(v){ return v * v * (3 - 2 * v); };
  /* tramo: convierte un rango en 0..1 */
  var tramo = function(p,a,b){ return suave(lim((p - a) / (b - a), 0, 1)); };

  var ticking = false;
  function pintar(){
    var r = zona.getBoundingClientRect();
    var recorrido = zona.offsetHeight - window.innerHeight;
    if(recorrido <= 0) return;
    var p = lim(-r.top / recorrido, 0, 1);

    /* el vídeo sale del fondo hacia el frente */
    if(bg){
      bg.style.setProperty('--z', 0);   /* sin profundidad 3D: inclinar y alejar el vídeo obligaba a ampliarlo un 20 % para tapar los bordes */
      bg.style.setProperty('--s', 1);   /* a su tamaño: nada de zoom */
      bg.style.setProperty('--rx', 0);
      bg.style.setProperty('--veil', (0.55 + 0.15 * tramo(p,.35,1)).toFixed(2));   /* velo suave: el vídeo se ve limpio; el título lleva sombra de letra */
    }

    /* el titular se va cuando empieza a subir el carrusel */
    var salida = tramo(p, .30, .58);
    pin.style.setProperty('--tOp', (1 - salida).toFixed(3));
    pin.style.setProperty('--tY',  (-170 * salida).toFixed(1));

    /* el carrusel sube desde abajo y se queda */
    var subida = tramo(p, .34, .68);
    pin.style.setProperty('--rY',  (58 * (1 - subida)).toFixed(2));
    pin.style.setProperty('--rOp', subida.toFixed(3));
  }

  function alScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(function(){ pintar(); ticking = false; });
  }

  window.addEventListener('scroll', alScroll, {passive:true});
  window.addEventListener('resize', alScroll, {passive:true});
  pintar();

  /* el vídeo solo corre mientras la zona se ve */
  if(vid && 'IntersectionObserver' in window){
    var cargar = window.__cargarVideo || function(v){
      if(!v.src && v.dataset.src){ v.src = (window.innerWidth >= 961 && v.dataset.srcHd) ? v.dataset.srcHd : v.dataset.src; }
      if(v.preload === 'none'){ v.preload = 'auto'; v.load(); }
    };
    /* se descarga una pantalla antes de llegar; se reproduce solo mientras la zona se ve */
    var zpre = new IntersectionObserver(function(en){
      en.forEach(function(e){ if(e.isIntersecting){ cargar(vid); zpre.unobserve(zona); } });
    }, {rootMargin:'100% 0px 100% 0px', threshold:0});
    zpre.observe(zona);
    new IntersectionObserver(function(en){
      en.forEach(function(e){
        if(e.isIntersecting){
          cargar(vid);
          var pr = vid.play(); if(pr && pr.catch) pr.catch(function(){});
        } else vid.pause();
      });
    }, {threshold:0}).observe(zona);
  }
})();


/* ══════════════════════════════════════════════════════
   CARRUSEL HORIZONTAL · flechas, contador y línea (sin barra nativa)
   ══════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.rail-nav').forEach(function(nav){
    var rail = nav.closest('.depth-rail') || nav.closest('.run') || nav.parentElement.parentElement;
    var track = nav.dataset.track ? rail.querySelector(nav.dataset.track) : rail.querySelector('.hscroll'); if(!track) return;
    var prev = nav.querySelector('[data-rail="prev"]'), next = nav.querySelector('[data-rail="next"]');
    var pos = nav.querySelector('.rail-pos i'), line = rail.querySelector('.rail-line i');
    var cards = track.querySelectorAll('.hcard').length ? track.querySelectorAll('.hcard') : track.children;
    var pad2 = function(n){ return (n < 10 ? '0' : '') + n; };
    var step = function(){ return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth; };
    var paint = function(){
      var max = track.scrollWidth - track.clientWidth, x = track.scrollLeft;
      var p = max > 0 ? x / max : 0;
      if(line) line.style.setProperty('--p', p.toFixed(3));
      if(pos) pos.textContent = pad2(Math.min(cards.length, Math.round(x / step()) + 1));
      if(prev) prev.disabled = x <= 2;
      if(next) next.disabled = x >= max - 2;
    };
    var go = function(dir){ track.scrollBy({left: dir * step(), behavior: reduce ? 'auto' : 'smooth'}); };
    if(prev) prev.addEventListener('click', function(){ go(-1); });
    if(next) next.addEventListener('click', function(){ go(1); });
    var tick = false;
    track.addEventListener('scroll', function(){ if(tick) return; tick = true; requestAnimationFrame(function(){ paint(); tick = false; }); }, {passive:true});
    window.addEventListener('resize', paint, {passive:true});
    paint();
  });
})();

/* ══════════════════════════════════════════════════════
   ARROCES PARA LLEVAR · vídeo con sonido, solo al pulsar
   ══════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var fig = document.querySelector('.llevar-phone'); if(!fig) return;
  var v = fig.querySelector('video'), btn = fig.querySelector('.llevar-play'); if(!v || !btn) return;
  var arrancar = function(){
    if(!v.src){ v.src = (window.innerWidth >= 961 && v.dataset.srcHd) ? v.dataset.srcHd : v.dataset.src; v.preload = 'auto'; v.load(); }
    v.controls = true; fig.classList.add('playing');
    var p = v.play(); if(p && p.catch) p.catch(function(){});
  };
  btn.addEventListener('click', arrancar);
  v.addEventListener('ended', function(){ fig.classList.remove('playing'); v.controls = false; });
  /* si el usuario se va, el vídeo se calla */
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(en){ en.forEach(function(e){ if(!e.isIntersecting && !v.paused) v.pause(); }); }, {threshold:.15}).observe(v);
  }
})();

/* ══════════════════════════════════════════════════════
   ARROCES PARA LLEVAR · variante B: la explicación de Juan en un diálogo
   ══════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var btn = document.getElementById('llevarVer'), dlg = document.getElementById('llevarDialog'); if(!btn || !dlg) return;
  var v = dlg.querySelector('video'), cerrar = document.getElementById('llevarCerrar');
  var abrir = function(){
    if(!v.src){ v.src = (window.innerWidth >= 961 && v.dataset.srcHd) ? v.dataset.srcHd : v.dataset.src; v.preload = 'auto'; }
    if(dlg.showModal) dlg.showModal(); else dlg.setAttribute('open','');
    var p = v.play(); if(p && p.catch) p.catch(function(){});
  };
  var fin = function(){ v.pause(); if(dlg.open) dlg.close(); };
  btn.addEventListener('click', abrir);
  if(cerrar) cerrar.addEventListener('click', fin);
  dlg.addEventListener('click', function(e){ if(e.target === dlg) fin(); });
  dlg.addEventListener('close', function(){ v.pause(); });
})();
