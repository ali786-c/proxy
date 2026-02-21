import { Link } from "react-router-dom";

interface InternalLinksProps {
  links: { to: string; label: string }[];
  title?: string;
}

export function InternalLinks({ links, title = "Related Services" }: InternalLinksProps) {
  return (
    <section className="border-t py-12">
      <div className="container">
        <h2 className="mb-6 text-xl font-bold">{title}</h2>
        <div className="flex flex-wrap gap-3">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-md border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
