"use client";

import { Plus, Shield, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminCreateExternalLink, adminDeleteExternalLink, adminUpsertSetting } from "@/app/_actions/admin";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ABOUT_CLUB } from "@/configs/data/about";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useHandleError } from "@/hooks/use-handle-error";
import { useToast } from "@/hooks/use-toast";
import { uploadToStorage } from "@/services/supabase-upload";

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
  { key: "footer_mail", label: "Email", placeholder: ABOUT_CLUB.contact.email }
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

  // --- Branding State ---
  const [siteLogo, setSiteLogo] = useState(settingsMap.site_logo ?? "");
  const [siteFavicon, setSiteFavicon] = useState(settingsMap.site_favicon ?? "");
  const [primaryColor, setPrimaryColor] = useState(settingsMap.site_primary_color ?? "#f97316");

  // --- Auth Settings State ---
  const [acceptedDomains, setAcceptedDomains] = useState(settingsMap.auth_accepted_domains ?? "");
  const [onlyExistingMembers, setOnlyExistingMembers] = useState(settingsMap.auth_only_existing_members === "true");
  const [requireMemberRole, setRequireMemberRole] = useState(
    settingsMap.auth_require_member_role === "true" || process.env.NEXT_PUBLIC_AUTH_REQUIRE_MEMBER_ROLE === "true"
  );

  // --- Image Upload Handlers ---
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      setLoading(true);
      const url = await uploadToStorage(file, "branding");
      setSiteLogo(url);
      toast({ description: "Đã tải lên logo thành công!" });
    } catch (err) {
      toast({
        variant: "destructive",
        description: `Lỗi tải lên logo: ${err instanceof Error ? err.message : "Thất bại"}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      setLoading(true);
      const url = await uploadToStorage(file, "branding");
      setSiteFavicon(url);
      toast({ description: "Đã tải lên favicon thành công!" });
    } catch (err) {
      toast({
        variant: "destructive",
        description: `Lỗi tải lên favicon: ${err instanceof Error ? err.message : "Thất bại"}`
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Save Branding ---
  const handleSaveBranding = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const siteTitle = (fd.get("site_title") as string) || "";
    const siteSlogan = (fd.get("site_slogan") as string) || "";

    try {
      await Promise.all([
        adminUpsertSetting({
          key: "site_title",
          value: siteTitle,
          description: "Tên Website"
        }),
        adminUpsertSetting({
          key: "site_slogan",
          value: siteSlogan,
          description: "Slogan Website"
        }),
        adminUpsertSetting({
          key: "site_logo",
          value: siteLogo,
          description: "Logo Website"
        }),
        adminUpsertSetting({
          key: "site_favicon",
          value: siteFavicon,
          description: "Favicon Website"
        }),
        adminUpsertSetting({
          key: "site_primary_color",
          value: primaryColor,
          description: "Màu chủ đạo Hex"
        })
      ]);
      toast({ description: "Đã lưu cấu hình thương hiệu thành công!" });
      router.refresh();
    } catch (err) {
      toast({
        variant: "destructive",
        description: `Không thể lưu branding: ${err instanceof Error ? err.message : "Thất bại"}`
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Save Auth Settings ---
  const handleSaveAuthSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await Promise.all([
        adminUpsertSetting({
          key: "auth_accepted_domains",
          value: acceptedDomains,
          description: "Các đuôi domain chấp nhận đăng nhập (phân cách bằng dấu phẩy)"
        }),
        adminUpsertSetting({
          key: "auth_only_existing_members",
          value: onlyExistingMembers ? "true" : "false",
          description: "Chỉ cho phép những thành viên có sẵn trong hệ thống đăng nhập"
        }),
        adminUpsertSetting({
          key: "auth_require_member_role",
          value: requireMemberRole ? "true" : "false",
          description: "Chặn tài khoản GUEST (khách) đăng nhập, chỉ cho phép MEMBER, COLLABORATOR, ADMIN"
        })
      ]);
      toast({ description: "Đã lưu cài đặt đăng nhập thành công!" });
      router.refresh();
    } catch (err) {
      toast({
        variant: "destructive",
        description: `Lỗi lưu cài đặt: ${err instanceof Error ? err.message : "Thất bại"}`
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Footer Social Links ---
  const handleSaveSocials = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      for (const { key } of FOOTER_SOCIAL_KEYS) {
        const value = (fd.get(key) as string) || "";
        await adminUpsertSetting({ key, value, description: `Footer: ${key}` });
      }
      toast({ description: "Đã lưu liên kết mạng xã hội" });
      router.refresh();
    } catch (err) {
      toast({
        variant: "destructive",
        description: `Không thể lưu social: ${err instanceof Error ? err.message : "Thất bại"}`
      });
    } finally {
      setLoading(false);
    }
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

      {/* ─── Web Identity & Branding ─── */}
      <section className='rounded-xl border border-border bg-background p-6 shadow-sm'>
        <h2 className='mb-4 flex items-center gap-2 font-semibold text-foreground text-lg'>
          🎨 Nhận diện thương hiệu (Branding)
        </h2>
        <form className='grid gap-6' onSubmit={handleSaveBranding}>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='grid gap-2'>
              <Label htmlFor='site_title'>Tên site</Label>
              <Input
                defaultValue={settingsMap.site_title ?? "MPClub"}
                id='site_title'
                name='site_title'
                placeholder='Nhập tên Website...'
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='site_slogan'>Slogan</Label>
              <Input
                defaultValue={settingsMap.site_slogan ?? ""}
                id='site_slogan'
                name='site_slogan'
                placeholder='Nhập slogan của CLB...'
              />
            </div>
          </div>

          <div className='grid gap-4 md:grid-cols-3'>
            {/* Logo */}
            <div className='flex flex-col gap-2 rounded-lg border border-border bg-muted/10 p-4'>
              <Label className='font-medium text-xs'>Logo Website</Label>
              <div className='mt-2 flex items-center gap-4'>
                <div className='relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-background'>
                  {siteLogo ? (
                    <Image alt='Logo Preview' className='object-cover' fill sizes='64px' src={siteLogo} />
                  ) : (
                    <span className='text-muted-foreground text-xs'>No Logo</span>
                  )}
                </div>
                <div className='flex flex-1 flex-col gap-2'>
                  <Button
                    className='h-8 text-xs'
                    onClick={() => document.getElementById("logo-file-input")?.click()}
                    size='sm'
                    type='button'
                    variant='outline'
                  >
                    <Upload className='mr-1.5 h-3.5 w-3.5' /> Tải ảnh lên
                  </Button>
                  <input
                    accept='image/*'
                    className='hidden'
                    id='logo-file-input'
                    onChange={handleLogoUpload}
                    type='file'
                  />
                  <p className='text-[10px] text-muted-foreground'>Hỗ trợ PNG, JPG, WebP. Tối đa 2MB.</p>
                </div>
              </div>
            </div>

            {/* Favicon */}
            <div className='flex flex-col gap-2 rounded-lg border border-border bg-muted/10 p-4'>
              <Label className='font-medium text-xs'>Favicon Website</Label>
              <div className='mt-2 flex items-center gap-4'>
                <div className='relative flex h-16 w-16 items-center justify-center overflow-hidden rounded border border-border bg-background'>
                  {siteFavicon ? (
                    <Image alt='Favicon Preview' className='object-contain' height={32} src={siteFavicon} width={32} />
                  ) : (
                    <span className='text-muted-foreground text-xs'>No Icon</span>
                  )}
                </div>
                <div className='flex flex-1 flex-col gap-2'>
                  <Button
                    className='h-8 text-xs'
                    onClick={() => document.getElementById("favicon-file-input")?.click()}
                    size='sm'
                    type='button'
                    variant='outline'
                  >
                    <Upload className='mr-1.5 h-3.5 w-3.5' /> Tải ảnh lên
                  </Button>
                  <input
                    accept='image/x-icon,image/png,image/svg+xml'
                    className='hidden'
                    id='favicon-file-input'
                    onChange={handleFaviconUpload}
                    type='file'
                  />
                  <p className='text-[10px] text-muted-foreground'>Chấp nhận .ico, .png, .svg.</p>
                </div>
              </div>
            </div>

            {/* Theme Main Color */}
            <div className='flex flex-col gap-2 rounded-lg border border-border bg-muted/10 p-4'>
              <Label className='font-medium text-xs' htmlFor='site_primary_color'>
                Màu chủ đạo
              </Label>
              <div className='mt-2 flex items-center gap-3'>
                <Input
                  className='h-12 w-16 cursor-pointer rounded-md p-1'
                  id='site_primary_color'
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  type='color'
                  value={primaryColor}
                />
                <div className='flex-1'>
                  <Input
                    className='h-8 font-mono text-xs'
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder='#f97316'
                    value={primaryColor}
                  />
                  <p className='mt-1 text-[10px] text-muted-foreground'>Màu sắc thương hiệu chính của Website.</p>
                </div>
              </div>
            </div>
          </div>

          <Button className='h-9 w-fit text-xs' disabled={loading} type='submit'>
            {loading ? "Đang lưu..." : "Lưu thương hiệu"}
          </Button>
        </form>
      </section>

      {/* ─── Cài đặt đăng nhập (Authentication Settings) ─── */}
      <section className='rounded-xl border border-border bg-background p-6 shadow-sm'>
        <h2 className='mb-4 flex items-center gap-2 font-semibold text-foreground text-lg'>
          <Shield className='h-5 w-5 text-primary' /> Cài đặt Đăng nhập (Authentication Settings)
        </h2>
        <form className='grid gap-6' onSubmit={handleSaveAuthSettings}>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='grid gap-2'>
              <Label htmlFor='auth_accepted_domains'>Đuôi domain chấp nhận</Label>
              <Input
                id='auth_accepted_domains'
                name='auth_accepted_domains'
                onChange={(e) => setAcceptedDomains(e.target.value)}
                placeholder='Ví dụ: ou.edu.vn, student.ou.edu.vn'
                value={acceptedDomains}
              />
              <p className='text-[10px] text-muted-foreground'>
                Phân cách các domain bằng dấu phẩy. Để trống để chấp nhận mọi domain.
              </p>
            </div>

            <div className='flex flex-col justify-end gap-2'>
              <div className='flex h-11 items-center space-x-2 rounded-lg border border-border bg-muted/10 p-3'>
                <Checkbox
                  checked={onlyExistingMembers}
                  id='auth_only_existing_members'
                  onCheckedChange={(checked) => setOnlyExistingMembers(checked === true)}
                />
                <Label className='cursor-pointer font-medium text-xs' htmlFor='auth_only_existing_members'>
                  Chỉ chấp nhận thành viên có trong hệ thống
                </Label>
              </div>
              <p className='px-1 text-[10px] text-muted-foreground'>
                Nếu bật, chỉ những email đã được định nghĩa là thành viên CLB trong database mới có thể đăng nhập.
              </p>
            </div>

            <div className='flex flex-col justify-end gap-2'>
              <div className='flex h-11 items-center space-x-2 rounded-lg border border-border bg-muted/10 p-3'>
                <Checkbox
                  checked={requireMemberRole}
                  id='auth_require_member_role'
                  onCheckedChange={(checked) => setRequireMemberRole(checked === true)}
                />
                <Label className='cursor-pointer font-medium text-xs' htmlFor='auth_require_member_role'>
                  Chặn tài khoản khách (Guest)
                </Label>
              </div>
              <p className='px-1 text-[10px] text-muted-foreground'>
                Nếu bật, tài khoản có role GUEST sẽ bị từ chối đăng nhập. Chỉ MEMBER, COLLABORATOR, ADMIN mới được phép.
              </p>
            </div>
          </div>

          <Button className='h-9 w-fit text-xs' disabled={loading} type='submit'>
            {loading ? "Đang lưu..." : "Lưu cài đặt đăng nhập"}
          </Button>
        </form>
      </section>

      {/* ─── Footer Social Links ─── */}
      <section className='rounded-xl border border-border bg-background p-5 shadow-sm'>
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
      <section className='rounded-xl border border-border bg-background p-5 shadow-sm'>
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
      <section className='rounded-xl border border-border bg-background p-5 shadow-sm'>
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
