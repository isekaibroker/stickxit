import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, copy, action }: { eyebrow: string; title: ReactNode; copy?: string; action?: ReactNode }) {
  return (
    <div className="section-heading">
      <div><span className="section-kicker">{eyebrow}</span><h2>{title}</h2>{copy ? <p>{copy}</p> : null}</div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
