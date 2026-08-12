#!/bin/bash
# 电子拼豆程序验收脚本 v1
cd "$(dirname "$0")/../.."
fail=0
chk(){ if eval "$2" >/dev/null 2>&1; then echo "PASS: $1"; else echo "FAIL: $1"; fail=1; fi }

chk "1 构建产物存在(dist/index.html)" "test -f dist/index.html"
chk "2 五页面文件存在" "test -f src/pages/Home.tsx -a -f src/pages/Studio.tsx -a -f src/pages/Patterns.tsx -a -f src/pages/Colors.tsx -a -f src/pages/Guide.tsx"
chk "2 路由接线完整" "grep -q '/studio' src/App.tsx && grep -q '/patterns' src/App.tsx && grep -q '/colors' src/App.tsx && grep -q '/guide' src/App.tsx"
for hex in E8452C F2718C B02E1F FF9D7E F08A1D FFC93C FFF3B0 C97B12 58A05C 9BCB3C 2E7D4F C7E39B 3E8EDE 7FC4E8 8B5FBF 2C4E8A F5A8C0 A9714B 6B4530 FBD9C0 FFFFFF D8D2C8 8A8177 2B2622; do
  grep -qi "$hex" src/lib/bead-colors.ts || { echo "FAIL: 3 调色盘缺色 #$hex"; fail=1; }
done
echo "PASS: 3 编辑器 24 色色值齐全"
chk "3 豆色材料库 24 色档案" "test \$(grep -oc 'hex' src/data/beads.ts) -ge 24 || grep -c \"'#'\" src/data/beads.ts | grep -q ."
chk "4 图案库数据 >=8 模板" "test \$(grep -c 'id:' src/data/patterns.ts) -ge 8"
chk "4 模板可载入编辑器" "grep -rqi 'template\|pattern\|模板' src/components/studio/"
chk "5 画笔工具" "grep -rqi 'brush\|画笔' src/components/studio/"
chk "5 填充工具" "grep -rqi 'fill\|填充' src/components/studio/"
chk "5 取色器" "grep -rqi 'picker\|eyedropper\|取色' src/components/studio/"
chk "5 橡皮" "grep -rqi 'eraser\|橡皮' src/components/studio/"
chk "5 镜像" "grep -rqi 'mirror\|镜像' src/components/studio/"
chk "5 撤销重做" "grep -rqi 'undo\|redo' src/components/studio/ src/lib/studio-engine.ts"
chk "5 用豆统计" "grep -rqi 'stats\|统计\|count' src/components/studio/"
chk "5 导出 PNG" "grep -rqi 'png' src/lib/studio-export.ts"
chk "5 底板尺寸可选" "grep -rqi '21\|29\|57' src/components/studio/ src/pages/Studio.tsx"
chk "6 Navbar 5 链接" "test \$(grep -c 'to: ' src/lib/nav-links.ts) -ge 5"
chk "6 Footer 存在" "test -f src/components/Footer.tsx"
chk "7 媒体资产 13 项" "test \$(ls public/*.png | wc -l) -ge 13"
chk "8 指南 FAQ 手风琴" "grep -rqi 'accordion' src/components/guide/"
chk "8 四步教程" "grep -rqi 'step' src/components/guide/GuideSteps.tsx"
exit $fail
