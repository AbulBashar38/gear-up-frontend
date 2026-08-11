import Link from "next/link";

type BrandMarkProps = {
  inverse?: boolean;
  compact?: boolean;
};

export function BrandMark({
  inverse = false,
  compact = false,
}: BrandMarkProps) {
  return (
    <Link
      href="/"
      aria-label="GearUp home"
      className="group inline-flex min-h-11 items-center gap-2.5 rounded-sm"
    >
      <span
        aria-hidden="true"
        className="surface-accent grid size-9 rotate-3 place-items-center bg-orange text-xl font-black text-ink transition-transform duration-300 group-hover:-rotate-3"
      >
        /
      </span>
      <span
        className={`font-display text-[1.7rem] font-black tracking-[-0.035em] ${inverse ? "text-paper" : "text-ink"}`}
      >
        GEAR
        <span className={inverse ? "text-orange" : "text-signal"}>/</span>
        UP
      </span>
      {!compact && (
        <span
          className={`hidden border-l pl-2 text-[0.58rem] font-bold uppercase leading-[1.1] tracking-[0.2em] sm:block ${inverse ? "border-paper/25 text-paper/60" : "border-ink/20 text-ink/70"}`}
        >
          Gear
          <br />
          rental
        </span>
      )}
    </Link>
  );
}
