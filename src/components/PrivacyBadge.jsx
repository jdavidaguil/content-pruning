export default function PrivacyBadge() {
  return (
    <div className="flex items-center gap-2 bg-green-950 border border-green-800 text-green-400 text-xs px-3 py-1.5 rounded-full">
      <span>🔒</span>
      <span>Your data and API keys never leave your device.</span>
    </div>
  );
}
