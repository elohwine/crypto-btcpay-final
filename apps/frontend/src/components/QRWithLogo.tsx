import React, { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { useAppTheme } from "../lib/themeUtils";

type Props = {
  data: string;
  logoSrc?: string | null;
  size?: number;
  imageSize?: number; // fraction 0..1
  type?: "svg" | "canvas";
};

const QRWithLogo: React.FC<Props> = ({
  data,
  logoSrc = null,
  size = 200,
  imageSize = 0.18,
  type = "svg",
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const qrRef = useRef<any | null>(null);
  const { primary } = useAppTheme();

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;
    qrRef.current = new (QRCodeStyling as any)({
      width: size,
      height: size,
      data: data || "",
      margin: 8,
      type,
      image: logoSrc || undefined,
      dotsOptions: {
        color: primary || "var(--text)",
        type: "rounded",
      },
      cornersSquareOptions: {
        color: primary || "var(--text)",
        type: "extra-rounded",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 6,
        hideBackgroundDots: true,
        imageSize: imageSize,
      },
      qrOptions: {
        errorCorrectionLevel: "H",
      },
    });

    mountNode.innerHTML = "";
    qrRef.current.append(mountNode);

    return () => {
      try {
        mountNode.innerHTML = "";
        qrRef.current = null;
      } catch (e) {
        // ignore
      }
    };
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!qrRef.current) return;
    try {
      qrRef.current.update({
        data: data || "",
        image: logoSrc || undefined,
        width: size,
        height: size,
        imageOptions: { imageSize },
        dotsOptions: { color: primary || "var(--text)" },
        cornersSquareOptions: { color: primary || "var(--text)" },
      });
    } catch (e) {
      // ignore update errors
    }
  }, [data, logoSrc, size, imageSize, primary]);

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size, display: "inline-block" }}
      aria-hidden
    />
  );
};

export default QRWithLogo;
