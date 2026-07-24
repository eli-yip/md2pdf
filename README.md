# md2pdf

将 Markdown 文档渲染为 Anthropic 风格的 PDF。

## 用法

```bash
md2pdf 某文件.md
```

在同目录生成同名的 `.pdf` 并打印其路径。

### 指定输出名

```bash
md2pdf -o 报告 某文件.md        # → 报告.pdf（不含 pdf 时自动补扩展名）
md2pdf -o 报告.pdf 某文件.md    # → 报告.pdf（含 pdf 时原样使用）
```

### 目标文件已存在时的行为

默认询问是否覆盖；不覆盖则自动改名另存。

```bash
md2pdf -f 某文件.md    # 直接覆盖，不询问
```

### 带公式

```bash
md2pdf --math 某文件.md
```

渲染 LaTeX 公式。

### 全部选项

```bash
md2pdf --help
```

## 安装

```bash
bun install
bun link
```
