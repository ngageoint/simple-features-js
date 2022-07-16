import { Point } from "../../internal";

/**
 * Line segment of an edge between two points
 */
export class Segment {

	/**
	 * Edge number
	 */
	private readonly _edge: number;

	/**
	 * Polygon ring number
	 */
	private readonly _ring: number;

	/**
	 * Left point
	 */
	private readonly _leftPoint: Point;

	/**
	 * Right point
	 */
	private readonly _rightPoint: Point;

	/**
	 * Segment above
	 */
	private _above: Segment;

	/**
	 * Segment below
	 */
	private _below: Segment;

	/**
	 * Constructor
	 * @param edge edge number
	 * @param ring ring number
	 * @param leftPoint left point
	 * @param rightPoint right point
	 */
	public constructor(edge: number, ring: number, leftPoint: Point, rightPoint: Point) {
		this._edge = edge;
		this._ring = ring;
		this._leftPoint = leftPoint;
		this._rightPoint = rightPoint;
	}

	/**
	 * Get the edge number
	 * 
	 * @return edge number
	 */
	public get edge(): number {
		return this._edge;
	}

	/**
	 * Get the polygon ring number
	 * 
	 * @return polygon ring number
	 */
	public get ring(): number {
		return this._ring;
	}

	/**
	 * Get the left point
	 * 
	 * @return left point
	 */
	public get leftPoint(): Point {
		return this._leftPoint;
	}

	/**
	 * Get the right point
	 * 
	 * @return right point
	 */
	public get rightPoint(): Point {
		return this._rightPoint;
	}

	/**
	 * Get the segment above
	 * 
	 * @return segment above
	 */
	public get above(): Segment {
		return this._above;
	}

	/**
	 * Set the segment above
	 * 
	 * @param above
	 *            segment above
	 */
	public set above(above: Segment) {
		this._above = above;
	}

	/**
	 * Get the segment below
	 * 
	 * @return segment below
	 */
	public get below(): Segment {
		return this._below;
	}

	/**
	 * Set the segment below
	 * 
	 * @param below
	 *            segment below
	 */
	public set below(below: Segment) {
		this._below = below;
	}

}
