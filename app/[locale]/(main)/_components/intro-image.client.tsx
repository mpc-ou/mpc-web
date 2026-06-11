"use client";

import Image from "next/image";
import { EditorWindow } from "@/components/custom/editor-window.client";

const IntroImageClient = () => {
  return (
    <EditorWindow showLineNumbers={false} showStatusBar title='we-at-web-design-2026.jpg'>
      <div className='relative aspect-4/3 w-full overflow-hidden bg-muted'>
        <Image
          alt='MPC Club Activities'
          className='object-cover'
          fill
          sizes='(max-width: 1024px) 100vw, 50vw'
          src='/images/bg/about.jpg'
        />
      </div>
    </EditorWindow>
  );
};

export { IntroImageClient };
