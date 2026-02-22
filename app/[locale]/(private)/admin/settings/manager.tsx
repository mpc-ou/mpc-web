"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminUpsertSetting } from "../actions";

type Setting = {
  id: string;
  key: string;
  value: string;
  description: string | null;
};

export const SettingsManager = ({ settings }: { settings: Setting[] }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpsert = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await adminUpsertSetting({
      key: fd.get("key") as string,
      value: fd.get("value") as string,
      description: (fd.get("description") as string) || undefined,
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4"
        onSubmit={handleUpsert}
      >
        <h3 className="font-medium text-foreground text-sm">
          Thêm / Cập nhật Setting
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Input name="key" placeholder="Key (VD: site_title)" required />
          <Input name="description" placeholder="Mô tả (tùy chọn)" />
        </div>
        <textarea
          className="min-h-[60px] rounded-md border border-border bg-background px-3 py-2 text-sm"
          name="value"
          placeholder="Value..."
          required
        />
        <Button disabled={loading} type="submit">
          Lưu
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Key
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Value
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Mô tả
              </th>
            </tr>
          </thead>
          <tbody>
            {settings.map((s) => (
              <tr
                className="border-border border-b last:border-0 hover:bg-muted/30"
                key={s.id}
              >
                <td className="px-4 py-3 font-medium font-mono text-foreground text-xs">
                  {s.key}
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-muted-foreground text-xs">
                  {s.value}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {s.description ?? "—"}
                </td>
              </tr>
            ))}
            {settings.length === 0 && (
              <tr>
                <td
                  className="px-4 py-8 text-center text-muted-foreground"
                  colSpan={3}
                >
                  Chưa có setting nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
