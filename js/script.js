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
  // Organic Susanoo chakra fire — layered, tapered flame tongues.
  // Deliberately avoids circular outlines/laser streaks; all effects are local Canvas.
  function startChakraFlames(){
    const canvas=$('chakraCanvas');
    if(!canvas)return;
    const ctx=canvas.getContext('2d');
    if(!ctx)return;

    const reduced=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const palette=['#0bdc70','#20ff91','#83ffc0','#d8ffeb','#00a957'];
    const anchors=[
      [-.98,.10],[-.94,-.24],[-.82,-.52],[-.60,-.78],[-.30,-.94],
      [.08,-1],[.42,-.90],[.70,-.72],[.90,-.43],[1,-.08],
      [.98,.30],[.83,.60],[.56,.82],[.18,.96],[-.28,.93],[-.62,.76],[-.86,.49]
    ];
    let w=1,h=1,dpr=1,raf=0,last=0,embers=[],clock=0;

    const center=()=>({x:w*.72,y:h*.56});
    function spawn(initial=false){
      const a=Math.random()*Math.PI*2,c=center();
      return {
        x:c.x+Math.cos(a)*w*.245,
        y:c.y+Math.sin(a)*h*.405,
        vx:(Math.random()-.5)*.38,
        vy:-(.35+Math.random()*.9),
        age:initial?Math.random():0,
        life:1.0+Math.random()*1.5,
        size:1.0+Math.random()*2.5,
        sway:Math.random()*6.28,
        color:palette[(Math.random()*palette.length)|0]
      };
    }
    function resize(){
      const r=canvas.getBoundingClientRect();
      w=Math.max(1,r.width);h=Math.max(1,r.height);
      dpr=Math.min(window.devicePixelRatio||1,1.35);
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      embers=Array.from({length:reduced?28:52},()=>spawn(true));
    }

    // A tapered, curved flame ribbon with a soft outer glow and a bright inner core.
    function tongue(x,y,dx,dy,length,width,seed,time,layer){
      const drift=Math.sin(time*.0018+seed*2.7)*(.10+layer*.025);
      const sway=Math.sin(time*.0031+seed*1.9)*length*.12;
      const nx=-dy,ny=dx;
      const tipX=x+dx*length+nx*(sway+drift*length);
      const tipY=y+dy*length+ny*(sway+drift*length);
      const c1x=x+dx*length*.30+nx*(sway*.18+Math.sin(time*.004+seed)*width*.9);
      const c1y=y+dy*length*.30+ny*(sway*.18+Math.sin(time*.004+seed)*width*.9);
      const c2x=x+dx*length*.73+nx*(sway*.72+Math.cos(time*.003+seed)*width*.65);
      const c2y=y+dy*length*.73+ny*(sway*.72+Math.cos(time*.003+seed)*width*.65);
      const baseW=width*(.72+.22*Math.sin(time*.008+seed));
      const midW=width*(.36+.16*Math.sin(time*.006+seed*1.4));

      ctx.save();
      ctx.globalCompositeOperation='lighter';
      ctx.beginPath();
      ctx.moveTo(x-nx*baseW,y-ny*baseW);
      ctx.bezierCurveTo(c1x-nx*baseW*.82,c1y-ny*baseW*.82,
        c2x-nx*midW,c2y-ny*midW,tipX,tipY);
      ctx.bezierCurveTo(c2x+nx*midW*.72,c2y+ny*midW*.72,
        c1x+nx*baseW*.72,c1y+ny*baseW*.72,x+nx*baseW,y+ny*baseW);
      ctx.closePath();

      const grad=ctx.createLinearGradient(x,y,tipX,tipY);
      grad.addColorStop(0,'rgba(4,150,73,.06)');
      grad.addColorStop(.20,layer===0?'rgba(13,224,105,.36)':'rgba(29,255,145,.48)');
      grad.addColorStop(.62,layer===0?'rgba(69,255,164,.58)':'rgba(135,255,195,.62)');
      grad.addColorStop(1,'rgba(225,255,239,0)');
      ctx.fillStyle=grad;
      ctx.shadowColor=layer===0?'#00e878':'#8dffc4';
      ctx.shadowBlur=width*(layer===0?2.8:1.8);
      ctx.fill();

      // Thin, irregular hot core; its curve follows the flame instead of forming a ring.
      ctx.beginPath();
      ctx.moveTo(x,y);
      ctx.quadraticCurveTo(c1x,c1y,(c2x+tipX)*.5,(c2y+tipY)*.5);
      ctx.quadraticCurveTo(c2x,c2y,tipX,tipY);
      ctx.strokeStyle=layer===0?'rgba(90,255,165,.42)':'rgba(224,255,239,.76)';
      ctx.lineWidth=Math.max(.7,width*.13);
      ctx.shadowColor='#baffd9';ctx.shadowBlur=7;ctx.stroke();
      ctx.restore();
    }

    function drawFire(time){
      const c=center();
      // Fire hugs the guardian's outer silhouette. Each plume rises and leans with its side.
      anchors.forEach((a,i)=>{
        const bx=c.x+a[0]*w*.245;
        const by=c.y+a[1]*h*.405;
        const side=a[0];
        const upward=.58+Math.max(0,a[1])*.48;
        const outward=Math.sign(side||1)*(.22+Math.abs(side)*.38);
        let dx=outward,dy=-upward;
        const norm=Math.hypot(dx,dy)||1;dx/=norm;dy/=norm;
        const pulse=.78+.22*Math.sin(time*.004+i*2.13);
        const baseLength=h*(.075+(.025*Math.sin(i*4.2)))*pulse;
        // Two offset tongues per anchor create a layered, turbulent flame silhouette.
        tongue(bx,by,dx,dy,baseLength*1.24,5.5+(i%4)*1.25,i+.2,time,0);
        if(i%2===0){
          tongue(bx+side*2,by+3,dx*.88-.12,dy,baseLength*.78,3.2+(i%3),i+8.4,time,1);
        }
      });

      // A few broad, soft flame sheets sweep upward behind the side edges.
      for(let side of [-1,1]){
        for(let k=0;k<3;k++){
          const x=c.x+side*w*(.245+k*.018);
          const y=c.y+h*(.22-k*.17);
          const sway=Math.sin(time*.0015+k*2.4+side)*w*.035;
          ctx.save();
          ctx.globalCompositeOperation='lighter';
          ctx.beginPath();
          ctx.moveTo(x,y+h*.12);
          ctx.bezierCurveTo(x+side*w*.04+sway,y-h*.02,
            x-side*w*.035-sway,y-h*.20,
            x+side*w*.025+sway,y-h*(.31+k*.025));
          ctx.strokeStyle=k===1?'rgba(34,255,145,.20)':'rgba(40,226,125,.12)';
          ctx.lineWidth=7-k*1.5;ctx.lineCap='round';
          ctx.shadowColor='#13ff83';ctx.shadowBlur=18;ctx.stroke();
          ctx.restore();
        }
      }
    }

    function frame(time){
      if(document.hidden){raf=0;return;}
      if(time-last<(reduced?55:30)){raf=requestAnimationFrame(frame);return;}
      last=time;clock+=reduced?.012:.026;
      ctx.clearRect(0,0,w,h);
      drawFire(time);

      // Ember fragments detach from the flame edges and rise with a gentle turbulent drift.
      for(let i=0;i<embers.length;i++){
        const p=embers[i];
        p.age+=reduced?.012:.022;
        p.x+=p.vx+Math.sin(time*.0018+p.sway)*.42;
        p.y+=p.vy;
        const fade=Math.max(0,Math.sin(Math.min(1,p.age/p.life)*Math.PI));
        ctx.save();
        ctx.globalAlpha=fade*(reduced?.34:.68);
        ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=9;
        ctx.beginPath();
        ctx.ellipse(p.x,p.y,p.size*.55,p.size*1.9,-.28,0,Math.PI*2);
        ctx.fill();ctx.restore();
        if(p.age>=p.life||p.y<0)embers[i]=spawn();
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
  // Lightweight ambient ember particles; all artwork is bundled locally.
  for(let i=0;i<18;i++){const p=document.createElement('i');p.className='particle';p.style.left=(Math.random()*100)+'%';p.style.bottom=(-10-Math.random()*50)+'px';p.style.animationDelay=(-Math.random()*9)+'s';p.style.animationDuration=(7+Math.random()*8)+'s';$('particles').append(p)}
  document.body.dataset.theme=settings.theme||'shisui';$('themeSelect').value=settings.theme||'shisui';soundOn=settings.sound!==false;$('soundSetting').checked=soundOn;$('soundBtn').style.color=soundOn?'var(--accent)':'var(--muted)';angle=settings.angle||'DEG';$('angleSelect').value=angle;$('angleMode').textContent=angle;setScientific(!!settings.scientific);render();
})();
