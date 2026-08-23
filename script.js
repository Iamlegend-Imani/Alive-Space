const body=document.body;
const welcome=document.getElementById('welcome');
const presence=document.getElementById('presence-card');
const dock=document.getElementById('control-dock');
const controlsToggle=document.getElementById('controls-toggle');
const controlsClose=document.getElementById('controls-close');
const chooseButton=document.getElementById('choose-button');
const skipButton=document.getElementById('skip-button');
const soundToggle=document.getElementById('sound-toggle');
const soundLabel=soundToggle.querySelector('.button-label');
const soundStatus=document.getElementById('sound-status');
const soundscapeName=document.getElementById('soundscape-name');
const breathButton=document.getElementById('breath-button');
const brightness=document.getElementById('brightness');
const motion=document.getElementById('motion');
const volume=document.getElementById('volume');
const brightnessValue=document.getElementById('brightness-value');
const motionValue=document.getElementById('motion-value');
const soundValue=document.getElementById('sound-value');
const brightnessOverlay=document.getElementById('brightness-overlay');
const themeToggle=document.getElementById('theme-toggle');
const reduceButton=document.getElementById('reduce-button');
const resetButton=document.getElementById('reset-button');
const presenceLabel=document.getElementById('presence-label');
const presenceTitle=document.getElementById('presence-title');
const presenceCopy=document.getElementById('presence-copy');

const atmospheres={
  forest:{name:'Forest',sound:'Forest Resonance',base:98,fifth:147,filter:760,color:[188,234,211],motion:'float'},
  ether:{name:'Ether',sound:'Ether Bloom',base:132,fifth:198,filter:1500,color:[216,198,255],motion:'orbit'},
  water:{name:'Water',sound:'Blue Current',base:110,fifth:165,filter:1050,color:[171,235,233],motion:'ripple'},
  night:{name:'Night',sound:'Midnight Still',base:82.4,fifth:123.6,filter:520,color:[198,216,255],motion:'stars'},
  dawn:{name:'Dawn',sound:'First Light',base:123.5,fifth:185.2,filter:1200,color:[255,221,178],motion:'rise'},
  rain:{name:'Rain',sound:'Soft Weather',base:92.5,fifth:138.7,filter:1800,color:[179,216,225],motion:'rain'},
  firelight:{name:'Firelight',sound:'Ember Hymn',base:104,fifth:156,filter:900,color:[255,192,139],motion:'embers'},
  flow:{name:'Flow',sound:'Liquid Motion',base:116.5,fifth:174.7,filter:1150,color:[177,231,217],motion:'stream'},
  earth:{name:'Earth',sound:'Ground Tone',base:73.4,fifth:110,filter:620,color:[218,191,137],motion:'dust'},
  air:{name:'Air',sound:'Open Sky',base:147,fifth:220.5,filter:2100,color:[214,239,240],motion:'drift'},
  wind:{name:'Wind',sound:'Moving Air',base:117,fifth:175.5,filter:1700,color:[197,230,216],motion:'wind'}
};
const states={
  stillness:{name:'Stillness',title:'Nothing needs your attention here.',copy:'Stay for a moment. Let the screen be quiet with you.',motion:34},
  groundedness:{name:'Groundedness',title:'Come back to what is underneath you.',copy:'Less reaching. More weight. More here.',motion:28},
  breath:{name:'Breath',title:'Let one rhythm be enough.',copy:'Follow the field as it expands and returns.',motion:38},
  drift:{name:'Drift',title:'You can loosen your grip for a while.',copy:'No destination. No next thing. Just movement without demand.',motion:54},
  focus:{name:'Focus',title:'One thing can be enough.',copy:'The space quiets around a single center.',motion:20},
  samadhi:{name:'Samadhi',title:'Rest attention inside itself.',copy:'A contemplative space for sustained stillness and undivided attention.',motion:14},
  enlightenment:{name:'Enlightenment',title:'Let the space become luminous.',copy:'An atmosphere for clarity, openness, wonder, and seeing differently.',motion:42},
  softness:{name:'Softness',title:'Nothing here needs to be hard.',copy:'Edges soften. Contrast lowers. The space holds less urgency.',motion:24},
  release:{name:'Release',title:'You may put something down.',copy:'Let motion pass through without having to follow it.',motion:48},
  presence:{name:'Presence',title:'This moment does not need improvement.',copy:'Stay with what is here before adding anything else.',motion:18},
  wonder:{name:'Wonder',title:'There is still mystery here.',copy:'A little strangeness. A little beauty. No explanation required.',motion:58},
  rest:{name:'Rest',title:'You are allowed to stop consuming.',copy:'The quietest version of the space. Almost nothing asks anything of you.',motion:8}
};
const defaults={atmosphere:'forest',state:'stillness',theme:'night',brightness:82,motion:44,volume:28};
let currentAtmosphere=localStorage.getItem('alive-space-atmosphere')||defaults.atmosphere;
let currentState=localStorage.getItem('alive-space-state')||defaults.state;
let currentTheme=localStorage.getItem('alive-space-theme')||defaults.theme;
let audio=null,audioOn=false;

