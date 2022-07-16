import { GeometryType, Geometry, Point } from "./internal";

/**
 * The base type for all 1-dimensional geometry types. A 1-dimensional geometry
 * is a geometry that has a length, but no area. A curve is considered simple if
 * it does not intersect itself (except at the start and end point). A curve is
 * considered closed its start and end point are coincident. A simple, closed
 * curve is called a ring.
 */
export abstract class Curve extends Geometry {
	/**
	 * Constructor
	 * @param type geometry type
	 * @param hasZ has z
	 * @param hasM has m
	 */
	protected constructor (type: GeometryType, hasZ: boolean, hasM: boolean) {
		super(type, hasZ, hasM);
	}

	/**
	 * Get the start Point of this Curve
	 *
	 * @return start point
	 */
	public abstract startPoint (): Point;

	/**
	 * Get the end Point of this Curve
	 *
	 * @return end point
	 */
	public abstract endPoint (): Point;

	/**
	 * Determine if this Curve is closed (start point = end point)
	 * @return true if closed
	 */
	public isClosed (): boolean {
		return !this.isEmpty() && this.startPoint().equals(this.endPoint());
	}

	/**
	 * Check for curve equality
	 */
	public abstract equals (obj: Geometry): boolean;

}
