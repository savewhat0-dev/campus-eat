import json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent.parent
sources=json.loads((root/'scripts/generated-asset-sources.json').read_text())
banner=root/'public/assets/banners'; banner.mkdir(parents=True,exist_ok=True)
products=root/'public/assets/products'; products.mkdir(parents=True,exist_ok=True)
for key,source in sources.items():
    im=Image.open(source)
    if key in ['hero','kathi','greenox','cafe','burger','dominos']:
        for width in [640,1440]:
            out=im.copy();out.thumbnail((width,width),Image.Resampling.LANCZOS)
            dest=banner/(key+('-small' if width==640 else '')+'.webp')
            out.save(dest,'WEBP',quality=86,method=6)
    elif key=='mascot':
        im.thumbnail((480,480),Image.Resampling.LANCZOS);im.save(root/'public/assets/chef-mascot.webp','WEBP',quality=90,method=6)
    # Product photos must come from the outlet. Never generate stand-in dish photos.
print('Optimized generated hero, five illustrative banners and Chef mascot only.')
