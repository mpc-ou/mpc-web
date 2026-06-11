import { Film } from "lucide-react";
import { AdminPageHeader } from "../_components/admin-page-header";
import { RecapsManager } from "./manager";

export default function RecapsPage(): React.ReactNode {
  return (
    <div className='flex flex-col gap-6'>
      <AdminPageHeader
        description='Quản lý tổng kết hoạt động theo năm của câu lạc bộ'
        icon={Film}
        title='Year Recaps'
      />
      <RecapsManager />
    </div>
  );
}
