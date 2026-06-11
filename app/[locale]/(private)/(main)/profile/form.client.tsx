"use client";

import { motion } from "framer-motion";
import {
  AtSign,
  Baby,
  Building2,
  Camera,
  Github,
  Globe,
  Hash,
  ImagePlus,
  Link2,
  Loader2,
  Lock,
  Music2,
  PencilLine,
  Plus,
  Quote,
  Save,
  ShieldCheck,
  Smartphone,
  Trash2,
  Upload,
  UserCircle,
  UserPen,
  X
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import {
  linkGithubIdentity,
  unlinkGithubIdentity,
  updatePassword as updatePasswordAction
} from "@/app/_actions/auth/auth";
import { updateProfile } from "@/app/_actions/profile/profile";
import { ImageCropperModal, readFileAsDataURL } from "@/components/image-cropper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PLATFORMS } from "@/constants/common";
import { STORAGE_BUCKET, STORAGE_PATHS } from "@/constants/storage";
import { UPLOAD_MAX_AVATAR_SIZE, UPLOAD_MAX_COVER_SIZE } from "@/constants/upload";
import { useHandleError } from "@/hooks/use-handle-error";
import { useToast } from "@/hooks/use-toast";
import { uploadToStorage } from "@/utils/supabase-upload";

// ── Types ──

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
  spotifyUri?: string | null;
};

type Props = {
  initialData: FormClientType;
  linkedProviders: string[];
};

// ── Skeleton Loader ──

function FormSkeleton() {
  return (
    <div className='flex flex-col gap-6'>
      {[1, 2, 3].map((i) => (
        <div className='overflow-hidden rounded-2xl border border-border/50 bg-card' key={i}>
          <div className='space-y-3 border-border/50 border-b px-6 py-5'>
            <Skeleton className='h-5 w-48' />
            <Skeleton className='h-4 w-72' />
          </div>
          <div className='space-y-4 p-6'>
            <Skeleton className='h-10 w-full' />
            <div className='flex gap-4'>
              <Skeleton className='h-10 flex-1' />
              <Skeleton className='h-10 flex-1' />
            </div>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-24 w-full' />
          </div>
        </div>
      ))}
      <div className='flex justify-end'>
        <Skeleton className='h-11 w-32' />
      </div>
    </div>
  );
}

// ── Section Header ──

function SectionHeader({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className='flex items-start gap-4 border-border/50 border-b px-6 py-5'>
      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
        {icon}
      </div>
      <div>
        <h3 className='font-semibold text-base'>{title}</h3>
        <p className='mt-0.5 text-muted-foreground text-sm'>{desc}</p>
      </div>
    </div>
  );
}

// ── Field Wrapper ──

function Field({
  label,
  required,
  children,
  error,
  hint
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string | null;
  hint?: string;
}) {
  return (
    <div className='space-y-2'>
      <Label>
        {label}
        {required && <span className='ml-1 text-destructive'>*</span>}
      </Label>
      {children}
      {error && <p className='text-[13px] text-destructive'>{error}</p>}
      {hint && !error && <p className='text-[13px] text-muted-foreground'>{hint}</p>}
    </div>
  );
}