function enterSpace(){welcome.classList.add('hidden');setTimeout(()=>presence.classList.remove('hidden'),220)}
function openDock(){dock.classList.add('open');dock.setAttribute('aria-hidden','false');controlsToggle.setAttribute('aria-expanded','true')}
function closeDock(){dock.classList.remove('open');dock.setAttribute('aria-hidden','true');controlsToggle.setAttribute('aria-expanded','false')}
function updatePresence(){const s=states[currentState],a=atmospheres[currentAtmosphere];presenceLabel.textContent=`${a.name} · ${s.name}`;presenceTitle.textContent=s.title;presenceCopy.textContent=s.copy;soundscapeName.textContent=a.sound}
function setAtmosphere(v){currentAtmosphere=v;body.dataset.atmosphere=v;localStorage.setItem('alive-space-atmosphere',v);document.querySelectorAll('[data-atmosphere]').forEach(b=>b.classList.toggle('active',b.dataset.atmosphere===v));updatePresence();reseedScene();if(audioOn)rebuildAudio()}
function setState(v,applyMotion=true){currentState=v;body.dataset.state=v;localStorage.setItem('alive-space-state',v);document.querySelectorAll('[data-state]').forEach(b=>b.classList.toggle('active',b.dataset.state===v));if(applyMotion){motion.value=states[v].motion;setMotion(states[v].motion)}updatePresence()}
function setBrightness(v){const n=Number(v);brightnessValue.textContent=`${n}%`;const alpha=n<100?Math.min((100-n)/100,.6):0;brightnessOverlay.style.background=n<100?`rgba(0,0,0,${alpha})`:`rgba(255,246,225,${Math.min((n-100)/100,.08)})`;localStorage.setItem('alive-space-brightness',String(n))}
function setMotion(v){const n=Number(v),f=n===0?.01:Math.max(.08,n/38);body.style.setProperty('--motion',f.toFixed(2));motionValue.textContent=n===0?'still':n<18?'very low':n<38?'gentle':n<65?'alive':'immersive';localStorage.setItem('alive-space-motion',String(n))}
function setVolume(v){const n=Number(v);soundValue.textContent=n===0?'silent':n<25?'soft':n<60?'low':'present';if(audio?.master)audio.master.gain.setTargetAtTime((n/100)*.22,audio.ctx.currentTime,.2);localStorage.setItem('alive-space-volume',String(n))}
function setTheme(v){currentTheme=v;body.dataset.theme=v;localStorage.setItem('alive-space-theme',v)}

