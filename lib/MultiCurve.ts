import { GeometryType, Curve, GeometryCollection } from "./internal";

/**
 * A restricted form of GeometryCollection where each Geometry in the collection
 * must be of type Curve.
 * @param <T> curve type
 */
export abstract class MultiCurve<T extends Curve> extends GeometryCollection<T> {


	/**
	 * Constructor
	 * @param type geometry type
	 * @param hasZ has z
	 * @param hasM has m
	 */
	protected constructor(type: GeometryType, hasZ: boolean, hasM: boolean) {
		super(type, hasZ, hasM);
	}

	/**
	 * Get the curves
	 * @return curves
	 */
	public getCurves(): Array<T> {
		return this.geometries;
	}

	/**
	 * Set the curves
	 * @param curves curves
	 */
	public setCurves(curves: Array<T>): void {
		this.geometries = curves;
	}

	/**
	 * Add a curve
	 * @param curve curve
	 */
	public addCurve(curve: T): void {
		this.addGeometry(curve);
	}

	/**
	 * Add curves
	 * @param curves curves
	 */
	public addCurves(curves: Array<T>): void {
		this.addGeometries(curves);
	}

	/**
	 * Get the number of curves
	 * @return number of curves
	 */
	public numCurves(): number {
		return this.numGeometries();
	}

	/**
	 * Returns the Nth curve
	 * @param n nth line curve to return
	 * @return curve
	 */
	public getCurve(n: number): T {
		return this.getGeometry(n);
	}

	/**
	 * Determine if this Multi Curve is closed for each Curve (start point = end
	 * point)
	 * 
	 * @return true if closed
	 */
	public isClosed(): boolean {
		let closed = true;
		for (const curve of this.geometries) {
			if (!curve.isClosed()) {
				closed = false;
				break;
			}
		}
		return closed;
	}

}
