"use client";

import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Globe,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  UserCircle,
  X
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { adminSaveMemberFull } from "@/app/_actions/admin";
import { ImageCropperModal, readFileAsDataURL } from "@/components/image-cropper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { STORAGE_BUCKET, STORAGE_PATHS } from "@/constants/storage";
import { UPLOAD_MAX_AVATAR_SIZE, UPLOAD_MAX_COVER_SIZE } from "@/constants/upload";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { getFullName } from "@/lib/utils";
import { uploadToStorage } from "@/services/supabase-upload";
import { formatLocalDate } from "@/utils/handle-datetime";
import type { MemberRow } from "../columns";
import { type ClubRoleEntry, type Department, PLATFORMS, POSITION_LABELS, type SocialEntry } from "../types";

const SPOTIFY_URL_RE = /spotify\.com\/(track|playlist|album|artist)\/([a-zA-Z0-9]+)/;

type Props = {
  member?: MemberRow;
  departments: Department[];
};

function parseSocials(member?: MemberRow): SocialEntry[] {
  if (!member) {
    return [];
  }
  try {
    const raw = (member as { socials?: unknown }).socials;
    const parsed = raw ? JSON.parse(JSON.stringify(raw)) : [];
    return Array.isArray(parsed)
      ? parsed.map((s: SocialEntry) => ({
          ...s,
          id: s.id ?? Math.random().toString(36).substring(2)
        }))
      : [];
  } catch {
    return [];
  }
}

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
        const type = parts[0];
        const id = parts[1];
        return `spotify:${type}:${id}`;
      }
    }
  } catch {
    const match = trimmed.match(SPOTIFY_URL_RE);
    if (match) {
      return `spotify:${match[1]}:${match[2]}`;
    }
  }
  return trimmed;
}

