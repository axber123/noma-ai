import urllib.request, ssl, os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

outdir = r'D:\龙族卡塞尔学院路明泽ai模型\noma_frames'
os.makedirs(outdir, exist_ok=True)

# Original generated images from doubao CDN (should be globally accessible)
files = [
    ('frame0_core_raw.png', 'https://aka.doubaocdn.com/s/DvVQsM1JYs'),
    ('frame1_idle_raw.png', 'https://aka.doubaocdn.com/s/hEJ723UOxX'),
    ('frame2_summon_raw.png', 'https://aka.doubaocdn.com/s/j9VywHoBVn'),
    ('frame3_orb_raw.png', 'https://aka.doubaocdn.com/s/YUQtqKXESn'),
    ('frame4_welcome_raw.png', 'https://aka.doubaocdn.com/s/JqGGHikDH8'),
    ('frame5_smile_raw.png', 'https://aka.doubaocdn.com/s/PCyco3FkiZ'),
]

for name, url in files:
    path = os.path.join(outdir, name)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=60) as resp:
            data = resp.read()
            with open(path, 'wb') as f:
                f.write(data)
            print(f'{name}: {len(data)//1024} KB OK')
    except Exception as e:
        print(f'{name}: FAILED - {e}')

print('\nFiles in dir:')
for f in os.listdir(outdir):
    fp = os.path.join(outdir, f)
    print(f'  {f} - {os.path.getsize(fp)//1024} KB')
