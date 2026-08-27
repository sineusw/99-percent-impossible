import math, os, random, struct, subprocess, wave

SR=44100
OUT='assets/sfx'
os.makedirs(OUT,exist_ok=True)
random.seed(99)

def env_exp(t,d,k=7.0):
    return math.exp(-k*t/max(d,1e-6))

def noise_sample():
    return random.uniform(-1.0,1.0)

def lowpass(samples,alpha):
    y=0.0
    out=[]
    for x in samples:
        y += alpha*(x-y)
        out.append(y)
    return out

def highpass(samples,alpha):
    lp=lowpass(samples,alpha)
    return [x-y for x,y in zip(samples,lp)]

def normalize(xs,peak=.82):
    m=max(1e-9,max(abs(x) for x in xs))
    s=peak/m
    return [max(-1,min(1,x*s)) for x in xs]

def write_mp3(name,xs):
    wav_path=f'{OUT}/{name}.wav'
    mp3_path=f'{OUT}/{name}.mp3'
    xs=normalize(xs)
    with wave.open(wav_path,'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR)
        w.writeframes(b''.join(struct.pack('<h',int(x*32767)) for x in xs))
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',wav_path,'-codec:a','libmp3lame','-b:a','128k',mp3_path],check=True)
    os.remove(wav_path)
    print('wrote',mp3_path)

def make(name,dur,fn):
    n=int(SR*dur)
    xs=[fn(i/SR,dur) for i in range(n)]
    write_mp3(name,xs)

# Muted mechanical click: mostly noise, no pitched beep.
def click(t,d,brightness=.35):
    e=env_exp(t,d,11)
    return noise_sample()*e*brightness

make('tap',.16,lambda t,d: click(t,d,.55))
make('tick',.14,lambda t,d: highpass([noise_sample() for _ in range(1)],.08)[0]*env_exp(t,d,16)*.35)

# Warm start impact: low thump + soft noise transient.
def start_fn(t,d):
    e=env_exp(t,d,8)
    th=math.sin(2*math.pi*(120-35*t/d)*t)*e*.5
    nz=noise_sample()*env_exp(t,d,13)*.32
    return th+nz
make('start',.28,start_fn)

# GO: short whoosh into a low-mid impact, energetic but not piercing.
def go_fn(t,d):
    e=env_exp(t,d,6)
    f=180+220*(t/d)
    tone=math.sin(2*math.pi*f*t)*e*.34
    nz=noise_sample()*env_exp(t,d,8)*.42
    return tone+nz
make('go',.34,go_fn)

# Blind cue: airy whoosh, deliberately soft.
def blind_fn(t,d):
    rise=min(1,t/.05)
    fall=env_exp(t,d,5)
    nz=noise_sample()*rise*fall*.42
    soft=math.sin(2*math.pi*330*t)*env_exp(t,d,7)*.16
    return nz+soft
make('blind',.38,blind_fn)

# Fail: low descending thud, no buzzer.
def fail_fn(t,d):
    e=env_exp(t,d,5)
    f=115-55*(t/d)
    low=math.sin(2*math.pi*f*t)*e*.72
    nz=noise_sample()*env_exp(t,d,10)*.22
    return low+nz
make('fail',.52,fail_fn)

# Win: two warm notes with soft attack/noise, kept below piercing range.
def win_fn(t,d):
    a=math.sin(2*math.pi*392*t)*env_exp(t,d,5)*.32
    t2=max(0,t-.11)
    b=(math.sin(2*math.pi*523.25*t2)*math.exp(-6*t2/max(d-.11,.01))*.38) if t>=.11 else 0
    nz=noise_sample()*env_exp(t,d,13)*.08
    return a+b+nz
make('win',.55,win_fn)

# Perfect: compact three-step warm flourish; no shrill top note.
def perfect_fn(t,d):
    out=0.0
    for delay,freq,amp in [(0,392,.28),(.10,523.25,.32),(.21,659.25,.34)]:
        if t>=delay:
            u=t-delay
            out += math.sin(2*math.pi*freq*u)*math.exp(-6*u/max(d-delay,.01))*amp
    out += noise_sample()*env_exp(t,d,15)*.07
    return out
make('perfect',.72,perfect_fn)
