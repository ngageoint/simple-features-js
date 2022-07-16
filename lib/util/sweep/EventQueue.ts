import { LineString, Point, Event, EventType, SweepLine } from "../../internal";
import * as TimSort from 'timsort';
/**
 * Event queue for processing events
 */
export class EventQueue implements Iterable<Event> {

	/**
	 * List of events
	 */
	private _events: Array<Event> = []

	public constructor(ring: LineString);
	public constructor(rings: Array<LineString>);

	public constructor(...args) {
		if (args.length === 1 && args[0] instanceof LineString) {
			this.addRing(args[0], 0)
			this.sort();
		} else if (args.length === 1) {
			for (let i = 0; i < args[0].length; i++) {
				this.addRing(args[0][i], i);
			}
			this.sort();
		}
	}

	/**
	 * Add a ring to the event queue
	 * @param ring polygon ring
	 * @param ringIndex ring index
	 */
	private addRing(ring: LineString, ringIndex: number): void {
		const points: Array<Point> = ring.points;

		for (let i = 0; i < points.length; i++) {

			const point1 = points[i];
			const point2 = points[(i + 1) % points.length];

			let type1: EventType = null;
			let type2: EventType = null;
			if (SweepLine.xyOrder(point1, point2) < 0) {
				type1 = EventType.LEFT;
				type2 = EventType.RIGHT;
			} else {
				type1 = EventType.RIGHT;
				type2 = EventType.LEFT;
			}

			this._events.push(new Event(i, ringIndex, point1, type1));
			this._events.push(new Event(i, ringIndex, point2, type2));
		}
	}

	/**
	 * Sort the events
	 */
	private sort(): void {
		TimSort.sort(this._events, (a, b) => SweepLine.xyOrder(a.point, b.point));
	}

	[Symbol.iterator](): Iterator<Event> {
		return this._events[Symbol.iterator]();
	}

}
