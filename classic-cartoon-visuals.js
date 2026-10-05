/* Grafik kartun 2D ceria berinspirasikan permainan pengembaraan laut klasik.
   Hanya fungsi lukisan ditukar. Kandungan, misi, semakan dan aliran permainan kekal. */

(function () {
   const avatarAkmal = new Image();
avatarAkmal.src = 'assets/characters/kapten_akmal.png?v=6';
const avatarArif = new Image();
avatarArif.src = 'assets/characters/kapten_arif.png?v=6';
   const island1 = new Image();
island1.src = 'assets/islands/island_1.png?v=1';

const island2 = new Image();
island2.src = 'assets/islands/island_2.png?v=1';

const island3 = new Image();
island3.src = 'assets/islands/island_3.png?v=1';

const island4 = new Image();
island4.src = 'assets/islands/island_4.png?v=1';

const island5 = new Image();
island5.src = 'assets/islands/island_5.png?v=1';

const islandImages = [island1, island2, island3, island4, island5];
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

  ctx.fillStyle = 'rgba(35, 70, 75, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 18, 44, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(
      img,
      -width / 2,
      -height + 20,
      width,
      height
    );
  } else {
    ctx.fillStyle = isArif ? '#e8943a' : '#3889b7';
    ctx.beginPath();
    ctx.arc(0, -75, 35, 0, Math.PI * 2);
    ctx.fill();
  }

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

  function islandOutline(index){
    ctx.save();
    ctx.fillStyle='#32b7df';
    ctx.strokeStyle='#197fa6';
    ctx.lineWidth=4;
    ctx.beginPath();
    if(index===0){
      ctx.moveTo(95,655);ctx.bezierCurveTo(185,555,350,505,555,520);
      ctx.bezierCurveTo(775,485,1040,510,1320,650);
      ctx.bezierCurveTo(1215,735,960,755,720,730);
      ctx.bezierCurveTo(455,760,210,735,95,655);
    }else if(index===1){
      ctx.moveTo(120,650);ctx.bezierCurveTo(260,590,465,575,640,615);
      ctx.bezierCurveTo(820,570,1090,575,1315,655);
      ctx.bezierCurveTo(1190,730,920,742,730,715);
      ctx.bezierCurveTo(500,752,265,730,120,650);
    }else if(index===2){
      ctx.moveTo(145,660);ctx.bezierCurveTo(210,520,405,475,610,520);
      ctx.bezierCurveTo(760,565,880,550,1025,500);
      ctx.bezierCurveTo(1190,470,1315,565,1300,665);
      ctx.bezierCurveTo(1160,710,1060,685,975,640);
      ctx.bezierCurveTo(865,595,785,610,700,690);
      ctx.bezierCurveTo(560,770,315,755,145,660);
    }else if(index===3){
      ctx.moveTo(75,665);ctx.bezierCurveTo(245,605,390,610,540,640);
      ctx.bezierCurveTo(680,665,730,545,875,540);
      ctx.bezierCurveTo(1060,525,1210,590,1360,645);
      ctx.bezierCurveTo(1220,708,1050,710,905,680);
      ctx.bezierCurveTo(755,655,685,750,500,740);
      ctx.bezierCurveTo(300,735,160,715,75,665);
    }else{
      ctx.moveTo(170,680);ctx.bezierCurveTo(230,560,400,485,600,520);
      ctx.bezierCurveTo(775,455,1045,500,1260,630);
      ctx.bezierCurveTo(1175,720,930,755,680,725);
      ctx.bezierCurveTo(465,770,260,745,170,680);
    }
    ctx.closePath();
    ctx.fill();ctx.stroke();

    ctx.strokeStyle='#ecfbff';
    ctx.lineWidth=13;
    ctx.lineJoin='round';
    ctx.stroke();

    ctx.fillStyle='#f6d36d';
    ctx.strokeStyle='#d7ad55';
    ctx.lineWidth=4;
    ctx.beginPath();
    if(index===0){
      ctx.moveTo(120,640);ctx.bezierCurveTo(225,550,385,520,575,535);
      ctx.bezierCurveTo(800,505,1035,530,1280,642);
      ctx.bezierCurveTo(1170,710,940,725,720,705);
      ctx.bezierCurveTo(470,735,245,705,120,640);
    }else if(index===1){
      ctx.moveTo(145,638);ctx.bezierCurveTo(285,600,470,590,650,625);
      ctx.bezierCurveTo(835,588,1080,595,1280,645);
      ctx.bezierCurveTo(1165,700,930,714,740,690);
      ctx.bezierCurveTo(520,720,285,700,145,638);
    }else if(index===2){
      ctx.moveTo(170,645);ctx.bezierCurveTo(245,535,415,500,610,540);
      ctx.bezierCurveTo(755,580,875,570,1015,520);
      ctx.bezierCurveTo(1170,495,1280,575,1270,650);
      ctx.bezierCurveTo(1150,682,1050,660,960,620);
      ctx.bezierCurveTo(850,580,770,600,690,670);
      ctx.bezierCurveTo(550,735,330,720,170,645);
    }else if(index===3){
      ctx.moveTo(105,650);ctx.bezierCurveTo(255,620,410,625,545,650);
      ctx.bezierCurveTo(685,675,755,565,885,560);
      ctx.bezierCurveTo(1050,550,1190,605,1325,645);
      ctx.bezierCurveTo(1200,680,1050,683,910,655);
      ctx.bezierCurveTo(760,635,690,715,510,710);
      ctx.bezierCurveTo(330,705,190,690,105,650);
    }else{
      ctx.moveTo(195,660);ctx.bezierCurveTo(260,570,425,510,605,540);
      ctx.bezierCurveTo(780,485,1025,525,1225,630);
      ctx.bezierCurveTo(1130,690,925,720,690,695);
      ctx.bezierCurveTo(485,735,300,710,195,660);
    }
    ctx.closePath();ctx.fill();ctx.stroke();
    ctx.restore();
  }

  function rockPeak(x,y,w,h,color){
    ctx.save();ctx.translate(x,y);
    ctx.fillStyle=color||'#bd6d4e';ctx.strokeStyle='#784638';ctx.lineWidth=4;
    ctx.beginPath();
    ctx.moveTo(-w*.46,h*.43);ctx.lineTo(-w*.35,-h*.10);ctx.lineTo(-w*.08,-h*.53);
    ctx.lineTo(w*.24,-h*.31);ctx.lineTo(w*.47,h*.10);ctx.lineTo(w*.31,h*.43);
    ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(255,196,143,.35)';
    ctx.beginPath();ctx.moveTo(-w*.25,h*.18);ctx.lineTo(-w*.15,-h*.20);ctx.lineTo(w*.02,-h*.38);ctx.lineTo(w*.08,h*.05);ctx.closePath();ctx.fill();
    ctx.restore();
  }

  function bushBlob(x,y,s){
    ctx.save();ctx.translate(x,y);ctx.scale(s,s);
    [[0,0,25],[27,4,21],[-27,6,22],[7,-18,23],[-12,-13,19]].forEach(function(b,i){
      ctx.fillStyle=i%2?'#2e9a49':'#43b858';ctx.beginPath();ctx.arc(b[0],b[1],b[2],0,Math.PI*2);ctx.fill();
    });
    ctx.restore();
  }

  function shellMark(x,y,color){
    ctx.save();ctx.translate(x,y);ctx.fillStyle=color||'#a969c4';ctx.strokeStyle='#75527d';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(0,0,11,Math.PI,0);ctx.lineTo(11,7);ctx.lineTo(-11,7);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
  }

 function drawIslandArt(index){
  const img = islandImages[index];

  if (!img || !img.complete || img.naturalWidth === 0) {
    return;
  }

  const width = 1180;
  const height = width * (img.naturalHeight / img.naturalWidth);

  ctx.save();

  ctx.drawImage(
    img,
    720 - width / 2,
    625 - height / 2,
    width,
    height
  );

  ctx.restore();
}
   drawIslandScene = function(index){
    const safeIndex=Math.max(0,Math.min(index,4));
    const m=missions[safeIndex];
    drawSkySea('#91bbd1','#579493');
    drawIslandArt(safeIndex);

    drawShip(205,625,.44);
    drawCaptain(610,650,'Kapten Akmal',false,false);
    drawCaptain(770,650,'Kapten Arif',true,false);

    rr(520,350,400,78,18,'#ffffffef','#344b59',4);
    ctx.fillStyle='#2e4651';ctx.textAlign='center';ctx.font='bold 25px Arial';ctx.fillText(m.island,720,381);
    ctx.font='bold 17px Arial';ctx.fillText(m.place,720,410);
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
