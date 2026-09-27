from PIL import Image
import numpy as np
import os

outdir = r'D:\龙族卡塞尔学院路明泽ai模型\noma_frames'

# Analyze frame0 to understand background color
img = Image.open(os.path.join(outdir, 'frame0_core_raw.png'))
print(f'Image size: {img.size}, mode: {img.mode}')
arr = np.array(img)
print(f'Shape: {arr.shape}')

# Sample corners and edges
h, w = arr.shape[:2]
print(f'\nCorner pixels (RGB):')
print(f'  Top-left: {arr[5, 5, :3]}')
print(f'  Top-right: {arr[5, w-5, :3]}')
print(f'  Bottom-left: {arr[h-5, 5, :3]}')
print(f'  Bottom-right: {arr[h-5, w-5, :3]}')
print(f'  Center-top: {arr[5, w//2, :3]}')
print(f'  Center-bottom: {arr[h-5, w//2, :3]}')
print(f'  Middle-left: {arr[h//2, 5, :3]}')
print(f'  Middle-right: {arr[h//2, w-5, :3]}')

# Sample the dress area (center)
print(f'\nCenter pixels (dress area):')
print(f'  Chest: {arr[h//3, w//2, :3]}')
print(f'  Waist: {arr[h//2, w//2, :3]}')
print(f'  Skirt: {arr[2*h//3, w//2, :3]}')

# Sample hair
print(f'\nHair pixels:')
print(f'  Top hair: {arr[h//6, w//2, :3]}')
print(f'  Left hair: {arr[h//2, w//6, :3]}')
