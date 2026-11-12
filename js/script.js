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
  // Living Susanoo: high-visibility chakra flames drawn locally on Canvas.
  // Canvas is a sibling above the hero vignette so WebView stacking cannot hide it.
  function startChakraFlames(){
    const canvas=$('chakraCanvas');
    if(!canvas)return;
    const ctx=canvas.getContext('2d');
    if(!ctx)return;
    const reduced=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const colors=['#13ff83','#5bffb0','#c4ffe5','#00d878','#edfff6'];
    let w=0,h=0,dpr=1,raf=0,last=0,particles=[],phase=0;
    function point(a,rx,ry,scale=1){
      return {x:w*.72+Math.cos(a)*rx*scale,y:h*.55+Math.sin(a)*ry*scale};
    }
    function spawn(initial=false){
      const a=Math.random()*Math.PI*2;
      const q=point(a,w*.255,h*.435,1.02+Math.random()*.08);
      return {x:q.x,y:q.y,vx:(Math.random()-.5)*.65,vy:-(.35+Math.random()*1.25),
        age:initial?Math.random()*.9:0,life:.7+Math.random()*1.25,
        size:1.4+Math.random()*3.1,phase:Math.random()*Math.PI*2,
        color:colors[(Math.random()*colors.length)|0]};
    }
    function resize(){
      const r=canvas.getBoundingClientRect();
      w=Math.max(1,r.width);h=Math.max(1,r.height);
      dpr=Math.min(window.devicePixelRatio||1,1.25);
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      particles=Array.from({length:reduced?42:86},()=>spawn(true));
    }
    function flame(a,t,index){
      const pulse=1+Math.sin(t*.003+index*1.7)*.09;
      const base=point(a,w*.245,h*.425,pulse);
      const tip=point(a+Math.sin(t*.002+index)*.12,w*.245,h*.425,1.12+(.12+.12*Math.sin(t*.006+index)));
      const tangent={x:-Math.sin(a),y:Math.cos(a)};
      const spread=7+Math.sin(t*.005+index)*3;
      ctx.beginPath();ctx.moveTo(base.x-tangent.x*spread,base.y-tangent.y*spread);
      ctx.quadraticCurveTo(base.x+tangent.x*spread*1.8+Math.cos(t*.004+index)*5,
        base.y+tangent.y*spread*1.8-9,tip.x,tip.y);
      ctx.quadraticCurveTo(base.x-tangent.x*spread*1.5-Math.sin(t*.004+index)*5,
        base.y-tangent.y*spread*1.5+8,base.x-tangent.x*spread,base.y-tangent.y*spread);
      ctx.closePath();
      ctx.fillStyle=index%3===0?'rgba(196,255,229,.52)':'rgba(35,255,139,.34)';
      ctx.shadowColor='#35ff9b';ctx.shadowBlur=16;ctx.fill();
      ctx.beginPath();ctx.moveTo(base.x,base.y);
      ctx.quadraticCurveTo((base.x+tip.x)/2+tangent.x*spread*.45,
        (base.y+tip.y)/2+tangent.y*spread*.45,tip.x,tip.y);
      ctx.strokeStyle=index%4===0?'rgba(239,255,247,.95)':'rgba(75,255,167,.92)';
      ctx.lineWidth=1.5+Math.sin(t*.01+index)*.65;ctx.shadowBlur=13;ctx.stroke();
    }
    function frame(time){
      if(document.hidden){raf=0;return}
      if(time-last<(reduced?65:28)){raf=requestAnimationFrame(frame);return}
      last=time;phase+=reduced?.012:.032;
      ctx.clearRect(0,0,w,h);
      // Several bright, broken energy rings hugging the Susanoo silhouette.
      ctx.save();ctx.globalCompositeOperation='lighter';
      for(let layer=0;layer<3;layer++){
        ctx.beginPath();
        const rx=w*(.235+layer*.012),ry=h*(.415+layer*.018);
        for(let i=0;i<=100;i++){
          const a=i/100*Math.PI*2;
          const wobble=1+.018*Math.sin(a*9+phase*2+layer);
          const q=point(a,rx,ry,wobble);
          if(i===0)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);
        }
        ctx.strokeStyle=layer===1?'rgba(191,255,224,.5)':'rgba(35,255,137,.38)';
        ctx.lineWidth=layer===1?1.6:3.2-layer*.6;ctx.shadowColor='#20ff91';ctx.shadowBlur=layer===1?18:25;ctx.stroke();
      }
      // Large animated flame tongues all around the guardian, not just tiny sparks.
      const count=reduced?15:23;
      for(let i=0;i<count;i++)flame(i/count*Math.PI*2+phase*.12,time,i);
      ctx.restore();
      // Flying embers rise from the flame ring.
      for(let i=0;i<particles.length;i++){
        const q=particles[i];q.age+=reduced?.012:.026;
        q.x+=q.vx+Math.sin(time*.0025+q.phase)*.48;
        q.y+=q.vy;
        const f=Math.max(0,Math.sin(Math.min(1,q.age/q.life)*Math.PI));
        ctx.save();ctx.globalAlpha=f*(reduced?.48:.9);
        ctx.fillStyle=q.color;ctx.shadowColor=q.color;ctx.shadowBlur=14;
        ctx.beginPath();ctx.ellipse(q.x,q.y,q.size*.75,q.size*2.8,-.35,0,Math.PI*2);ctx.fill();
        ctx.restore();
        if(q.age>=q.life||q.y<2)particles[i]=spawn();
      }
      // Bright chakra flashes orbit the perimeter to make motion obvious on phone screens.
      for(let j=0;j<7;j++){
        const a=time*(reduced?.00018:.00042)+j*Math.PI*2/7;
        const q=point(a,w*.25,h*.43,1.06);
        const r=4+2*Math.sin(time*.01+j);
        const g=ctx.createRadialGradient(q.x,q.y,0,q.x,q.y,r*3);
        g.addColorStop(0,'rgba(230,255,244,.95)');
        g.addColorStop(.25,'rgba(56,255,153,.8)');
        g.addColorStop(1,'rgba(20,255,130,0)');
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(q.x,q.y,r*3,0,Math.PI*2);ctx.fill();
      }
      raf=requestAnimationFrame(frame);
    }
    resize();
    if('ResizeObserver' in window)new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize',resize,{passive:true});
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0}
      else if(!raf)raf=requestAnimationFrame(frame);
    });
    raf=requestAnimationFrame(frame);
  }
  startChakraFlames();
  // Lightweight ambient ember particles; all artwork is bundled locally.
  for(let i=0;i<18;i++){const p=document.createElement('i');p.className='particle';p.style.left=(Math.random()*100)+'%';p.style.bottom=(-10-Math.random()*50)+'px';p.style.animationDelay=(-Math.random()*9)+'s';p.style.animationDuration=(7+Math.random()*8)+'s';$('particles').append(p)}
  document.body.dataset.theme=settings.theme||'shisui';$('themeSelect').value=settings.theme||'shisui';soundOn=settings.sound!==false;$('soundSetting').checked=soundOn;$('soundBtn').style.color=soundOn?'var(--accent)':'var(--muted)';angle=settings.angle||'DEG';$('angleSelect').value=angle;$('angleMode').textContent=angle;setScientific(!!settings.scientific);render();
})();