function applyFeeling(feeling){const map={bright:{atmosphere:'night',state:'softness',brightness:52,motion:18},loud:{atmosphere:'forest',state:'rest',brightness:68,motion:10},fast:{atmosphere:'water',state:'stillness',brightness:72,motion:20},head:{atmosphere:'ether',state:'presence',brightness:66,motion:18},restless:{atmosphere:'earth',state:'groundedness',brightness:76,motion:32},quiet:{atmosphere:'forest',state:'rest',brightness:64,motion:8}};const p=map[feeling]||map.quiet;setAtmosphere(p.atmosphere);setState(p.state,false);brightness.value=p.brightness;motion.value=p.motion;setBrightness(p.brightness);setMotion(p.motion);enterSpace()}

document.querySelectorAll('[data-feeling]').forEach(b=>b.addEventListener('click',()=>applyFeeling(b.dataset.feeling)));
skipButton.addEventListener('click',enterSpace);chooseButton.addEventListener('click',openDock);controlsToggle.addEventListener('click',()=>dock.classList.contains('open')?closeDock():openDock());controlsClose.addEventListener('click',closeDock);document.querySelectorAll('[data-atmosphere]').forEach(b=>b.addEventListener('click',()=>setAtmosphere(b.dataset.atmosphere)));document.querySelectorAll('[data-state]').forEach(b=>b.addEventListener('click',()=>setState(b.dataset.state)));brightness.addEventListener('input',e=>setBrightness(e.target.value));motion.addEventListener('input',e=>setMotion(e.target.value));volume.addEventListener('input',e=>setVolume(e.target.value));themeToggle.addEventListener('click',()=>setTheme(currentTheme==='night'?'day':'night'));
reduceButton.addEventListener('click',()=>{const active=body.classList.toggle('quieter');reduceButton.setAttribute('aria-pressed',String(active));reduceButton.textContent=active?'Restore detail':'Make it quieter';if(active){motion.value=8;setMotion(8)}});
breathButton.addEventListener('click',()=>{const active=body.classList.toggle('breathing');breathButton.setAttribute('aria-pressed',String(active));breathButton.textContent=active?'breathing with the field':'breathe with the field'});
resetButton.addEventListener('click',()=>{setAtmosphere(defaults.atmosphere);setState(defaults.state,false);setTheme(defaults.theme);brightness.value=defaults.brightness;motion.value=defaults.motion;volume.value=defaults.volume;setBrightness(defaults.brightness);setMotion(defaults.motion);setVolume(defaults.volume);body.classList.remove('quieter','breathing');reduceButton.textContent='Make it quieter';breathButton.textContent='breathe with the field'});

/* Generative ambient audio: no external copyrighted tracks, no hard loop points. */
function createNoiseBuffer(ctx){const b=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<d.length;i++){const white=Math.random()*2-1;last=(last+.02*white)/1.02;d[i]=last*3.4}return b}
function tone(ctx,dest,freq,type='sine',gain=.02,detune=0){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=freq;o.detune.value=detune;g.gain.value=gain;o.connect(g);g.connect(dest);o.start();return{o,g}}
function bell(ctx,dest,freq,delay){const now=ctx.currentTime+delay,o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(freq,now);g.gain.setValueAtTime(0.0001,now);g.gain.exponentialRampToValueAtTime(.045,now+.03);g.gain.exponentialRampToValueAtTime(.0001,now+3.8);o.connect(g);g.connect(dest);o.start(now);o.stop(now+4)}
function scheduleBells(pack){if(!audioOn||!audio||audio!==pack)return;const a=atmospheres[currentAtmosphere],notes=[a.base*2,a.fifth*2,a.base*2.5,a.fifth*1.5];bell(pack.ctx,pack.fx,notes[Math.floor(Math.random()*notes.length)],.1);pack.timer=setTimeout(()=>scheduleBells(pack),6000+Math.random()*9000)}
function buildAudio(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;const a=atmospheres[currentAtmosphere],ctx=new AC(),master=ctx.createGain(),compressor=ctx.createDynamicsCompressor(),fx=ctx.createGain();master.gain.value=(Number(volume.value)/100)*.22;fx.gain.value=.9;fx.connect(compressor);compressor.connect(master);master.connect(ctx.destination);
  const noise=ctx.createBufferSource();noise.buffer=createNoiseBuffer(ctx);noise.loop=true;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=a.filter;const ng=ctx.createGain();ng.gain.value=currentAtmosphere==='rain'?.5:currentAtmosphere==='wind'?.38:.22;noise.connect(filter);filter.connect(ng);ng.connect(fx);noise.start();
  const t1=tone(ctx,fx,a.base,'sine',.026),t2=tone(ctx,fx,a.fifth,'sine',.014,3),t3=tone(ctx,fx,a.base/2,'triangle',.009,-4);
  const lfo=ctx.createOscillator(),lfoGain=ctx.createGain();lfo.frequency.value=.055;lfoGain.gain.value=.008;lfo.connect(lfoGain);lfoGain.connect(t1.g.gain);lfo.start();
  const pack={ctx,master,fx,noise,nodes:[t1,t2,t3,lfo],timer:null};setTimeout(()=>scheduleBells(pack),2400);return pack}
