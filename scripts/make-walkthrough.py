from PIL import Image,ImageDraw,ImageFont
import imageio_ffmpeg,subprocess,pathlib,textwrap
root=pathlib.Path('docs');font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',30);small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',23)
scenes=[('01-board.png','1. Discover internships','API-driven listings with pagination. Express + SQLite locally; Worker + D1 when hosted.'),('02-search.png','2. Search and filter','Filter roles by interest. Loading, empty, failure and retry states keep the next action clear.'),('03-form.png','3. Apply with validation','Client checks guide the user. The server independently validates data and uses bound SQL parameters.'),('04-success.png','4. Confirm the outcome','Persistent applications and a uniqueness constraint make accidental retries safe. Test data is fictional.'),('05-mobile.png','5. Mobile and engineering checks','Responsive controls, health endpoints and structured logs. Automated tests, accessibility scan and local benchmark included.')]
proc=subprocess.Popen([imageio_ffmpeg.get_ffmpeg_exe(),'-y','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s','1280x900','-r','10','-i','-','-an','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart','docs/walkthrough.mp4'],stdin=subprocess.PIPE,stderr=subprocess.DEVNULL)
for name,title,caption in scenes:
 canvas=Image.new('RGB',(1280,900),'#f8fafc');im=Image.open(root/'frames'/name).convert('RGB');im.thumbnail((1240,700));canvas.paste(im,((1280-im.width)//2,15));draw=ImageDraw.Draw(canvas);draw.rectangle((0,730,1280,900),fill='#14213d');draw.text((30,750),title,font=font,fill='white');draw.text((30,800),'\n'.join(textwrap.wrap(caption,100)),font=small,fill='#dbeafe');data=canvas.tobytes()
 for _ in range(100):proc.stdin.write(data)
proc.stdin.close();assert proc.wait()==0
print('Created captioned walkthrough: 50 seconds, 1280x900, actual interface captures.')
