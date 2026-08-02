# -*- coding: utf-8 -*-
"""Builds The Vault workbook: Content Calendar, Affiliate Scorecard,
Sample->Sale Forecaster, and Campaign Tracker. Live formulas throughout."""
import os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

OUT = os.path.join(os.path.dirname(__file__), "..", "vault", "orange-cart-vault-workbook.xlsx")

INK="16130F"; ACCENT="FF5A1F"; SOFT="FDEEE4"; INPUT="FFF7EF"; GREY="F2ECE2"; RULE="E7DDCE"
WHITE="FFFFFF"; GREEN="0E7C6B"; RED="B3261E"
F="Arial"
hdr_fill=PatternFill("solid",fgColor=INK)
acc_fill=PatternFill("solid",fgColor=ACCENT)
soft_fill=PatternFill("solid",fgColor=SOFT)
inp_fill=PatternFill("solid",fgColor=INPUT)
grey_fill=PatternFill("solid",fgColor=GREY)
thin=Side(style="thin",color=RULE)
border=Border(left=thin,right=thin,top=thin,bottom=thin)
inp_side=Side(style="medium",color=ACCENT)
inp_border=Border(left=inp_side,right=inp_side,top=inp_side,bottom=inp_side)

def title(ws,text,sub,span=8):
    ws.merge_cells(start_row=1,start_column=1,end_row=1,end_column=span)
    c=ws.cell(1,1,text); c.font=Font(F,size=18,bold=True,color=WHITE); c.fill=acc_fill
    c.alignment=Alignment(vertical="center",indent=1); ws.row_dimensions[1].height=34
    ws.merge_cells(start_row=2,start_column=1,end_row=2,end_column=span)
    c=ws.cell(2,1,sub); c.font=Font(F,size=10,italic=True,color="4A423A"); c.fill=soft_fill
    c.alignment=Alignment(vertical="center",indent=1); ws.row_dimensions[2].height=22

def head(ws,row,cols,widths=None):
    for i,t in enumerate(cols,1):
        c=ws.cell(row,i,t); c.font=Font(F,size=10,bold=True,color=WHITE); c.fill=hdr_fill
        c.alignment=Alignment(horizontal="left",vertical="center",wrap_text=True,indent=1)
        c.border=border
    ws.row_dimensions[row].height=30
    if widths:
        for i,w in enumerate(widths,1): ws.column_dimensions[get_column_letter(i)].width=w

def cell(ws,r,c,v,inp=False,bold=False,center=False,money=False,pct=False,color=None,fill=None):
    x=ws.cell(r,c,v)
    x.font=Font(F,size=10,bold=bold,color=color or "16130F")
    x.alignment=Alignment(horizontal="center" if center else "left",vertical="center",indent=0 if center else 1,wrap_text=True)
    x.border=inp_border if inp else border
    if inp: x.fill=inp_fill
    elif fill: x.fill=PatternFill("solid",fgColor=fill)
    if money: x.number_format='$#,##0'
    if pct: x.number_format='0%'
    return x

wb=Workbook()

# ---------------- START HERE ----------------
ws=wb.active; ws.title="START HERE"; ws.sheet_view.showGridLines=False
title(ws,"THE VAULT  ·  Workbook","The Orange Cart Playbook — plug-and-play tools. Fill the orange cells only.",6)
ws.column_dimensions['A'].width=3
for i in range(2,7): ws.column_dimensions[get_column_letter(i)].width=20
rows=[
 ("",""),
 ("How to use this workbook","4 tabs. Everything you edit is an ORANGE cell. Grey/dark cells calculate themselves — don't overwrite them."),
 ("1 · Content Calendar","Plan a week of content on the 7-pillar rotation. Pillars are pre-filled; you add the hook, format, and post date."),
 ("2 · Affiliate Scorecard","Score each creator 0–2 on five checks. The sheet totals it and tells you APPROVE / REVIEW / REJECT."),
 ("3 · Sample→Sale Forecaster","Enter your GMV goal and your cost numbers. It tells you how many samples to ship and what they'll cost & return."),
 ("4 · Campaign Tracker","One row per creator campaign. Enter samples, posts, views, GMV — it computes your real GMV-per-sample so you can replace the ~$18 benchmark with YOUR number."),
 ("",""),
 ("The one number to learn","GMV per sample. Start with the ~$18 benchmark, then let the Tracker compute your own. Every forecast gets sharper once you use your real figure."),
 ("Legend","ORANGE = you type here.   Dark = section header.   Grey = auto-calculated."),
]
r=4
for k,v in rows:
    if k=="":
        r+=1; continue
    a=ws.cell(r,2,k); a.font=Font(F,size=11,bold=True,color=ACCENT if k[0].isdigit() else INK)
    a.alignment=Alignment(vertical="top",wrap_text=True)
    ws.merge_cells(start_row=r,start_column=3,end_row=r,end_column=6)
    b=ws.cell(r,3,v); b.font=Font(F,size=10,color="3A332C"); b.alignment=Alignment(vertical="top",wrap_text=True)
    ws.row_dimensions[r].height=34 if len(v)>90 else 22
    r+=1

