#!/usr/bin/env python3
"""Re-run bounded document/spec checks and write literal command evidence."""
from pathlib import Path
import subprocess,hashlib,shlex,tempfile

ROOT=Path(__file__).resolve().parents[2]
records=[]
def run(label,args,cwd=ROOT):
    proc=subprocess.run(args,cwd=cwd,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    records.append((label,str(cwd),shlex.join([str(x) for x in args]),proc.stdout,proc.returncode))
    print(label+': exit '+str(proc.returncode))
    assert proc.returncode==0,proc.stdout
    return proc
run('Baseline source check',['python3',str(ROOT/'docs/plan-review/check-plan.py'),'--mode','baseline','--document',str(ROOT/'docs/history/design.original-2026-09-16.md')])
run('Modified document check',['python3',str(ROOT/'docs/plan-review/check-plan.py'),'--mode','modified','--document',str(ROOT/'docs/design.md')])
run('Executable design-contract probes',['node',str(ROOT/'docs/plan-review/spec-probe.mjs')])
run('Rollback input check',['sh',str(ROOT/'docs/plan-review/rollback.sh'),'--check'])
run('Rollback execution on temporary copy',['sh',str(ROOT/'docs/plan-review/rollback.sh'),'--self-test'])
with tempfile.TemporaryDirectory(prefix='tarot-plan-diff-') as folder:
    temp=Path(folder);(temp/'docs').mkdir()
    target=temp/'docs/design.md'
    original=(ROOT/'docs/history/design.original-2026-09-16.md').read_bytes()
    modified=(ROOT/'docs/design.md').read_bytes()
    target.write_bytes(original)
    run('Apply document patch',['patch','-p1','-i',str(ROOT/'docs/plan-review/design.patch')],temp)
    assert target.read_bytes()==modified
    run('Patched document matches modified artifact',['cmp',str(target),str(ROOT/'docs/design.md')],temp)
    run('Reverse document patch',['patch','-R','-p1','-i',str(ROOT/'docs/plan-review/design.patch')],temp)
    assert target.read_bytes()==original
    run('Reverse patch matches original artifact',['cmp',str(target),str(ROOT/'docs/history/design.original-2026-09-16.md')],temp)

report=['# 设计稿重构核对记录','',
'本记录验证的是 **文档、原始资产、设计契约探针和文档回退**；不是网站实现验收。没有创建应用、安装框架依赖、连接服务器或更改 DNS。', '',
'## 结论','',
'- 原稿与牌面 zip 的 SHA-256 保持不变。',
'- 新稿 22 张大牌 + 4×14 张小牌的定义与实际 78 个文件一致；所有 JPEG 为 800×1280。',
'- 文档中的均匀整数函数已实际执行边界探针；独立参考模型检查 HKDF 分块、确定性、样本/用途区分、洗切不变量与分享编码长度。',
'- 这些是设计合同探针，不是生产 RNG、完整 schema 解码器或浏览器状态机的测试；未来实现仍按设计稿 §12 验收。',
'- 差异补丁已在临时副本正向应用并逐字节比较，也已逆向应用并逐字节比较；回退脚本在临时副本执行成功，工作区保持重构稿。',
'- 未运行：网站 build、Playwright、Lighthouse、VoiceOver、微信真机、nginx/TLS/systemd、外网域名及生产回滚。','',
'## 文件摘要','',
'| 文件 | SHA-256 |','| --- | --- |']
for relative in ['docs/design.md','docs/history/design.original-2026-09-16.md','docs/plan-review/design.patch','docs/plan-review/rollback.sh','docs/plan-review/check-plan.py','docs/plan-review/spec-probe.mjs','docs/plan-review/verify.py','RWS_78_aligned.zip']:
    p=ROOT/relative
    report.append(f'| `{p}` | `{hashlib.sha256(p.read_bytes()).hexdigest()}` |')
report+=['','## 复跑','',f'```sh\npython3 {ROOT}/docs/plan-review/verify.py\n```','',
'回退脚本默认只读检查；`--self-test` 在临时副本验证；显式 `--restore` 才将主文档恢复为原稿。若主文档已有后续编辑，摘要保护会中止覆盖。回退只影响 design.md，保留审核材料。','',
'## 实际命令与字面输出','',
'以下临时目录是本次测试真实使用的路径，测试后已自动清理；其余均为工作区文件。']
for label,cwd,command,output,code in records:
    report += ['',f'### {label}','',f'工作目录：`{cwd}`','',f'```sh\n{command}\n```','',f'退出状态：`{code}`','',f'```text\n{output.rstrip() if output else "(empty stdout/stderr)"}\n```']
(ROOT/'docs/plan-review/verification.md').write_text('\n'.join(report)+'\n')
print('PASS all document/spec checks; report written to '+str(ROOT/'docs/plan-review/verification.md'))
