import { Suspense } from "react";

import { GalleryClient } from "@/components/gallery/GalleryClient";
import { GallerySkeleton } from "@/components/gallery/GallerySkeleton";
import { getTrades } from "@/lib/trades";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function GalleryPage() {
  return (
    <Suspense fallback={<GallerySkeleton />}>
      <GalleryContent />
    </Suspense>
  );
}

async function GalleryContent() {
  const tradeSource = await getTrades({ screenshotsOnly: true });

  return <GalleryClient {...tradeSource} />;
}
