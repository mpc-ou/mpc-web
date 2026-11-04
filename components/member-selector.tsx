"use client";

import { ImagePlus, Loader2, Search, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { adminRegisterTempImage } from "@/app/_actions/admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { STORAGE_BUCKET } from "@/constants/storage";
import { UPLOAD_MAX_IMAGE_SIZE } from "@/constants/upload";
import { useToast } from "@/hooks/use-toast";
import { uploadToStorage } from "@/services/supabase-upload";

export type MemberOption = {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  avatar: string | null;
  studentId: string | null;
  webRole: string;
};

export type LinkedMember = {
  member: MemberOption;
  role: string | null;
  imageUrl?: string | null;
  joinedAt?: string | null;
};

type MemberSelectorProps = {
  allMembers: MemberOption[];
  linked: LinkedMember[];
  onLink: (member: MemberOption, role: string, joinedAt: string | null) => void;
  onUnlink: (memberId: string) => void;
  onUpdate?: (memberId: string, updates: Partial<LinkedMember>) => void;
  withJoinedAt?: boolean;
  withImage?: boolean;
  joinedAtHint?: string;
};

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

const toDateInputValue = (value?: string | null) => {
  if (!value) {
    return "";
  }
  if (DATE_ONLY_RE.test(value)) {
    return value;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(date);
};

function MemberImageUploadButton({ memberId, onUploaded }: { memberId: string; onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", description: "Chỉ chấp nhận file ảnh" });
      return;
    }
    if (file.size > UPLOAD_MAX_IMAGE_SIZE) {
      toast({ variant: "destructive", description: "Ảnh tối đa 5MB" });
      return;
    }

    setUploading(true);
    try {
      const url = await uploadToStorage(file, STORAGE_BUCKET, `achievements/members/${memberId}`);
      await adminRegisterTempImage(url);
      onUploaded(url);
    } catch {
      toast({ variant: "destructive", description: "Upload ảnh thất bại" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button
        className='flex h-12 w-12 items-center justify-center rounded-md border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary'
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        title='Upload ảnh tuyên dương'
        type='button'
      >
        {uploading ? <Loader2 className='h-4 w-4 animate-spin' /> : <ImagePlus className='h-4 w-4' />}
      </button>
      <input accept='image/*' className='hidden' onChange={handleFileChange} ref={fileInputRef} type='file' />
    </>
  );
}

const SELECTOR_LABELS = {
  linkedMembers: "Thành viên đã gắn kết",
  removeLinkedMember: "Xóa thành viên này",
  searchMembersPlaceholder: "Tìm kiếm thành viên theo tên hoặc MSSV...",
  rolePlaceholder: "Nhập vai trò / giải thưởng (VD: Giải Nhất, Frontend...)",
  clearSelectedMember: "Bỏ chọn thành viên"
};

export function MemberSelector({
  allMembers,
  linked,
  onLink,
  onUnlink,
  onUpdate,
  withJoinedAt = false,
  withImage = true,
  joinedAtHint
}: MemberSelectorProps) {
  const t = (key: keyof typeof SELECTOR_LABELS) => SELECTOR_LABELS[key];
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [roleInput, setRoleInput] = useState("");
  const [joinedAtInput, setJoinedAtInput] = useState("");

  const linkedIds = new Set(linked.map((l) => l.member.id));

  const filtered = useMemo(() => {
    if (!search.trim()) {
      return [];
    }
    const q = search.toLowerCase();
    return allMembers
      .filter(
        (m) =>
          !linkedIds.has(m.id) &&
          (`${m.firstName} ${m.lastName}`.toLowerCase().includes(q) || (m.studentId ?? "").toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [allMembers, search, linkedIds]);

  const selectedMember = allMembers.find((m) => m.id === selectedId);

  const handleAdd = () => {
    if (!selectedMember) {
      return;
    }
    onLink(selectedMember, roleInput.trim(), joinedAtInput || null);
    setSelectedId(null);
    setRoleInput("");
    setJoinedAtInput("");
    setSearch("");
  };

  return (
    <div className='min-w-0 space-y-3'>
      <div className='flex items-center justify-between'>
        <Label className='text-muted-foreground text-xs'>
          {t("linkedMembers")} ({linked.length})
        </Label>
      </div>

      {/* Linked members — vertical stacked card per member for narrow sidebar clarity */}
      {linked.length > 0 && (
        <div className='space-y-2.5'>
          {linked.map((l) => (
            <div
              className='flex flex-col gap-2.5 rounded-lg border bg-muted/20 p-3 text-xs transition-colors hover:border-border/80'
              key={l.member.id}
            >
              {/* Row 1: Avatar + Full Name + Student ID + Remove Button */}
              <div className='flex items-center justify-between gap-2'>
                <div className='flex min-w-0 flex-1 items-center gap-2.5'>
                  <Avatar className='h-8 w-8 shrink-0'>
                    <AvatarImage src={l.member.avatar ?? undefined} />
                    <AvatarFallback className='text-xs'>
                      {l.member.firstName[0]}
                      {l.member.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className='min-w-0 flex-1'>
                    <div className='truncate font-semibold text-foreground text-sm'>
                      {l.member.firstName} {l.member.lastName}
                    </div>
                    {l.member.studentId && (
                      <div className='truncate text-[10px] text-muted-foreground'>{l.member.studentId}</div>
                    )}
                  </div>
                </div>

                <button
                  className='shrink-0 rounded-md border p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
                  onClick={() => onUnlink(l.member.id)}
                  title={t("removeLinkedMember")}
                  type='button'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              </div>

              {/* Row 2: Full-width Role / Prize Input */}
              <div className='grid min-w-0 gap-1.5'>
                <span className='text-[11px] text-muted-foreground'>Vai trò / Giải thưởng</span>
                <Input
                  className='h-8 w-full text-xs'
                  onChange={(e) => onUpdate?.(l.member.id, { role: e.target.value })}
                  placeholder='VD: Giải Nhất, Trưởng nhóm, Backend...'
                  value={l.role || ""}
                />
              </div>

              {/* Row 3 (Optional): Joined Date or Honor Image */}
              {(withJoinedAt || withImage) && (
                <div className='flex flex-wrap items-center justify-between gap-2 border-border/50 border-t pt-2'>
                  {withJoinedAt && (
                    <div className='grid min-w-0 flex-1 gap-1'>
                      <span className='text-[11px] text-muted-foreground'>Ngày tham gia</span>
                      <Input
                        aria-label='Ngày tham gia'
                        className='h-8 w-full text-xs'
                        onChange={(e) => onUpdate?.(l.member.id, { joinedAt: e.target.value || null })}
                        title={joinedAtHint}
                        type='date'
                        value={toDateInputValue(l.joinedAt)}
                      />
                    </div>
                  )}

                  {withImage && (
                    <div className='flex w-full items-center justify-between gap-2'>
                      <span className='text-[11px] text-muted-foreground'>Ảnh tuyên dương riêng:</span>
                      {l.imageUrl ? (
                        <div className='relative h-12 w-12 shrink-0 rounded-md border bg-muted'>
                          <Image
                            alt={`Avatar ${l.member.firstName}`}
                            className='rounded-md object-cover'
                            fill
                            sizes='48px'
                            src={l.imageUrl}
                          />
                          <button
                            className='absolute -top-1.5 -right-1.5 z-10 rounded-full bg-destructive p-0.5 text-white hover:bg-destructive/80'
                            onClick={() => onUpdate?.(l.member.id, { imageUrl: null })}
                            title='Xóa ảnh tuyên dương'
                            type='button'
                          >
                            <X className='h-2.5 w-2.5' />
                          </button>
                        </div>
                      ) : (
                        <MemberImageUploadButton
                          memberId={l.member.id}
                          onUploaded={(url) => onUpdate?.(l.member.id, { imageUrl: url })}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Separator />

      {/* Search */}
      <div className='relative'>
        <Search className='absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground' />
        <Input
          className='h-8 pl-8 text-xs'
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedId(null);
          }}
          placeholder={t("searchMembersPlaceholder")}
          value={search}
        />
      </div>

      {/* Search results dropdown */}
      {filtered.length > 0 && !selectedId && (
        <div className='max-h-[200px] overflow-y-auto rounded-md border bg-background shadow-sm'>
          {filtered.map((m) => (
            <button
              className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted'
              key={m.id}
              onClick={() => {
                setSelectedId(m.id);
                setSearch(`${m.firstName} ${m.lastName}`);
              }}
              type='button'
            >
              <Avatar className='h-6 w-6 shrink-0'>
                <AvatarImage src={m.avatar ?? undefined} />
                <AvatarFallback className='text-[9px]'>
                  {m.firstName[0]}
                  {m.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1'>
                <span className='font-medium'>
                  {m.firstName} {m.lastName}
                </span>
                {m.studentId && <span className='ml-1.5 text-muted-foreground text-xs'>{m.studentId}</span>}
              </div>
              <Badge className='shrink-0 text-[10px]' variant='outline'>
                {m.webRole}
              </Badge>
            </button>
          ))}
        </div>
      )}

      {/* Role input + confirm (stacked cleanly for narrow sidebar) */}
      {selectedMember && (
        <div className='flex flex-col gap-2.5 rounded-lg border border-primary/30 bg-primary/5 p-3'>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex min-w-0 items-center gap-2'>
              <Avatar className='h-6 w-6 shrink-0'>
                <AvatarImage src={selectedMember.avatar ?? undefined} />
                <AvatarFallback className='text-[9px]'>
                  {selectedMember.firstName[0]}
                  {selectedMember.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <span className='truncate font-medium text-sm'>
                {selectedMember.firstName} {selectedMember.lastName}
              </span>
            </div>
            <button
              className='shrink-0 rounded p-1 text-muted-foreground text-xs hover:bg-muted hover:text-foreground'
              onClick={() => {
                setSelectedId(null);
                setSearch("");
              }}
              title={t("clearSelectedMember")}
              type='button'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          </div>

          <Input
            className='h-8 w-full text-xs'
            onChange={(e) => setRoleInput(e.target.value)}
            placeholder={t("rolePlaceholder")}
            value={roleInput}
          />

          {withJoinedAt && (
            <Input
              aria-label='Ngày tham gia'
              className='h-8 w-full text-xs'
              onChange={(e) => setJoinedAtInput(e.target.value)}
              title={joinedAtHint}
              type='date'
              value={joinedAtInput}
            />
          )}

          <button
            className='w-full rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground text-xs transition-colors hover:bg-primary/90'
            onClick={handleAdd}
            type='button'
          >
            + Thêm thành viên
          </button>
        </div>
      )}
    </div>
  );
}
