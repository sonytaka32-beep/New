(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const display = $('display'), expressionLine = $('expression');
  const HISTORY_KEY = 'shisui-calc-history-v2', SETTINGS_KEY = 'shisui-calc-settings-v4';
  let input = '0', justEvaluated = false, soundOn = true, scientific = false, angle = 'DEG';
  let history = load(HISTORY_KEY, []), settings = load(SETTINGS_KEY, {theme:'shisui',sound:true,scientific:false,angle:'DEG'});
  function load(key, fallback){try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback}}
  function save(){try{localStorage.setItem(HISTORY_KEY,JSON.stringify(history.slice(0,60)));localStorage.setItem(SETTINGS_KEY,JSON.stringify({theme:document.body.dataset.theme,sound:soundOn,scientific,angle}))}catch{}}
  function showToast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>el.classList.remove('show'),1800)}
  function beep(){if(!soundOn)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const ctx=new C(),o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=620;g.gain.setValueAtTime(.035,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.055);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.06);o.onended=()=>ctx.close()}catch{}}
  function format(n){if(!Number.isFinite(n))throw Error('Hasil tidak valid');if(Math.abs(n)<1e-12)return '0';return Number(n.toPrecision(12)).toString()}
  function render(){display.textContent=input;display.title=input;}
  function append(value){if(justEvaluated && /[0-9.πe]/.test(value[0]||''))input='0';justEvaluated=false;if(input==='Error')input='0';if(value==='.' ){const tail=input.split(/[+−×÷%^()]/).pop();if(tail.includes('.'))return;if(!tail)input+='0';}if(input.length>90)return;input=(input==='0'&&(/^[0-9]$/.test(value)||['sin(','cos(','tan(','sqrt(','log(','ln(','(','π','e'].includes(value)))?value:input+value;render()}
  function factorial(n){if(!Number.isInteger(n)||n<0||n>170)throw Error('Faktorial hanya untuk bilangan bulat 0–170');let r=1;for(let i=2;i<=n;i++)r*=i;return r}
  function tokenize(src){const s=src.replace(/×/g,'*').replace(/[÷]/g,'/').replace(/[−]/g,'-').replace(/π/g,'pi').replace(/√/g,'sqrt');const tokens=[];let i=0;while(i<s.length){if(/\s/.test(s[i])){i++;continue}const num=s.slice(i).match(/^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i);if(num){tokens.push({type:'num',value:Number(num[0])});i+=num[0].length;continue}const word=s.slice(i).match(/^[a-z]+/i);if(word){tokens.push({type:'word',value:word[0].toLowerCase()});i+=word[0].length;continue}if('+-*/%^!()'.includes(s[i])){tokens.push({type:s[i],value:s[i++]});continue}throw Error('Karakter tidak dikenal: '+s[i])}return tokens}
  function evaluate(src){const t=tokenize(src);let p=0;const peek=()=>t[p];const eat=type=>{if(peek()?.type===type)return t[p++];return null};const need=type=>{const x=eat(type);if(!x)throw Error('Ekspresi belum lengkap');return x};
    function primary(){if(eat('+'))return primary();if(eat('-'))return -primary();const n=eat('num');if(n)return n.value;if(eat('(')){const v=add();need(')');return v}const w=eat('word');if(w){if(w.value==='pi')return Math.PI;if(w.value==='e')return Math.E;const arg=primary(),rad=angle==='DEG'?Math.PI/180:1;switch(w.value){case'sqrt':if(arg<0)throw Error('Akar negatif tidak valid');return Math.sqrt(arg);case'sin':return Math.sin(arg*rad);case'cos':return Math.cos(arg*rad);case'tan':return Math.tan(arg*rad);case'log':if(arg<=0)throw Error('Log harus positif');return Math.log10(arg);case'ln':if(arg<=0)throw Error('Ln harus positif');return Math.log(arg);default:throw Error('Fungsi tidak dikenal: '+w.value)}}throw Error('Angka atau fungsi tidak ditemukan')}
    function postfix(){let v=primary();while(eat('!'))v=factorial(v);return v}function power(){let v=postfix();if(eat('^'))v=Math.pow(v,power());return v}function mul(){let v=power();while(peek()&&['*','/','%'].includes(peek().type)){const op=t[p++].type,b=power();if((op==='/'||op==='%')&&b===0)throw Error('Tidak bisa membagi dengan nol');v=op==='*'?v*b:op==='/'?v/b:v%b}return v}function add(){let v=mul();while(peek()&&['+','-'].includes(peek().type)){const op=t[p++].type,b=mul();v=op==='+'?v+b:v-b}return v}
    if(!t.length)throw Error('Masukkan perhitungan');const result=add();if(p!==t.length)throw Error('Periksa tanda kurung atau operator');if(!Number.isFinite(result))throw Error('Hasil di luar batas');return result}
  function calculate(){try{const original=input;const result=evaluate(original);const formatted=format(result);history.unshift({expression:original,result:formatted,time:new Date().toLocaleString()});history=history.slice(0,60);save();expressionLine.textContent=original+' =';input=formatted;justEvaluated=true;render();beep()}catch(e){showToast(e.message||'Perhitungan gagal')}}
  function clear(){input='0';expressionLine.innerHTML='&nbsp;';justEvaluated=false;render()}
  function removeLast(){if(justEvaluated){clear();return}input=input.length>1?input.slice(0,-1):'0';if(input==='-')input='0';render()}
  function toggleSign(){if(justEvaluated){input='-'+input;justEvaluated=false;render();return}const m=input.match(/(\d*\.?\d+|pi|e)$/i);if(!m)return;const start=m.index,part=m[0];input=input.slice(0,start)+(part.startsWith('-')?part.slice(1):'-'+part);render()}
  function percent(){if(justEvaluated){input=format(Number(input)/100);justEvaluated=false;render();return}const m=input.match(/(\d*\.?\d+)$/);if(m){input=input.slice(0,m.index)+format(Number(m[0])/100);render()}}
  function handleButton(btn){beep();if(btn.dataset.action==='clear')return clear();if(btn.dataset.action==='delete')return removeLast();if(btn.dataset.action==='sign')return toggleSign();if(btn.dataset.action==='equals')return calculate();if(btn.dataset.value==='%')return percent();append(btn.dataset.value)}
  document.querySelectorAll('.keys button').forEach(btn=>btn.addEventListener('click',()=>handleButton(btn)));
  document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key;if(/^[0-9.]$/.test(k)){append(k);beep()}else if(k==='+'||k==='-'||k==='*'||k==='/ '||k==='/'||k==='^'){append(({ '*':'×','/':'÷','-':'−'}[k]||k));beep()}else if(k==='Enter'||k==='='){e.preventDefault();calculate()}else if(k==='Backspace'){removeLast()}else if(k==='Escape'){clear()}else if(k==='('||k===')'||k==='%'||k==='!'){append(k)}});
  function setScientific(value){scientific=!!value;$('scientificKeys').hidden=!scientific;$('scientificToggle').setAttribute('aria-pressed',String(scientific));$('scientificToggle').innerHTML='SCI <span>'+(scientific?'ON':'OFF')+'</span>';$('scientificSetting').checked=scientific;save()}
  $('scientificToggle').addEventListener('click',()=>setScientific(!scientific));$('scientificSetting').addEventListener('change',e=>setScientific(e.target.checked));
  $('soundBtn').addEventListener('click',()=>{soundOn=!soundOn;$('soundSetting').checked=soundOn;$('soundBtn').style.color=soundOn?'var(--accent)':'var(--muted)';save();showToast(soundOn?'Suara aktif':'Suara nonaktif')});$('soundSetting').addEventListener('change',e=>{soundOn=e.target.checked;$('soundBtn').style.color=soundOn?'var(--accent)':'var(--muted)';save()});
  $('angleSelect').addEventListener('change',e=>{angle=e.target.value;$('angleMode').textContent=angle;save()});
  $('themeSelect').addEventListener('change',e=>{document.body.dataset.theme=e.target.value;save()});
  function open(id){$(id).hidden=false}function close(id){$(id).hidden=true}document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>close(b.dataset.close)));document.querySelectorAll('.overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)close(o.id)}));
  function renderHistory(){const box=$('historyList');box.innerHTML='';if(!history.length){box.innerHTML='<div class="history-empty">Belum ada perhitungan tersimpan.</div>';return}history.forEach((h,i)=>{const item=document.createElement('div');item.className='history-item';const small=document.createElement('small');small.textContent=h.time+' · '+h.expression;const strong=document.createElement('strong');strong.textContent='= '+h.result;item.append(small,strong);item.addEventListener('click',()=>{input=h.result;expressionLine.textContent=h.expression+' =';justEvaluated=true;render();close('historyOverlay')});box.append(item)})}
  $('historyBtn').addEventListener('click',()=>{renderHistory();open('historyOverlay')});$('clearHistory').addEventListener('click',()=>{history=[];save();renderHistory();showToast('Riwayat dihapus')});$('settingsBtn').addEventListener('click',()=>open('settingsOverlay'));
  
  // =====================================================================
  // FIXED: PRO ENGINE V4: NARUTO STORM 4 CHAKRA & ANATOMICAL 3D RIBCAGE
  // Volumetric plasma, correct particle life, zero-collision error safety.
  // =====================================================================
  function startChakraFlames(){
    const canvas=$('chakraCanvas');
    if(!canvas)return;
    const ctx=canvas.getContext('2d');
    if(!ctx)return;

    const reduced=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w=1,h=1,dpr=1,raf=0,last=0;
    let flames=[], sparks=[];
    
    // Posisi presisi mengikuti karakter Shisui & Susanoo di kanan
    const getCenter=()=>({x:w*0.71, y:h*0.54});

    // 1. LIDAH API TAJAM (SHARP FLAME TONGUES) ALA NARUTO STORM
    class FlameTongue {
      constructor(isInit) {
        this.reset(isInit);
      }
      reset(isInit) {
        const c = getCenter();
        const side = Math.random() < 0.5 ? -1 : 1;
        const t = Math.random(); 
        
        const contourW = Math.sin(t * Math.PI) * (w * 0.19) + (w * 0.04);
        const edgeBias = 0.55 + Math.random() * 0.55; 
        
        this.x = c.x + side * contourW * edgeBias;
        this.y = (c.y + h * 0.34) - t * (h * 0.72);
        
        this.height = 45 + Math.random() * 75;
        this.width = 10 + Math.random() * 18;
        this.vy = -(1.4 + Math.random() * 2.2);
        this.vx = side * (0.15 + Math.random() * 0.45);
        this.freq = 0.004 + Math.random() * 0.004;
        this.phase = Math.random() * Math.PI * 2;
        this.swayAmp = 8 + Math.random() * 14;
        
        this.maxLife = 900 + Math.random() * 1100;
        this.life = isInit ? Math.random() * this.maxLife : 0;
      }
      update(dt) {
        this.life += dt;
        const k = dt / 16;
        this.x += this.vx * k;
        this.y += this.vy * k;
        if(this.life >= this.maxLife) this.reset(false);
      }
      draw(ctx, time) {
        const p = this.life / this.maxLife;
        const alpha = Math.sin(Math.pow(p, 0.65) * Math.PI);
        if (alpha <= 0.02) return;

        const curH = this.height * (0.5 + 0.6 * Math.sin(p * Math.PI));
        const curW = this.width * (1 - p * 0.45);
        const wave1 = Math.sin(time * this.freq + this.phase) * this.swayAmp;
        const wave2 = Math.cos(time * this.freq * 1.3 + this.phase) * (this.swayAmp * 0.65);

        const bx = this.x;
        const by = this.y;
        const tx = bx + wave1;
        const ty = by - curH;

        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // Lapis 1: Outer Emerald Flame Tongue (Tajam meruncing di ujung atas)
        const grad = ctx.createLinearGradient(bx, by, tx, ty);
        grad.addColorStop(0, `rgba(0, 190, 85, 0)`);
        grad.addColorStop(0.25, `rgba(0, 255, 115, ${alpha * 0.75})`);
        grad.addColorStop(0.7, `rgba(90, 255, 165, ${alpha * 0.85})`);
        grad.addColorStop(1, `rgba(210, 255, 230, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(bx - curW, by);
        ctx.quadraticCurveTo(bx - curW * 0.4 + wave2, by - curH * 0.5, tx, ty);
        ctx.quadraticCurveTo(bx + curW * 0.4 + wave2, by - curH * 0.5, bx + curW, by);
        ctx.quadraticCurveTo(bx, by + curW * 0.4, bx - curW, by);
        ctx.fill();

        // Lapis 2: Inner White-Hot Chakra Core (Inti api tajam)
        const coreW = curW * 0.42;
        const coreH = curH * 0.68;
        // BUGFIX TERPECAHKAN: Mengubah "ctx" ke "coreX" untuk menghindari overwriting context canvas 2D
        const coreX = bx + wave1 * 0.65;
        const coreY = by - coreH;

        ctx.fillStyle = `rgba(225, 255, 240, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.moveTo(bx - coreW, by);
        ctx.quadraticCurveTo(bx + wave2 * 0.5, by - coreH * 0.5, coreX, coreY);
        ctx.quadraticCurveTo(bx + wave2 * 0.5, by - coreH * 0.5, bx + coreW, by);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
    }

    // 2. PERCIKAN BARA TAJAM & KILAT CHAKRA (EMBERS & SPARKS)
    class ChakraSpark {
      constructor(isInit) {
        this.reset(isInit);
      }
      reset(isInit) {
        const c = getCenter();
        const angle = Math.random() * Math.PI * 2;
        const rx = (0.04 + Math.random() * 0.20) * w;
        const ry = (0.08 + Math.random() * 0.34) * h;
        this.x = c.x + Math.cos(angle) * rx;
        this.y = c.y + Math.sin(angle) * ry;
        this.vy = -(1.8 + Math.random() * 3.2);
        this.vx = (Math.random() - 0.5) * 1.6;
        this.len = 6 + Math.random() * 14;
        this.maxLife = 500 + Math.random() * 900;
        this.life = isInit ? Math.random() * this.maxLife : 0;
      }
      update(dt) {
        this.life += dt;
        const k = dt / 16;
        this.x += this.vx * k;
        this.y += this.vy * k;
        if(this.life >= this.maxLife) this.reset(false);
      }
      draw(ctx) {
        const p = this.life / this.maxLife;
        const alpha = Math.sin(p * Math.PI);
        if(alpha <= 0) return;
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.strokeStyle = `rgba(190, 255, 220, ${alpha * 0.9})`;
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 2.5, this.y + this.len);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 3. ANATOMICAL 3D SUSANOO RIBCAGE (TULANG RUSUK 3D MELINGKAR)
    function drawAnatomicalRibcage(time) {
      const c = getCenter();
      const breath = Math.sin(time * 0.0025);
      const scalePulse = 1 + breath * 0.025;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // Aura Inti Belakang (Backlight Glow di belakang Shisui)
      const bgGlow = ctx.createRadialGradient(c.x, c.y, 10, c.x, c.y, w * 0.28);
      bgGlow.addColorStop(0, 'rgba(0, 255, 120, 0.22)');
      bgGlow.addColorStop(0.55, 'rgba(0, 180, 75, 0.08)');
      bgGlow.addColorStop(1, 'rgba(0, 80, 30, 0)');
      ctx.fillStyle = bgGlow;
      ctx.beginPath();
      ctx.arc(c.x, c.y, w * 0.28, 0, Math.PI * 2);
      ctx.fill();

      // Tulang Belakang Vertikal (Ethereal Spine)
      const spineTop = c.y - h * 0.14;
      const spineBottom = c.y + h * 0.20;
      const spineGrad = ctx.createLinearGradient(c.x, spineTop, c.x, spineBottom);
      spineGrad.addColorStop(0, 'rgba(0, 255, 128, 0)');
      spineGrad.addColorStop(0.25, 'rgba(80, 255, 165, 0.45)');
      spineGrad.addColorStop(0.8, 'rgba(80, 255, 165, 0.4)');
      spineGrad.addColorStop(1, 'rgba(0, 255, 128, 0)');
      
      ctx.strokeStyle = spineGrad;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(c.x, spineTop);
      ctx.lineTo(c.x, spineBottom);
      ctx.stroke();

      // Ruas-ruas Tulang Belakang (Vertebrae Nodes)
      for (let i = 0; i < 4; i++) {
        const vy = c.y - h * 0.07 + i * (h * 0.068) + breath * (3 + i);
        ctx.fillStyle = 'rgba(210, 255, 230, 0.65)';
        ctx.beginPath();
        ctx.ellipse(c.x, vy, 8, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4 Pasang Tulang Rusuk 3D (Melengkung dari punggung memeluk ke depan dada)
      const ribSpecs = [
        { yOff: -0.07, rx: 0.16, ry: 0.055, thick: 11, alpha: 0.70 },
        { yOff: -0.002, rx: 0.205, ry: 0.070, thick: 13, alpha: 0.85 },
        { yOff:  0.068, rx: 0.19, ry: 0.068, thick: 12, alpha: 0.80 },
        { yOff:  0.135, rx: 0.145, ry: 0.052, thick: 9.5, alpha: 0.60 }
      ];

      ribSpecs.forEach((rib, idx) => {
        const sway = Math.sin(time * 0.003 + idx * 0.7) * 4;
        const ry = c.y + h * rib.yOff + breath * (4 + idx * 1.5);
        const rx = w * rib.rx * scalePulse;
        const dropY = h * rib.ry;

        [-1, 1].forEach(dir => {
          // Titik pangkal di tulang belakang
          const startX = c.x + dir * 4;
          const startY = ry - dropY * 0.35;

          // Titik lengkung luar (bahu/samping rusuk)
          const ctrl1X = c.x + dir * (rx * 1.18) + sway;
          const ctrl1Y = ry - dropY * 0.1;

          // Titik lengkung depan bawah
          const ctrl2X = c.x + dir * (rx * 0.88) + sway;
          const ctrl2Y = ry + dropY * 1.05;

          // Ujung depan tulang rusuk (meruncing menghadap ke tengah dada)
          const tipX = c.x + dir * (rx * 0.24) + sway * 0.5;
          const tipY = ry + dropY * 0.78;

          const t = rib.thick;

          // Poligon Tulang Rusuk Bervolume (Tebal di pangkal/samping, tajam di ujung depan)
          ctx.beginPath();
          ctx.moveTo(startX, startY - t * 0.45);
          // Sisi atas tulang rusuk
          ctx.bezierCurveTo(
            ctrl1X, ctrl1Y - t * 0.6,
            ctrl2X, ctrl2Y - t * 0.45,
            tipX, tipY
          );
          // Sisi bawah tulang rusuk kembali ke pangkal
          ctx.bezierCurveTo(
            ctrl2X + dir * (t * 0.4), ctrl2Y + t * 0.55,
            ctrl1X + dir * (t * 0.3), ctrl1Y + t * 0.6,
            startX, startY + t * 0.45
          );
          ctx.closePath();

          // Gradien 3D dari pangkal ke ujung rusuk
          const ribGrad = ctx.createLinearGradient(c.x, ry, c.x + dir * rx, ry + dropY);
          ribGrad.addColorStop(0, `rgba(0, 210, 95, ${rib.alpha * 0.35})`);
          ribGrad.addColorStop(0.55, `rgba(20, 255, 135, ${rib.alpha * 0.85})`);
          ribGrad.addColorStop(0.88, `rgba(170, 255, 215, ${rib.alpha * 0.95})`);
          ribGrad.addColorStop(1, `rgba(240, 255, 245, ${rib.alpha})`);

          ctx.save();
          ctx.shadowColor = '#00ff73';
          ctx.shadowBlur = 18;
          ctx.fillStyle = ribGrad;
          ctx.fill();

          // Garis Inti Tulang (Sharp Bone Ridge Highlight ala Cel-Shading Storm)
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, tipX, tipY);
          ctx.strokeStyle = `rgba(230, 255, 240, ${rib.alpha * 0.85})`;
          ctx.lineWidth = 2.2;
          ctx.stroke();
          ctx.restore();
        });
      });

      // 4. PUSARAN ANGIN CHAKRA DI KAKI (GROUND VORTEX RING)
      const baseY = c.y + h * 0.33;
      const baseW = w * 0.21 * scalePulse;
      const ringGrad = ctx.createRadialGradient(c.x, baseY, baseW * 0.1, c.x, baseY, baseW * 1.2);
      ringGrad.addColorStop(0, 'rgba(0, 255, 120, 0)');
      ringGrad.addColorStop(0.65, 'rgba(0, 255, 120, 0.35)');
      ringGrad.addColorStop(0.85, 'rgba(180, 255, 220, 0.6)');
      ringGrad.addColorStop(1, 'rgba(0, 255, 120, 0)');

      ctx.fillStyle = ringGrad;
      ctx.beginPath();
      ctx.ellipse(c.x, baseY, baseW * 1.15, h * 0.035, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 5. KILATAN PETIR CHAKRA (STORM CHAKRA LIGHTNING ARCS)
    function drawChakraLightning(time) {
      if (Math.sin(time * 0.037) < 0.25 && Math.cos(time * 0.019) < 0.4) return;
      const c = getCenter();
      const side = Math.sin(time * 0.09) > 0 ? 1 : -1;
      let lx = c.x + side * (w * (0.06 + (time % 11) * 0.012));
      let ly = c.y + ((time % 17) - 8) * (h * 0.025);

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = 'rgba(215, 255, 235, 0.92)';
      ctx.shadowColor = '#00ff73';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx, ly);

      for (let i = 0; i < 5; i++) {
        lx += (Math.sin(time * 0.2 + i * 2.3) ) * 16;
        ly -= 12 + (i * 3);
        ctx.lineTo(lx, ly);
      }
      ctx.stroke();
      ctx.restore();
    }

    function resize(){
      const r=canvas.getBoundingClientRect();
      w=Math.max(1,r.width);h=Math.max(1,r.height);
      dpr=Math.min(window.devicePixelRatio||1,1.75);
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      
      flames = [];
      sparks = [];
      const flameCount = reduced ? 24 : 68;
      const sparkCount = reduced ? 12 : 36;
      for(let i=0; i<flameCount; i++) flames.push(new FlameTongue(true));
      for(let i=0; i<sparkCount; i++) sparks.push(new ChakraSpark(true));
    }

    function frame(time){
      if(document.hidden){raf=0;return;}
      if(!last) last = time;
      let dt = time - last;
      if (reduced && dt < 45) { raf = requestAnimationFrame(frame); return; }
      if (dt > 100) dt = 16; 
      last = time;
      
      ctx.clearRect(0,0,w,h);
      
      // Layer 1: Lidah api bagian belakang
      const half = Math.floor(flames.length / 2);
      for(let i=0; i<half; i++) {
        flames[i].update(dt);
        flames[i].draw(ctx, time);
      }

      // Layer 2: Kerangka Tulang Rusuk 3D Anatomis & Spine
      drawAnatomicalRibcage(time);

      // Layer 3: Lidah api bagian depan (menyatu dengan rusuk)
      for(let i=half; i<flames.length; i++) {
        flames[i].update(dt);
        flames[i].draw(ctx, time);
      }

      // Layer 4: Percikan bara & kilatan petir chakra
      for(let i=0; i<sparks.length; i++) {
        sparks[i].update(dt);
        sparks[i].draw(ctx);
      }
      if(!reduced) drawChakraLightning(time);
      
      raf=requestAnimationFrame(frame);
    }

    resize();
    if('ResizeObserver' in window)new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize',resize,{passive:true});
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;}
      else if(!raf)raf=requestAnimationFrame(frame);
    });
    raf=requestAnimationFrame(frame);
  }
  startChakraFlames();
  
  for(let i=0;i<18;i++){const p=document.createElement('i');p.className='particle';p.style.left=(Math.random()*100)+'%';p.style.bottom=(-10-Math.random()*50)+'px';p.style.animationDelay=(-Math.random()*9)+'s';p.style.animationDuration=(7+Math.random()*8)+'s';$('particles').append(p)}
  document.body.dataset.theme=settings.theme||'shisui';$('themeSelect').value=settings.theme||'shisui';soundOn=settings.sound!==false;$('soundSetting').checked=soundOn;$('soundBtn').style.color=soundOn?'var(--accent)':'var(--muted)';angle=settings.angle||'DEG';$('angleSelect').value=angle;$('angleMode').textContent=angle;setScientific(!!settings.scientific);render();
})();
