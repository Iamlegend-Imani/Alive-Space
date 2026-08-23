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

const atmosphereNames={forest:'Forest',ether:'Ether',water:'Water',night:'Night',dawn:'Dawn',rain:'Rain',firelight:'Firelight',flow:'Flow',earth:'Earth',air:'Air',wind:'Wind'};
const states={
  stillness:{name:'Stillness',title:'Nothing needs your attention here.',copy:'Stay for a moment. Let the screen be quiet with you.',motion:22},
  groundedness:{name:'Groundedness',title:'Come back to what is underneath you.',copy:'Less reaching. More weight. More here.',motion:18},
  breath:{name:'Breath',title:'Let one rhythm be enough.',copy:'You do not need to force the breath. Let the field give you a slower visual pace.',motion:34},
  drift:{name:'Drift',title:'You can loosen your grip for a while.',copy:'No destination. No next thing. Just movement without demand.',motion:48},
  focus:{name:'Focus',title:'One thing can be enough.',copy:'The space quiets around a single center.',motion:14},
  samadhi:{name:'Samadhi',title:'Rest attention inside itself.',copy:'A contemplative space for sustained stillness and undivided attention.',motion:10},
  enlightenment:{name:'Enlightenment',title:'Let the space become luminous.',copy:'An atmosphere for clarity, openness, wonder, and seeing differently.',motion:30},
  softness:{name:'Softness',title:'Nothing here needs to be hard.',copy:'Edges soften. Contrast lowers. The space holds less urgency.',motion:16},
  release:{name:'Release',title:'You may put something down.',copy:'Let motion pass through without having to follow it.',motion:40},
  presence:{name:'Presence',title:'This moment does not need improvement.',copy:'Stay with what is here before adding anything else.',motion:8},
  wonder:{name:'Wonder',title:'There is still mystery here.',copy:'A little strangeness. A little beauty. No explanation required.',motion:38},
  rest:{name:'Rest',title:'You are allowed to stop consuming.',copy:'The quietest version of the space. Almost nothing moves.',motion:4}
};
const defaults={atmosphere:'forest',state:'stillness',theme:'night',brightness:82,motion:28,volume:18};
let currentAtmosphere=localStorage.getItem('alive-space-atmosphere')||defaults.atmosphere;
let currentState=localStorage.getItem('alive-space-state')||defaults.state;
let currentTheme=localStorage.getItem('alive-space-theme')||defaults.theme;
let audio=null,audioOn=false;

function enterSpace(){welcome.classList.add('hidden');setTimeout(()=>presence.classList.remove('hidden'),220)}
function openDock(){dock.classList.add('open');dock.setAttribute('aria-hidden','false');controlsToggle.setAttribute('aria-expanded','true')}
function closeDock(){dock.classList.remove('open');dock.setAttribute('aria-hidden','true');controlsToggle.setAttribute('aria-expanded','false')}
function updatePresence(){const s=states[currentState];presenceLabel.textContent=`${atmosphereNames[currentAtmosphere]} · ${s.name}`;presenceTitle.textContent=s.title;presenceCopy.textContent=s.copy}
function setAtmosphere(v){currentAtmosphere=v;body.dataset.atmosphere=v;localStorage.setItem('alive-space-atmosphere',v);document.querySelectorAll('[data-atmosphere]').forEach(b=>b.classList.toggle('active',b.dataset.atmosphere===v));updatePresence();if(audioOn)rebuildAudio()}
function setState(v,applyMotion=true){currentState=v;body.dataset.state=v;localStorage.setItem('alive-space-state',v);document.querySelectorAll('[data-state]').forEach(b=>b.classList.toggle('active',b.dataset.state===v));if(applyMotion){motion.value=states[v].motion;setMotion(states[v].motion)}updatePresence()}
function setBrightness(v){const n=Number(v);brightnessValue.textContent=`${n}%`;const alpha=n<100?Math.min((100-n)/100,.6):0;brightnessOverlay.style.background=n<100?`rgba(0,0,0,${alpha})`:`rgba(255,246,225,${Math.min((n-100)/100,.08)})`;localStorage.setItem('alive-space-brightness',String(n))}
function setMotion(v){const n=Number(v);const f=n===0?.01:Math.max(.08,n/35);body.style.setProperty('--motion',f.toFixed(2));motionValue.textContent=n===0?'still':n<18?'very low':n<38?'low':n<65?'flowing':'alive';localStorage.setItem('alive-space-motion',String(n))}
function setVolume(v){const n=Number(v);soundValue.textContent=n===0?'silent':n<25?'soft':n<60?'low':'present';if(audio?.master)audio.master.gain.setTargetAtTime((n/100)*.16,audio.ctx.currentTime,.15);localStorage.setItem('alive-space-volume',String(n))}
function setTheme(v){currentTheme=v;body.dataset.theme=v;localStorage.setItem('alive-space-theme',v)}

function applyFeeling(feeling){
  const map={
    bright:{atmosphere:'night',state:'softness',brightness:52,motion:12},
    loud:{atmosphere:'forest',state:'rest',brightness:70,motion:4},
    fast:{atmosphere:'water',state:'stillness',brightness:72,motion:8},
    head:{atmosphere:'ether',state:'presence',brightness:68,motion:6},
    restless:{atmosphere:'earth',state:'groundedness',brightness:76,motion:20},
    quiet:{atmosphere:'forest',state:'rest',brightness:64,motion:2}
  };
  const p=map[feeling]||map.quiet;setAtmosphere(p.atmosphere);setState(p.state,false);brightness.value=p.brightness;motion.value=p.motion;setBrightness(p.brightness);setMotion(p.motion);enterSpace();
}

