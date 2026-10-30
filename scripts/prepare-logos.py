from pathlib import Path
from PIL import Image,ImageChops
root=Path(__file__).resolve().parent.parent/'public/assets/logos'
for name in ['kathi','greenox','cafe','burger','dominos']:
    original=Image.open(root/(name+'.jpg')).convert('RGB')
    background=original.getpixel((0,0))
    diff=ImageChops.difference(original,Image.new('RGB',original.size,background)).convert('L')
    bbox=diff.point(lambda x:255 if x>25 else 0).getbbox()
    if bbox:
        l,t,r,b=bbox; pad=round(max(r-l,b-t)*.025)
        cropped=original.crop((max(0,l-pad),max(0,t-pad),min(original.width,r+pad),min(original.height,b+pad)))
    else: cropped=original
    cropped.thumbnail((700,700),Image.Resampling.LANCZOS)
    cropped.save(root/(name+'.webp'),'WEBP',lossless=True,method=6)
print('Prepared five whitespace-cropped logo derivatives; original JPEGs retained.')
