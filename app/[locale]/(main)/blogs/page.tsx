import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { checkUserBlogCreationPermission, getBlogsPageData } from "@/app/_actions/main";
import { PageHero } from "@/components/custom/page-hero.client";
import { generatePageSeo } from "@/utils/seo";
import { BlogsClient } from "./client";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageSeo({
    page: "blogs",
    locale,
    pathname: "/blogs"
  });
}

export default async function BlogsPage({ params, searchParams }: Props): Promise<React.ReactNode> {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const page = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : 1;
  const validPage = Number.isNaN(page) || page < 1 ? 1 : page;

  const take = 12;

  const [{ data }, t, { data: canCreatePermission }] = await Promise.all([
    getBlogsPageData(validPage, take, locale),
    getTranslations({ locale, namespace: "blogs" }),
    checkUserBlogCreationPermission()
  ]);

  const canCreate = Boolean(canCreatePermission?.payload);

  const payload = data?.payload as
    | {
        blogs: Array<{
          id: string;
          title: string;
          slug: string;
          description: string | null;
          thumbnail: string | null;
          publishedAt: string;
          author: {
            firstName: string;
            lastName: string;
            avatar: string | null;
            slug: string | null;
          };
          tags: Array<{ tag: { nameVi: string; nameEn: string } }>;
        }>;
        totalPages: number;
      }
    | undefined;

  const dbBlogs = payload?.blogs ?? [];
  const totalPages = payload?.totalPages ?? 0;

  return (
    <div className='min-h-screen bg-background pb-20'>
      <PageHero badge={t("badge")} description={t("description")} imageUrl='/images/bg/blogs.jpg' title={t("title")} />
      <div className='container mx-auto mt-16 max-w-6xl px-4'>
        <BlogsClient
          blogs={dbBlogs.map((b) => ({
            ...b,
            description: b.description ?? undefined,
            thumbnail: b.thumbnail ?? undefined,
            author: {
              ...b.author,
              avatar: b.author.avatar ?? undefined,
              slug: b.author.slug ?? undefined
            }
          }))}
          canCreate={canCreate}
          currentPage={validPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
