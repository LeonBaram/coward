import {
	AudioPlayerStatus,
	createAudioPlayer,
	createAudioResource,
	getVoiceConnection
} from "@discordjs/voice";

import { AudioPlayer } from "@discordjs/voice";

import ytdl from "ytdl-core";

import { Queue } from "./Queue";

export class Bot {
	player: AudioPlayer = createAudioPlayer();
	queue: Queue<string> = new Queue();
	loopQueue: boolean = false;
	loopCurrentTrack: boolean = false;
	private _paused: boolean = false;

	constructor(readonly guildId: string) {
		const { player, queue } = this;

		queue.on('nonempty', () => this.attemptPlayback());

		player.on(AudioPlayerStatus.Idle, () => {
			if (!this.loopCurrentTrack) {
				queue.index++;
			}
			if (this.loopQueue) {
				queue.index %= queue.length;
			}
			this.attemptPlayback();
		});

		player.on(AudioPlayerStatus.Paused, () => {
			this._paused = true;
		});

		player.on(AudioPlayerStatus.Playing, () => {
			this._paused = false;
		});
	}

	get paused(): boolean {
		return this._paused;
	}

	get playing(): boolean {
		return !this._paused;
	}

	set paused(val: boolean) {
		if (val) {
			this.player.pause();
		} else {
			this.player.unpause();
		}
	}

	set playing(val: boolean) {
		if (val) {
			this.player.unpause();
		} else {
			this.player.pause();
		}
	}

	private attemptPlayback() {
		const { guildId, player, queue } = this;

		const connection = getVoiceConnection(guildId) ?? null;

		if (connection !== null) {
			while (queue.length > 0) {
				try {
					const url = queue.current!;
					const stream = ytdl(url, { filter: 'audioonly' });
					const resource = createAudioResource(stream);

					connection.subscribe(player);
					player.play(resource);
					return;
				} catch (err) {
					console.error(err);
					queue.remove();
				}
			}
		}
	}
}
