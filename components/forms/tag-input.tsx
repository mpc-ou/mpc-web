"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TagItem = { id: string; name: string; slug: string };

type Props = {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  /** Async function to fetch existing tags. Default fetches from admin API. */
  getTags?: () => Promise<TagItem[]>;
};

function defaultGetTags(): Promise<TagItem[]> {
  return Promise.resolve([]);
}

export function TagInput({ selectedTags, onChange, getTags = defaultGetTags }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [allTags, setAllTags] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await getTags();
        if (Array.isArray(res)) {
          setAllTags(res);
        }
      } catch (err) {
        console.error("Failed to fetch tags", err);
      }
    };
    fetchTags();
  }, [getTags]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!inputValue.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = allTags.filter(
      (t) =>
        t.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedTags.some((st) => st.toLowerCase() === t.name.toLowerCase())
    );
    setSuggestions(filtered);
  }, [inputValue, allTags, selectedTags]);

  const addTag = (tagName: string) => {
    const clean = tagName.trim();
    if (!clean) {
      return;
    }

    if (selectedTags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setInputValue("");
      setIsOpen(false);
      return;
    }

    const updated = [...selectedTags, clean];
    onChange(updated);
    setInputValue("");
    setIsOpen(false);
  };

  const removeTag = (tag: string) => {
    const updated = selectedTags.filter((t) => t !== tag);
    onChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "," || e.key === ";") {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  return (
    <div className='space-y-2' ref={containerRef}>
      <label className='font-medium text-foreground text-sm' htmlFor='tag-input-field'>
        Tags / Nhãn bài viết
      </label>

      {/* Selected tags list */}
      <div className='flex min-h-[36px] flex-wrap gap-1.5 rounded-lg border bg-muted/20 p-1.5'>
        {selectedTags.length === 0 ? (
          <span className='self-center px-1 text-muted-foreground text-xs'>Chưa có tag nào</span>
        ) : (
          selectedTags.map((tag) => (
            <Badge
              className='flex items-center gap-1 py-0.5 pr-1 pl-2.5 font-medium text-xs'
              key={tag}
              variant='secondary'
            >
              {tag}
              <button
                className='rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground'
                onClick={() => removeTag(tag)}
                title={`Xóa tag ${tag}`}
                type='button'
              >
                <X className='h-3 w-3' />
              </button>
            </Badge>
          ))
        )}
      </div>

      {/* Input container */}
      <div className='relative'>
        <div className='flex gap-2'>
          <Input
            className='h-9 text-xs'
            id='tag-input-field'
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder='Nhập tên tag rồi nhấn Enter hoặc Dấu phẩy...'
            value={inputValue}
          />
          <Button className='h-9 shrink-0 px-3' onClick={() => addTag(inputValue)} size='sm' type='button'>
            <Plus className='mr-1 h-4 w-4' />
            Thêm
          </Button>
        </div>

        {/* Suggestion Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div className='fade-in-50 slide-in-from-top-1 absolute z-50 mt-1 max-h-48 w-full animate-in overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md outline-none'>
            <div className='p-1'>
              <p className='px-2 py-1 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider'>
                Gợi ý tag sẵn có
              </p>
              {suggestions.map((suggestion) => (
                <button
                  className='relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-left text-xs outline-none hover:bg-accent hover:text-accent-foreground'
                  key={suggestion.id}
                  onClick={() => addTag(suggestion.name)}
                  type='button'
                >
                  <span className='truncate'>{suggestion.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
