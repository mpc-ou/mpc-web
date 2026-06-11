"use client";

import { adminGetTags } from "@/app/_actions/admin";
import { TagInput as BaseTagInput } from "@/components/forms/tag-input";

type Props = {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
};

export function TagInput({ selectedTags, onChange }: Props) {
  return <BaseTagInput getTags={adminGetTags as any} onChange={onChange} selectedTags={selectedTags} />;
}
