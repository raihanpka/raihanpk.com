/** Label for the view counter. A failed load shows a dash, never a made-up 0. */
export function formatViews(views: number | null, error: boolean): string {
  if (views === null) return error ? '– views' : '… views'
  return `${views} views`
}
