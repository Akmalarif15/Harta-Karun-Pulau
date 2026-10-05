/* Grafik kartun 2D ceria berinspirasikan permainan pengembaraan laut klasik.
   Hanya fungsi lukisan ditukar. Kandungan, misi, semakan dan aliran permainan kekal. */

(function () {
   const avatarAkmal = new Image();
avatarAkmal.src = 'assets/characters/kapten_akmal.png';

const avatarArif = new Image();
avatarArif.src = 'assets/characters/kapten_arif.png';
  function rr(x,y,w,h,r,fill,stroke,lw){
    const q=Math.min(r,w/2,h/2);
    ctx.beginPath();
    ctx.moveTo(x+q,y);
    ctx.arcTo(x+w,y,x+w,y+h,q);
    ctx.arcTo(x+w,y+h,x,y+h,q);
    ctx.arcTo(x,y+h,x,y,q);
    ctx.arcTo(x,y,x+w,y,q);
    ctx.closePath();
    if(fill){ctx.fillStyle=fill;ctx.fill();}
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw||2;ctx.stroke();}
  }

  function cloud(x,y,s){
    ctx.save();ctx.translate(x,y);ctx.scale(s,s);
    ctx.fillStyle='#dbe3f4';
    ctx.beginPath();ctx.ellipse(6,18,70,24,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ffffff';
    [[0,0,48,27],[48,-7,60,35],[105,5,48,27],[62,16,83,28]].forEach(function(p){
      ctx.beginPath();ctx.ellipse(p[0],p[1],p[2],p[3],0,0,Math.PI*2);ctx.fill();
    });
    ctx.restore();
  }

  function waveLine(y,alpha){
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.strokeStyle='#d7f2ef';
    ctx.lineWidth=4;
    ctx.beginPath();
    for(let x=0;x<=canvas.width;x+=35){
      const yy=y+Math.sin(x*.018+state.t*1.25)*6;
      if(x===0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy);
    }
    ctx.stroke();ctx.restore();
  }

  drawSkySea = function(sky,sea){
    ctx.fillStyle=sky||'#8fb9d1';
    ctx.fillRect(0,0,canvas.width,430);
    ctx.fillStyle=sea||'#579493';
    ctx.fillRect(0,430,canvas.width,canvas.height-430);
    cloud(155,105,.95);cloud(650,135,1.15);cloud(1110,95,.82);
    waveLine(485,.55);waveLine(560,.42);waveLine(645,.34);waveLine(735,.28);
  };

  drawPalm = function(x,y,scale){
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
    ctx.fillStyle='#5d7668aa';ctx.beginPath();ctx.ellipse(0,10,55,16,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#825b2f';ctx.lineWidth=16;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(15,-78,-8,-165);ctx.stroke();
    ctx.strokeStyle='#ad7d43';ctx.lineWidth=5;
    ctx.beginPath();ctx.moveTo(-4,-5);ctx.quadraticCurveTo(11,-80,-8,-158);ctx.stroke();
    for(let i=0;i<8;i++){
      const a=-2.8+i*.78;
      const ex=-8+Math.cos(a)*96,ey=-165+Math.sin(a)*48;
      ctx.fillStyle=i%2?'#238d42':'#38a64c';
      ctx.strokeStyle='#1e6d37';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(-8,-165);
      ctx.quadraticCurveTo((-8+ex)/2,-185,ex,ey);
      ctx.quadraticCurveTo((-8+ex)/2,-150,-8,-165);
      ctx.closePath();ctx.fill();ctx.stroke();
    }
    ctx.fillStyle='#6f4928';
    [[-15,-151],[4,-149],[-4,-137]].forEach(function(p){ctx.beginPath();ctx.arc(p[0],p[1],9,0,Math.PI*2);ctx.fill();});
    ctx.restore();
  };

  drawCaptain = function(x, y, name, isArif, cheer) {
  ctx.save();
  ctx.translate(x, y);

  const img = isArif ? avatarArif : avatarAkmal;

  const width = isArif ? 150 : 145;
  let height = 190;

  if (img.complete && img.naturalWidth > 0) {
    height = width * (img.naturalHeight / img.naturalWidth);
  }

  // Bayang di bawah kaki
  ctx.fillStyle = 'rgba(35, 70, 75, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 18, 44, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lukis avatar PNG
  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(
      img,
      -width / 2,
      -height + 20,
      width,
      height
    );
  } else {
    // Paparan sementara sementara gambar dimuatkan
    ctx.fillStyle = isArif ? '#e8943a' : '#3889b7';
    ctx.beginPath();
    ctx.arc(0, -75, 35, 0, Math.PI * 2);
    ctx.fill();
  }

  // Label nama
  if (name) {
    const boxWidth = 140;
    const boxHeight = 30;
    const boxY = -height - 17;

    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.strokeStyle = '#344e5f';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.roundRect(
      -boxWidth / 2,
      boxY,
      boxWidth,
      boxHeight,
      13
    );
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2e4652';
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(
      name,
      0,
      boxY + boxHeight / 2
    );
  }

  ctx.restore();
};


  drawShip = function(x,y,scale){
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
    ctx.fillStyle='#335f6570';ctx.beginPath();ctx.ellipse(0,62,168,20,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#f19631';ctx.strokeStyle='#35424a';ctx.lineWidth=5;
    ctx.beginPath();ctx.moveTo(-165,10);ctx.quadraticCurveTo(-115,84,0,88);ctx.quadraticCurveTo(115,84,165,10);ctx.lineTo(110,25);ctx.lineTo(-110,25);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#ffd54e';ctx.fillRect(-113,27,226,16);
    ctx.strokeStyle='#35424a';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(0,20);ctx.lineTo(0,-182);ctx.stroke();
    ctx.fillStyle='#f8f5df';ctx.strokeStyle='#35424a';ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(7,-172);ctx.lineTo(120,-137);ctx.lineTo(120,-42);ctx.lineTo(7,-65);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#39444b';ctx.beginPath();ctx.moveTo(0,-183);ctx.lineTo(83,-163);ctx.lineTo(0,-136);ctx.closePath();ctx.fill();
    ctx.fillStyle='#ffffff';ctx.font='bold 27px Arial';ctx.textAlign='center';ctx.fillText('☠',28,-154);
    ctx.restore();
  };

  drawSpeechBubble = function(x,y,w,h,text,side){
    rr(x,y,w,h,18,'#ffffff','#2f3d45',3);
    ctx.fillStyle='#ffffff';ctx.strokeStyle='#2f3d45';ctx.lineWidth=3;
    ctx.beginPath();
    if(side==='left'){ctx.moveTo(x+38,y+h-2);ctx.lineTo(x+15,y+h+25);ctx.lineTo(x+63,y+h-3);}
    else{ctx.moveTo(x+w-62,y+h-3);ctx.lineTo(x+w-18,y+h+24);ctx.lineTo(x+w-38,y+h-3);}
    ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#26333a';ctx.font='bold 18px Arial';ctx.textAlign='left';
    const words=String(text).split(' ');let line='';let yy=y+31;
    words.forEach(function(word,i){
      const test=line+word+' ';
      if(ctx.measureText(test).width>w-30&&line){ctx.fillText(line.trim(),x+15,yy);line=word+' ';yy+=25;}else line=test;
      if(i===words.length-1)ctx.fillText(line.trim(),x+15,yy);
    });
  };

  function islandBase(grass){
    ctx.fillStyle='#e8e38a';ctx.strokeStyle='#c9bd66';ctx.lineWidth=4;
    ctx.beginPath();ctx.ellipse(720,615,520,175,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle=grass||'#a9c989';ctx.beginPath();ctx.ellipse(720,555,405,113,0,0,Math.PI*2);ctx.fill();
  }

  drawIntroScene = function(){
    drawSkySea('#8fb9d1','#579493');
    ctx.fillStyle='#e8e38a';ctx.beginPath();ctx.moveTo(0,365);ctx.quadraticCurveTo(380,400,680,810);ctx.lineTo(0,810);ctx.closePath();ctx.fill();
    ctx.fillStyle='#a9c989';ctx.beginPath();ctx.moveTo(0,340);ctx.quadraticCurveTo(330,370,540,610);ctx.lineTo(0,610);ctx.closePath();ctx.fill();
    drawPalm(155,505,1.15);drawShip(1050,495,.92);
    drawCaptain(320,650,'Kapten Akmal',false,false);drawCaptain(1035,420,'Kapten Arif',true,false);
    if(state.screen==='intro'){
      const d=introLines[state.introIndex];
      if(d.speaker==='Kapten Akmal')drawSpeechBubble(375,405,400,108,d.text,'left');
      else drawSpeechBubble(655,175,520,112,d.text,'right');
    }
  };

  drawIslandScene = function(index){
    const m=missions[Math.max(0,Math.min(index,4))];
    drawSkySea('#91bbd1','#579493');
    islandBase(['#a9c989','#a8c98b','#9fc27f','#b3cc8b','#9ebd80'][index]||'#a9c989');
    drawPalm(390,590,.92);drawPalm(1070,575,.80);drawShip(245,580,.52);

    if(index===0){drawPalm(870,552,.60);}
    if(index===1){
      rr(810,515,120,70,12,'#e6a24b','#39474d',4);ctx.fillStyle='#f7df72';ctx.fillRect(800,490,140,28);ctx.fillStyle='#ef5d55';ctx.fillRect(835,535,26,24);ctx.fillStyle='#4f9ed0';ctx.fillRect(883,535,26,24);
    }
    if(index===2){
      ctx.strokeStyle='#ffffff';ctx.lineWidth=7;ctx.strokeRect(825,485,150,95);ctx.fillStyle='#ffffff';ctx.strokeStyle='#2f3a40';ctx.lineWidth=3;ctx.beginPath();ctx.arc(735,590,28,0,Math.PI*2);ctx.fill();ctx.stroke();
    }
    if(index===3){
      ctx.strokeStyle='#765431';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(810,600);ctx.lineTo(835,480);ctx.moveTo(980,600);ctx.lineTo(955,480);ctx.stroke();ctx.strokeStyle='#4c9d7e';ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(835,515);ctx.quadraticCurveTo(895,575,955,515);ctx.stroke();
    }
    if(index===4){
      ctx.fillStyle='#707873';ctx.strokeStyle='#414d50';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(820,615);ctx.lineTo(835,500);ctx.lineTo(900,450);ctx.lineTo(975,500);ctx.lineTo(1000,615);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#263a41';ctx.beginPath();ctx.ellipse(910,575,52,63,0,Math.PI,Math.PI*2);ctx.lineTo(962,615);ctx.lineTo(858,615);ctx.closePath();ctx.fill();
    }

    drawCaptain(600,620,'Kapten Akmal',false,false);drawCaptain(755,620,'Kapten Arif',true,false);
    rr(540,372,360,76,18,'#ffffffed','#344b59',4);ctx.fillStyle='#2e4651';ctx.textAlign='center';ctx.font='bold 25px Arial';ctx.fillText(m.island,720,402);ctx.font='bold 17px Arial';ctx.fillText(m.place,720,431);
  };

  drawTravel = function(progress){
    drawSkySea('#8fb9d1','#579493');
    const pts=[{x:135,y:620},{x:340,y:500},{x:550,y:625},{x:770,y:485},{x:995,y:610},{x:1240,y:490}];
    ctx.strokeStyle='#f8f1c5';ctx.lineWidth=5;ctx.setLineDash([11,14]);ctx.beginPath();pts.forEach(function(p,i){if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});ctx.stroke();ctx.setLineDash([]);
    pts.forEach(function(p,i){ctx.fillStyle=i===0?'#e8e38a':'#a9c989';ctx.strokeStyle='#657c64';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(p.x,p.y,76,36,0,0,Math.PI*2);ctx.fill();ctx.stroke();if(i>0){ctx.fillStyle='#2f8f4c';ctx.beginPath();ctx.arc(p.x-18,p.y-31,22,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(p.x+15,p.y-32,18,0,Math.PI*2);ctx.fill();}}
    const a=pts[Math.max(0,state.travelFrom+1)],b=pts[state.travelTo+1];
    const e=progress<.5?2*progress*progress:1-Math.pow(-2*progress+2,2)/2;
    const x=a.x+(b.x-a.x)*e,y=a.y+(b.y-a.y)*e-32*Math.sin(Math.PI*e);
    drawShip(x,y,.34);drawCaptain(x-18,y-46,'',false,false);drawCaptain(x+24,y-46,'',true,false);
    rr(500,700,440,42,18,'#f8fbf6','#334b59',3);ctx.fillStyle='#e7d05d';ctx.fillRect(515,714,410*progress,14);ctx.strokeStyle='#739094';ctx.lineWidth=2;ctx.strokeRect(515,714,410,14);ctx.fillStyle='#314954';ctx.font='bold 18px Arial';ctx.textAlign='center';ctx.fillText(Math.round(progress*100)+'%',720,690);
  };

  drawTreasureChest = function(x,y,scale,open){
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
    if(open){ctx.fillStyle='#fff3a777';ctx.beginPath();ctx.arc(0,-10,120,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='#a76231';ctx.strokeStyle='#35434a';ctx.lineWidth=5;ctx.fillRect(-90,-6,180,76);ctx.strokeRect(-90,-6,180,76);
    ctx.fillStyle='#f0c84f';ctx.fillRect(-90,10,180,13);ctx.fillRect(-12,-6,24,76);
    if(open){ctx.fillStyle='#d88635';ctx.beginPath();ctx.moveTo(-90,-8);ctx.lineTo(-72,-72);ctx.lineTo(72,-72);ctx.lineTo(90,-8);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#ffe269';for(let i=0;i<18;i++){ctx.beginPath();ctx.arc(-65+(i*29)%130,4+(i*17)%42,7,0,Math.PI*2);ctx.fill();}}
    ctx.restore();
  };

  drawFinalScene = function(){
    drawSkySea('#91bbd1','#579493');islandBase('#a9c989');drawPalm(350,590,.93);drawPalm(1090,580,.85);drawTreasureChest(720,585,1.15,true);drawCaptain(500,660,'Kapten Akmal',false,true);drawCaptain(940,660,'Kapten Arif',true,true);
    rr(470,55,500,64,18,'#ffffffef','#344b59',4);ctx.fillStyle='#334a55';ctx.font='bold 31px Arial';ctx.textAlign='center';ctx.fillText('HARTA KARUN DITEMUI!',720,96);
    if(!state.calm){const cs=['#f5ca52','#ef705b','#5bbca5','#78a9dd'];for(let i=0;i<54;i++){ctx.fillStyle=cs[i%cs.length];const x=(i*103)%1400+20,y=(i*59+state.t*75)%360+130;ctx.fillRect(x,y,7,12);}}
  };
})();
