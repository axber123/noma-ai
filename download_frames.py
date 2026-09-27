import urllib.request, ssl, os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

outdir = r'D:\龙族卡塞尔学院路明泽ai模型\noma_frames'
os.makedirs(outdir, exist_ok=True)

files = [
    ('frame0_core.png', 'https://mediakit-image.cn-beijing.volces.com/tos-cn-i-mcagdqv95q/veImageX-store/imagesegment/0b91a8ee-7860-430a-9846-ce11cd7fad54/8a43aa6e1cd3ec7e186105d3a1b3958db23ac9f32545fd13432ee396ba57d4a6.png~tplv-mcagdqv95q-image.image?sign=1790423942-rand-imagex-b4775b4b0b621bd0a49815ecee5c28a0'),
    ('frame1_idle.png', 'https://mediakit-image.cn-beijing.volces.com/tos-cn-i-mcagdqv95q/veImageX-store/imagesegment/69311aa5-5c4a-4036-a4b6-3c0ec370705b/26425822e436400188a4f351c8c8bdb9df4163d4ecf097b6538e170eb9ca298d.png~tplv-mcagdqv95q-image.image?sign=1790423946-rand-imagex-ef4a09001a77ce7315c7d135d130fadf'),
    ('frame2_summon.png', 'https://mediakit-image.cn-beijing.volces.com/tos-cn-i-mcagdqv95q/veImageX-store/imagesegment/74463c9f-a63b-4ede-9450-5c72b37da91e/e48e9a5ceae278095ac949cfd13f4e7f00f4ec4c27754608be7b196b225ce5a6.png~tplv-mcagdqv95q-image.image?sign=1790423951-rand-imagex-aa604c3965b3877e98e817279409818c'),
    ('frame3_orb.png', 'https://mediakit-image.cn-beijing.volces.com/tos-cn-i-mcagdqv95q/veImageX-store/imagesegment/15cb1612-6519-44ea-b85c-f90e3d91ba95/8f7feb39ba0ecfd6f55e8205939a2cacd67d1591c800fbc7971cb9e1c766f625.png~tplv-mcagdqv95q-image.image?sign=1790423994-rand-imagex-c162d4af197a815e72f0a4debb29f0f5'),
    ('frame4_welcome.png', 'https://mediakit-image.cn-beijing.volces.com/tos-cn-i-mcagdqv95q/veImageX-store/imagesegment/34a9c4f6-7377-4777-8db4-4105c6dde783/66d22f166e74e70484f8449c44007a6572141bdfb0e1f14069569d224c926008.png~tplv-mcagdqv95q-image.image?sign=1790423961-rand-imagex-4994c9c7798392b1b860a85e0302b84d'),
    ('frame5_smile.png', 'https://mediakit-image.cn-beijing.volces.com/tos-cn-i-mcagdqv95q/veImageX-store/imagesegment/2a5a5aa2-7e35-4fe7-99cc-68b2a111be83/7911b84621c3106f43291dad11328f726f3efa230e77fc58bea57b353d48f29b.png~tplv-mcagdqv95q-image.image?sign=1790423966-rand-imagex-cb3dfad8242d6b8d7fa189740066923d'),
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

print('Done. Files in dir:')
for f in os.listdir(outdir):
    fp = os.path.join(outdir, f)
    print(f'  {f} - {os.path.getsize(fp)//1024} KB')
