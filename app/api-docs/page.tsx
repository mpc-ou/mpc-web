"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

function ApiDoc() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded && (window as any).SwaggerUIBundle) {
      (window as any).SwaggerUIBundle({
        url: "/api/docs",
        dom_id: "#swagger-ui"
      });
    }
  }, [loaded]);

  return (
    <div className='container mx-auto p-4'>
      <link href='https://unpkg.com/swagger-ui-dist@5/swagger-ui.css' rel='stylesheet' />
      <Script onLoad={() => setLoaded(true)} src='https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js' />
      <Link className='mb-4 font-bold text-2xl' href='/'>
        NextJS Faster
      </Link>
      <div className='swagger-ui-wrapper rounded-lg bg-white shadow-sm'>
        <div id='swagger-ui' />
      </div>
    </div>
  );
}

export default ApiDoc;
