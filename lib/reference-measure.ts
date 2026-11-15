export type Point={x:number;y:number};
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
export function referenceEstimate(reference:Point[],opening:Point[],referenceWidth:number,referenceHeight:number,samePlane:boolean){
  if(!samePlane||reference.length!==4||opening.length!==4||!Number.isFinite(referenceWidth)||!Number.isFinite(referenceHeight)||referenceWidth<=0||referenceHeight<=0)throw new Error('Bekannte Referenz und Bestätigung der gemeinsamen Messebene fehlen.');
  if([...reference,...opening].some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))throw new Error('Ungültige Messpunkte.');
  for(const points of [reference,opening]){
    const cross=points.map((p,i)=>{const q=points[(i+1)%4],r=points[(i+2)%4];return(q.x-p.x)*(r.y-q.y)-(q.y-p.y)*(r.x-q.x);});
    if(!cross.every(x=>x>0)&&!cross.every(x=>x<0))throw new Error('Ecken bitte umlaufend markieren: oben links, oben rechts, unten rechts, unten links.');
  }
  if(reference.some((p,i)=>distance(p,reference[(i+1)%4])<40))throw new Error('Die Referenz ist im Bild zu klein. Bitte näher aufnehmen.');
  const target=[{x:0,y:0},{x:referenceWidth,y:0},{x:referenceWidth,y:referenceHeight},{x:0,y:referenceHeight}];
  const rows:number[][]=[];
  reference.forEach((p,i)=>{const t=target[i];rows.push([p.x,p.y,1,0,0,0,-t.x*p.x,-t.x*p.y,t.x]);rows.push([0,0,0,p.x,p.y,1,-t.y*p.x,-t.y*p.y,t.y]);});
  // Solve the planar homography; never infer a 3D depth or an order-size offset.
  for(let col=0;col<8;col++){
    let pivot=col;for(let row=col+1;row<8;row++)if(Math.abs(rows[row][col])>Math.abs(rows[pivot][col]))pivot=row;
    if(Math.abs(rows[pivot][col])<1e-9)throw new Error('Referenzgeometrie nicht belastbar.');
    [rows[pivot],rows[col]]=[rows[col],rows[pivot]];const div=rows[col][col];rows[col]=rows[col].map(x=>x/div);
    for(let row=0;row<8;row++)if(row!==col){const factor=rows[row][col];rows[row]=rows[row].map((x,i)=>x-factor*rows[col][i]);}
  }
  const h=rows.map(r=>r[8]);
  const mapped=opening.map(p=>{const d=h[6]*p.x+h[7]*p.y+1;if(Math.abs(d)<1e-6)throw new Error('Perspektive für diese Messung ungeeignet.');return{x:(h[0]*p.x+h[1]*p.y+h[2])/d,y:(h[3]*p.x+h[4]*p.y+h[5])/d};});
  const widths=[distance(mapped[0],mapped[1]),distance(mapped[3],mapped[2])],heights=[distance(mapped[0],mapped[3]),distance(mapped[1],mapped[2])];
  const width=(widths[0]+widths[1])/2,height=(heights[0]+heights[1])/2;
  if(width<=0||height<=0||width>20000||height>20000||Math.abs(widths[0]-widths[1])/width>.05||Math.abs(heights[0]-heights[1])/height>.05)throw new Error('Messkanten sind nicht plausibel. Bitte manuell messen.');
  // Opposite edges can agree even for a skew quadrilateral. Rectangularity is required.
  const a={x:mapped[1].x-mapped[0].x,y:mapped[1].y-mapped[0].y},b={x:mapped[3].x-mapped[0].x,y:mapped[3].y-mapped[0].y};
  if(Math.abs((a.x*b.x+a.y*b.y)/(Math.hypot(a.x,a.y)*Math.hypot(b.x,b.y)))>.08)throw new Error('Öffnung und Referenz liegen nicht plausibel in derselben rechteckigen Ebene. Bitte manuell messen.');
  return {width:Math.round(width),height:Math.round(height),source:'reference-photo' as const,status:'estimated' as const,reference:JSON.stringify({method:'planar-reference-homography/1',referenceWidth,referenceHeight,reference,opening,samePlane:true})};
}
