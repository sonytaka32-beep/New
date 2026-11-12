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
  // FIXED: NARUTO STORM STYLE SUSANOO CHAKRA ENGINE
  // Volumetric plasma, correct particle lifespan, and bright skeletal ribs
  // =====================================================================
  function startChakraFlames(){
    const canvas=$('chakraCanvas');
    if(!canvas)return;
    const ctx=canvas.getContext('2d');
    if(!ctx)return;

    const reduced=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w=1,h=1,dpr=1,raf=0,last=0;
    let particles=[];
    const center=()=>({x:w*.72,y:h*.56});

    class ChakraAura {
      constructor(isInitial) {
        this.reset(isInitial);
      }
      reset(isInitial) {
        const c = center();
        const angle = Math.random() * Math.PI * 2;
        const radiusX = w * (0.15 + Math.random() * 0.22);
        const radiusY = h * (0.25 + Math.random() * 0.25);
        
        this.x = c.x + Math.cos(angle) * radiusX;
        this.y = c.y + Math.sin(angle) * radiusY;
        
        this.vx = (Math.cos(angle) * 0.5) + (Math.random() - 0.5) * 1.5;
        this.vy = -Math.random() * 3.5 - 0.5;
        
        // BUGFIX: Skala umur partikel dikonversi menjadi milidetik agar hidup lebih lama (2 - 5 detik)
        this.maxLife = 2000 + Math.random() * 3000;
        this.life = isInitial ? Math.random() * this.maxLife : 0;
        
        this.size = 20 + Math.random() * 45;
        this.type = Math.random() > 0.8 ? 'ember' : 'plasma';
        this.seed = Math.random() * 1000;
      }
      update(dt, time) {
        this.life += dt;
        this.vx += Math.sin(time * 0.0015 + this.seed) * 0.05;
        this.vy -= 0.008; 
        
        this.x += this.vx * (dt/16);
        this.y += this.vy * (dt/16);
        
        if (this.life >= this.maxLife || this.y < -100) {
          this.reset(false);
        }
      }
      draw(ctx, time) {
        const progress = this.life / this.maxLife;
        // Curve melengkung agar efek masuknya (fade in) cepat, matinya (fade out) perlahan
        const alpha = Math.sin(Math.pow(progress, 0.7) * Math.PI) * (this.type === 'ember' ? 0.9 : 0.65);
        
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = Math.max(0, alpha);
        
        if (this.type === 'ember') {
          ctx.fillStyle = '#baffd2';
          ctx.shadowColor = '#00ff73';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 0.12, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const sway = Math.sin(time * 0.002 + this.seed) * 20;
          const stretch = 1 + progress * 1.8; // Menarik partikel ke atas ala wisp
          
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
          grad.addColorStop(0, progress < 0.2 ? 'rgba(50, 255, 140, 1)' : 'rgba(20, 220, 100, 1)');
          grad.addColorStop(0.4, 'rgba(0, 180, 80, 0.6)');
          grad.addColorStop(1, 'rgba(0, 100, 40, 0)');
          
          ctx.fillStyle = grad;
          // Memakai metode transformasi yang lebih universal agar anti-crash di semua layar
          ctx.translate(this.x + sway, this.y);
          ctx.rotate(Math.sin(time*0.001 + this.seed) * 0.4);
          ctx.scale(0.8, stretch);
          
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    function drawSkeletalCore(time) {
      const c = center();
      const pulse = 0.85 + 0.15 * Math.sin(time * 0.003);
      
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      
      // Menggambar 5 tulang rusuk
      for(let i=0; i<5; i++) {
        const ribY = c.y - h * 0.03 - (i * h * 0.09);
        const ribWidth = w * (0.24 - i * 0.03) * pulse; 
        const sway = Math.sin(time * 0.002 + i) * 10;
        
        ctx.beginPath();
        // Lengkungan rusuk dari ujung ke poros tengah ke ujung satunya
        ctx.moveTo(c.x - ribWidth + sway, ribY + 30);
        ctx.quadraticCurveTo(c.x + sway, ribY - 25, c.x + ribWidth + sway, ribY + 30);
        
        // Cahaya luar rusuk (Glow)
        ctx.strokeStyle = `rgba(20, 255, 130, ${0.45 - i*0.07})`;
        ctx.lineWidth = 22 + i * 2;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#00ff73';
        ctx.shadowBlur = 25;
        ctx.stroke();
        
        // Tulang dalam rusuk (Bone Core)
        ctx.beginPath();
        ctx.moveTo(c.x - ribWidth + sway, ribY + 30);
        ctx.quadraticCurveTo(c.x + sway, ribY - 25, c.x + ribWidth + sway, ribY + 30);
        ctx.strokeStyle = `rgba(200, 255, 220, ${0.85 - i*0.1})`;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 5;
        ctx.stroke();
      }
      ctx.restore();
    }

    function resize(){
      const r=canvas.getBoundingClientRect();
      w=Math.max(1,r.width);h=Math.max(1,r.height);
      dpr=Math.min(window.devicePixelRatio||1,1.5);
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      
      particles = [];
      const count = reduced ? 30 : 100; 
      for(let i=0; i<count; i++) particles.push(new ChakraAura(true));
    }

    function frame(time){
      if(document.hidden){raf=0;return;}
      
      // BUGFIX: Menyesuaikan timbangan waktu (Delta Time) secara aman
      if(!last) last = time;
      let dt = time - last;
      if (reduced && dt < 45) { raf = requestAnimationFrame(frame); return; }
      if (dt > 100) dt = 16; 
      last = time;
      
      ctx.clearRect(0,0,w,h);
      
      // 1. Gambar kerangka tulang bercahaya di latar belakang
      drawSkeletalCore(time);
      
      // 2. Render partikel plasma / wisp chakra
      for(let i=0; i<particles.length; i++) {
        particles[i].update(dt, time);
        particles[i].draw(ctx, time);
      }
      
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