const FormClient = ({ initialData, linkedProviders }: Props) => {
  const router = useRouter();
  const t = useTranslations("profile.form");
  const { toast } = useToast();
  const { handleErrorClient } = useHandleError();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      toast({ variant: "destructive", description: "Chỉ chấp nhận file ảnh" });
      return;
    }
    if (file.size > UPLOAD_MAX_AVATAR_SIZE) {
      toast({ variant: "destructive", description: "Ảnh tối đa 3MB" });
      return;
    }
    try {
      const src = await readFileAsDataURL(file);
      setAvatarCropSrc(src);
      setIsAvatarCropOpen(true);
    } catch {
      toast({ variant: "destructive", description: "Không thể đọc file ảnh" });
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
      const url = await uploadToStorage(file, STORAGE_BUCKET, STORAGE_PATHS.avatars);
      setFormData((prev) => ({ ...prev, avatar: url }));
    } catch {
      toast({ variant: "destructive", description: "Upload avatar thất bại" });
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
      toast({ variant: "destructive", description: "Chỉ nhận file ảnh" });
      return;
    }
    if (file.size > UPLOAD_MAX_COVER_SIZE) {
      toast({ variant: "destructive", description: "Ảnh tối đa 5MB" });
      return;
    }
    setCoverUploading(true);
    try {
      const url = await uploadToStorage(file, STORAGE_BUCKET, STORAGE_PATHS.covers);
      setFormData((prev) => ({ ...prev, coverImage: url }));
    } catch {
      toast({ variant: "destructive", description: "Upload cover thất bại" });
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
      onSuccess: () => router.refresh(),
      withSuccessNotify: true
    });
    setIsLinkingGithub(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!(formData.firstName && formData.lastName)) {
      return;
    }

    let slug = formData.slug.trim();
    if (!slug) {
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

    function parseSpotifyUri(input: string): string | null {
      if (!input) {
        return null;
      }
      const trimmed = input.trim();
      if (trimmed.startsWith("spotify:")) {
        const parts = trimmed.split(":");
        if (parts.length >= 3) {
          return `spotify:${parts[1]}:${parts[2]}`;
        }
        return trimmed;
      }
      try {
        const urlString = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
        const url = new URL(urlString);
        if (url.hostname.includes("spotify.com")) {
          const parts = url.pathname.split("/").filter(Boolean);
          if (parts.length >= 2) {
            return `spotify:${parts[0]}:${parts[1]}`;
          }
        }
      } catch {
        const match = trimmed.match(/spotify\.com\/(track|playlist|album|artist)\/([a-zA-Z0-9]+)/);
        if (match) {
          return `spotify:${match[1]}:${match[2]}`;
        }
      }
      return trimmed;
    }

    const parsedSpotifyUri = formData.spotifyUri ? parseSpotifyUri(formData.spotifyUri) : "";
    const payload = {
      ...formData,
      slug,
      dob: formData.dob ? new Date(formData.dob) : undefined,
      socials: formData.socials.map(({ id: _id, ...rest }) => rest),
      spotifyUri: parsedSpotifyUri || null
    };

    setIsSubmitting(true);
    await handleErrorClient({
      cb: async () => updateProfile(payload as any),
      withSuccessNotify: true
    });
    setIsSubmitting(false);
  };

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className='flex flex-col gap-6'
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Images Card ── */}
      <div className='overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm'>
        <SectionHeader
          desc='Hình ảnh cá nhân sẽ hiển thị trên trang profile của bạn.'
          icon={<Camera className='h-5 w-5' />}
          title='Ảnh đại diện & Ảnh bìa'
        />
        <div className='space-y-6 p-6'>
          {/* Cover */}
          <div>
            <Label className='mb-2 flex items-center gap-2 font-medium text-sm'>
              <ImagePlus className='h-4 w-4 text-primary' />
              Ảnh bìa
            </Label>
            {formData.coverImage ? (
              <div className='group relative aspect-3/1 w-full overflow-hidden rounded-xl border bg-muted'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt='Cover' className='h-full w-full object-cover' src={formData.coverImage} />
                <div className='absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30' />
                <button
                  className='absolute top-3 right-3 z-10 rounded-full bg-black/60 p-2 text-white opacity-0 shadow-lg backdrop-blur-sm transition-all hover:bg-black/80 group-hover:opacity-100'
                  onClick={() => setFormData((prev) => ({ ...prev, coverImage: null }))}
                  title='Xóa ảnh bìa'
                  type='button'
                >
                  <Trash2 className='h-4 w-4' />
                </button>
              </div>
            ) : (
              <button
                className={`flex h-36 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all ${
                  isCoverDragOver
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/20 bg-muted/20 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
                }`}
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
                    <Loader2 className='h-7 w-7 animate-spin text-primary' />
                    <span className='font-medium text-sm'>Đang upload...</span>
                  </>
                ) : (
                  <>
                    <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10'>
                      <ImagePlus className='h-6 w-6 text-primary' />
                    </div>
                    <span className='font-medium text-sm'>Thêm ảnh bìa</span>
                    <span className='text-muted-foreground text-xs'>Kéo thả hoặc click để chọn · max 5MB</span>
                  </>
                )}
              </button>
            )}
            <input accept='image/*' className='hidden' onChange={handleCoverUpload} ref={coverInputRef} type='file' />
          </div>

          {/* Avatar */}
          <div>
            <Label className='mb-2 flex items-center gap-2 font-medium text-sm'>
              <UserCircle className='h-4 w-4 text-primary' />
              Ảnh đại diện
            </Label>
            <div
              className={`flex flex-col items-center gap-5 rounded-xl border-2 border-dashed p-5 transition-colors sm:flex-row ${
                isAvatarDragOver ? "border-primary bg-primary/10" : "border-muted-foreground/20"
              }`}
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
                <Avatar className='h-24 w-24 border-2 shadow-md ring-4 ring-background'>
                  <AvatarImage src={formData.avatar ?? undefined} />
                  <AvatarFallback className='bg-primary/5 text-4xl text-primary/40'>
                    {avatarUploading ? (
                      <Loader2 className='h-8 w-8 animate-spin' />
                    ) : (
                      <UserCircle className='h-14 w-14' />
                    )}
                  </AvatarFallback>
                </Avatar>
                {avatarUploading && (
                  <div className='absolute inset-0 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-[2px]'>
                    <Loader2 className='h-6 w-6 animate-spin text-white' />
                  </div>
                )}
              </div>
              <div className='flex flex-col items-center gap-2 sm:items-start'>
                <div className='flex gap-2'>
                  <Button
                    disabled={avatarUploading}
                    onClick={() => avatarInputRef.current?.click()}
                    size='sm'
                    type='button'
                    variant='outline'
                  >
                    <Upload className='mr-1.5 h-3.5 w-3.5' />
                    {avatarUploading ? "Đang upload..." : "Đổi ảnh"}
                  </Button>
                  {formData.avatar && (
                    <Button
                      className='text-destructive'
                      onClick={() => setFormData((prev) => ({ ...prev, avatar: null }))}
                      size='sm'
                      type='button'
                      variant='ghost'
                    >
                      <Trash2 className='mr-1.5 h-3.5 w-3.5' />
                      Xóa
                    </Button>
                  )}
                </div>
                <span className='text-muted-foreground text-xs'>JPG, PNG, WebP · max 3MB · Khung hình vuông</span>
              </div>
              <input
                accept='image/*'
                className='hidden'
                onChange={handleAvatarUpload}
                ref={avatarInputRef}
                type='file'
              />
            </div>
          </div>
        </div>
      </div>

      <ImageCropperModal
        aspect={1}
        imageSrc={avatarCropSrc}
        isOpen={isAvatarCropOpen}
        onConfirm={handleAvatarCropConfirm}
        onOpenChange={setIsAvatarCropOpen}
      />

      {/* ── Form ── */}
      <form className='flex flex-col gap-6' onSubmit={handleSubmit}>
        {/* Personal Info */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className='overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm'
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <SectionHeader
            desc='Họ tên, slug, và các thông tin cơ bản.'
            icon={<UserPen className='h-5 w-5' />}
            title='Thông tin cá nhân'
          />
          <div className='space-y-5 p-6'>
            <div className='flex flex-col gap-4 sm:flex-row'>
              <Field label='Họ' required>
                <Input
                  id='firstName'
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value
                    }))
                  }
                  placeholder='Nguyễn'
                  required
                  value={formData.firstName}
                />
              </Field>
              <Field label='Tên' required>
                <Input
                  id='lastName'
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName: e.target.value
                    }))
                  }
                  placeholder='Văn A'
                  required
                  value={formData.lastName}
                />
              </Field>
            </div>

            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
              <Field
                error={slugError}
                hint='Chữ thường, số, -, _. Không dùng "me".'
                label='Slug (URL cá nhân)'
                required
              >
                <div className='relative'>
                  <AtSign className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    className='pl-9'
                    id='slug'
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        slug: e.target.value
                      }));
                      setSlugError(null);
                    }}
                    placeholder='trieukon1011'
                    value={formData.slug}
                  />
                </div>
              </Field>
              <Field label='Ngày sinh'>
                <div className='relative'>
                  <Baby className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    className='pl-9'
                    id='dob'
                    onChange={(e) => setFormData((prev) => ({ ...prev, dob: e.target.value }))}
                    type='date'
                    value={formData.dob ?? ""}
                  />
                </div>
              </Field>
              <Field label='Số điện thoại'>
                <div className='relative'>
                  <Smartphone className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    className='pl-9'
                    id='phone'
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value
                      }))
                    }
                    placeholder='0901234567'
                    value={formData.phone}
                  />
                </div>
              </Field>
              <Field label='Mã số sinh viên'>
                <div className='relative'>
                  <Hash className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    className='pl-9'
                    id='studentId'
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        studentId: e.target.value
                      }))
                    }
                    placeholder='22110xxx'
                    value={formData.studentId}
                  />
                </div>
              </Field>
            </div>

            <Field label='Spotify URI'>
              <div className='relative'>
                <Music2 className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  className='pl-9'
                  id='spotifyUri'
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      spotifyUri: e.target.value
                    }))
                  }
                  placeholder={t("spotifyPlaceholder")}
                  value={formData.spotifyUri ?? ""}
                />
              </div>
            </Field>

            <Field label='Giới thiệu'>
              <div className='relative'>
                <Quote className='absolute top-3 left-3 h-4 w-4 text-muted-foreground' />
                <textarea
                  className='flex min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2.5 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                  id='bio'
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder='Đôi nét về bản thân...'
                  value={formData.bio}
                />
              </div>
            </Field>
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className='overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm'
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <SectionHeader
            desc='Hiển thị trên trang cá nhân công khai của bạn.'
            icon={<Link2 className='h-5 w-5' />}
            title='Liên kết mạng xã hội'
          />
          <div className='space-y-4 p-6'>
            {formData.socials.length === 0 && (
              <div className='flex flex-col items-center gap-3 py-6 text-center'>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-muted'>
                  <Globe className='h-6 w-6 text-muted-foreground/50' />
                </div>
                <p className='text-muted-foreground text-sm'>Chưa có liên kết nào. Thêm mạng xã hội bên dưới.</p>
              </div>
            )}
            {formData.socials.map((social, idx) => (
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className='flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/20 p-4 sm:flex-row sm:items-center'
                initial={{ opacity: 0, x: -10 }}
                key={social.id}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
              >
                <div className='w-full shrink-0 sm:w-48'>
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
                            <img alt={p.label} className='h-4 w-4 object-contain' src={p.icon} />
                            <span>{p.label}</span>
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
                    className='shrink-0 text-muted-foreground hover:text-destructive'
                    onClick={() => handleRemoveSocial(social.id!)}
                    size='icon'
                    type='button'
                    variant='ghost'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </motion.div>
            ))}
            <Button className='mt-1' onClick={handleAddSocial} size='sm' type='button' variant='outline'>
              <Plus className='mr-1.5 h-4 w-4' />
              Thêm liên kết
            </Button>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className='overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm'
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <SectionHeader
            desc='Mật khẩu và liên kết tài khoản.'
            icon={<ShieldCheck className='h-5 w-5' />}
            title='Tài khoản & Bảo mật'
          />
          <div className='space-y-6 p-6'>
            {/* Password */}
            <div>
              <Label className='mb-3 flex items-center gap-2 font-medium text-sm'>
                <Lock className='h-4 w-4 text-primary' />
                Đổi mật khẩu
              </Label>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-end'>
                <div className='flex-1 space-y-2'>
                  <Input
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Mật khẩu mới'
                    type='password'
                    value={password}
                  />
                </div>
                <div className='flex-1 space-y-2'>
                  <Input
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Xác nhận mật khẩu'
                    type='password'
                    value={confirmPassword}
                  />
                </div>
                <Button
                  className='shrink-0'
                  disabled={!password || password !== confirmPassword || isUpdatingPassword}
                  onClick={handleUpdatePassword}
                  size='sm'
                  type='button'
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' /> Đang cập nhật
                    </>
                  ) : (
                    "Cập nhật"
                  )}
                </Button>
              </div>
            </div>

            <div className='h-px bg-border/50' />

            {/* GitHub Link */}
            <div>
              <Label className='mb-3 flex items-center gap-2 font-medium text-sm'>
                <Github className='h-4 w-4 text-primary' />
                Liên kết GitHub
              </Label>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                <Button
                  disabled={isLinkingGithub}
                  onClick={() => (linkedProviders.includes("github") ? handleUnlinkGithub() : handleLinkGithub())}
                  size='sm'
                  type='button'
                  variant={linkedProviders.includes("github") ? "destructive" : "default"}
                >
                  {isLinkingGithub ? (
                    <>
                      <Loader2 className='mr-1.5 h-4 w-4 animate-spin' /> Đang xử lý
                    </>
                  ) : linkedProviders.includes("github") ? (
                    <>
                      <Github className='mr-1.5 h-4 w-4' /> Hủy liên kết
                    </>
                  ) : (
                    <>
                      <Github className='mr-1.5 h-4 w-4' /> Liên kết GitHub
                    </>
                  )}
                </Button>
                <p className='text-muted-foreground text-sm'>
                  {linkedProviders.includes("github")
                    ? "Đã liên kết GitHub. Nhấn để hủy."
                    : "Liên kết GitHub để đăng nhập nhanh và xác thực danh tính."}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div
          animate={{ opacity: 1 }}
          className='flex items-center justify-end gap-3'
          initial={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Button disabled={isSubmitting} onClick={() => router.refresh()} type='button' variant='ghost'>
            Hủy
          </Button>
          <Button disabled={isSubmitting} size='lg' type='submit'>
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Đang lưu...
              </>
            ) : (
              <>
                <Save className='mr-2 h-4 w-4' /> Lưu thay đổi
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export { FormClient };
export { FormSkeleton };
