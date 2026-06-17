// Helper function that takes in request params and cleans out any undefined values
export const cleanParams = (params: Record<string, string | undefined>): Record<string, string> => {
  const defined = Object.entries(params).filter(([, value]) => value != undefined) as [
    string,
    string,
  ][];
  return Object.fromEntries(defined);
};
