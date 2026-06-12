export type SetTestEvent = {
  message: string;
};

export type NativeAudioPlayerEvents = {
  onSetTest: (params: SetTestEvent) => void;
};
