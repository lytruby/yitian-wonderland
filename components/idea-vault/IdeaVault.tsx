"use client";

import { useState } from "react";

const audiences = [
  { title: "婚礼新人", note: "高情绪价值 · 强个性化", active: true },
  { title: "企业活动", note: "大订单 · 有复购可能", active: true },
  { title: "婚礼策划师", note: "渠道合作 · 批量转介绍", active: false },
];

const nextSteps = [
  "列出回国后可以拜访的 10 家礼品与包装渠道",
  "访谈 3 位办过婚礼的朋友：最痛苦的采购环节是什么？",
  "做 3 档礼盒样品：¥99 / ¥199 / ¥399",
];

export function IdeaVault() {
  const [draft, setDraft] = useState("");
  const [captured, setCaptured] = useState(false);

  function captureIdea() {
    if (!draft.trim()) return;
    setCaptured(true);
    setDraft("");
    window.setTimeout(() => setCaptured(false), 2200);
  }

  return (
    <div className="pb-16">
      <section className="mb-8 rounded-[2rem] border border-white/80 bg-white/50 p-4 shadow-soft backdrop-blur-sm sm:p-6">
        <label htmlFor="idea-capture" className="sr-only">
          记录一个新想法
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="idea-capture"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && captureIdea()}
            placeholder="脑子里又冒出了什么？先丢进来……"
            className="min-h-14 flex-1 rounded-2xl border border-ink/10 bg-paper/70 px-5 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-lavender/40 focus:ring-4 focus:ring-lavender/10"
          />
          <button
            type="button"
            onClick={captureIdea}
            className="min-h-14 rounded-2xl bg-ink px-6 text-sm text-paper transition hover:-translate-y-0.5 hover:bg-moss focus:outline-none focus:ring-4 focus:ring-moss/15"
          >
            {captured ? "收好了 ✓" : "收进灵感库"}
          </button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.34fr_0.66fr]">
        <aside className="rounded-[1.6rem] border border-ink/10 bg-white/35 p-3 lg:sticky lg:top-6 lg:h-fit">
          <div className="flex items-center justify-between px-3 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">全部灵感 · 1</p>
            <button className="text-lg text-lavender" aria-label="新增灵感">＋</button>
          </div>
          <button className="w-full rounded-[1.25rem] border border-lavender/20 bg-white/80 p-5 text-left shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="rounded-full bg-moss/10 px-3 py-1 text-[0.65rem] tracking-[0.12em] text-moss">探索中</span>
              <span className="text-xs text-muted/70">今天</span>
            </div>
            <h2 className="font-display text-xl leading-snug text-ink">伴手礼定制网站</h2>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">让新人和企业按预算、礼盒与产品自由组合一份真正有心意的礼物。</p>
            <div className="mt-5 flex gap-2 text-[0.65rem] text-muted">
              <span># 婚礼</span><span># 企业礼赠</span>
            </div>
          </button>
          <div className="px-4 py-8 text-center text-xs leading-5 text-muted/70">
            新想法会安静地长在这里。
          </div>
        </aside>

        <article className="overflow-hidden rounded-[1.8rem] border border-white/80 bg-white/55 shadow-soft backdrop-blur-sm">
          <header className="border-b border-ink/10 px-6 py-8 sm:px-9 sm:py-10">
            <div className="mb-5 flex flex-wrap items-center gap-3 text-xs text-muted">
              <span className="rounded-full border border-moss/20 bg-moss/5 px-3 py-1 text-moss">探索中</span>
              <span>灵感 001</span><span>·</span><span>2026.07.15</span>
            </div>
            <h1 className="font-display text-4xl tracking-tight text-ink sm:text-5xl">伴手礼定制网站</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted">一个让顾客从预算开始，自由选择礼盒、产品、包装和祝福卡的定制平台；我回国时负责找到真正有质感、价格也合理的供应渠道。</p>
          </header>

          <div className="space-y-10 px-6 py-8 sm:px-9 sm:py-10">
            <section>
              <SectionLabel number="01" title="这是谁的礼物？" />
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {audiences.map((audience) => (
                  <div key={audience.title} className={`rounded-2xl border p-4 ${audience.active ? "border-lavender/20 bg-lavender/5" : "border-ink/10 bg-paper/50"}`}>
                    <p className="font-display text-lg text-ink">{audience.title}</p>
                    <p className="mt-2 text-xs leading-5 text-muted">{audience.note}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <SectionLabel number="02" title="顾客怎么定制" />
              <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 sm:grid-cols-5">
                {["定预算", "选礼盒", "加产品", "做包装", "确认数量"].map((step, index) => (
                  <div key={step} className="min-h-28 bg-paper/95 p-4">
                    <span className="text-xs text-lavender">0{index + 1}</span>
                    <p className="mt-5 text-sm text-ink">{step}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-6 sm:grid-cols-2">
              <div>
                <SectionLabel number="03" title="为什么可能成立" />
                <ul className="mt-5 space-y-3 text-sm leading-6 text-muted">
                  <li>婚礼用户需要省心，也希望礼物不像批发货。</li>
                  <li>企业活动更看重交付稳定、品牌定制与批量报价。</li>
                  <li>渠道与包装能力会成为比网页本身更深的壁垒。</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-ink p-6 text-paper">
                <p className="text-xs uppercase tracking-[0.16em] text-paper/55">商业模式假设</p>
                <p className="mt-5 font-display text-2xl">礼盒差价 + 定制服务费</p>
                <p className="mt-3 text-sm leading-6 text-paper/65">企业客户可增加设计、打样、品牌包装与履约服务。</p>
              </div>
            </section>

            <section>
              <SectionLabel number="04" title="下一步，不要想太远" />
              <div className="mt-5 space-y-3">
                {nextSteps.map((step, index) => (
                  <label key={step} className="flex cursor-pointer items-start gap-4 rounded-2xl border border-ink/10 bg-paper/45 p-4 transition hover:bg-white/70">
                    <input type="checkbox" className="mt-1 h-4 w-4 accent-[#58705d]" />
                    <span className="text-sm leading-6 text-ink/80"><span className="mr-2 text-lavender">0{index + 1}</span>{step}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}

function SectionLabel({ number, title }: { number: string; title: string }) {
  return <div className="flex items-center gap-3"><span className="font-display text-lg text-lavender">{number}</span><h2 className="text-sm font-medium tracking-wide text-ink">{title}</h2></div>;
}
