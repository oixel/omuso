// Helper function that takes in request params and cleans out any undefined values
export function cleanParams(params: Record<string, any | undefined>): Record<string, any> {
  const defined = Object.entries(params).filter(([, value]) => value != undefined) as [
    string,
    any,
  ][];
  return Object.fromEntries(defined);
}
