import {
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  createAudioResource,
} from "@discordjs/voice";

import type { AudioPlayer } from "@discordjs/voice";
import ytdl from "ytdl-core";

type Status = "idle" | "paused" | "playing";

export class Bot {
  static fetchResource(url: string): AudioResource | null {
    try {
      const stream = ytdl(url, { filter: "audioonly" });

      return createAudioResource(stream);
    }
    catch (error) {
      console.error(error);
      console.error({ url });

      return null;
    }
  }

  audioPlayer: AudioPlayer = createAudioPlayer();

  trackUrls: string[] = [];
  index: number = 0;

  loopQueue: boolean = false;
  loopCurrentTrack: boolean = false;

  private _status: Status = "idle";

  get status(): Status {
    return this._status;
  }

  get currentUrl(): string | null {
    return this.trackUrls.at(this.index) ?? null;
  }

  constructor(readonly guildId: string) {
    this.audioPlayer.on(AudioPlayerStatus.Paused, () => this._status = "paused");

    this.audioPlayer.on(AudioPlayerStatus.Playing, () => this._status = "playing");

    this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
      this._status = "idle";

      if (!this.loopCurrentTrack) {
        this.index++;
      }

      if (this.index < 0) {
        this.index = this.trackUrls.length;
      }

      if (this.loopQueue) {
        this.index %= this.trackUrls.length;
      }
      else if (this.index > this.trackUrls.length) {
        this.index = this.trackUrls.length;
      }

      this.playCurrentTrack();
    });
  }

  playCurrentTrack(): boolean {
    const url = this.currentUrl;

    if (url === null) {
      return false;
    }

    const resource = Bot.fetchResource(url);

    if (resource === null) {
      return false;
    }

    this.audioPlayer.play(resource);
    return true;
  }
}
