import Image from "next/image";
import { existsSync } from "node:fs";
import path from "node:path";

export default function Loading() {
  const logo = existsSync(
    path.join(process.cwd(), "public/images/logo/hanam-bbq-logo.png"),
  );
  return (
    <div className="page-boot" role="status" aria-label="Hanam BBQ Mongolia">
      {logo ? (
        <Image
          src="/images/logo/hanam-bbq-logo.png"
          alt="Hanam BBQ Mongolia"
          width={648}
          height={212}
          priority
        />
      ) : (
        <span>Hanam BBQ Mongolia</span>
      )}
    </div>
  );
}