export function MemberForm({ member, departments }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const locale = useLocale();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState(member?.email ?? "");
  const [firstName, setFirstName] = useState(member?.firstName ?? "");
  const [middleName, setMiddleName] = useState(member?.middleName ?? "");
  const [lastName, setLastName] = useState(member?.lastName ?? "");
  const [phone, setPhone] = useState(member?.phone ?? "");
  const [studentId, setStudentId] = useState(member?.studentId ?? "");
  const [slugValue, setSlugValue] = useState(member?.slug ?? "");
  const [dob, setDob] = useState(member?.dob ? new Date(member.dob).toISOString().split("T")[0] : "");
  const [showDob, setShowDob] = useState(member?.showDob ?? true);
  const [showPhone, setShowPhone] = useState(member?.showPhone ?? true);
  const [showStudentId, setShowStudentId] = useState(member?.showStudentId ?? true);
  const [bio, setBio] = useState(member?.bio ?? "");
  const [webRole, setWebRole] = useState(member?.webRole ?? "MEMBER");
  const [spotifyUri, setSpotifyUri] = useState(member?.spotifyUri ?? "");

  // Avatars/Covers
  const [avatarUrl, setAvatarUrl] = useState<string | null>(member?.avatar ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(member?.coverImage ?? null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [isAvatarDragOver, setIsAvatarDragOver] = useState(false);
  const [isCoverDragOver, setIsCoverDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [avatarCropSrc, setAvatarCropSrc] = useState<string>("");
  const [isAvatarCropOpen, setIsAvatarCropOpen] = useState(false);

  // 2. Socials State
  const [socials, setSocials] = useState<SocialEntry[]>(() => parseSocials(member));

  // 3. Roles State
  const [clubRoles, setClubRoles] = useState<ClubRoleEntry[]>(() => {
    if (!member?.clubRoles) {
      return [];
    }
    return member.clubRoles.map((r) => ({
      ...r,
      department: r.department
        ? {
            id: r.department.id || "",
            nameVi: r.department.nameVi || "",
            nameEn: r.department.nameEn || "",
            slug: r.department.slug || ""
          }
        : null
    })) as ClubRoleEntry[];
  });

  // Roles Sub-form State
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState<ClubRoleEntry | null>(null);
  const [rolePosition, setRolePosition] = useState<string>("");
  const [roleDepartmentId, setRoleDepartmentId] = useState<string>("none");
  const [roleTerm, setRoleTerm] = useState<string>("");
  const [roleStartAt, setRoleStartAt] = useState<string>("");
  const [roleEndAt, setRoleEndAt] = useState<string>("");
  const [roleNote, setRoleNote] = useState<string>("");

  const isDeptRequired =
    rolePosition === "DEPARTMENT_LEADER" ||
    rolePosition === "DEPARTMENT_VICE_LEADER" ||
    rolePosition === "DEPARTMENT_MEMBER" ||
    rolePosition === "COLLABORATOR";

  const isTermRequired = rolePosition === "COLLABORATOR" || rolePosition === "DEPARTMENT_MEMBER";

  // Avatar functions
  const processAvatarFile = async (file: File) => {
    if (file.size > UPLOAD_MAX_AVATAR_SIZE) {
      toast({
        variant: "destructive",
        description: "Dung lượng ảnh tối đa 3MB"
      });
      return;
    }
    try {
      const dataUrl = await readFileAsDataURL(file);
      setAvatarCropSrc(dataUrl);
      setIsAvatarCropOpen(true);
    } catch {
      toast({ variant: "destructive", description: "Lỗi đọc file ảnh" });
    }
  };

  const processCoverFile = async (file: File) => {
    if (file.size > UPLOAD_MAX_COVER_SIZE) {
      toast({
        variant: "destructive",
        description: "Dung lượng ảnh tối đa 5MB"
      });
      return;
    }
    setCoverUploading(true);
    const path = await uploadToStorage(file, STORAGE_BUCKET, STORAGE_PATHS.covers);
    if (!path) {
      toast({
        variant: "destructive",
        description: "Tải ảnh bìa lên thất bại"
      });
      setCoverUploading(false);
      return;
    }
    setCoverUrl(path);
    setCoverUploading(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processAvatarFile(e.target.files[0]);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processCoverFile(e.target.files[0]);
    }
  };

  const handleAvatarCropConfirm = async (blob: Blob) => {
    setAvatarUploading(true);
    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
    const path = await uploadToStorage(file, "media", "avatars");
    if (!path) {
      toast({
        variant: "destructive",
        description: "Tải ảnh đại diện lên thất bại"
      });
      setAvatarUploading(false);
      return;
    }
    setAvatarUrl(path);
    setAvatarUploading(false);
  };

  // Social updates
  const handleAddSocial = () => {
    setSocials((prev) => [...prev, { id: Math.random().toString(36).substring(2), platform: "", url: "" }]);
  };

  const handleRemoveSocial = (id: string) => {
    setSocials((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateSocial = (id: string, field: "platform" | "url", value: string) => {
    setSocials((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  // Roles updates
  const handlePositionChange = (val: string) => {
    setRolePosition(val);
    const requiresDept =
      val === "DEPARTMENT_LEADER" ||
      val === "DEPARTMENT_VICE_LEADER" ||
      val === "DEPARTMENT_MEMBER" ||
      val === "COLLABORATOR";
    if (!requiresDept) {
      setRoleDepartmentId("none");
    }
  };

  const handleAddRoleClick = () => {
    setEditingRole(null);
    setRolePosition("");
    setRoleDepartmentId("none");
    setRoleTerm("");
    setRoleStartAt("");
    setRoleEndAt("");
    setRoleNote("");
    setShowRoleForm((v) => !v);
  };

  const handleEditRoleClick = (role: ClubRoleEntry) => {
    setEditingRole(role);
    setRolePosition(role.position);
    setRoleDepartmentId(role.department?.id ?? "none");
    setRoleTerm(role.term ? String(role.term) : "");
    setRoleStartAt(role.startAt ? new Date(role.startAt).toISOString().split("T")[0] : "");
    setRoleEndAt(role.endAt ? new Date(role.endAt).toISOString().split("T")[0] : "");
    setRoleNote(role.note ?? "");
    setShowRoleForm(true);
  };

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rolePosition) {
      toast({ variant: "destructive", description: "Vui lòng chọn chức vụ" });
      return;
    }
    if (isDeptRequired && roleDepartmentId === "none") {
      toast({
        variant: "destructive",
        description: "Chức vụ này yêu cầu chọn ban bộ"
      });
      return;
    }
    if (isTermRequired && !roleTerm) {
      toast({
        variant: "destructive",
        description: "Khóa (năm) là bắt buộc đối với Cộng tác viên và Thành viên ban"
      });
      return;
    }
    if (!roleStartAt) {
      toast({
        variant: "destructive",
        description: "Vui lòng chọn ngày bắt đầu nhiệm kỳ"
      });
      return;
    }

    const dept = departments.find((d) => d.id === roleDepartmentId) || null;

    const roleData: ClubRoleEntry = {
      id: editingRole?.id ?? Math.random().toString(36).substring(2),
      position: rolePosition,
      department: dept,
      term: roleTerm ? Number(roleTerm) : null,
      startAt: new Date(roleStartAt).toISOString(),
      endAt: roleEndAt ? new Date(roleEndAt).toISOString() : null,
      note: roleNote || null
    };

    if (editingRole) {
      setClubRoles((prev) => prev.map((r) => (r.id === editingRole.id ? roleData : r)));
      toast({ description: "Cập nhật chức vụ tạm thời thành công" });
    } else {
      setClubRoles((prev) => [roleData, ...prev]);
      toast({ description: "Thêm chức vụ tạm thời thành công" });
    }

    // Reset sub-form
    setShowRoleForm(false);
    setEditingRole(null);
  };

  const handleRemoveRole = async (roleId: string) => {
    const ok = await confirm({
      title: "Xóa chức vụ?",
      description: "Chức vụ sẽ được loại bỏ khỏi danh sách (cần bấm Lưu ở dưới để xác nhận)."
    });
    if (ok) {
      setClubRoles((prev) => prev.filter((r) => r.id !== roleId));
    }
  };

  // Main save transaction
  const handleMainSave = async () => {
    if (!(firstName && lastName)) {
      toast({ variant: "destructive", description: "Họ và tên là bắt buộc" });
      return;
    }
    if (!(member || email)) {
      toast({
        variant: "destructive",
        description: "Email đăng nhập là bắt buộc"
      });
      return;
    }

    setSaving(true);

    const cleanSocials = socials.filter((s) => s.platform && s.url).map(({ id: _id, ...rest }) => rest);

    const cleanClubRoles = clubRoles.map((r) => {
      // If the ID was generated locally (doesn't exist in original DB), omit ID so database creates it
      const hasIdInOriginal = member?.clubRoles?.some((orig) => orig.id === r.id);
      return {
        id: hasIdInOriginal ? r.id : undefined,
        position: r.position,
        departmentId: r.department?.id || null,
        term: r.term,
        startAt: r.startAt,
        endAt: r.endAt,
        note: r.note
      };
    });

    const payload = {
      profile: {
        email: email.trim(),
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        webRole: webRole as "ADMIN" | "COLLABORATOR" | "MEMBER" | "GUEST",
        phone: phone.trim() || undefined,
        dob: dob || null,
        studentId: studentId.trim() || undefined,
        bio: bio.trim() || undefined,
        avatar: avatarUrl,
        coverImage: coverUrl,
        slug: slugValue.trim() || undefined,
        showDob,
        showPhone,
        showStudentId,
        spotifyUri: spotifyUri ? parseSpotifyUri(spotifyUri) : null
      },
      socials: cleanSocials,
      clubRoles: cleanClubRoles
    };

    const res = await adminSaveMemberFull(member?.id ?? null, payload);
    setSaving(false);

    if (res.error) {
      toast({ variant: "destructive", description: res.error?.message });
    } else {
      toast({
        description: member ? "Cập nhật thành công!" : "Tạo thành viên thành công!"
      });
      router.push("/admin/members");
      router.refresh();
    }
  };

  return (
    <div className='flex w-full flex-col gap-6'>
      <ConfirmDialog />

      {/* Header bar with Back button and Save action */}
      <div className='flex flex-col justify-between gap-4 border-b pb-5 md:flex-row md:items-center'>
        <div>
          <h1 className='flex items-center gap-2 font-bold text-2xl text-foreground'>
            <Button className='h-8 w-8' onClick={() => router.push("/admin/members")} size='icon' variant='outline'>
              <ArrowLeft className='h-4 w-4' />
            </Button>
            {member ? `Chỉnh sửa: ${getFullName(firstName, middleName, lastName, "vi")}` : "Thêm thành viên mới"}
          </h1>
          <p className='mt-1 text-muted-foreground text-sm'>
            Thiết lập thông tin cá nhân, mạng xã hội, vai trò ban bộ và lưu tất cả cùng một lúc.
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Button disabled={saving} onClick={() => router.push("/admin/members")} variant='outline'>
            Hủy
          </Button>
          <Button disabled={saving} onClick={handleMainSave}>
            {saving ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Đang lưu...
              </>
            ) : (
              "Lưu tất cả thay đổi"
            )}
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Left Column: Personal Profile */}
        <div className='flex flex-col gap-5 rounded-xl border bg-background p-6 shadow-sm'>
          <h2 className='flex items-center gap-2 font-semibold text-base text-foreground'>
            <span>👤</span> Hồ sơ cá nhân
          </h2>

          {/* Cover photo + Avatar Header */}
          <div className='relative mb-16'>
            <div className='relative h-40 w-full overflow-hidden rounded-xl border bg-muted/30'>
              {coverUrl ? (
                <>
                  <Image alt='Cover' className='object-cover' fill sizes='100%' src={coverUrl} />
                  <Button
                    className='absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 text-white hover:bg-red-600/80'
                    onClick={() => setCoverUrl(null)}
                    size='icon'
                    type='button'
                    variant='destructive'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </>
              ) : (
                <button
                  className={`flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:bg-muted/50 ${
                    isCoverDragOver ? "border-primary bg-primary/10" : ""
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
                      <Loader2 className='h-5 w-5 animate-spin' />
                      <span className='font-medium text-xs'>Đang tải lên...</span>
                    </>
                  ) : (
                    <>
                      <ImagePlus className='h-6 w-6' />
                      <span className='font-medium text-xs'>Thêm ảnh bìa (Max 5MB)</span>
                    </>
                  )}
                </button>
              )}
              <input
                accept='image/*'
                className='hidden'
                onChange={handleCoverUpload}
                ref={coverInputRef}
                title='Upload ảnh bìa'
                type='file'
              />
            </div>

            {/* biome-ignore lint/a11y/noStaticElementInteractions: optional drag-and-drop target layered on the already-keyboard-accessible upload button below */}
            {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: same as above */}
            <div
              className={`absolute bottom-0 left-6 flex translate-y-1/2 items-end gap-4 rounded-xl p-1 transition-colors ${
                isAvatarDragOver ? "border-primary bg-primary/10" : ""
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
              <div className='group relative'>
                <Avatar className='h-24 w-24 border-4 border-background shadow-md'>
                  <AvatarImage src={avatarUrl ?? undefined} />
                  <AvatarFallback className='bg-primary/10 font-semibold text-2xl text-primary'>
                    {avatarUploading ? (
                      <Loader2 className='h-6 w-6 animate-spin' />
                    ) : (
                      <UserCircle className='h-12 w-12' />
                    )}
                  </AvatarFallback>
                </Avatar>
                <button
                  className='absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity disabled:opacity-50 group-hover:opacity-100'
                  disabled={avatarUploading}
                  onClick={() => fileInputRef.current?.click()}
                  type='button'
                >
                  <Upload className='mb-1 h-5 w-5' />
                  <span className='font-medium text-[10px]'>Thay đổi</span>
                </button>
              </div>

              <div className='flex flex-col gap-1 pb-2'>
                <div className='flex gap-2'>
                  <Button
                    className='h-8 bg-background font-medium text-xs'
                    disabled={avatarUploading}
                    onClick={() => fileInputRef.current?.click()}
                    size='sm'
                    type='button'
                    variant='outline'
                  >
                    {avatarUploading ? "Đang upload..." : "Thay đổi avatar"}
                  </Button>
                  {avatarUrl && (
                    <Button
                      className='h-8 text-destructive text-xs hover:bg-destructive/10 hover:text-destructive'
                      onClick={() => setAvatarUrl(null)}
                      size='sm'
                      type='button'
                      variant='ghost'
                    >
                      Xóa
                    </Button>
                  )}
                </div>
                <span className='rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground'>
                  JPG, PNG, WebP · max 3MB
                </span>
              </div>

              <input
                accept='image/*'
                className='hidden'
                onChange={handleAvatarUpload}
                ref={fileInputRef}
                title='Upload avatar'
                type='file'
              />
            </div>
          </div>

          <Separator />

          <div className='grid gap-4'>
            <div className='flex flex-col justify-between gap-4 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3.5 text-blue-600 text-xs sm:flex-row sm:items-center dark:text-blue-400'>
              <span>
                <strong>Lưu ý:</strong> Các thông tin cá nhân (Họ tên, SĐT, MSSV, Ngày sinh) sẽ được đồng bộ tự động lên
                SSO khi bạn lưu.
              </span>
            </div>

            <div className='grid gap-1.5'>
              <Label htmlFor='email'>Email đăng nhập *</Label>
              <Input
                disabled
                id='email'
                onChange={(e) => setEmail(e.target.value)}
                placeholder='email@example.com'
                required
                type='email'
                value={email}
              />
            </div>

            <div className='grid grid-cols-3 gap-3'>
              <div className='grid gap-1.5'>
                <Label htmlFor='lastName'>Họ *</Label>
                <Input id='lastName' onChange={(e) => setLastName(e.target.value)} required value={lastName} />
              </div>
              <div className='grid gap-1.5'>
                <Label htmlFor='middleName'>Tên đệm</Label>
                <Input
                  id='middleName'
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder='Văn'
                  value={middleName}
                />
              </div>
              <div className='grid gap-1.5'>
                <Label htmlFor='firstName'>Tên *</Label>
                <Input id='firstName' onChange={(e) => setFirstName(e.target.value)} required value={firstName} />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              <div className='space-y-2'>
                <div className='grid gap-1.5'>
                  <Label htmlFor='phone'>Số điện thoại</Label>
                  <Input id='phone' onChange={(e) => setPhone(e.target.value)} value={phone} />
                </div>
                <div className='flex items-center gap-2'>
                  <Checkbox checked={showPhone} id='showPhone' onCheckedChange={(c) => setShowPhone(!!c)} />
                  <Label
                    className='cursor-pointer select-none font-normal text-muted-foreground text-xs'
                    htmlFor='showPhone'
                  >
                    Hiển thị số điện thoại
                  </Label>
                </div>
              </div>
              <div className='space-y-2'>
                <div className='grid gap-1.5'>
                  <Label htmlFor='studentId'>MSSV</Label>
                  <Input id='studentId' onChange={(e) => setStudentId(e.target.value)} value={studentId} />
                </div>
                <div className='flex items-center gap-2'>
                  <Checkbox checked={showStudentId} id='showStudentId' onCheckedChange={(c) => setShowStudentId(!!c)} />
                  <Label
                    className='cursor-pointer select-none font-normal text-muted-foreground text-xs'
                    htmlFor='showStudentId'
                  >
                    Hiển thị MSSV
                  </Label>
                </div>
              </div>
            </div>

            <div className='grid gap-1.5'>
              <Label htmlFor='slug'>Slug (Tên định danh viết liền không dấu)</Label>
              <Input
                id='slug'
                onChange={(e) => setSlugValue(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder='vd: nguyen-van-a'
                value={slugValue}
              />
            </div>

            <div className='space-y-2'>
              <div className='grid gap-1.5'>
                <Label htmlFor='dob'>Ngày sinh</Label>
                <Input id='dob' onChange={(e) => setDob(e.target.value)} type='date' value={dob} />
              </div>
              <div className='flex items-center gap-2'>
                <Checkbox checked={showDob} id='showDob' onCheckedChange={(c) => setShowDob(!!c)} />
                <Label
                  className='cursor-pointer select-none font-normal text-muted-foreground text-xs'
                  htmlFor='showDob'
                >
                  Hiển thị ngày sinh
                </Label>
              </div>
            </div>

            <div className='grid gap-1.5'>
              <Label htmlFor='bio'>Giới thiệu bản thân / Tiểu sử</Label>
              <textarea
                className='min-h-18 rounded-md border border-input bg-background px-3 py-2 text-sm'
                id='bio'
                onChange={(e) => setBio(e.target.value)}
                placeholder='Viết vài dòng về bản thân...'
                value={bio}
              />
            </div>

            <div className='grid gap-1.5'>
              <Label htmlFor='spotifyUri'>Spotify Link / URI (Nhạc yêu thích)</Label>
              <Input
                id='spotifyUri'
                onChange={(e) => setSpotifyUri(e.target.value)}
                placeholder='https://open.spotify.com/track/...'
                value={spotifyUri}
              />
            </div>

            <div className='grid gap-1.5'>
              <Label htmlFor='webRole'>Vai trò hệ thống</Label>
              <Select disabled onValueChange={setWebRole} value={webRole}>
                <SelectTrigger id='webRole'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ADMIN'>Admin</SelectItem>
                  <SelectItem value='COLLABORATOR'>Cộng tác viên</SelectItem>
                  <SelectItem value='MEMBER'>Thành viên</SelectItem>
                  <SelectItem value='GUEST'>Khách</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Right Column: Socials + Club Roles */}
        <div className='flex flex-col gap-6'>
          {/* Social Links Section */}
          <div className='flex flex-col gap-4 rounded-xl border bg-background p-6 shadow-sm'>
            <h2 className='flex items-center gap-2 font-semibold text-base text-foreground'>
              <span>🔗</span> Mạng xã hội
            </h2>
            <p className='text-muted-foreground text-xs'>Các liên kết mạng xã hội và trang cá nhân.</p>

            {socials.map((social) => (
              <div className='flex items-center gap-2' key={social.id}>
                <div className='w-40 shrink-0'>
                  <Select
                    onValueChange={(val) => handleUpdateSocial(social.id, "platform", val)}
                    value={social.platform || undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Nền tảng' />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          <span className='flex items-center gap-2'>
                            <Image alt={p.label} className='shrink-0' height={16} src={p.icon} width={16} />
                            <span>{p.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex flex-1 items-center gap-2'>
                  <Input
                    onChange={(e) => handleUpdateSocial(social.id, "url", e.target.value)}
                    placeholder='Link / Username'
                    value={social.url}
                  />
                  <Button
                    className='h-9 w-9 shrink-0 text-destructive'
                    onClick={() => handleRemoveSocial(social.id)}
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
              className='w-full border-dashed'
              onClick={handleAddSocial}
              size='sm'
              type='button'
              variant='outline'
            >
              <Plus className='mr-2 h-4 w-4' />
              Thêm liên kết mới
            </Button>
          </div>

          {/* Club Roles Section */}
          <div className='flex flex-col gap-4 rounded-xl border bg-background p-6 shadow-sm'>
            <div className='flex items-center justify-between'>
              <h2 className='flex items-center gap-2 font-semibold text-base text-foreground'>
                <span>🏅</span> Chức vụ CLB
              </h2>
            </div>

            <div className='flex flex-col justify-between gap-4 rounded-lg border border-orange-500/20 bg-orange-500/10 p-3.5 text-orange-600 text-xs sm:flex-row sm:items-center dark:text-orange-400'>
              <span>
                <strong>Lưu ý:</strong> Chức vụ và vai trò của thành viên hiện được đồng bộ tự động và quản lý tập trung
                từ cổng SSO. Bạn không thể chỉnh sửa chức vụ tại đây.
              </span>
              <a
                className='inline-flex shrink-0 items-center gap-1 font-bold text-orange-700 hover:underline dark:text-orange-300'
                href='https://auth.mpclub.dev/admin/ui/users'
                rel='noopener noreferrer'
                target='_blank'
              >
                Quản lý trên SSO
                <ExternalLink className='h-3 w-3' />
              </a>
            </div>

            {/* List of currently accumulated Roles */}
            {clubRoles.length === 0 ? (
              <p className='py-6 text-center text-muted-foreground text-xs'>Chưa có chức vụ nào được thêm</p>
            ) : (
              <div className='relative mt-2 space-y-0 pl-4'>
                <div className='absolute top-2 bottom-2 left-1.75 w-px bg-border' />
                {clubRoles.map((role) => {
                  const isActive = !role.endAt;
                  return (
                    <div className='relative flex items-start gap-3 pb-4' key={role.id}>
                      <div
                        className={`relative z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 ${
                          isActive ? "border-primary bg-primary" : "border-muted-foreground bg-background"
                        }`}
                      />
                      <div className='flex flex-1 items-start justify-between gap-2'>
                        <div>
                          <div className='flex items-center gap-2'>
                            <span className='font-medium text-foreground text-xs'>
                              {POSITION_LABELS[role.position] ?? role.position}
                            </span>
                            {role.department && (
                              <Badge className='text-[9px]' variant='outline'>
                                {role.department.nameVi}
                              </Badge>
                            )}
                            {isActive && (
                              <Badge className='text-[9px]' variant='default'>
                                Hiện tại
                              </Badge>
                            )}
                            {role.term && (
                              <Badge className='text-[9px]' variant='secondary'>
                                NK {role.term}
                              </Badge>
                            )}
                          </div>
                          <div className='mt-0.5 text-[10px] text-muted-foreground'>
                            {role.startAt ? formatLocalDate(role.startAt, locale) : ""} –{" "}
                            {role.endAt ? formatLocalDate(role.endAt, locale) : "Hiện tại"}
                          </div>
                          {role.note && (
                            <div className='mt-0.5 text-[10px] text-muted-foreground italic'>* {role.note}</div>
                          )}
                        </div>

                        {null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
    </div>
  );
}
