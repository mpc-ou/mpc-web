import { adminGetPosts } from "../actions";
import type { PostRow } from "./columns";
import { PostsDataTable } from "./table";

export default async function AdminPostsPage() {
  const { data } = await adminGetPosts();
  const posts = (data?.payload ?? []) as PostRow[];

  return (
    <div className='flex flex-col gap-6'>
      <h1 className='font-bold text-2xl text-foreground'>📝 Quản lý Bài viết</h1>
      <PostsDataTable data={posts} />
    </div>
  );
}
