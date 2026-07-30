interface AssetManifest {
  fonts?: Array<{ family: string; weight: string }>;
  video?: string;
  images?: string[];
}

export async function preloadAssets(
  manifest: AssetManifest,
  onProgress: (progress: number) => void
): Promise<void> {
  const total = 100;
  let loaded = 0;

  const report = (weight: number) => {
    loaded += weight;
    onProgress(Math.min(loaded, total));
  };

  if (manifest.fonts?.length) {
    await Promise.all(
      manifest.fonts.map(({ family, weight }) =>
        document.fonts.load(`${weight} 1em "${family}"`)
      )
    );
    report(20);
  }

  if (manifest.video) {
    await preloadVideo(manifest.video);
    report(40);
  }

  if (manifest.images?.length) {
    await Promise.all(manifest.images.map(preloadImage));
    report(25);
  }

  await new Promise((r) => setTimeout(r, 400));
  report(15);
}

function preloadVideo(src: string): Promise<void> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.addEventListener("canplaythrough", () => resolve(), { once: true });
    video.addEventListener("error", () => resolve(), { once: true });
    video.src = src;
    video.load();
  });
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}
