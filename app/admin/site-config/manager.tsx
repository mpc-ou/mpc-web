"use client";

import { Code2, Download, ExternalLink, FileText, Monitor, Pencil, RotateCcw, Save } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import {
  adminGetDefaultWebDesignExhibitions,
  adminGetDefaultWebDesignFaqs,
  adminSaveWebDesignConfig,
  adminSaveWebDesignExhibitions,
  adminSaveWebDesignFaqs
} from "@/app/_actions/admin";
import { useHandleError } from "@/app/admin/_hooks/use-handle-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { cn } from "@/lib/utils";
import type { WebDesignConfig, WebDesignExhibitionItem, WebDesignFaq, WebDesignPrize } from "@/types/webdesign";
import { formatMilestoneRange } from "@/utils/webdesign-milestones";
import { generateId } from "@/utils/webdesign-validate";
import { ExhibitionDialog } from "./_components/exhibition-form-dialog";
import {
  BenefitDialog,
  FaqDialog,
  GENERAL_FIELDS,
  GeneralDialog,
  MilestoneDialog,
  PRIZE_TIER_LABELS,
  PrizeDialog,
  RegulationDialog
} from "./_components/item-dialogs";
import { type JsonApplyPayload, JsonDevDialog } from "./_components/json-dev-editor";
import { ListPanel } from "./_components/list-panel";
import { defaultBenefits, defaultPrizes, sampleMilestones, sampleRegulations } from "./_components/webdesign-defaults";

type Props = {
  webDesignConfig: WebDesignConfig;
  webDesignExhibitions: WebDesignExhibitionItem[];
  webDesignFaqs: WebDesignFaq[];
};

type Snapshot = { config: WebDesignConfig; exhibitions: WebDesignExhibitionItem[]; faqs: WebDesignFaq[] };
type DocKey = keyof Snapshot;

const DOC_KEYS: DocKey[] = ["config", "exhibitions", "faqs"];

/** Each document has its own store (site setting / site setting / FaqItem rows) and save action. */
const SAVERS: Record<DocKey, (input: unknown) => ReturnType<typeof adminSaveWebDesignConfig>> = {
  config: adminSaveWebDesignConfig,
  exhibitions: adminSaveWebDesignExhibitions,
  faqs: adminSaveWebDesignFaqs
};

const PRIZE_TIER_STYLES: Record<WebDesignPrize["tier"], string> = {
  gold: "border-yellow-500/40 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  silver: "border-slate-400/40 bg-slate-400/10 text-slate-600 dark:text-slate-300",
  bronze: "border-amber-700/40 bg-amber-700/10 text-amber-700 dark:text-amber-500"
};

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const text = (t: { vi: string; en: string }) => t.vi || t.en || "—";

