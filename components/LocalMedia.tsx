"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getLocalMediaUrl } from "@/lib/media-storage";

export function LocalMedia({
  mediaId,
  alt,
  className,
}: {
  mediaId: string;
  alt: string;
  className?: string;
}) {
  const [source, setSource] = useState("");

  useEffect(() => {
    let active = true;
    let objectUrl = "";
    void getLocalMediaUrl(mediaId)
      .then((value) => {
        if (!active || !value) return;
        objectUrl = value;
        setSource(value);
      })
      .catch(() => {
        if (active) setSource("");
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mediaId]);

  if (!source) return null;
  return <Image className={className} src={source} alt={alt} fill unoptimized sizes="(max-width: 760px) 100vw, 33vw" />;
}
