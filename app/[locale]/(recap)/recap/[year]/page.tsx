import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getRecapByYear } from "@/app/[locale]/actions/recaps";
import { parseRecapData } from "@/lib/recap-data";
import { RecapSlideViewer } from "./client";

type Props = {
  params: Promise<{ year: string; locale: string }>;
};

async function RecapContent({ yearPromise }: { yearPromise: Promise<string> }) {
  await connection();
  const yearStr = await yearPromise;
  const year = Number(yearStr);
  if (isNaN(year)) notFound();

  const { data } = await getRecapByYear(year);
  const recap = (data?.payload as any)?.recap;
  if (!recap) notFound();

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
    <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
      <RecapContent yearPromise={params.then((p) => p.year)} />
    </Suspense>
  );
}
