#!/usr/bin/env python3
"""김소정 소개 영상 (약 1분 30초, 1920x1080) 렌더러.

사용법:  python3 intro-video/make_video.py
- 각 장면의 `clip` 이름과 같은 영상 파일(clips/<이름>.mp4 또는 .mov)이 있으면
  사진 대신 그 영상을 사용합니다. 없으면 `photo` 사진으로 대체합니다.
  (허당 / 여행 / 보리고양이 / 지침 / 자는모습 / 망가짐)
- 자막은 아래 SCENES 의 텍스트를 수정하면 바뀝니다.
"""
import os, subprocess, tempfile, shutil
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(HERE, "intro.mp4")
BGM = os.path.join(ROOT, "bgm.mp3")
FONT = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"
W, H, FPS = 1920, 1080, 30
FADE = 0.4

# (photo, clip 이름 또는 None, [(자막, 초), ...])  — 자막이 없으면 영상/사진만 보여줌
SCENES = [
    ("04", None, [("김소정을 소개합니다", 3)]),
    ("18", None, [("처음에는 저도…", 2.5), ("그녀와 친해지는 게\n쉽지 않았습니다.", 4)]),
    ("21", None, [("시크함과 차가움.", 2.5), ("그 벽을 뚫기가\n꽤 어려웠거든요.", 3.5)]),
    ("23", None, [("하지만 제가 누굽니까.", 4)]),
    ("07", None, [("결국 그 벽을 뚫고,\n김소정의 진짜 모습을 발견하게 됩니다.", 5)]),
    ("20", None, [("바로…", 1.5), ("이런 모습들로 말이죠.", 3)]),
    ("16", "허당", [(None, 4)]),
    ("17", None, [("소정이는 꽤 독립적입니다.", 2.5), ("혼자 해외에서 한 달 살기도\n거뜬히 해냅니다.", 3.5), ("참고로 저는…\n보내줘도 못 갑니다.", 3)]),
    ("22", "여행", [(None, 3)]),
    ("13", "보리고양이", [("동물도 정말 좋아하고,", 3.5)]),
    ("10", None, [("낚시, 해루질, 자전거, 등산…", 3), ("하고 싶은 것도 참 많습니다.", 3)]),
    ("12", "지침", [("다만…\n체력이 따라주지는 않습니다.", 4.5)]),
    ("14", "자는모습", [("그래서인지\n머리만 닿으면 잡니다.", 3.5), ("정말…\n어디서든 잡니다.", 3.5)]),
    ("15", None, [("가끔은 처음 만났을 때의\n그 시크함이 그립기도 합니다.", 4.5), ("하지만 이미 늦었습니다.", 2.5)]),
    ("09", None, [("어느 순간 저도\n그녀에게 장악되어…", 4.5)]),
    ("02", "망가짐", [(None, 4)]),
    ("25", None, [("똑같이 이러고 살고 있거든요.", 3.5), ("뭐…\n둘이 행복하면 됐죠.", 4)]),
    ("01", None, [("이승수 ♥ 김소정", 3.5), ("2026. 10. 24 SAT", 2.5)]),
]


def run(cmd):
    subprocess.run(cmd, check=True, stderr=subprocess.DEVNULL)


def find_clip(name):
    for ext in ("mp4", "mov", "m4v"):
        p = os.path.join(HERE, "clips", f"{name}.{ext}")
        if name and os.path.exists(p):
            return p
    return None


def caption_filters(caps, tmp, idx):
    fs, t = [], 0.0
    for i, (text, sec) in enumerate(caps):
        if text:
            f = os.path.join(tmp, f"cap{idx}_{i}.txt")
            open(f, "w", encoding="utf8").write(text)
            a, b = t + 0.25, t + sec - 0.25
            alpha = (f"if(lt(t,{a}),0,if(lt(t,{a+0.4}),(t-{a})/0.4,"
                     f"if(lt(t,{b-0.4}),1,if(lt(t,{b}),({b}-t)/0.4,0))))")
            fs.append(
                f"drawtext=fontfile={FONT}:textfile={f}:fontsize=64:fontcolor=white:"
                f"borderw=5:bordercolor=black@0.7:shadowx=2:shadowy=3:shadowcolor=black@0.5:"
                f"line_spacing=18:x=(w-text_w)/2:y=h-text_h-50:alpha='{alpha}'")
        t += sec
    return fs


def render_scene(idx, photo, clip, caps, tmp):
    dur = sum(s for _, s in caps)
    out = os.path.join(tmp, f"s{idx:02d}.mp4")
    vid = find_clip(clip)
    img = os.path.join(HERE, "photos", f"{photo}.jpg")
    fh = int(H * 0.76)
    if vid:
        inp = ["-i", vid]
        fg = f"[0:v]fps={FPS},scale={W}:{fh}:force_original_aspect_ratio=decrease,setsar=1[fg]"
        bgsrc = "[0:v]"
    else:
        iw, ih = Image.open(img).size
        fw = int(fh * iw / ih) // 2 * 2
        frames = int(dur * FPS)
        inp = ["-loop", "1", "-framerate", str(FPS), "-t", f"{dur}", "-i", img]
        fg = (f"[0:v]scale={fw*2}:{fh*2},zoompan=z='1.0+0.07*on/{frames}':d={frames}:"
              f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={fw}x{fh}:fps={FPS},setsar=1[fg]")
        bgsrc = "[0:v]"
    bg = (f"{bgsrc}scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
          f"gblur=sigma=40,eq=brightness=-0.28,setsar=1,fps={FPS}[bg]")
    caps_f = caption_filters(caps, tmp, idx)
    chain = f"[bg][fg]overlay=(W-w)/2:40+({fh}-h)/2,format=yuv420p"
    for f in caps_f:
        chain += "," + f
    chain += f",fade=t=in:d={FADE},fade=t=out:st={dur-FADE}:d={FADE}[v]"
    run(["ffmpeg", "-y", *inp, "-filter_complex", f"{bg};{fg};{chain}", "-map", "[v]",
         "-t", f"{dur}", "-r", str(FPS), "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
         "-pix_fmt", "yuv420p", out])
    return out, dur


def main():
    tmp = tempfile.mkdtemp()
    try:
        parts, total = [], 0
        for i, (photo, clip, caps) in enumerate(SCENES):
            p, d = render_scene(i, photo, clip, caps, tmp)
            parts.append(p); total += d
            print(f"scene {i:02d} {d:>4}s", flush=True)
        lst = os.path.join(tmp, "list.txt")
        open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
        silent = os.path.join(tmp, "all.mp4")
        run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", silent])
        run(["ffmpeg", "-y", "-i", silent, "-i", BGM, "-t", f"{total}",
             "-filter_complex", f"[1:a]volume=0.7,afade=t=in:d=2,afade=t=out:st={total-4}:d=4[a]",
             "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
             "-movflags", "+faststart", OUT])
        print(f"완료: {OUT} ({int(total//60)}분 {total%60:.0f}초)")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
