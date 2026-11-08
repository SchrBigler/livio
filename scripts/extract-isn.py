"""Extract explicit original matrix cells from pdftotext -layout; no price inference.
Usage: python3 scripts/extract-isn.py INPUT_TEXT OUTPUT_JSON
The output is confidential supplier data and must not be committed to a public repository.
"""
import json,re,sys,hashlib
from pathlib import Path
pages=Path(sys.argv[1]).read_text().split('\f')
# Exact base variants only. Ambiguous suffix variants require explicit selection.
selected=[(541,'Spannrahmen Preisliste 2',['SP1/41','SP1/43']),
 (542,'Spannrahmen Preisliste 3',['SP6/51']), (542,'Spannrahmen Preisliste 4',['SP5/10']),
 (545,'Pendeltüren Preisliste 2',['PT2/10']), (545,'Pendeltüren Preisliste 3',['PT2/71']),
 (547,'Drehrahmen für Türen Preisliste 1',['DT3/1']),
 (549,'Rollos für Fenster und Türen Preisliste 1',['RO5/2']),
 (549,'Rollos für Fenster und Türen Preisliste 2',['RO4/2']),
 (557,'Schiebeanlagen ST3        Preisliste 1',['ST3/1','ST3/4']),
 (565,'Lichtschachtabdeckungen LiSA Preisliste 1',['LI1/1']),
 (565,'Lichtschachtabdeckungen LiSA Preisliste 2',['LI1/2'])]
def normalize(x):return re.sub(r'\s+',' ',x).strip()
tables=[]
for page,title,codes in selected:
 lines=pages[page-1].splitlines();start=next(i for i,l in enumerate(lines) if normalize(title) in normalize(l))
 header=next(i for i in range(start+1,len(lines)) if lines[i].strip().startswith('Breite'))
 widths=[int(x) for x in re.findall(r'\d+',lines[header])];pending=None;cells=[]
 for line in lines[header+1:]:
  stripped=line.strip();nums=[int(x) for x in re.findall(r'\d+',line)]
  if not stripped:continue
  if not nums:
   if cells:break
   continue
  if len(nums)==1:pending=nums[0];continue
  if pending is not None and not stripped.startswith(('Höhe','Tiefe')):
   if len(nums)!=len(widths):pending=None;continue
   height=pending;values=nums;pending=None;pending=None
   cells.extend({'width':w,'height':height,'net':v} for w,v in zip(widths,values));continue
  if stripped.startswith(('Höhe','Tiefe')):
   if pending:height=pending;values=nums;pending=None
   else:height=nums[0];values=nums[1:]
  elif stripped[0].isdigit() and not re.search('[A-Za-z]',stripped):height=nums[0];values=nums[1:]
  else:break
  assert 0<len(values)<=len(widths),(page,title,line)
  cells.extend({'width':w,'height':height,'net':v} for w,v in zip(widths,values))
 assert cells,(page,title)
 tables.append({'id':f'isn-2025-p{page}-{len(tables)+1}','title':normalize(title),'codes':codes,'pdfPage':page,'printedPage':page-525,'widths':widths,'cells':cells})
result={'schema':'isn-source/1','supplier':'ISN Schweiz','source':'ISN komplett 2026-06-komprimiert.pdf','priceEdition':'04/2025 CHF','validFrom':'2025-04-01','validityConfirmed':False,'status':'imported-needs-commercial-review','roundingRule':'next-upper-width-and-height','tables':tables,
 'frameMeshSurcharges':{'areaUpperM2':[1,1.5,2,2.5,3,3.5,4],'TTA':[37,54,73,90,109,125,142],'TFP':[67,101,133,165,196,228,262],'FA':[0,0,0,0,0,0,0],'pdfPage':541,'printedPage':16},
 'notes':['Original net price cells, not sale prices. Dealer discount and service costs must be confirmed.','Mesh tiers use actual order dimensions, not the upper price-band area.','Grey technical table marks and detailed variant feasibility require specialist confirmation.','Special colors/accessories and non-frame meshes need their own explicit surcharge rules.']}
Path(sys.argv[2]).write_text(json.dumps(result,ensure_ascii=False))
print(json.dumps({'tables':len(tables),'cells':sum(len(t['cells']) for t in tables),'codes':[c for t in tables for c in t['codes']]}))
