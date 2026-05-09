import { useState } from 'react';

interface NavLink {
  label: string;
  href: string;
}

interface Props {
  navLinks: NavLink[];
  langSwitchHref: string;
  langSwitchLabel: string;
  ctaLabel: string;
  ctaHref: string;
}

export default function NavbarMobileDrawer({
  navLinks,
  langSwitchHref,
  langSwitchLabel,
  ctaLabel,
  ctaHref,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="p-2 text-[#142E56] hover:text-[#FF7100] transition-colors"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-x-0 top-[6.25rem] bottom-0 bg-white z-40 flex flex-col p-6 gap-1 border-t border-gray-100 shadow-lg">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-base font-semibold text-[#142E56] py-3 border-b border-gray-100 hover:text-[#FF7100] transition-colors"
            >
              {link.label}
            </a>
          ))}

          <div className="flex flex-col gap-3 pt-6">
            <a
              href={langSwitchHref}
              className="text-sm font-semibold text-center px-4 py-2.5 rounded border border-gray-300 text-gray-600"
            >
              {langSwitchLabel}
            </a>
            <a
              href={ctaHref}
              onClick={() => setOpen(false)}
              className="text-sm font-bold text-center px-6 py-3 rounded-full bg-[#FF7100] text-white hover:bg-[#EC7333] transition-colors"
            >
              {ctaLabel}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
