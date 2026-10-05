#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { Command } from "commander";
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

// 目标输出路径: -o 指定则用它 (含 "pdf" 就原样, 否则补 .pdf); 否则由输入换扩展名而来
function targetPath(src: string, output: string | undefined): string {
  if (output) {
    return output.toLowerCase().includes("pdf") ? resolve(output) : resolve(`${output}.pdf`);
  }
  return `${src.replace(/\.[^./]*$/, "")}.pdf`;
}

// 重名时在 .pdf 前插入随机数字, 循环直到不冲突
function withRandomSuffix(path: string): string {
  const base = path.replace(/\.pdf$/i, "");
  let out = `${base}.pdf`;
  while (existsSync(out)) {
    out = `${base}-${Math.floor(1000 + Math.random() * 9000)}.pdf`;
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

type Opts = { math?: boolean; output?: string; force?: boolean };

async function render(file: string, opts: Opts): Promise<void> {
  const src = resolve(file);
  if (!existsSync(src)) die(`找不到文件: ${file}`);

  const dest = resolveDest(targetPath(src, opts.output), opts.force ?? false);
  try {
    const pdf = await mdToPdf(
      { path: src },
      {
        stylesheet: [CSS],
        body_class: ["markdown-body"],
        marked_options: { breaks: true }, // 软换行渲染为 <br>，而非 CommonMark 默认的空格
        ...(opts.math ? { script: MATHJAX } : {}),
        pdf_options: {
          format: "A4",
          margin: { top: "12mm", bottom: "12mm", left: "10mm", right: "10mm" },
          printBackground: true,
          outline: true,
        },
      },
    );
    if (!pdf?.content) die("渲染失败: 未生成内容");
    await Bun.write(dest, pdf.content);
    console.log(dest);
  } catch (e) {
    die(`渲染失败: ${e instanceof Error ? e.message : String(e)}`);
  }
}

new Command()
  .name("md2pdf")
  .description("Markdown → PDF，Anthropic 风格主题")
  .version(pkg.version)
  .argument("<file>", "Markdown 文件")
  .option("-o, --output <name>", "输出文件名 (含 pdf 则原样, 否则补 .pdf)")
  .option("-f, --force", "冲突时直接覆盖 (默认询问)", false)
  .option("--math", "渲染 LaTeX 公式（$…$ / $$…$$）")
  .action(render)
  .parseAsync();
