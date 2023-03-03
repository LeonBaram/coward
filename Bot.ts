import {
	createAudioPlayer,
	createAudioResource,
	getVoiceConnection
} from "@discordjs/voice";

import type { AudioPlayer } from "@discordjs/voice";

import ytdl from "ytdl-core";

import { Queue } from "./Queue";

export class Bot {
	player: AudioPlayer = createAudioPlayer();
	queue: Queue<string> = new Queue();
	loopQueue: boolean = false;
	loopCurrentTrack: boolean = false;

	constructor(readonly guildId: string) {
		const { player, queue } = this;

		queue.on('grow', () => {
			const connection = getVoiceConnection(guildId) ?? null;
			if (connection !== null) {
				while (queue.length > 0) {
					try {
						const url = queue.current!;
						const stream = ytdl(url, { filter: 'audioonly' });
						const resource = createAudioResource(stream);
						connection.subscribe(player);
						player.play(resource);
						break;
					} catch (err) {
						console.error(err);
						queue.index++;
					}
				}
			}
		});
	}
}