# ---------------- CONTENT CALENDAR ----------------
ws=wb.create_sheet("1 Content Calendar"); ws.sheet_view.showGridLines=False
title(ws,"WEEKLY CONTENT CALENDAR","The 7-pillar rotation. Pillar is set — you fill hook, format, sound & post date. Never post the same angle twice in a row.",7)
head(ws,4,["Day","Pillar (set)","Hook idea","Format","Sound / trend","Post date","Status"],
     [12,18,34,20,22,14,14])
cal=[("Monday","Pain Point"),("Tuesday","Demo / Tutorial"),("Wednesday","Social Proof"),
     ("Thursday","Trend-Jack"),("Friday","Lifestyle"),("Saturday","Comparison"),("Sunday","Behind the Scenes")]
r=5
# example row
ex=("Monday","Pain Point","\"I felt the lump on my 10-yr-old…\"","Reveal story","Emotional piano bed","(ex) filled in","Drafted")
for i,v in enumerate(ex,1):
    cell(ws,r,i,v,inp=(i in(3,4,5,6,7)),color="8A8078" if i<=2 else None)
ws.cell(r,1).value="(example)"; ws.cell(r,1).font=Font(F,size=9,italic=True,color="8A8078")
r+=1
for day,pillar in cal:
    cell(ws,r,1,day,bold=True,fill=GREY)
    cell(ws,r,2,pillar,fill=SOFT,color="B23A0E",bold=True)
    for c in range(3,8): cell(ws,r,c,"",inp=True)
    ws.row_dimensions[r].height=30
    r+=1
ws.freeze_panes="A5"

# ---------------- AFFILIATE SCORECARD ----------------
ws=wb.create_sheet("2 Affiliate Scorecard"); ws.sheet_view.showGridLines=False
title(ws,"AFFILIATE CREATOR SCORECARD","Score 0–2 on each check (0 = no, 1 = partial, 2 = strong). 8+ auto-approves; 5–7 review; under 5 reject.",9)
head(ws,4,["Creator @handle","Category fit","Real human","Content style","Audience match","Track record / GMV","TOTAL","Decision","Notes"],
     [22,12,11,12,13,15,9,14,26])
r=5
# example
cell(ws,r,1,"@example_creator",color="8A8078")
for c,val in zip(range(2,7),[2,2,1,2,1]): cell(ws,r,c,val,center=True,color="8A8078")
tot=f"=SUM(B{r}:F{r})"; cell(ws,r,7,tot,center=True,bold=True,fill=GREY)
dec=f'=IF(G{r}="","",IF(G{r}>=8,"APPROVE",IF(G{r}>=5,"REVIEW","REJECT")))'
cell(ws,r,8,dec,center=True,bold=True,fill=GREY)
cell(ws,r,9,"(example) strong fit, proven seller",color="8A8078")
ws.cell(r,1).font=Font(F,size=9,italic=True,color="8A8078")
r+=1
for _ in range(14):
    for c in range(1,7): cell(ws,r,c,"",inp=True,center=(c>=2))
    cell(ws,r,7,f"=IF(COUNT(B{r}:F{r})=0,\"\",SUM(B{r}:F{r}))",center=True,bold=True,fill=GREY)
    cell(ws,r,8,f'=IF(G{r}="","",IF(G{r}>=8,"APPROVE",IF(G{r}>=5,"REVIEW","REJECT")))',center=True,bold=True,fill=GREY)
    cell(ws,r,9,"",inp=True)
    ws.row_dimensions[r].height=26
    r+=1
