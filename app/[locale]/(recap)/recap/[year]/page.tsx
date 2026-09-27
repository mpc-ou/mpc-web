import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { getRecapByYear } from "@/app/_actions/main";
import { parseRecapData } from "@/lib/recap-data";
import { generatePageSeo } from "@/utils/seo";
import { RecapSlideViewer } from "./client";

type Props = {
  params: Promise<{ year: string; locale: string }>;
};

type YearRecapPayload = {
  year: number;
  name: string;
  description: string | null;
  coverImage: string | null;
  coverImage2: string | null;
  coverImage3: string | null;
  endImage: string | null;
  musicUrl: string | null;
  data: unknown;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, locale } = await params;
  const { data } = await getRecapByYear(Number(year));
  const recap = data?.payload as YearRecapPayload | null | undefined;
  return generatePageSeo({
    page: "recap",
    locale,
    pathname: `/recap/${year}`,
    title: recap?.name || `MPC Recap ${year}`,
    description: recap?.description || undefined,
    image: recap?.coverImage || undefined
  });
}

async function RecapContent({ yearPromise }: { yearPromise: Promise<string> }) {
  await connection();
  const yearStr = await yearPromise;
  const year = Number(yearStr);
  if (Number.isNaN(year)) {
    notFound();
  }

  const { data } = await getRecapByYear(year);
  const recap = (data?.payload as { recap?: YearRecapPayload | null } | undefined)?.recap;
  if (!recap) {
    notFound();
  }

  const recapData = parseRecapData(recap.data);

  return (
    <RecapSlideViewer
      coverImage={recap.coverImage}
      coverImage2={recap.coverImage2}
      coverImage3={recap.coverImage3}
      endImage={recap.endImage}
      musicUrl={recap.musicUrl}
      name={recap.name}
      recapData={recapData}
      year={recap.year}
    />
  );
}

export default function RecapYearPage({ params }: Props) {
  return (
    <Suspense fallback={<div className='fixed inset-0 bg-black' />}>
      <RecapContent yearPromise={params.then((p) => p.year)} />
    </Suspense>
  );
}
