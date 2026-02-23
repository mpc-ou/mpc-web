"use client";

import { LinkIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Sponsor = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
  description: string | null;
  sponsorships: {
    id: string;
    title: string | null;
    tier: string | null;
  }[];
};

export function SponsorsClient({ sponsors }: { sponsors: Sponsor[] }) {
  const [selected, setSelected] = useState<Sponsor | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {sponsors.map((item) => (
          <div
            className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
            key={item.id}
            onClick={() => setSelected(item)}
          >
            <div className="relative mb-4 flex aspect-square w-full max-w-32 items-center justify-center overflow-hidden rounded-xl bg-muted/30">
              {item.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={item.name}
                  className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  src={item.logo}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-bold text-3xl text-muted-foreground/30 opacity-50">
                  {item.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <h3 className="line-clamp-2 text-center font-semibold text-foreground text-sm leading-tight transition-colors group-hover:text-primary">
              {item.name}
            </h3>

            {/* Show Tier Badges if available */}
            {item.sponsorships && item.sponsorships.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                {item.sponsorships.map((sponsor) => {
                  if (!sponsor.tier) {
                    return null;
                  }
                  const tierLower = sponsor.tier.toLowerCase();
                  let colorClass = "bg-muted text-foreground";
                  if (tierLower === "kim cương" || tierLower === "diamond") {
                    colorClass =
                      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border-blue-200 dark:border-blue-800";
                  }
                  if (tierLower === "vàng" || tierLower === "gold") {
                    colorClass =
                      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800";
                  }
                  if (tierLower === "bạc" || tierLower === "silver") {
                    colorClass =
                      "bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-200 border-slate-200 dark:border-slate-700";
                  }
                  if (tierLower === "đồng" || tierLower === "bronze") {
                    colorClass =
                      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200 border-orange-200 dark:border-orange-800";
                  }

                  return (
                    <Badge
                      className={`px-1.5 py-0 text-[10px] ${colorClass}`}
                      key={sponsor.id}
                      variant="outline"
                    >
                      {sponsor.tier}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog
        onOpenChange={(open) => !open && setSelected(null)}
        open={!!selected}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {selected?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-6 pt-4">
            <div className="flex aspect-video w-full max-w-[240px] items-center justify-center rounded-xl bg-muted/30 p-2">
              {selected?.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={selected.name}
                  className="max-h-full max-w-full object-contain"
                  src={selected.logo}
                />
              ) : (
                <span className="font-bold text-4xl text-muted-foreground/30 opacity-50">
                  {selected?.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            {selected?.description ? (
              <p className="whitespace-pre-line text-muted-foreground text-sm">
                {selected.description}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm italic">
                Chưa có mô tả chi tiết.
              </p>
            )}

            {selected?.website && (
              <Button asChild className="w-full">
                <a
                  href={selected.website}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <LinkIcon className="mr-2 h-4 w-4" /> Truy cập website
                </a>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