ws.freeze_panes="A5"
# scoring key
r+=1
ws.merge_cells(start_row=r,start_column=1,end_row=r,end_column=9)
c=ws.cell(r,1,"Scoring key — each check: 0 = clear no · 1 = partial / borderline · 2 = strong yes.  |  Tighten the approve threshold (raise 8) if your GMV-per-sample drops.")
c.font=Font(F,size=9,italic=True,color="4A423A"); c.fill=soft_fill

# ---------------- FORECASTER ----------------
ws=wb.create_sheet("3 Forecaster"); ws.sheet_view.showGridLines=False
title(ws,"SAMPLE → SALE FORECASTER","Enter your goal & cost numbers (orange). The sheet plans your sample budget from the ~$18-per-sample benchmark.",6)
ws.column_dimensions['A'].width=3
ws.column_dimensions['B'].width=34
for col in "CDEF": ws.column_dimensions[col].width=16
# Inputs block
def sec(r,text):
    ws.merge_cells(start_row=r,start_column=2,end_row=r,end_column=6)
    c=ws.cell(r,2,text); c.font=Font(F,size=11,bold=True,color=WHITE); c.fill=hdr_fill
    c.alignment=Alignment(vertical="center",indent=1); ws.row_dimensions[r].height=26
sec(4,"YOUR INPUTS  (edit the orange cells)")
inputs=[
 ("GMV goal for the period","goal",15000,'$#,##0'),
 ("GMV per sample shipped (benchmark ~$16–18)","gps",16,'$#,##0'),
 ("All-in cost per sample (product + ship + commission)","cost",6,'$#,##0.00'),
 ("Sample approval rate you expect","apr",0.15,'0%'),
]
r=5; ref={}
for label,key,val,fmt in inputs:
    cell(ws,r,2,label)
    x=cell(ws,r,3,val,inp=True,center=True); x.number_format=fmt
    ref[key]=f"C{r}"; r+=1
r+=1
sec(r,"THE PLAN  (calculates automatically)"); r+=1
plan=[
 ("Samples you need to SHIP",f"=ROUND({ref['goal']}/{ref['gps']},0)",'#,##0'),
 ("Sample requests to APPROVE from (÷ approval rate)",f"=ROUND({ref['goal']}/{ref['gps']}/{ref['apr']},0)",'#,##0'),
 ("Total sample cost to fund",f"=({ref['goal']}/{ref['gps']})*{ref['cost']}",'$#,##0'),
 ("Forecast GMV from this cohort",f"={ref['goal']}",'$#,##0'),
 ("Cost as % of GMV",f"=(({ref['goal']}/{ref['gps']})*{ref['cost']})/{ref['goal']}",'0.0%'),
 ("Contribution before repeat purchases",f"={ref['goal']}-(({ref['goal']}/{ref['gps']})*{ref['cost']})",'$#,##0'),
]
for label,f_,fmt in plan:
    cell(ws,r,2,label,bold=True)
    x=cell(ws,r,3,f_,center=True,bold=True,fill=GREY); x.number_format=fmt
    r+=1
r+=1
# sensitivity table
sec(r,"WHAT IF YOU SHIP N SAMPLES?  (uses your GMV-per-sample above)"); r+=1
head(ws,r,["Samples shipped","Forecast GMV","Sample cost","Contribution"],None)
# shift header into B..E
for i,t in enumerate(["Samples shipped","Forecast GMV","Sample cost","Contribution"]):
    c=ws.cell(r,2+i,t); c.font=Font(F,size=10,bold=True,color=WHITE); c.fill=hdr_fill
    c.alignment=Alignment(horizontal="center",vertical="center"); c.border=border
ws.cell(r,1).value=None
r+=1
for n in (100,250,500,1000,2000):
    cell(ws,r,2,n,center=True)
    cell(ws,r,3,f"=B{r}*{ref['gps']}",center=True,fill=GREY).number_format='$#,##0'
    cell(ws,r,4,f"=B{r}*{ref['cost']}",center=True,fill=GREY).number_format='$#,##0'
    cell(ws,r,5,f"=C{r}-D{r}",center=True,bold=True,fill=GREY).number_format='$#,##0'
    r+=1