function stopAudio(){if(!audio)return;if(audio.timer)clearTimeout(audio.timer);try{audio.ctx.close()}catch(e){}audio=null}
function rebuildAudio(){stopAudio();audio=buildAudio();soundscapeName.textContent=atmospheres[currentAtmosphere].sound}
async function toggleSound(){audioOn=!audioOn;soundToggle.setAttribute('aria-pressed',String(audioOn));soundLabel.textContent=audioOn?'sound on':'sound off';soundStatus.textContent=audioOn?'playing':'silent';if(audioOn){audio=buildAudio();if(audio?.ctx.state==='suspended')await audio.ctx.resume()}else stopAudio()}
soundToggle.addEventListener('click',toggleSound);

/* Atmosphere-specific visual physics. */
const canvas=document.getElementById('ambient-canvas'),ctx=canvas.getContext('2d');let W=0,H=0,DPR=1,particles=[];
function seedParticle(mode){const base={x:Math.random()*W,y:Math.random()*H,a:.08+Math.random()*.2,s:.5+Math.random()*2,life:Math.random()*1000};if(mode==='rain')return{...base,vx:-.2,vy:1.8+Math.random()*2.5,len:10+Math.random()*30};if(mode==='embers')return{...base,vx:(Math.random()-.5)*.25,vy:-.3-Math.random()*.7,s:1+Math.random()*2};if(mode==='stars')return{...base,vx:0,vy:0,s:.4+Math.random()*1.3};if(mode==='ripple')return{...base,x:Math.random()*W,y:H*(.45+Math.random()*.5),r:2+Math.random()*24,vr:.08+Math.random()*.16};if(mode==='wind')return{...base,vx:.7+Math.random()*1.1,vy:(Math.random()-.5)*.16,len:25+Math.random()*55};if(mode==='dust')return{...base,vx:(Math.random()-.5)*.08,vy:-.02-Math.random()*.06,s:.5+Math.random()*2.2};if(mode==='rise')return{...base,vx:(Math.random()-.5)*.04,vy:-.08-Math.random()*.14,s:1+Math.random()*2};if(mode==='stream')return{...base,vx:.08+Math.random()*.22,vy:(Math.random()-.5)*.18,s:1+Math.random()*2.5};if(mode==='orbit')return{...base,angle:Math.random()*Math.PI*2,rad:90+Math.random()*Math.min(W,H)*.35,s:.8+Math.random()*2};return{...base,vx:(Math.random()-.5)*.06,vy:-.02-Math.random()*.08}}
function reseedScene(){const mode=atmospheres[currentAtmosphere].motion,count=Math.max(34,Math.min(90,Math.round(W/18)));particles=Array.from({length:count},()=>seedParticle(mode))}
function resize(){W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);canvas.width=W*DPR;canvas.height=H*DPR;canvas.style.width=`${W}px`;canvas.style.height=`${H}px`;ctx.setTransform(DPR,0,0,DPR,0,0);reseedScene()}
function rgba(alpha){const c=atmospheres[currentAtmosphere].color;return`rgba(${c[0]},${c[1]},${c[2]},${alpha})`}
function draw(){ctx.clearRect(0,0,W,H);const a=atmospheres[currentAtmosphere],mode=a.motion,m=Number(getComputedStyle(body).getPropertyValue('--motion'))||.2,cx=W*.66,cy=H*.48;particles.forEach((p,i)=>{p.life+=m;
  if(mode==='rain'){p.x+=p.vx*m;p.y+=p.vy*m;ctx.strokeStyle=rgba(p.a);ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.len*.14,p.y-p.len);ctx.stroke();if(p.y>H+40){particles[i]=seedParticle(mode);particles[i].y=-30}}
  else if(mode==='embers'){p.x+=p.vx*m;p.y+=p.vy*m;ctx.fillStyle=rgba(p.a*(.55+.45*Math.sin(p.life*.03)));ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,Math.PI*2);ctx.fill();if(p.y<-20)particles[i]=seedParticle(mode)}
  else if(mode==='stars'){const tw=.25+.75*Math.abs(Math.sin(p.life*.012+i));ctx.fillStyle=rgba(p.a*tw);ctx.beginPath();ctx.arc(p.x,p.y,p.s*tw,0,Math.PI*2);ctx.fill()}
  else if(mode==='ripple'){p.r+=p.vr*m;ctx.strokeStyle=rgba(Math.max(0,p.a*(1-p.r/120)));ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*2.2,p.r*.55,0,0,Math.PI*2);ctx.stroke();if(p.r>120)particles[i]=seedParticle(mode)}
  else if(mode==='wind'){p.x+=p.vx*m;p.y+=p.vy*m;ctx.strokeStyle=rgba(p.a*.65);ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.quadraticCurveTo(p.x-p.len*.45,p.y-8*Math.sin(p.life*.01),p.x-p.len,p.y);ctx.stroke();if(p.x>W+p.len)particles[i]={...seedParticle(mode),x:-p.len}}
  else if(mode==='orbit'){p.angle+=.0007*m*(1+(i%4)*.12);const x=cx+Math.cos(p.angle)*p.rad,y=cy+Math.sin(p.angle)*p.rad*.58;ctx.fillStyle=rgba(p.a);ctx.beginPath();ctx.arc(x,y,p.s,0,Math.PI*2);ctx.fill()}
  else{p.x+=p.vx*m;p.y+=p.vy*m;const glow=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.s*7);glow.addColorStop(0,rgba(p.a));glow.addColorStop(1,rgba(0));ctx.fillStyle=glow;ctx.beginPath();ctx.arc(p.x,p.y,p.s*7,0,Math.PI*2);ctx.fill();if(p.y<-15||p.x<-20||p.x>W+20)particles[i]=seedParticle(mode)}
});requestAnimationFrame(draw)}
addEventListener('resize',resize);resize();draw();

body.dataset.atmosphere=currentAtmosphere;body.dataset.state=currentState;setTheme(currentTheme);document.querySelectorAll('[data-atmosphere]').forEach(b=>b.classList.toggle('active',b.dataset.atmosphere===currentAtmosphere));document.querySelectorAll('[data-state]').forEach(b=>b.classList.toggle('active',b.dataset.state===currentState));brightness.value=localStorage.getItem('alive-space-brightness')||defaults.brightness;motion.value=localStorage.getItem('alive-space-motion')||defaults.motion;volume.value=localStorage.getItem('alive-space-volume')||defaults.volume;setBrightness(brightness.value);setMotion(motion.value);setVolume(volume.value);updatePresence();
