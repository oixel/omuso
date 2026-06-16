export class SubsonicError extends Error {
  constructor(
    public code: number,
    message: string
  ) {
    super(message);
    this.name = 'SubsonicError';
  }
}
