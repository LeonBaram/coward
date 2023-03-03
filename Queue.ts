import { EventEmitter } from "events";

interface QueueEvents {
	'end': () => void;
	'grow': () => void;
}

export interface Queue<T> {
	on<E extends keyof QueueEvents>(
		event: E,
		listener: QueueEvents[E]
	): this;

	emit<E extends keyof QueueEvents>(
		event: E,
		...args: Parameters<QueueEvents[E]>
	): boolean;
}

export class Queue<T> extends EventEmitter {
	private array: T[] = [];
	private _index: number = 0;

	constructor() {
		super();
	}

	get current(): T | null {
		return this.ended ? null : this.array[this.index];
	}

	get index(): number {
		return this._index;
	}

	get length(): number {
		return this.array.length;
	}

	get ended(): boolean {
		return this.index >= this.length;
	}

	[Symbol.iterator] = this.array[Symbol.iterator];

	get contents(): T[] {
		return [...this];
	}

	private modify(func: () => void): void {
		const wasEnded = this.ended;

		func();

		if (this.index < 0) {
			this._index = 0;
		}
		if (this.ended) {
			this._index = this.length - 1;
		}

		if (wasEnded !== this.ended) {
			if (this.ended) {
				this.emit('end');
			} else {
				this.emit('grow');
			}
		}
	}

	set index(val: number) {
		this.modify(() => {
			this._index = val;
		});
	}

	push(...args: T[]): void {
		this.modify(() => {
			this.array.push(...args);
		});
	}

	clear(): void {
		this.modify(() => {
			this.array = [];
		});
	}

	shuffle(): void {
		this.modify(() => {
			for (let i = this.length - 1; i >= 0; i--) {
				const j = Math.floor(Math.random() * i);
				[this.array[i], this.array[j]] = [this.array[j], this.array[i]];
			}
		});
	}

	remove(index: number = this.index): void {
		this.modify(() => {
			this.array.splice(index, 1);
		});
	}

	insert(index: number = this.index, ...args: T[]): void {
		this.modify(() => {
			this.array.splice(index, 0, ...args);
		});
	}
}
