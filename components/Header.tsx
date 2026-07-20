import Link from "next/link";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/notes", label: "Notes" },
  { href: "/tools", label: "Tools" },
  { href: "/tools/idea-vault", label: "Ideas" },
];

export function Header() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl flex-col items-start gap-5 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-8 md:px-10">
      <Link
        href="/"
        className="group flex items-center gap-2 font-display text-lg text-ink"
        aria-label="Yitian's Lab, home"
      >
        <span className="inline-block text-lavender transition-transform duration-300 group-hover:rotate-12">
          ✦
        </span>
        Yitian&apos;s Lab
      </Link>
      <nav aria-label="Main navigation">
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted sm:gap-6">
          {navigation.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="transition-colors duration-200 hover:text-ink"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
