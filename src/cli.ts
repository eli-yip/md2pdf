#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { Command, Option } from "commander";
import { mdToPdf } from "md-to-pdf";
import pkg from "../package.json";

const CSS = join(import.meta.dir, "..", "theme", "anthropic.css");

const MATHJAX = [
  { content: "window.MathJax={tex:{inlineMath:[['$','$']],displayMath:[['$$','$$']]}};" },
  { url: "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" },
];

function die(msg: string): never {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

type Format = "pdf" | "html";

// 按目标格式补扩展名，或替换已有的 PDF / HTML 扩展名
function targetPath(src: string, output: string | undefined, format: Format): string {
  if (output) {
    if (extname(output).toLowerCase() === `.${format}`) return resolve(output);
    return resolve(`${output.replace(/\.(pdf|html)$/i, "")}.${format}`);
  }
  return `${src.replace(/\.[^./]*$/, "")}.${format}`;
}

// 重名时在扩展名前插入随机数字, 循环直到不冲突
function withRandomSuffix(path: string): string {
  const extension = extname(path);
  const base = path.slice(0, -extension.length);
  let out = path;
  while (existsSync(out)) {
    out = `${base}-${Math.floor(1000 + Math.random() * 9000)}${extension}`;
  }
  return out;
}

// 冲突处理: 无冲突直接用; force 覆盖; 否则询问, 答 y 覆盖, 否则改用随机后缀名
function resolveDest(dest: string, force: boolean): string {
  if (!existsSync(dest)) return dest;
  if (force) return dest;
  const ans = prompt(`文件已存在, 覆盖? ${dest} [y/N]`);
  return ans?.trim().toLowerCase() === "y" ? dest : withRandomSuffix(dest);
}

type Opts = { math?: boolean; output?: string; force?: boolean; format: Format };

async function render(file: string, opts: Opts): Promise<void> {
  const src = resolve(file);
  if (!existsSync(src)) die(`找不到文件: ${file}`);

  const dest = resolveDest(targetPath(src, opts.output, opts.format), opts.force ?? false);
  try {
    const config = {
      stylesheet: [CSS],
      body_class: ["markdown-body"],
      marked_options: { breaks: true }, // 软换行渲染为 <br>，而非 CommonMark 默认的空格
      ...(opts.math ? { script: MATHJAX } : {}),
      pdf_options: {
        format: "A4" as const,
        margin: { top: "12mm", bottom: "12mm", left: "10mm", right: "10mm" },
        printBackground: true,
        outline: true,
      },
    };
    const result =
      opts.format === "html"
        ? await mdToPdf({ path: src }, { ...config, as_html: true })
        : await mdToPdf({ path: src }, config);
    if (!result?.content) die("渲染失败: 未生成内容");
    await Bun.write(dest, result.content);
    console.log(dest);
  } catch (e) {
    die(`渲染失败: ${e instanceof Error ? e.message : String(e)}`);
  }
}

new Command()
  .name("md2pdf")
  .description("Markdown → PDF / HTML，Anthropic 风格主题")
  .version(pkg.version)
  .argument("<file>", "Markdown 文件")
  .addOption(new Option("--format <format>", "输出格式").choices(["pdf", "html"]).default("pdf"))
  .option("-o, --output <name>", "输出文件名 (按格式补扩展名或替换 .pdf / .html)")
  .option("-f, --force", "冲突时直接覆盖 (默认询问)", false)
  .option("--math", "渲染 LaTeX 公式（$…$ / $$…$$）")
  .action(render)
  .parseAsync();
