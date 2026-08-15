import Image from "next/image";
import { cn } from "../utils";

export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.jpg"
      alt="Atlas Forms"
      width={size}
      height={size}
      className={cn("rounded-lg object-cover", className)}
      style={{ width: size, height: size }}
      priority
    />
  );
}