export const SiteConfigManager = ({ webDesignConfig, webDesignExhibitions, webDesignFaqs }: Props) => {
  const router = useRouter();
  const { handleErrorClient, toast } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Every edit lands in `draft`; the single Save button diffs it against `saved` and persists what changed.
  const [saved, setSaved] = useState<Snapshot>({
    config: webDesignConfig,
    exhibitions: webDesignExhibitions,
    faqs: webDesignFaqs
  });
  const [draft, setDraft] = useState<Snapshot>(saved);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState<"general" | "json" | null>(null);

  const isDirty = DOC_KEYS.some((key) => !same(draft[key], saved[key]));

  useEffect(() => {
    if (!isDirty) {
      return;
    }
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const patchConfig = <K extends keyof WebDesignConfig>(key: K, value: WebDesignConfig[K]) =>
    setDraft((prev) => ({ ...prev, config: { ...prev.config, [key]: value } }));

  const save = async (next: Snapshot = draft) => {
    setSaving(true);
    let failed = false;
    let result: Snapshot = saved;

    // Save changed documents one by one; stop at the first failure.
    for (const key of DOC_KEYS) {
      if (failed || same(next[key], saved[key])) {
        continue;
      }
      failed = true;
      await handleErrorClient({
        cb: () => SAVERS[key](next[key]),
        withSuccessNotify: false,
        onSuccess: ({ data }) => {
          failed = false;
          result = { ...result, [key]: data.payload } as Snapshot;
        }
      });
    }

    setSaved(result);
    if (failed) {
      // Keep unsaved edits; documents that did save take the server's normalized version.
      const merged = { ...next };
      for (const key of DOC_KEYS) {
        if (!same(result[key], saved[key])) {
          Object.assign(merged, { [key]: result[key] });
        }
      }
      setDraft(merged);
    } else {
      setDraft(result);
      toast({ description: "Đã lưu cấu hình WebDesign." });
      router.refresh();
    }
    setSaving(false);
  };

  const discard = async () => {
    const ok = await confirm({
      title: "Hủy các thay đổi chưa lưu?",
      description: "Dữ liệu sẽ quay về lần lưu gần nhất.",
      confirmText: "Hủy thay đổi"
    });
    if (ok) {
      setDraft(saved);
    }
  };

  const applyJson = (payload: JsonApplyPayload, { save: shouldSave }: { save: boolean }) => {
    const next: Snapshot = { ...draft, ...payload };
    setDraft(next);
    setOpenDialog(null);
    if (shouldSave) {
      save(next);
    } else {
      toast({ description: "Đã áp dụng JSON vào bản nháp. Nhấn Lưu để lưu lại." });
    }
  };

  const loadDefaultExhibitions = async () => {
    await handleErrorClient({
      cb: () => adminGetDefaultWebDesignExhibitions(),
      withSuccessNotify: false,
      onSuccess: ({ data }) => setDraft((prev) => ({ ...prev, exhibitions: data.payload as WebDesignExhibitionItem[] }))
    });
  };

  const loadDefaultFaqs = async () => {
    await handleErrorClient({
      cb: () => adminGetDefaultWebDesignFaqs(),
      withSuccessNotify: false,
      onSuccess: ({ data }) =>
        setDraft((prev) => ({
          ...prev,
          faqs: (data.payload as Omit<WebDesignFaq, "id">[]).map((faq) => ({ ...faq, id: generateId() }))
        }))
    });
  };

  const { config, exhibitions, faqs } = draft;

  return (
    <div className='rounded-xl border border-border bg-background shadow-sm'>
      <ConfirmDialog />
      {openDialog === "general" && (
        <GeneralDialog
          onClose={() => setOpenDialog(null)}
          onSubmit={(next) => {
            setDraft((prev) => ({ ...prev, config: { ...prev.config, ...next } }));
            setOpenDialog(null);
          }}
          value={config}
        />
      )}
      {openDialog === "json" && (
        <JsonDevDialog
          config={config}
          exhibitions={exhibitions}
          faqs={faqs}
          onApply={applyJson}
          onClose={() => setOpenDialog(null)}
        />
      )}

      {/* Header — sticky so Save is always reachable */}
      <div className='sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-t-xl border-border border-b bg-background/95 px-6 py-4 backdrop-blur'>
        <div className='min-w-0'>
          <h2 className='flex items-center gap-2 font-semibold text-foreground text-lg'>
            <Monitor className='h-5 w-5 text-primary' /> WebDesign Contest
            {isDirty && (
              <Badge
                className='border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400'
                variant='outline'
              >
                Chưa lưu
              </Badge>
            )}
          </h2>
          <p className='text-muted-foreground text-xs'>
            Cấu hình trang <code>/web-design</code> — nội dung song ngữ VI/EN.
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Button onClick={() => setOpenDialog("json")} size='sm' type='button' variant='outline'>
            <Code2 className='mr-1.5 h-4 w-4' /> JSON
          </Button>
          <Button asChild size='sm' variant='ghost'>
            <a href='/vi/web-design' rel='noopener noreferrer' target='_blank'>
              <ExternalLink className='mr-1.5 h-4 w-4' /> Xem trang
            </a>
          </Button>
          {isDirty && (
            <Button disabled={saving} onClick={discard} size='sm' type='button' variant='ghost'>
              <RotateCcw className='mr-1.5 h-4 w-4' /> Hoàn tác
            </Button>
          )}
          <Button disabled={!isDirty || saving} onClick={() => save()} size='sm' type='button'>
            <Save className='mr-1.5 h-4 w-4' />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      <Tabs className='px-6 py-5' defaultValue='overview'>
        <TabsList className='mb-5 h-auto w-full justify-start overflow-x-auto sm:w-fit'>
          <TabsTrigger value='overview'>Tổng quan</TabsTrigger>
          <TabsTrigger value='milestones'>Mốc thời gian · {config.milestones.length}</TabsTrigger>
          <TabsTrigger value='regulations'>Quy định · {config.regulations.length}</TabsTrigger>
          <TabsTrigger value='prizes'>Giải thưởng · {config.prizes.length + config.benefits.length}</TabsTrigger>
          <TabsTrigger value='exhibitions'>Triển lãm · {exhibitions.length}</TabsTrigger>
          <TabsTrigger value='faqs'>FAQ · {faqs.length}</TabsTrigger>
        </TabsList>

        <TabsContent className='mt-0' value='overview'>
          <div className='mb-4 flex items-center justify-between gap-3'>
            <p className='text-muted-foreground text-sm'>Ngày thi và các liên kết hiển thị trên trang.</p>
            <Button onClick={() => setOpenDialog("general")} size='sm' type='button'>
              <Pencil className='mr-1.5 h-4 w-4' /> Chỉnh sửa
            </Button>
          </div>
          <dl className='divide-y divide-border overflow-hidden rounded-lg border border-border'>
            {GENERAL_FIELDS.map((field) => {
              const value = config[field.key];
              return (
                <div className='grid gap-1 px-4 py-3 sm:grid-cols-[220px_1fr] sm:gap-4' key={field.key}>
                  <dt className='font-medium text-sm'>{field.label}</dt>
                  <dd className='min-w-0 truncate text-sm'>
                    {value ? (
                      <ValueText kind={field.kind} value={value} />
                    ) : (
                      <span className='text-muted-foreground'>— {field.hint}</span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </TabsContent>

        <TabsContent className='mt-0' value='milestones'>
          <ListPanel
            addLabel='Thêm mốc'
            description='Tự sắp xếp theo ngày bắt đầu khi lưu. Hero đếm ngược tới mốc kế tiếp / hiện "Đang diễn ra".'
            emptyAction={
              <LoadSampleButton
                label='Nạp 4 giai đoạn mẫu'
                onClick={() => patchConfig("milestones", sampleMilestones())}
              />
            }
            emptyText='Chưa có mốc nào — trang dùng "Ngày thi" và 4 giai đoạn mặc định.'
            getKey={(m) => m.id}
            items={config.milestones}
            onChange={(next) => patchConfig("milestones", next)}
            renderDialog={(props) => <MilestoneDialog {...props} />}
            renderRow={(m) => ({
              leading: <MonoTag>{formatMilestoneRange(m.start, m.end) || "?"}</MonoTag>,
              title: text(m.title),
              meta: m.description.vi || m.description.en
            })}
          />
        </TabsContent>

        <TabsContent className='mt-0' value='regulations'>
          <ListPanel
            addLabel='Thêm điều'
            description='Hiển thị dạng accordion "Điều 01, 02…" theo thứ tự bên dưới.'
            emptyAction={
              <LoadSampleButton
                label='Nạp bộ quy định mẫu'
                onClick={() => patchConfig("regulations", sampleRegulations())}
              />
            }
            emptyText='Chưa có điều khoản nào — mục Quy định đang bị ẩn ngoài trang.'
            getKey={(r) => r.id}
            header={
              <div className='flex items-center gap-3 rounded-lg border border-border border-dashed px-4 py-3 text-sm'>
                <FileText className='h-4 w-4 shrink-0 text-muted-foreground' />
                <span className='min-w-0 flex-1 truncate'>
                  Thể lệ PDF:{" "}
                  {config.rulesPdfUrl ? (
                    <ValueText kind='pdf' value={config.rulesPdfUrl} />
                  ) : (
                    <span className='text-muted-foreground'>chưa có (hiện "sắp cập nhật")</span>
                  )}
                </span>
                <Button onClick={() => setOpenDialog("general")} size='sm' type='button' variant='ghost'>
                  <Pencil className='mr-1.5 h-3.5 w-3.5' /> Sửa
                </Button>
              </div>
            }
            items={config.regulations}
            onChange={(next) => patchConfig("regulations", next)}
            renderDialog={(props) => <RegulationDialog {...props} />}
            renderRow={(r, idx) => ({
              leading: <MonoTag>Điều {String(idx + 1).padStart(2, "0")}</MonoTag>,
              title: text(r.title),
              meta: `${r.items.length} mục`
            })}
            reorderable
          />
        </TabsContent>

        <TabsContent className='mt-0 space-y-8' value='prizes'>
          <SubSection title='Giải thưởng'>
            <ListPanel
              addLabel='Thêm giải'
              description='Giải Vàng hiển thị dạng thẻ lớn.'
              emptyAction={
                <LoadSampleButton label='Điền 3 giải mặc định' onClick={() => patchConfig("prizes", defaultPrizes())} />
              }
              emptyText='Chưa có giải thưởng nào.'
              getKey={(p) => p.id}
              items={config.prizes}
              onChange={(next) => patchConfig("prizes", next)}
              renderDialog={(props) => <PrizeDialog {...props} />}
              renderRow={(p) => ({
                leading: (
                  <Badge className={cn("w-14 justify-center", PRIZE_TIER_STYLES[p.tier])} variant='outline'>
                    {PRIZE_TIER_LABELS[p.tier]}
                  </Badge>
                ),
                title: text(p.title),
                meta: p.description.vi || p.description.en
              })}
              reorderable
            />
          </SubSection>
          <SubSection title='Quyền lợi'>
            <ListPanel
              addLabel='Thêm quyền lợi'
              emptyAction={
                <LoadSampleButton
                  label='Điền quyền lợi mặc định'
                  onClick={() => patchConfig("benefits", defaultBenefits())}
                />
              }
              emptyText='Chưa có quyền lợi nào.'
              getKey={(b) => b.id}
              items={config.benefits}
              onChange={(next) => patchConfig("benefits", next)}
              renderDialog={(props) => <BenefitDialog {...props} />}
              renderRow={(b) => ({ title: text(b.title), meta: b.description.vi || b.description.en })}
              reorderable
            />
          </SubSection>
        </TabsContent>

        <TabsContent className='mt-0' value='exhibitions'>
          <ListPanel
            addLabel='Thêm dự án'
            description='Hiển thị ở mục "Các dự án tiêu biểu".'
            emptyAction={<LoadSampleButton label='Nạp từ configs/data/wd.json' onClick={loadDefaultExhibitions} />}
            emptyText='Chưa có dự án nào — mục Dự án đang bị ẩn ngoài trang.'
            getKey={(ex, idx) => `${ex.teamName}-${ex.live}-${idx}`}
            items={exhibitions}
            onChange={(next) => setDraft((prev) => ({ ...prev, exhibitions: next }))}
            renderDialog={(props) => <ExhibitionDialog {...props} />}
            renderRow={(ex) => ({
              leading: (
                <div className='relative h-10 w-16 overflow-hidden rounded-md border border-border bg-muted/40'>
                  {ex.thumbnail && <Image alt='' className='object-cover' fill sizes='64px' src={ex.thumbnail} />}
                </div>
              ),
              title: text(ex.projectName),
              meta: [ex.teamName, ex.techStack.join(", ")].filter(Boolean).join(" · ")
            })}
            reorderable
          />
        </TabsContent>

        <TabsContent className='mt-0' value='faqs'>
          <ListPanel
            addLabel='Thêm câu hỏi'
            description='Hiển thị ở mục "Câu hỏi thường gặp" cuối trang, theo thứ tự bên dưới.'
            emptyAction={<LoadSampleButton label='Nạp từ configs/data/fqa.json' onClick={loadDefaultFaqs} />}
            emptyText='Chưa có câu hỏi nào — mục FAQ đang bị ẩn ngoài trang.'
            getKey={(f) => f.id}
            items={faqs}
            onChange={(next) => setDraft((prev) => ({ ...prev, faqs: next }))}
            renderDialog={(props) => <FaqDialog {...props} />}
            renderRow={(f, idx) => ({
              leading: f.isActive ? (
                <MonoTag>Q{String(idx + 1).padStart(2, "0")}</MonoTag>
              ) : (
                <Badge className='text-muted-foreground' variant='outline'>
                  Ẩn
                </Badge>
              ),
              title: text(f.question),
              meta: f.answer.vi || f.answer.en
            })}
            reorderable
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

function SubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='space-y-3'>
      <h3 className='font-semibold text-sm'>{title}</h3>
      {children}
    </section>
  );
}

function MonoTag({ children }: { children: ReactNode }) {
  return (
    <span className='inline-block rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground'>
      {children}
    </span>
  );
}

function LoadSampleButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button onClick={onClick} size='sm' type='button' variant='outline'>
      <Download className='mr-1.5 h-4 w-4' /> {label}
    </Button>
  );
}

function ValueText({ kind, value }: { kind: "date" | "url" | "pdf"; value: string }) {
  if (kind === "date") {
    return (
      <span className='font-mono'>
        {formatMilestoneRange(value, "")} {value.slice(11, 16)}
      </span>
    );
  }
  return (
    <a className='text-primary hover:underline' href={value} rel='noopener noreferrer' target='_blank'>
      {value}
    </a>
  );
}
