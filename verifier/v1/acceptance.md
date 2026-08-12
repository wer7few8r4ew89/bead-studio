# 验收标准 v1 — 电子拼豆程序 (BeadStudio)

1. 构建通过：`npm run build` exit 0。
2. 5 个页面存在并在 App.tsx 中接线：/ /studio /patterns /colors /guide。
3. 核心需求 —— 选择材料颜色：24 色调色盘，色值与 design.md 第 2 节一致（编辑器 bead-colors + colors 页 beads.ts）。
4. 核心需求 —— 要拼的图案：编辑器网格画布可绘制；图案库 ≥8 个模板；模板可载入编辑器。
5. 编辑器工具：画笔/填充/取色/橡皮/镜像；撤销重做；底板尺寸可选；用豆统计；导出 PNG。
6. Navbar 含全部 5 个路由链接；Footer 存在。
7. public/ 含 13 个媒体资产（8 pattern-*.png + hero + og + 3 guide-step）。
8. 新手指南：四步教程 + FAQ 手风琴。
