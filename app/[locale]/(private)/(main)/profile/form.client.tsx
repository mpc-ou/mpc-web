"use client";

import { Globe, ImagePlus, Loader2, Plus, Trash2, Upload, UserCircle, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import {
  linkGithubIdentity,
  unlinkGithubIdentity,
  updatePassword as updatePasswordAction
} from "@/app/[locale]/actions/auth";
import { ImageCropperModal, readFileAsDataURL } from "@/components/image-cropper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useHandleError } from "@/hooks/use-handle-error";
import { useToast } from "@/hooks/use-toast";
import { uploadToStorage } from "@/utils/supabase-upload";
import { updateProfile } from "./actions";

type FormClientType = {
  firstName: string;
  lastName: string;
  bio: string;
  phone: string;
  studentId: string;
  dob: string | null;
  slug: string;
  avatar: string | null;
  coverImage: string | null;
  socials: { id?: string; platform: string; url: string }[];
};

const PLATFORMS = [
  {
    value: "Facebook",
    label: "Facebook",
    icon: "/images/icons/facebook-icon.svg"
  },
  { value: "GitHub", label: "GitHub", icon: "/images/icons/github-icon.svg" },
  {
    value: "LinkedIn",
    label: "LinkedIn",
    icon: "/images/icons/linkedin-icon.svg"
  },
  {
    value: "X (Twitter)",
    label: "X (Twitter)",
    icon: "/images/icons/x-icon.svg"
  },
  {
    value: "Instagram",
    label: "Instagram",
    icon: "/images/icons/instagram-icon.svg"
  },
  { value: "TikTok", label: "TikTok", icon: "/images/icons/tiktok-icon.svg" },
  {
    value: "YouTube",
    label: "YouTube",
    icon: "/images/icons/youtube-icon.svg"
  },
  {
    value: "Discord",
    label: "Discord",
    icon: "/images/icons/discord-icon.svg"
  },
  { value: "Email", label: "Email", icon: "/images/icons/email-icon.svg" },
  {
    value: "Website",
    label: "Website / Khác",
    icon: "/images/icons/website-icon.svg"
  }
];

type Props = {
  initialData: FormClientType;
  linkedProviders: string[];
};

const FormClient = ({ initialData, linkedProviders }: Props) => {
  const router = useRouter();
  const t = useTranslations("profile.form");
  const { toast } = useToast();
  const { handleErrorClient } = useHandleError();
  const [formData, setFormData] = useState({
    ...initialData,
    socials: initialData.socials.map((s: any) => ({
      ...s,
      id: s.id || Math.random().toString(36).substring(2)
    }))
  });
  const [slugError, setSlugError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isLinkingGithub, setIsLinkingGithub] = useState(false);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [isAvatarDragOver, setIsAvatarDragOver] = useState(false);
  const [isCoverDragOver, setIsCoverDragOver] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [isAvatarCropOpen, setIsAvatarCropOpen] = useState(false);
  const [avatarCropSrc, setAvatarCropSrc] = useState("");

  const processAvatarFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      window.alert("Chỉ chấp nhận file ảnh");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      window.alert("Ảnh tối đa 3MB");
      return;
    }
    try {
      const src = await readFileAsDataURL(file);
      setAvatarCropSrc(src);
      setIsAvatarCropOpen(true);
    } catch {
      window.alert("Không thể đọc file ảnh");
    } finally {
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  const handleAvatarCropConfirm = async (croppedBlob: Blob) => {
    setAvatarUploading(true);
    try {
      const file = new File([croppedBlob], "avatar-cropped.jpg", {
        type: "image/jpeg"
      });
      const url = await uploadToStorage(file, "media", "avatars");
      setFormData((prev) => ({ ...prev, avatar: url }));
    } catch {
      window.alert("Upload avatar thất bại");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAvatarFile(file);
    }
  };

  const processCoverFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      window.alert("Chỉ nhận file ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      window.alert("Ảnh tối đa 5MB");
      return;
    }
    setCoverUploading(true);
    try {
      const url = await uploadToStorage(file, "media", "covers");
      setFormData((prev) => ({ ...prev, coverImage: url }));
    } catch {
      window.alert("Upload cover thất bại");
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCoverFile(file);
    }
  };

  const handleAddSocial = () => {
    setFormData((prev) => ({
      ...prev,
      socials: [...prev.socials, { id: Math.random().toString(36).substring(2), platform: "", url: "" }]
    }));
  };

  const handleRemoveSocial = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      socials: prev.socials.filter((s) => s.id !== id)
    }));
  };

  const handleUpdateSocial = (id: string, field: "platform" | "url", value: string) => {
    setFormData((prev) => ({
      ...prev,
      socials: prev.socials.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    }));
  };

  const handleUpdatePassword = async () => {
    if (!password) {
      return;
    }
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        description: "Mật khẩu xác nhận không khớp!"
      });
      return;
    }
    setIsUpdatingPassword(true);
    await handleErrorClient({
      cb: async () => await updatePasswordAction(password),
      withSuccessNotify: true
    });
    setIsUpdatingPassword(false);
    setPassword("");
    setConfirmPassword("");
  };

  const handleLinkGithub = async () => {
    setIsLinkingGithub(true);
    await handleErrorClient({
      cb: async () => await linkGithubIdentity(window.location.href),
      onSuccess: ({ data }) => {
        if ((data as any)?.payload?.url) {
          window.location.href = (data as any).payload.url;
        }
      },
      withSuccessNotify: false
    });
    setIsLinkingGithub(false);
  };

  const handleUnlinkGithub = async () => {
    setIsLinkingGithub(true);
    await handleErrorClient({
      cb: async () => await unlinkGithubIdentity(),
      onSuccess: () => {
        router.refresh();
      },
      withSuccessNotify: true
    });
    setIsLinkingGithub(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!(formData.firstName && formData.lastName)) {
      return;
    }

    // Slug validation
    let slug = formData.slug.trim();
    if (!slug) {
      // Auto-generate from first name + random suffix
      slug = `${formData.firstName.toLowerCase().replace(/\s+/g, "").slice(0, 12)}${Math.random().toString(36).slice(2, 6)}`;
      setFormData((prev) => ({ ...prev, slug }));
      setSlugError(`Slug đã được tạo tự động: "${slug}". Kiểm tra lại rồi lưu.`);
      return;
    }
    if (slug === "me") {
      setSlugError('Slug không được là "me", vui lòng chọn slug khác.');
      return;
    }
    if (!/^[a-z0-9-_]+$/.test(slug)) {
      setSlugError("Slug chỉ được chứa chữ thường, số, dấu gạch ngang và gạch dưới.");
      return;
    }
    setSlugError(null);

    const payload = {
      ...formData,
      slug,
      dob: formData.dob ? new Date(formData.dob) : undefined,
      socials: formData.socials.map(({ id, ...rest }) => rest)
    };

    await handleErrorClient({
      cb: async () => updateProfile(payload as any),
      withSuccessNotify: true
    });
  };

  return (
    <div className='flex flex-col space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Ảnh đại diện & Ảnh bìa</CardTitle>
          <CardDescription>Cập nhật hình ảnh cá nhân của bạn.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Cover Photo */}
          <div className='space-y-2'>
            <Label>Ảnh bìa (Cover Photo)</Label>
            {formData.coverImage ? (
              <div className='relative aspect-[3/1] w-full overflow-hidden rounded-lg border bg-muted'>
                <img alt='Cover' className='h-full w-full object-cover' src={formData.coverImage} />
                <button
                  className='absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80'
                  onClick={() => setFormData((prev) => ({ ...prev, coverImage: null }))}
                  title='Xóa ảnh bìa'
                  type='button'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
            ) : (
              <button
                className={`flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors disabled:opacity-50 ${isCoverDragOver ? "border-primary bg-primary/10" : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
                disabled={coverUploading}
                onClick={() => coverInputRef.current?.click()}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsCoverDragOver(false);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsCoverDragOver(true);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsCoverDragOver(false);
                  if (e.dataTransfer.files?.[0]) {
                    processCoverFile(e.dataTransfer.files[0]);
                  }
                }}
                type='button'
              >
                {coverUploading ? (
                  <>
                    <Loader2 className='h-6 w-6 animate-spin' />
                    <span className='text-sm'>Đang upload...</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className='h-8 w-8' />
                    <span className='text-sm'>Upload ảnh bìa (max 5MB)</span>
                  </>
                )}
              </button>
            )}
            <input
              accept='image/*'
              className='hidden'
              onChange={handleCoverUpload}
              ref={coverInputRef}
              title='Chọn ảnh bìa'
              type='file'
            />
          </div>

          <Separator />

          {/* Avatar */}
          <div
            className={`flex items-center gap-6 rounded-xl border-2 border-dashed p-4 transition-colors ${isAvatarDragOver ? "border-primary bg-primary/10" : "border-transparent"}`}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsAvatarDragOver(false);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsAvatarDragOver(true);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsAvatarDragOver(false);
              if (e.dataTransfer.files?.[0]) {
                processAvatarFile(e.dataTransfer.files[0]);
              }
            }}
          >
            <div className='relative'>
              <Avatar className='h-24 w-24 border-2 shadow-sm'>
                <AvatarImage src={formData.avatar ?? undefined} />
                <AvatarFallback className='bg-primary/10 text-3xl text-primary'>
                  {avatarUploading ? (
                    <Loader2 className='h-8 w-8 animate-spin' />
                  ) : (
                    <UserCircle className='h-12 w-12' />
                  )}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className='flex flex-col gap-2'>
              <Button
                disabled={avatarUploading}
                onClick={() => avatarInputRef.current?.click()}
                size='sm'
                type='button'
                variant='outline'
              >
                <Upload className='mr-2 h-4 w-4' />
                {avatarUploading ? "Đang upload..." : "Đổi avatar"}
              </Button>
              {formData.avatar && (
                <Button
                  className='text-destructive'
                  onClick={() => setFormData((prev) => ({ ...prev, avatar: null }))}
                  size='sm'
                  type='button'
                  variant='ghost'
                >
                  Xóa ảnh
                </Button>
              )}
              <span className='mt-1 text-muted-foreground text-xs'>JPG, PNG, WebP · max 3MB</span>
            </div>
            <input
              accept='image/*'
              className='hidden'
              onChange={handleAvatarUpload}
              ref={avatarInputRef}
              title='Chọn ảnh đại diện'
              type='file'
            />
          </div>
        </CardContent>
      </Card>

      <ImageCropperModal
        aspect={1}
        imageSrc={avatarCropSrc}
        isOpen={isAvatarCropOpen}
        onConfirm={handleAvatarCropConfirm}
        onOpenChange={setIsAvatarCropOpen}
      />
      <form className='flex flex-col space-y-6' onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>Cập nhật thông tin chi tiết.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex flex-col gap-4 sm:flex-row sm:space-x-4'>
              <div className='flex-1 space-y-2'>
                <Label htmlFor='firstName'>{t("firstName")} *</Label>
                <Input
                  id='firstName'
                  name='firstName'
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value
                    }))
                  }
                  placeholder={t("firstName")}
                  required
                  value={formData.firstName}
                />
              </div>
              <div className='flex-1 space-y-2'>
                <Label htmlFor='lastName'>{t("lastName")} *</Label>
                <Input
                  id='lastName'
                  name='lastName'
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName: e.target.value
                    }))
                  }
                  placeholder={t("lastName")}
                  required
                  value={formData.lastName}
                />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='slug'>Slug (Đường dẫn trang cá nhân) *</Label>
                <Input
                  id='slug'
                  name='slug'
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, slug: e.target.value }));
                    setSlugError(null);
                  }}
                  placeholder='ví dụ: trieukon1011'
                  value={formData.slug}
                />
                {slugError && <p className='text-destructive text-xs'>{slugError}</p>}
                <p className='text-muted-foreground text-xs'>
                  Không được để trống, không được dùng "me". Chỉ chữ thường, số, -, _.
                </p>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='dob'>Ngày sinh</Label>
                <Input
                  id='dob'
                  name='dob'
                  onChange={(e) => setFormData((prev) => ({ ...prev, dob: e.target.value }))}
                  type='date'
                  value={formData.dob ?? ""}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='phone'>Số điện thoại</Label>
                <Input
                  id='phone'
                  name='phone'
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder='Số điện thoại cá nhân'
                  value={formData.phone}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='studentId'>Mã sinh viên</Label>
                <Input
                  id='studentId'
                  name='studentId'
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      studentId: e.target.value
                    }))
                  }
                  placeholder='Mã số sinh viên'
                  value={formData.studentId}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='bio'>{t("bio")}</Label>
              <textarea
                className='flex min-h-25 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                id='bio'
                name='bio'
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder={t("bio")}
                value={formData.bio}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liên kết mạng xã hội</CardTitle>
            <CardDescription>Các liên kết sẽ được hiển thị trên trang profile public của bạn.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {formData.socials.map((social) => (
              <div className='flex flex-col items-start gap-3 sm:flex-row sm:items-center' key={social.id}>
                <div className='w-full shrink-0 sm:w-55'>
                  <Select
                    onValueChange={(val) => handleUpdateSocial(social.id!, "platform", val)}
                    value={social.platform || undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn nền tảng' />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          <span className='flex items-center gap-2'>
                            <img alt={p.label} className='h-4 w-4 object-contain' src={p.icon} /> <span>{p.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex w-full flex-1 items-center gap-2'>
                  <Input
                    onChange={(e) => handleUpdateSocial(social.id!, "url", e.target.value)}
                    placeholder='Link hoặc Username'
                    value={social.url}
                  />
                  <Button
                    className='shrink-0 text-destructive'
                    onClick={() => handleRemoveSocial(social.id!)}
                    size='icon'
                    type='button'
                    variant='ghost'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              className='mt-2 w-full sm:w-auto'
              onClick={handleAddSocial}
              size='sm'
              type='button'
              variant='outline'
            >
              <Plus className='mr-2 h-4 w-4' /> Thêm liên kết mới
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tài khoản & Bảo mật</CardTitle>
            <CardDescription>Liên kết tài khoản GitHub hoặc cập nhật mật khẩu đăng nhập của bạn.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-end'>
              <div className='flex-1 space-y-2'>
                <Label htmlFor='newPassword'>Mật khẩu mới (Tùy chọn)</Label>
                <Input
                  id='newPassword'
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Nhập mật khẩu mới'
                  type='password'
                  value={password}
                />
              </div>
              <div className='flex-1 space-y-2'>
                <Label htmlFor='confirmPassword'>Xác nhận mật khẩu</Label>
                <Input
                  id='confirmPassword'
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder='Nhập lại mật khẩu'
                  type='password'
                  value={confirmPassword}
                />
              </div>
              <Button
                className='shrink-0'
                disabled={!password || password !== confirmPassword || isUpdatingPassword}
                onClick={handleUpdatePassword}
                type='button'
              >
                {isUpdatingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
              </Button>
            </div>

            <Separator />

            <div className='space-y-2'>
              <Label>Liên kết & Xác thực</Label>
              <div className='flex items-center gap-4'>
                <Button
                  disabled={isLinkingGithub}
                  onClick={() => {
                    if (linkedProviders.includes("github")) {
                      handleUnlinkGithub();
                    } else {
                      handleLinkGithub();
                    }
                  }}
                  type='button'
                  variant={linkedProviders.includes("github") ? "destructive" : "default"}
                >
                  <img alt='GitHub' className='mr-2 h-5 w-5' src='/images/icons/github-icon.svg' />
                  {isLinkingGithub
                    ? t("linkingGithub")
                    : linkedProviders.includes("github")
                      ? t("linkedGithub")
                      : t("linkGithub")}
                </Button>
                <p className='text-muted-foreground text-xs'>
                  {linkedProviders.includes("github") ? t("linkedGithubDesc") : t("linkGithubDesc")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='flex justify-end'>
          <Button size='lg' type='submit'>
            {t("submit")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export { FormClient };
