# 豆豆工坊 BeadStudio — 电子拼豆程序

把实体拼豆（Perler/Hama 风格）的挑豆、摆豆、烫画全过程搬到浏览器里：**选择材料颜色**、**挑选或绘制要拼的图案**，在像素网格上一颗一颗摆豆，实时统计用豆数量，并导出图纸去实体店配豆。

## 功能

### 创作工坊 `/studio`（核心）
- Canvas 网格编辑器：拟物豆子渲染（高光/凹槽/坐标尺），滚轮缩放、平移、触摸支持
- **24 色材料调色盘**：6 大色系家族 × 4 色，豆号 R-01…N-04，支持自定义取色
- 工具：画笔 / 油漆桶填充 / 取色器 / 橡皮 / 移动 + 水平镜像；快捷键 B/G/I/E/H/T
- 撤销 / 重做（Ctrl+Z / Ctrl+Shift+Z）、清空、底板尺寸 21/29/57/自定义
- **模板描图**：图案库模板可叠加描图或一键"描图填充"（图片采样 → 最近豆色映射）
- **实时用豆统计**：每色豆数、占比横条、可复制材料清单
- **导出图纸**：PNG 下载（带坐标/色号/用豆清单）、PDF 打印、分享链接（RLE+base64url 编码到 URL）
- localStorage 自动保存，下次打开自动恢复

### 图案库 `/patterns`
26 个图案模板，分类 / 难度（1-5 豆）/ 尺寸筛选 + 搜索，详情弹层含用色清单，一键载入编辑器。

### 豆色材料库 `/colors`
24 色完整档案：豆号、HEX、用量热度、常用搭配，颜色详情弹层，4 套配色方案推荐，实体配豆贴士。

### 新手指南 `/guide`
选豆 → 画图 → 熨烫 → 定型四步滚动教程（含可交互迷你摆豆演示）、FAQ 手风琴、安全提示。

## 技术栈

Node.js 20 · React 19 + TypeScript · Vite 7 · Tailwind CSS v3.4 · shadcn/ui · GSAP (ScrollTrigger) · Framer Motion · Lenis

## 本地运行

```bash
npm install   # 或 pnpm install；会重新生成 package-lock.json（本仓库未提交 lock 文件）
npm run dev
npm run build
```

## 关于 `public/*.png`

仓库未提交 `public/` 下的 13 张 PNG 图片（程序生成的图案素材与教程插图）。缺失时页面相应图片位置为空，不影响核心编辑器功能；可放入任意同名 PNG（图案建议 600×600，教程图 800×600，封面 1200×630）补齐。

## 目录结构

```
src/
├── pages/            # Home / Studio / Patterns / Colors / Guide
├── components/
│   ├── studio/       # 编辑器：BeadCanvas / ToolRail / SidePanel / TemplateDrawer / ExportDialog ...
│   ├── patterns/     # 图案库组件
│   ├── colors/       # 豆色材料库组件
│   ├── guide/        # 教程组件
│   └── home/         # 首页各段落
├── data/             # beads.ts（24 色档案）、patterns.ts（26 图案）
└── lib/              # bead-colors / studio-engine / studio-export
```
