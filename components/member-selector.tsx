"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export type MemberOption = {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  studentId: string | null;
  webRole: string;
};

export type LinkedMember = {
  member: MemberOption;
  role: string | null;
};

type MemberSelectorProps = {
  allMembers: MemberOption[];
  linked: LinkedMember[];
  onLink: (member: MemberOption, role: string) => void;
  onUnlink: (memberId: string) => void;
};

export function MemberSelector({ allMembers, linked, onLink, onUnlink }: MemberSelectorProps) {
  const t = useTranslations("admin.form.selector");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [roleInput, setRoleInput] = useState("");

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
    onLink(selectedMember, roleInput.trim());
    setSelectedId(null);
    setRoleInput("");
    setSearch("");
  };

  return (
    <div className='space-y-3'>
      <Label>{t("linkedMembers")}</Label>

      {/* Linked members */}
      {linked.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {linked.map((l) => (
            <div
              className='flex items-center gap-1.5 rounded-full border bg-muted/50 py-0.5 pr-1 pl-2 text-xs'
              key={l.member.id}
            >
              <Avatar className='h-4 w-4'>
                <AvatarImage src={l.member.avatar ?? undefined} />
                <AvatarFallback className='text-[8px]'>
                  {l.member.firstName[0]}
                  {l.member.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <span className='font-medium'>
                {l.member.firstName} {l.member.lastName}
              </span>
              {l.role && <span className='text-muted-foreground'>· {l.role}</span>}
              <button
                className='ml-0.5 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive'
                onClick={() => onUnlink(l.member.id)}
                title={t("removeLinkedMember")}
                type='button'
              >
                <X className='h-2.5 w-2.5' />
              </button>
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
              <div className='flex-1'>
                <span className='font-medium'>
                  {m.firstName} {m.lastName}
                </span>
                {m.studentId && <span className='ml-1.5 text-muted-foreground text-xs'>{m.studentId}</span>}
              </div>
              <Badge className='text-[10px]' variant='outline'>
                {m.webRole}
              </Badge>
            </button>
          ))}
        </div>
      )}

      {/* Role input + confirm */}
      {selectedMember && (
        <div className='flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2'>
          <Avatar className='h-6 w-6 shrink-0'>
            <AvatarImage src={selectedMember.avatar ?? undefined} />
            <AvatarFallback className='text-[9px]'>
              {selectedMember.firstName[0]}
              {selectedMember.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <span className='shrink-0 font-medium text-sm'>
            {selectedMember.firstName} {selectedMember.lastName}
          </span>
          <Input
            className='h-7 flex-1 text-xs'
            onChange={(e) => setRoleInput(e.target.value)}
            placeholder={t("rolePlaceholder")}
            value={roleInput}
          />
          <button
            className='shrink-0 rounded-md bg-primary px-2 py-1 text-primary-foreground text-xs hover:bg-primary/90'
            onClick={handleAdd}
            type='button'
          >
            Thêm
          </button>
          <button
            className='shrink-0 text-muted-foreground text-xs hover:text-foreground'
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
      )}
    </div>
  );
}
