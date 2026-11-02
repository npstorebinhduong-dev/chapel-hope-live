"""Build repeatable distribution from validated outputs; never packages node_modules."""
from pathlib import Path
import hashlib,json,zipfile
root=Path(__file__).resolve().parents[1]
required=['production/server.cjs','production/manifest.json','apps/client/dist/index.html','START_CHAPEL_LIVE.bat','STOP_CHAPEL_LIVE.bat']
for name in required:
 if not (root/name).is_file():raise SystemExit('Missing build output: '+name)
files=[]
for name in ['apps','packages','windows','scripts','tests']:
 for p in (root/name).rglob('*'):
  if p.is_file() and not any(part in ('node_modules','.vite') for part in p.parts):files.append(p)
for name in ['production','docs']:
 for p in (root/name).rglob('*'):
  if p.is_file() and (name!='docs' or (('screenshots' not in p.parts or 'live-v17' in p.parts) and p.name not in ['ARCHIVE_README_V1_2.md'])):files.append(p)
for name in ['START_CHAPEL_LIVE.bat','STOP_CHAPEL_LIVE.bat','README.md','AGENTS.md','package.json','package-lock.json','tsconfig.json']:
 files.append(root/name)
files=sorted(set(files));manifest={str(p.relative_to(root)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
out=root/'downloads/Chapel-of-Hope-LIVE-v1.7-Windows.zip'
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in files:z.write(p,p.relative_to(root))
 z.writestr('DISTRIBUTION_MANIFEST.json',json.dumps({'version':'1.7.0','runtime':'Node >=22.12 (not bundled)','status':'READY FOR WINDOWS VALIDATION','sha256':manifest},indent=2))
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 assert not any('node_modules' in n for n in z.namelist())
 for name,digest in manifest.items():assert hashlib.sha256(z.read(name)).hexdigest()==digest
print(f'Validated {len(files)} files, {out.stat().st_size} bytes: {out}')
