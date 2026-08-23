(()=>{
  const isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const btn=document.getElementById('sound-toggle');
  if(!btn)return;

  async function unlockAudioContext(ctx){
    if(!ctx)return false;
    try{
      if(ctx.state==='suspended') await ctx.resume();
      const buffer=ctx.createBuffer(1,1,22050);
      const source=ctx.createBufferSource();
      source.buffer=buffer;
      source.connect(ctx.destination);
      source.start(0);
      if(ctx.state==='suspended') await ctx.resume();
      return ctx.state==='running';
    }catch(e){return false}
  }

  btn.onclick=async()=>{
    if(audioOn){
      audioOn=false;
      stopAudio();
      btn.setAttribute('aria-pressed','false');
      soundLabel.textContent='sound off';
      soundStatus.textContent='silent';
      return;
    }

    audioOn=true;
    stopAudio();
    audio=buildAudio();
    const ok=await unlockAudioContext(audio?.ctx);
    if(audio?.master){
      const mobileGain=isiOS?.28:.22;
      audio.master.gain.setValueAtTime((Number(volume.value)/100)*mobileGain,audio.ctx.currentTime);
    }

    btn.setAttribute('aria-pressed','true');
    soundLabel.textContent=ok?'sound on':'tap sound again';
    soundStatus.textContent=ok?'playing':'tap again';

    if(!ok){
      audioOn=false;
      stopAudio();
    }
  };

  document.addEventListener('visibilitychange',async()=>{
    if(!document.hidden&&audioOn&&audio?.ctx?.state==='suspended'){
      try{await audio.ctx.resume()}catch(e){}
    }
  });
})();
