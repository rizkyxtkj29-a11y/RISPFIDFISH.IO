export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

export function formatCoins(coins: number): string {
  return `${formatNumber(coins)} Koin`;
}

export function formatSecondsToTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs} detik`;
  return `${mins}m ${secs}d`;
}
