"use client";

import Image from "next/image";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { WebDesignExhibitionItem } from "@/types/webdesign";
import { EditDialog } from "./edit-dialog";
import { Field, LocalizedInput, LocalizedTextarea, UploadUrlInput } from "./form-fields";
import type { ItemDialogProps } from "./list-panel";
import { EMPTY_EXHIBITION } from "./webdesign-defaults";

const splitList = (value: string) =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export function ExhibitionDialog({ item, onSubmit, onClose }: ItemDialogProps<WebDesignExhibitionItem>) {
  const [draft, setDraft] = useState<WebDesignExhibitionItem>(item ?? EMPTY_EXHIBITION);
  // Comma lists are edited as raw text so typing ", " isn't swallowed mid-edit.
  const [members, setMembers] = useState(draft.teamMembers.join(", "));
  const [techStack, setTechStack] = useState(draft.techStack.join(", "));
  const patch = (p: Partial<WebDesignExhibitionItem>) => setDraft((prev) => ({ ...prev, ...p }));

  return (
    <EditDialog
      onClose={onClose}
      onSubmit={() => onSubmit({ ...draft, teamMembers: splitList(members), techStack: splitList(techStack) })}
      size='lg'
      submitDisabled={!(draft.teamName.trim() && (draft.projectName.vi.trim() || draft.projectName.en.trim()))}
      title={item ? "Sửa dự án triển lãm" : "Thêm dự án triển lãm"}
    >
      <div className='grid gap-4 sm:grid-cols-2'>
        <Field htmlFor='ex-team' label='Tên đội'>
          <Input id='ex-team' onChange={(e) => patch({ teamName: e.target.value })} value={draft.teamName} />
        </Field>
        <Field htmlFor='ex-subject' label='Chủ đề'>
          <Input id='ex-subject' onChange={(e) => patch({ subjects: e.target.value })} value={draft.subjects} />
        </Field>
        <Field htmlFor='ex-live' label='URL demo'>
          <Input
            id='ex-live'
            onChange={(e) => patch({ live: e.target.value })}
            placeholder='https://…'
            value={draft.live}
          />
        </Field>
        <Field htmlFor='ex-github' label='URL GitHub'>
          <Input
            id='ex-github'
            onChange={(e) => patch({ github: e.target.value })}
            placeholder='https://github.com/…'
            value={draft.github}
          />
        </Field>
        <Field hint='Phân cách bằng dấu phẩy' htmlFor='ex-members' label='Thành viên'>
          <Input id='ex-members' onChange={(e) => setMembers(e.target.value)} value={members} />
        </Field>
        <Field hint='Phân cách bằng dấu phẩy' htmlFor='ex-tech' label='Tech stack'>
          <Input id='ex-tech' onChange={(e) => setTechStack(e.target.value)} value={techStack} />
        </Field>
      </div>

      <Field label='Ảnh thumbnail'>
        <div className='flex items-center gap-3'>
          <div className='relative h-16 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-muted/30'>
            {draft.thumbnail ? (
              <Image alt='' className='object-cover' fill sizes='96px' src={draft.thumbnail} />
            ) : (
              <span className='flex h-full items-center justify-center text-[10px] text-muted-foreground'>
                Chưa có ảnh
              </span>
            )}
          </div>
          <div className='flex-1'>
            <UploadUrlInput
              accept='image/*'
              onChange={(thumbnail) => patch({ thumbnail })}
              placeholder='URL ảnh'
              value={draft.thumbnail}
            />
          </div>
        </div>
      </Field>

      <Field label='Tên dự án'>
        <LocalizedInput onChange={(projectName) => patch({ projectName })} value={draft.projectName} />
      </Field>
      <Field label='Mô tả'>
        <LocalizedTextarea onChange={(description) => patch({ description })} value={draft.description} />
      </Field>
    </EditDialog>
  );
}
