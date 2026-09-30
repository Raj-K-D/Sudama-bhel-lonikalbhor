/** Replaces Flutter's _buildDashedLine() helper */
export default function DashedLine() {
  return (
    <div className="flex w-full">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 h-0.5"
          style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(139,113,75,0.4)' }}
        />
      ))}
    </div>
  );
}
