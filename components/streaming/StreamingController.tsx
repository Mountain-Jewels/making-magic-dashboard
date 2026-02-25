"use client";

import { useEffect, useState } from "react";

interface StreamingControllerProps {
  activateStreaming: boolean;
  downgradeToGltf: boolean;
  streamingLock: boolean;
}

export default function StreamingController({
  activateStreaming,
  downgradeToGltf,
  streamingLock,
}: StreamingControllerProps) {
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (activateStreaming && !isStreaming) {
      setIsStreaming(true);
    }

    if (downgradeToGltf && !streamingLock) {
      setIsStreaming(false);
    }
  }, [activateStreaming, downgradeToGltf, streamingLock, isStreaming]);

  if (!isStreaming) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black">
      <iframe
        src={process.env.NEXT_PUBLIC_PIXEL_STREAM_URL}
        className="w-full h-full"
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
