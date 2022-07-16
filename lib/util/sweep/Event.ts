import { Point, Comparable, EventType, SweepLine } from "../../internal";

/**
 * Event element
 */
export class Event implements Comparable<Event> {

	/**
	 * Edge number
	 */
	private readonly _edge: number;

	/**
	 * Polygon ring number
	 */
	private readonly _ring: number;

	/**
	 * Polygon point
	 */
	private readonly _point: Point;

	/**
	 * Event type, left or right point
	 */
	private readonly _type: EventType;

	/**
	 * Constructor
	 * @param edge edge number
	 * @param ring ring number
	 * @param point point
	 * @param type event type
	 */
	public constructor(edge: number, ring: number, point: Point, type: EventType) {
		this._edge = edge;
		this._ring = ring;
		this._point = point;
		this._type = type;
	}

	/**
	 * Get the edge
	 * 
	 * @return edge number
	 */
	public get edge(): number {
		return this._edge;
	}

	/**
	 * Get the polygon ring number
	 * @return polygon ring number
	 */
	public get ring(): number {
		return this._ring;
	}

	/**
	 * Get the polygon point
	 * @return polygon point
	 */
	public get point(): Point {
		return this._point;
	}

	/**
	 * Get the event type
	 * @return event type
	 */
	public get type(): EventType {
		return this._type;
	}

	/**
	 * {@inheritDoc}
	 */
	public compareTo(other: Event): number {
		return SweepLine.xyOrder(this.point, other.point);
	}

}