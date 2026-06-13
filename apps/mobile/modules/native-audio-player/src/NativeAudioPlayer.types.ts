export type SetTestEvent = {
  message: string;
};

export type NativeAudioPlayerEvents = {
  onSetTest: (event: SetTestEvent) => void;
};
