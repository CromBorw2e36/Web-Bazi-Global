#!/bin/sh
# Cài Bát Tự vào docker-compose.yml của BuilderCMS.
#
#   ./deploy/install.sh [đường/dẫn/tới/docker-compose.yml]
#
# Đặt 4 service vào đúng mục `services:`, thêm volume, thêm bazi vào depends_on
# của nginx, và ghi phần DEPLOY NOTES vào cuối file.
#
# Chạy lại được nhiều lần: nếu đã cài rồi thì gỡ bản cũ ra rồi đặt lại, nên
# dùng luôn cho việc cập nhật. Nó cũng dọn được trường hợp đã dán tay sai chỗ.
#
# An toàn: backup trước, `docker compose config` sau, và tự khôi phục nếu kiểm
# tra không qua — file gốc không bao giờ hỏng.
set -e

HERE=$(cd "$(dirname "$0")" && pwd)

# Mặc định đoán compose file nằm ở thư mục cạnh repo này, vì build.context
# trong services.yml là ../Web-Bazi-Global.
COMPOSE=${1:-$(dirname "$HERE")/../BuilderCMS/docker-compose.yml}

if [ ! -f "$COMPOSE" ]; then
  echo "Không thấy compose file: $COMPOSE" >&2
  echo "Truyền đường dẫn vào: ./deploy/install.sh /root/BuilderCMS/BuilderCMS/docker-compose.yml" >&2
  exit 1
fi

COMPOSE=$(cd "$(dirname "$COMPOSE")" && pwd)/$(basename "$COMPOSE")
COMPOSE_DIR=$(dirname "$COMPOSE")
BACKUP="$COMPOSE.bak.$(date +%Y%m%d-%H%M%S)"

echo "compose : $COMPOSE"
echo "backup  : $BACKUP"
cp "$COMPOSE" "$BACKUP"

SERVICES="$HERE/services.yml" NOTES="$HERE/notes.txt" PYTHONIOENCODING=utf-8 \
  python3 - "$COMPOSE" <<'PY'
import io, os, re, sys

compose = sys.argv[1]
lines = io.open(compose, encoding='utf-8').read().split('\n')

START = '  # >>> BAZI START'
END = '  # <<< BAZI END'

def strip_previous(lines):
    """Gỡ mọi dấu vết của lần cài trước, kể cả bản dán tay sai chỗ."""
    out, removed = [], 0
    i = 0
    while i < len(lines):
        line = lines[i]

        # Khối có mốc — gỡ trọn từ START tới END.
        if line.startswith(START):
            while i < len(lines) and not lines[i].startswith(END):
                i += 1; removed += 1
            i += 1; removed += 1
            continue

        # Không có mốc: gỡ từng service tên bazi* ở bất cứ đâu, kèm comment
        # dính liền phía trên. Đây là trường hợp đã dán tay nhầm chỗ.
        if re.match(r'^  bazi[a-z-]*:\s*$', line):
            while out and (out[-1].strip().startswith('#') or out[-1].strip() == ''):
                out.pop(); removed += 1
            i += 1; removed += 1
            while i < len(lines) and (lines[i].startswith('    ') or lines[i].strip() == ''):
                i += 1; removed += 1
            continue

        out.append(line); i += 1
    return out, removed

lines, removed = strip_previous(lines)

# Gỡ volume và depends_on cũ để lát nữa thêm lại sạch.
lines = [l for l in lines if l.strip() not in ('bazi-pgdata:', '- bazi')]

# ── 1. Chèn services ngay trước `volumes:` (hoặc cuối mục services) ──
block = io.open(os.environ['SERVICES'], encoding='utf-8').read().split('\n')
block = block[next(i for i, l in enumerate(block) if l.startswith(START)):]
while block and block[-1].strip() == '':
    block.pop()

try:
    at = next(i for i, l in enumerate(lines) if l.startswith('volumes:'))
except StopIteration:
    at = next((i for i, l in enumerate(lines) if l and not l.startswith((' ', '#')) and i > 0), len(lines))
while at - 1 > 0 and lines[at-1].strip() == '':
    at -= 1
lines = lines[:at] + block + [''] + lines[at:]

# ── 2. Thêm volume ──
try:
    vi = next(i for i, l in enumerate(lines) if l.startswith('volumes:'))
    lines.insert(vi + 1, '  bazi-pgdata:')
except StopIteration:
    lines += ['', 'volumes:', '  bazi-pgdata:']

# ── 3. Thêm bazi vào depends_on của nginx ──
try:
    ni = next(i for i, l in enumerate(lines) if re.match(r'^  nginx:\s*$', l))
    di = next(i for i in range(ni, len(lines))
              if lines[i].strip() == 'depends_on:' and lines[i].startswith('    '))
    j = di + 1
    while j < len(lines) and lines[j].startswith('      - '):
        j += 1
    lines.insert(j, '      - bazi')
except StopIteration:
    print('  ! nginx depends_on not found - add "- bazi" manually')

# ── 4. Ghi chú deploy vào cuối file ──
notes = io.open(os.environ['NOTES'], encoding='utf-8').read().rstrip('\n')
text = '\n'.join(lines).rstrip('\n')
marker = '# ─── BÁT TỰ (bazi.sincely.io.vn)'
if marker not in text:
    text += '\n\n' + notes
text += '\n'

# Chạy lại nhiều lần thì dòng trống dồn lại; gom mọi chuỗi dòng trống về một.
out, blank = [], 0
for l in text.split('
'):
    if l.strip() == '':
        blank += 1
        if blank > 1:
            continue
    else:
        blank = 0
    out.append(l)
text = '
'.join(out)

io.open(compose, 'w', encoding='utf-8').write(text)
print('  removed %d stale line(s), placed 4 services under services:' % removed)
PY

echo
echo "=== kiểm tra ==="
if (cd "$COMPOSE_DIR" && docker compose config >/dev/null 2>&1); then
  (cd "$COMPOSE_DIR" && docker compose config --services | grep '^bazi' | sed 's/^/  /')
  echo "  volume : $(cd "$COMPOSE_DIR" && docker compose config | grep -c 'bazi-pgdata') tham chiếu"
  echo
  echo "OK. Bước tiếp theo:"
  echo "  cd $COMPOSE_DIR"
  echo "  docker compose up -d --build bazi-db bazi-migrate bazi bazi-cron"
else
  echo "  KHÔNG QUA — khôi phục lại bản cũ."
  (cd "$COMPOSE_DIR" && docker compose config 2>&1 | head -5 | sed 's/^/  /')
  cp "$BACKUP" "$COMPOSE"
  echo
  echo "File đã trở lại như trước. Gửi thông báo lỗi ở trên."
  exit 1
fi
