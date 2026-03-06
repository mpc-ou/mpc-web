"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFullName } from "@/lib/utils";
import type { MemberRow } from "./columns";
import { MemberProfileTab } from "./member-profile-tab";
import { MemberRolesTab } from "./member-roles-tab";
import { MemberSocialsTab } from "./member-socials-tab";
import { type Department, POSITION_LABELS } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: MemberRow | null;
  departments?: Department[];
};

export function MemberFormDialog({
  open,
  onOpenChange,
  member,
  departments = [],
}: Props) {
  const isEdit = !!member;
  const initials = member
    ? `${member.firstName?.[0] ?? ""}${member.lastName?.[0] ?? ""}`
    : "?";

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? (
              <span className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={member.avatar ?? undefined} />
                  <AvatarFallback className="bg-primary/10 font-bold text-[11px] text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {getFullName(member.firstName, member.lastName, "vi")}
              </span>
            ) : (
              "Thêm thành viên mới"
            )}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `${member.email} · ${POSITION_LABELS[member.webRole] ?? member.webRole}`
              : "Thêm email để tạo tài khoản mới."}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile">
          <TabsList className="w-full">
            <TabsTrigger className="flex-1" value="profile">
              👤 Hồ sơ
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="socials">
              🔗 Liên kết
            </TabsTrigger>
            <TabsTrigger className="flex-1" disabled={!isEdit} value="roles">
              🏅 Chức vụ CLB
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <MemberProfileTab
              member={member || undefined}
              onClose={() => onOpenChange(false)}
            />
          </TabsContent>

          <TabsContent value="socials">
            <MemberSocialsTab
              member={member || undefined}
              onClose={() => onOpenChange(false)}
            />
          </TabsContent>

          <TabsContent value="roles">
            <MemberRolesTab
              departments={departments}
              member={member!}
              open={open}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