document.querySelectorAll('[data-feeling]').forEach(b=>b.addEventListener('click',()=>applyFeeling(b.dataset.feeling)));
skipButton.addEventListener('click',enterSpace);chooseButton.addEventListener('click',openDock);controlsToggle.addEventListener('click',()=>dock.classList.contains('open')?closeDock():openDock());controlsClose.addEventListener('click',closeDock);
document.querySelectorAll('[data-atmosphere]').forEach(b=>b.addEventListener('click',()=>setAtmosphere(b.dataset.atmosphere)));
document.querySelectorAll('[data-state]').forEach(b=>b.addEventListener('click',()=>setState(b.dataset.state)));
brightness.addEventListener('input',e=>setBrightness(e.target.value));motion.addEventListener('input',e=>setMotion(e.target.value));volume.addEventListener('input',e=>setVolume(e.target.value));themeToggle.addEventListener('click',()=>setTheme(currentTheme==='night'?'day':'night'));
reduceButton.addEventListener('click',()=>{const active=body.classList.toggle('quieter');reduceButton.setAttribute('aria-pressed',String(active));reduceButton.textContent=active?'Restore detail':'Make it quieter';if(active){motion.value=4;setMotion(4)}});
breathButton.addEventListener('click',()=>{const active=body.classList.toggle('breathing');breathButton.setAttribute('aria-pressed',String(active));breathButton.textContent=active?'breathing with the field':'breathe with the field'});
resetButton.addEventListener('click',()=>{setAtmosphere(defaults.atmosphere);setState(defaults.state,false);setTheme(defaults.theme);brightness.value=defaults.brightness;motion.value=defaults.motion;volume.value=defaults.volume;setBrightness(defaults.brightness);setMotion(defaults.motion);setVolume(defaults.volume);body.classList.remove('quieter','breathing');reduceButton.textContent='Make it quieter';breathButton.textContent='breathe with the field'});

function createNoiseBuffer(ctx){const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;return buffer}
function buildAudio(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;const ctx=new AC(),master=ctx.createGain();master.gain.value=(Number(volume.value)/100)*.16;master.connect(ctx.destination);const noise=ctx.createBufferSource();noise.buffer=createNoiseBuffer(ctx);noise.loop=true;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value={forest:720,ether:520,water:900,night:430,dawn:780,rain:1150,firelight:680,flow:820,earth:540,air:1250,wind:980}[currentAtmosphere]||720;const ng=ctx.createGain();ng.gain.value=.35;noise.connect(filter);filter.connect(ng);ng.connect(master);noise.start();const osc=ctx.createOscillator(),og=ctx.createGain();osc.frequency.value={forest:98,ether:132,water:110,night:82,dawn:123,rain:92,firelight:104,flow:116,earth:73,air:147,wind:117}[currentAtmosphere]||98;osc.type='sine';og.gain.value=.03;osc.connect(og);og.connect(master);osc.start();return{ctx,master}}
function stopAudio(){if(!audio)return;try{audio.ctx.close()}catch(e){}audio=null}
function rebuildAudio(){stopAudio();audio=buildAudio()}
async function toggleSound(){audioOn=!audioOn;soundToggle.setAttribute('aria-pressed',String(audioOn));soundLabel.textContent=audioOn?'sound on':'sound off';if(audioOn){audio=buildAudio();if(audio?.ctx.state==='suspended')await audio.ctx.resume()}else stopAudio()}
soundToggle.addEventListener('click',toggleSound);

const canvas=document.getElementById('ambient-canvas'),ctx=canvas.getContext('2d');let W=0,H=0,DPR=1,particles=[];
function resize(){W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);canvas.width=W*DPR;canvas.height=H*DPR;canvas.style.width=`${W}px`;canvas.style.height=`${H}px`;ctx.setTransform(DPR,0,0,DPR,0,0);const count=Math.max(18,Math.min(45,Math.round(W/40)));particles=Array.from({length:count},()=>({x:Math.random()*W,y:Math.random()*H,r:.6+Math.random()*2.1,vx:(Math.random()-.5)*.035,vy:-.01-Math.random()*.045,a:.03+Math.random()*.13}))}
function draw(){ctx.clearRect(0,0,W,H);const m=Number(getComputedStyle(body).getPropertyValue('--motion'))||.2;particles.forEach(p=>{p.x+=p.vx*m;p.y+=p.vy*m;if(p.y<-8)p.y=H+8;if(p.x<-8)p.x=W+8;if(p.x>W+8)p.x=-8;const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*7);g.addColorStop(0,`rgba(225,242,233,${p.a})`);g.addColorStop(1,'rgba(225,242,233,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*7,0,Math.PI*2);ctx.fill()});requestAnimationFrame(draw)}
addEventListener('resize',resize);resize();draw();

body.dataset.atmosphere=currentAtmosphere;body.dataset.state=currentState;setTheme(currentTheme);document.querySelectorAll('[data-atmosphere]').forEach(b=>b.classList.toggle('active',b.dataset.atmosphere===currentAtmosphere));document.querySelectorAll('[data-state]').forEach(b=>b.classList.toggle('active',b.dataset.state===currentState));brightness.value=localStorage.getItem('alive-space-brightness')||defaults.brightness;motion.value=localStorage.getItem('alive-space-motion')||defaults.motion;volume.value=localStorage.getItem('alive-space-volume')||defaults.volume;setBrightness(brightness.value);setMotion(motion.value);setVolume(volume.value);updatePresence();
