# Assembles PNG frames into a looping GIF. The last frame is held for 3 seconds.
import sys, os
from PIL import Image
d, out = sys.argv[1], sys.argv[2]
files = sorted(f for f in os.listdir(d) if f.endswith('.png'))
frames = [Image.open(os.path.join(d, f)).convert('RGB') for f in files]
pal = frames[-1].quantize(colors=128, method=Image.Quantize.MEDIANCUT)
frames = [f.quantize(palette=pal, dither=Image.Dither.NONE) for f in frames]
durations = [120] * (len(frames) - 1) + [3000]
frames[0].save(out, save_all=True, append_images=frames[1:], duration=durations, loop=0, optimize=True)
