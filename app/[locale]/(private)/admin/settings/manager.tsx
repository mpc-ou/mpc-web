"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useHandleError } from "@/hooks/use-handle-error";
import { useToast } from "@/hooks/use-toast";
import { adminCreateExternalLink, adminDeleteExternalLink, adminUpsertSetting } from "../actions";

type Setting = {
  id: string;
  key: string;
  value: string;
  description: string | null;
};

type ExternalLink = {
  id: string;
  label: string;
  url: string;
  order: number;
  isActive: boolean;
};

const FOOTER_SOCIAL_KEYS = [
  {
    key: "footer_fanpage",
    label: "Facebook Fanpage",
    placeholder: "https://facebook.com/..."
  },
  {
    key: "footer_youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/..."
  },
  {
    key: "footer_github",
    label: "GitHub",
    placeholder: "https://github.com/..."
  },
  { key: "footer_mail", label: "Email", placeholder: "mpc@ou.edu.vn" }
] as const;

type Props = {
  settings: Setting[];
  externalLinks: ExternalLink[];
};

export const SettingsManager = ({ settings, externalLinks }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const { handleErrorClient } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [loading, setLoading] = useState(false);

  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    settingsMap[s.key] = s.value;
  }

  // --- Footer Social Links ---
  const handleSaveSocials = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    for (const { key } of FOOTER_SOCIAL_KEYS) {
      const value = (fd.get(key) as string) || "";
      await adminUpsertSetting({ key, value, description: `Footer: ${key}` });
    }
    setLoading(false);
    toast({ description: "Đã lưu liên kết mạng xã hội" });
    router.refresh();
  };

  // --- External Links ---
  const handleAddLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await handleErrorClient({
      cb: () =>
        adminCreateExternalLink({
          label: fd.get("label") as string,
          url: fd.get("url") as string,
          order: Number(fd.get("order")) || 0
        }),
      onSuccess: () => {
        router.refresh();
        (e.target as HTMLFormElement).reset();
      }
    });
    setLoading(false);
  };

  const handleDeleteLink = async (id: string) => {
    const ok = await confirm({
      title: "Xóa liên kết ngoài?",
      description: "Hành động này không thể hoàn tác."
    });
    if (!ok) {
      return;
    }
    await handleErrorClient({
      cb: () => adminDeleteExternalLink(id),
      onSuccess: () => router.refresh()
    });
  };

  // --- Generic settings ---
  const handleUpsert = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await adminUpsertSetting({
      key: fd.get("key") as string,
      value: fd.get("value") as string,
      description: (fd.get("description") as string) || undefined
    });
    setLoading(false);
    toast({ description: "Đã lưu setting" });
    router.refresh();
  };

  return (
    <div className='flex flex-col gap-8'>
      <ConfirmDialog />

      {/* ─── Footer Social Links ─── */}
      <section className='rounded-xl border border-border bg-background p-5'>
        <h2 className='mb-4 font-semibold text-foreground text-lg'>🔗 Liên kết mạng xã hội (Footer)</h2>
        <form className='grid gap-4' onSubmit={handleSaveSocials}>
          <div className='grid gap-4 sm:grid-cols-2'>
            {FOOTER_SOCIAL_KEYS.map(({ key, label, placeholder }) => (
              <div className='grid gap-2' key={key}>
                <Label htmlFor={key}>{label}</Label>
                <Input defaultValue={settingsMap[key] ?? ""} id={key} name={key} placeholder={placeholder} />
              </div>
            ))}
          </div>
          <Button className='w-fit' disabled={loading} type='submit'>
            {loading ? "Đang lưu..." : "Lưu liên kết"}
          </Button>
        </form>
      </section>

      {/* ─── External Links ─── */}
      <section className='rounded-xl border border-border bg-background p-5'>
        <h2 className='mb-4 font-semibold text-foreground text-lg'>🌐 Liên kết ngoài (Footer)</h2>

        {/* Add form */}
        <form className='mb-4 flex flex-wrap items-end gap-3' onSubmit={handleAddLink}>
          <div className='grid gap-1'>
            <Label htmlFor='link-label'>Tên hiển thị</Label>
            <Input id='link-label' name='label' placeholder='Khoa CNTT' required />
          </div>
          <div className='grid gap-1'>
            <Label htmlFor='link-url'>URL</Label>
            <Input id='link-url' name='url' placeholder='https://...' required />
          </div>
          <div className='grid gap-1'>
            <Label htmlFor='link-order'>Thứ tự</Label>
            <Input className='w-20' defaultValue='0' id='link-order' name='order' type='number' />
          </div>
          <Button disabled={loading} size='sm' type='submit'>
            <Plus className='mr-1 h-4 w-4' />
            Thêm
          </Button>
        </form>

        {/* List */}
        <div className='overflow-x-auto rounded-lg border border-border'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-border border-b bg-muted/50'>
                <th className='px-4 py-2 text-left font-medium text-muted-foreground'>#</th>
                <th className='px-4 py-2 text-left font-medium text-muted-foreground'>Label</th>
                <th className='px-4 py-2 text-left font-medium text-muted-foreground'>URL</th>
                <th className='px-4 py-2 text-right font-medium text-muted-foreground'>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {externalLinks.map((link) => (
                <tr className='border-border border-b last:border-0 hover:bg-muted/30' key={link.id}>
                  <td className='px-4 py-2 text-muted-foreground'>{link.order}</td>
                  <td className='px-4 py-2 font-medium'>{link.label}</td>
                  <td className='max-w-xs truncate px-4 py-2 text-muted-foreground text-xs'>
                    <a className='hover:text-primary' href={link.url} rel='noopener noreferrer' target='_blank'>
                      {link.url}
                    </a>
                  </td>
                  <td className='px-4 py-2 text-right'>
                    <Button onClick={() => handleDeleteLink(link.id)} size='sm' variant='ghost'>
                      <Trash2 className='h-4 w-4 text-destructive' />
                    </Button>
                  </td>
                </tr>
              ))}
              {externalLinks.length === 0 && (
                <tr>
                  <td className='px-4 py-6 text-center text-muted-foreground' colSpan={4}>
                    Chưa có liên kết ngoài nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── Generic Key-Value Settings ─── */}
      <section className='rounded-xl border border-border bg-background p-5'>
        <h2 className='mb-4 font-semibold text-foreground text-lg'>🛠️ Cài đặt chung (Key-Value)</h2>
        <form className='flex flex-col gap-3' onSubmit={handleUpsert}>
          <div className='grid grid-cols-2 gap-3'>
            <Input name='key' placeholder='Key (VD: site_title)' required />
            <Input name='description' placeholder='Mô tả (tùy chọn)' />
          </div>
          <textarea
            className='min-h-15 rounded-md border border-border bg-background px-3 py-2 text-sm'
            name='value'
            placeholder='Value...'
            required
          />
          <Button className='w-fit' disabled={loading} type='submit'>
            Lưu
          </Button>
        </form>

        <div className='mt-4 overflow-x-auto rounded-lg border border-border'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-border border-b bg-muted/50'>
                <th className='px-4 py-3 text-left font-medium text-muted-foreground'>Key</th>
                <th className='px-4 py-3 text-left font-medium text-muted-foreground'>Value</th>
                <th className='px-4 py-3 text-left font-medium text-muted-foreground'>Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((s) => (
                <tr className='border-border border-b last:border-0 hover:bg-muted/30' key={s.id}>
                  <td className='px-4 py-3 font-medium font-mono text-foreground text-xs'>{s.key}</td>
                  <td className='max-w-xs truncate px-4 py-3 text-muted-foreground text-xs'>{s.value}</td>
                  <td className='px-4 py-3 text-muted-foreground text-xs'>{s.description ?? "—"}</td>
                </tr>
              ))}
              {settings.length === 0 && (
                <tr>
                  <td className='px-4 py-8 text-center text-muted-foreground' colSpan={3}>
                    Chưa có setting nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
