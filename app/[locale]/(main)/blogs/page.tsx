import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getBlogsPageData } from "@/app/_actions/main";
import { PageHero } from "@/components/custom/page-hero.client";
import { prisma } from "@/configs/prisma/db";
import { createClientSsr } from "@/configs/supabase/server";
import { getBlogPermissionLevel, hasBlogCreationPermission } from "@/utils/blog-permission";
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

  const take = 9;

  const [{ data }, t, permissionLevel] = await Promise.all([
    getBlogsPageData(validPage, take, locale),
    getTranslations({ locale, namespace: "blogs" }),
    getBlogPermissionLevel()
  ]);

  let canCreate = false;
  try {
    const supabase = await createClientSsr();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) {
      const member = await prisma.member.findUnique({
        where: { authId: user.id },
        select: { webRole: true }
      });
      if (member) {
        canCreate = hasBlogCreationPermission(member.webRole, permissionLevel);
      }
    }
  } catch {
    // Not logged in → can't create
  }

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
