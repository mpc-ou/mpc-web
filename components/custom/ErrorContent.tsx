"use client";

import { AlertTriangleIcon, HomeIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type ErrorContentProps = {
  reset: () => void;
  title?: string;
  description?: string;
  reminder?: string;
  tryAgain?: string;
  redirect?: string;
};

const ErrorContent = ({
  reset,
  title = "Đã xảy ra lỗi hệ thống",
  description = "Thật không may, chúng tôi đã gặp sự cố không mong muốn trong khi xử lý yêu cầu của bạn.",
  reminder = "Nếu sự cố vẫn tiếp diễn, vui lòng liên hệ với bộ phận hỗ trợ kỹ thuật để được hỗ trợ.",
  tryAgain = "Thử lại",
  redirect = "Về trang chủ"
}: ErrorContentProps) => {
  return (
    <div className='flex h-full items-center justify-center'>
      <div className='w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md'>
        <AlertTriangleIcon className='mx-auto mb-4 h-12 w-12 text-red-500' />
        <h1 className='mb-4 font-bold text-2xl text-gray-800'>{title}</h1>
        <p className='mb-6 text-gray-600'>{description}</p>
        <div className='mb-6 rounded-md bg-gray-100 p-4'>
          <p className='text-gray-600 text-sm'>{reminder}</p>
        </div>
        <div className='flex flex-col space-y-3'>
          <Button className='w-full' onClick={() => reset()}>
            <RefreshCwIcon className='mr-2 h-4 w-4' />
            {tryAgain}
          </Button>
          <Link href='/' passHref>
            <Button className='w-full' variant='outline'>
              <HomeIcon className='mr-2 h-4 w-4' />
              {redirect}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export { ErrorContent };
