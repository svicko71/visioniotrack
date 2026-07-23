import { ImgHTMLAttributes, useState } from "react";

const PLACEHOLDER = "/placeholder.svg";

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

/**
 * Image with graceful fallback, lazy loading, and skeleton state.
 * Never breaks layout when src is missing / broken / slow.
 */
export const SafeImage = ({ src, fallback = PLACEHOLDER, alt = "", className, onError, onLoad, ...rest }: Props) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const finalSrc = !src || errored ? fallback : src;

  return (
    <img
      {...rest}
      src={finalSrc}
      alt={alt}
      loading={rest.loading ?? "lazy"}
      decoding={rest.decoding ?? "async"}
      referrerPolicy={rest.referrerPolicy ?? "no-referrer"}
      className={className}
      style={{
        ...rest.style,
        transition: "opacity 200ms",
        opacity: loaded || errored ? 1 : 0.35,
        backgroundColor: loaded ? undefined : "hsl(var(--muted))",
      }}
      onLoad={(e) => { setLoaded(true); onLoad?.(e); }}
      onError={(e) => { setErrored(true); setLoaded(true); onError?.(e); }}
    />
  );
};

export default SafeImage;
