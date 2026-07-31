import type { Metadata } from "next";
import { Suspense } from "react";
import { MyBlogsClient } from "./client";

export const metadata: Metadata = {
  title: "Bài viết của tôi"
};

export default async function MyBlogsPage() {
  return (
    <div className='mx-auto w-full max-w-7xl px-4 py-8'>
      <div className='mb-8'>
        <h1 className='font-bold text-3xl tracking-tight'>Bài viết của tôi</h1>
        <p className='mt-1 text-muted-foreground'>Quản lý các bài viết blog bạn đã đăng.</p>
      </div>
      <Suspense fallback={<div className='py-20 text-center text-muted-foreground'>Đang tải...</div>}>
        <MyBlogsClient />
      </Suspense>
    </div>
  );
}
