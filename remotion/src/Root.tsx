import React from "react";
import { Composition } from "remotion";
import { MainVideo, TOTAL_FRAMES } from "./MainVideo";
import { AdVideo, AD_TOTAL } from "./AdVideo";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="main" component={MainVideo} durationInFrames={TOTAL_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="ad" component={AdVideo} durationInFrames={AD_TOTAL} fps={30} width={1920} height={1080} />
  </>
);
