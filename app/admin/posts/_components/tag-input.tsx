"use client";

import { adminGetTags } from "@/app/_actions/admin";
import { TagInput as BaseTagInput } from "@/components/forms/tag-input";

type Props = {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
};

async function getTags() {
  const res = await adminGetTags();
  return (res.data?.payload as Array<{ id: string; name: string; slug: string }>) ?? [];
}

export function TagInput({ selectedTags, onChange }: Props) {
  return <BaseTagInput getTags={getTags} onChange={onChange} selectedTags={selectedTags} />;
}
