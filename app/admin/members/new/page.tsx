import { ArrowLeft, ExternalLink, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewMemberPage() {
  return (
    <div className='flex min-h-[60vh] items-center justify-center p-6'>
      <Card className='w-full max-w-md border-border/50 bg-card shadow-lg'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-orange-500'>
            <ShieldAlert className='h-6 w-6' />
          </div>
          <CardTitle className='font-bold text-xl'>Quản lý tài khoản đã chuyển sang SSO</CardTitle>
          <CardDescription className='mt-2'>
            Hệ thống hiện tại sử dụng cổng xác thực tập trung SSO làm nguồn dữ liệu thành viên duy nhất.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4 text-center'>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            Việc thêm thành viên mới, cấp tài khoản và cấu phác chức vụ ban đầu phải được thực hiện trực tiếp trên SSO.
            Dữ liệu sẽ tự động đồng bộ về website sau đó.
          </p>
          <div className='mt-2 flex flex-col gap-2'>
            <Button asChild className='w-full' variant='default'>
              <a href='https://auth.mpclub.dev' rel='noopener noreferrer' target='_blank'>
                Đi tới SSO Dashboard
                <ExternalLink className='ml-2 h-4 w-4' />
              </a>
            </Button>
            <Button asChild className='w-full' variant='ghost'>
              <Link href='/admin/members'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Quay lại danh sách
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
