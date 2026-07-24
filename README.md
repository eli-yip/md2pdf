# md-render

Markdown → PDF，Anthropic 风格主题。

## 用法

```bash
md2pdf 某文件.md
```

在同目录生成同名的 `.pdf` 并打印其路径。失败时打印错误原因，退出码为 1。

### 指定输出名

```bash
md2pdf -o 报告 某文件.md        # → 报告.pdf（不含 pdf 时自动补扩展名）
md2pdf -o 报告.pdf 某文件.md    # → 报告.pdf（含 pdf 时原样使用）
```

### 文件已存在

默认会询问是否覆盖；答 `y` 覆盖，否则在文件名后加随机数字（如 `报告-4821.pdf`）另存。

```bash
md2pdf -f 某文件.md    # 直接覆盖，不询问
```

### 带公式

```bash
md2pdf --math 某文件.md
```

渲染 LaTeX 公式（`$…$` 行内、`$$…$$` 块级）。

> 开启后文档中所有 `$` 都按公式解析——含美元金额（如 `$20`）的文档请勿加 `--math`。

### 全部选项

```bash
md2pdf --help
```

## 换主题 / 调版式

- 配色、字体：编辑 `theme/anthropic.css`
- 页面尺寸、页边距：编辑 `src/cli.ts` 里的 `pdf_options`

## 安装

```bash
bun install
bun link
```