r+=1
ws.merge_cells(start_row=r,start_column=2,end_row=r,end_column=6)
c=ws.cell(r,2,"Note: $18/sample came out nearly identical across two unrelated categories in a real 6-month portfolio. Replace it with your own number from the Tracker as soon as you have 30+ days of data.")
c.font=Font(F,size=9,italic=True,color="4A423A"); c.fill=soft_fill; c.alignment=Alignment(wrap_text=True,vertical="center"); ws.row_dimensions[r].height=40

# ---------------- CAMPAIGN TRACKER ----------------
ws=wb.create_sheet("4 Campaign Tracker"); ws.sheet_view.showGridLines=False
title(ws,"CAMPAIGN TRACKER","One row per creator. Enter the orange cells; totals & your real GMV-per-sample calculate at the top.",9)
# summary row at top (row 4-5)
ws.merge_cells("A4:B4"); c=ws.cell(4,1,"PORTFOLIO TOTALS →"); c.font=Font(F,size=10,bold=True,color=WHITE); c.fill=hdr_fill; c.alignment=Alignment(vertical="center",indent=1)
labels=["Samples","Posts","Views","Units","GMV","Commission","GMV / sample"]
for i,l in enumerate(labels):
    c=ws.cell(4,3+i,l); c.font=Font(F,size=9,bold=True,color=WHITE); c.fill=acc_fill; c.alignment=Alignment(horizontal="center",vertical="center"); c.border=border
# formulas summary in row 5 (sum of data rows 8..40)
DR1,DR2=8,40
sums={"C":"E","D":"F","E":"G","F":"H","G":"I","H":"J"}  # not used; compute directly
tot_cols={3:"E",4:"F",5:"G",6:"H",7:"I",8:"J"}
for outc,src in tot_cols.items():
    c=ws.cell(5,outc,f"=SUM({src}{DR1}:{src}{DR2})"); c.font=Font(F,size=11,bold=True,color=INK); c.fill=grey_fill
    c.alignment=Alignment(horizontal="center",vertical="center"); c.border=border
    if outc in (7,8): c.number_format='$#,##0'
    else: c.number_format='#,##0'
# GMV per sample = total GMV / total samples
c=ws.cell(5,9,f"=IF(C5=0,\"—\",I5/C5)"); c.font=Font(F,size=11,bold=True,color=GREEN); c.fill=grey_fill
c.alignment=Alignment(horizontal="center",vertical="center"); c.border=border; c.number_format='$#,##0.00'
ws.cell(5,1).value="(auto)"; ws.merge_cells("A5:B5"); ws.cell(5,1).font=Font(F,size=9,italic=True,color="8A8078"); ws.cell(5,1).alignment=Alignment(indent=1,vertical="center")
ws.row_dimensions[4].height=22; ws.row_dimensions[5].height=24
# header
head(ws,7,["Creator @handle","Product","Samples shipped","Posted (Y/N)","Views","Units sold","GMV","Commission paid","Net (GMV−comm)"],
     [22,18,13,11,12,11,12,14,14])
# example row 8
exrow=["@example","Your SKU",1,"Y",4200,3,54,8,None]
for i,v in enumerate(exrow,1):
    if i==9:
        cell(ws,8,9,"=G8-H8",center=True,fill=GREY).number_format='$#,##0'
    else:
        x=cell(ws,8,i,v,inp=(i in(1,2,3,4,5,6,7,8)),center=(i>=3),color="8A8078")
        if i in(7,8): x.number_format='$#,##0'
ws.cell(8,1).value="(example)"; ws.cell(8,1).font=Font(F,size=9,italic=True,color="8A8078")
for r in range(9,DR2+1):
    for c in range(1,9): cell(ws,r,c,"",inp=True,center=(c>=3))
    x=cell(ws,r,9,f"=IF(G{r}=\"\",\"\",G{r}-H{r})",center=True,bold=True,fill=GREY); x.number_format='$#,##0'
    for c in (7,8): ws.cell(r,c).number_format='$#,##0'
    ws.row_dimensions[r].height=24
ws.freeze_panes="A8"

# Force any real spreadsheet app (Excel, Google Sheets, Numbers) to recalc on open
wb.calculation.fullCalcOnLoad = True

os.makedirs(os.path.dirname(OUT),exist_ok=True)
wb.save(OUT)
print("wrote",OUT)
