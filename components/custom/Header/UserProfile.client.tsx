"use client";

import { LogOut, Settings, Shield, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Link, useRouter } from "@/configs/i18n/routing";
import { createClient } from "@/configs/supabase/client";
import { _ROUTE_ADMIN, _ROUTE_AUTH, _ROUTE_MEMBERS, _ROUTE_PROFILE } from "@/constants/route";
import { type UserProfileData, type WebRole } from "@/types/common";

const WEB_ROLE_LABEL: Record<WebRole, string> = {
  ADMIN: "Quản trị viên",
  COLLABORATOR: "Cộng tác viên",
  MEMBER: "Thành viên",
  GUEST: "Khách"
};

type Props = {
  profile: UserProfileData;
};

const UserProfile = ({ profile }: Props) => {
  const t = useTranslations("common.nav");
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace(_ROUTE_AUTH);
    router.refresh();
  };

  const profileHref = profile?.slug ? `${_ROUTE_MEMBERS}/${profile.slug}` : _ROUTE_PROFILE;

  return profile ? (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className='cursor-pointer'>
            <AvatarImage src={profile.avatarUrl ?? undefined} />
            <AvatarFallback>{profile.fullName?.charAt(0)?.toUpperCase() ?? "U"}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-56'>
          {/* Header: Name + Role */}
          <DropdownMenuLabel className='font-normal'>
            <p className='truncate font-semibold text-sm'>{profile.fullName ?? "—"}</p>
            <p className='mt-0.5 text-muted-foreground text-xs'>{WEB_ROLE_LABEL[profile.webRole] ?? profile.webRole}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href={profileHref}>
              <User className='mr-2 h-4 w-4' />
              {t("profile")}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={_ROUTE_PROFILE}>
              <Settings className='mr-2 h-4 w-4' />
              {t("settings")}
            </Link>
          </DropdownMenuItem>

          {profile.isAdmin && (
            <DropdownMenuItem asChild>
              <Link href={_ROUTE_ADMIN}>
                <Shield className='mr-2 h-4 w-4' />
                {t("admin")}
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className='text-destructive focus:bg-destructive/10 focus:text-destructive'
            onClick={() => setShowLogoutDialog(true)}
          >
            <LogOut className='mr-2 h-4 w-4' />
            {t("logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout confirmation dialog */}
      <Dialog onOpenChange={setShowLogoutDialog} open={showLogoutDialog}>
        <DialogContent className='sm:max-w-100'>
          <DialogHeader>
            <DialogTitle>Xác nhận đăng xuất</DialogTitle>
            <DialogDescription>Bạn có chắc muốn đăng xuất khỏi tài khoản không?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowLogoutDialog(false)} type='button' variant='outline'>
              Huỷ
            </Button>
            <Button onClick={handleLogout} type='button' variant='destructive'>
              <LogOut className='mr-2 h-4 w-4' />
              Đăng xuất
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  ) : (
    <Button asChild type='button' variant='outline'>
      <Link href={_ROUTE_AUTH}>{t("login")}</Link>
    </Button>
  );
};

export type { UserProfileData };
export { UserProfile };
