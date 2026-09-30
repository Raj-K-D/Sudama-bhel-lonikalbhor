import clsx from 'clsx';

interface LiveBackgroundProps {
  isDark?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Animated gradient background — replaces Flutter's LiveBackground widget.
 * isDark=true → Tamarind Brown dark theme (admin panel)
 * isDark=false → Warm Off-White theme (customer pages)
 */
export default function LiveBackground({ isDark = false, children, className }: LiveBackgroundProps) {
  return (
    <div
      className={clsx(
        'relative min-h-screen overflow-hidden',
        isDark ? 'bg-accent-brown' : 'bg-background',
        className,
      )}
    >
      {/* Animated background blobs */}
      <div
        className={clsx(
          'pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20 blur-3xl animate-pulse',
          isDark ? 'bg-primary' : 'bg-primary',
        )}
      />
      <div
        className={clsx(
          'pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full opacity-10 blur-3xl animate-pulse delay-700',
          isDark ? 'bg-accent-gold' : 'bg-accent-gold',
        )}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
