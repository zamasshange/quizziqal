type ContainedPhotoProps = {
  src: string;
  alt?: string;
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
};

/** Full subject visible — blurred fill behind, no aggressive crop. */
export default function ContainedPhoto({
  src,
  alt = "",
  className = "",
  onError,
  onLoad,
}: ContainedPhotoProps) {
  return (
    <div className={`relative overflow-hidden bg-ink ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-md"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={onLoad}
        onError={onError}
        className="relative z-10 h-full w-full object-contain p-1.5"
      />
    </div>
  );
}
