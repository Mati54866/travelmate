import { useEffect, useState } from "react";

const fallback = "/assets/feturedTour.avif";

const ImageGallery = ({ images = [] }) => {
  const source = images.length ? images : [fallback];
  const [selected, setSelected] = useState(source[0]);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setSelected(source[0]);
  }, [images, source]);

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="overflow-hidden rounded-[22px] border border-white/10 bg-[#0a1020] sm:rounded-[28px]"
        >
          <img src={selected} alt="Gallery preview" className="h-[240px] w-full object-cover sm:h-[300px] lg:h-[360px]" />
        </button>
        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
          {source.slice(0, 4).map((image) => (
            <button
              key={image}
              type="button"
              onClick={() => setSelected(image)}
              className={`overflow-hidden rounded-2xl border bg-[#0a1020] ${
                image === selected ? "border-[#75d780]" : "border-white/10"
              }`}
            >
              <img src={image} alt="Thumbnail" className="h-20 w-full object-cover sm:h-24 lg:h-[112px]" />
            </button>
          ))}
        </div>
      </div>
      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-5 top-5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900"
          >
            Close
          </button>
          <img
            src={selected}
            alt="Full size"
            className="max-h-[90vh] max-w-5xl rounded-[28px] object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
};

export default ImageGallery;
