import { GeometryType, Geometry, Point, GeometryCollection } from "./internal";

/**
 * A restricted form of GeometryCollection where each Geometry in the collection
 * must be of type Point.
 */

export class MultiPoint extends GeometryCollection<Point> {

	public constructor();
	public constructor(hasZ: boolean, hasM: boolean);
	public constructor(multiPoint: MultiPoint);
	public constructor(points: Array<Point>);
	public constructor(type: GeometryType, hasZ: boolean, hasM: boolean);

	/**
	 * Constructor
	 */
	public constructor(...args) {
		if (args.length === 0) {
			super(GeometryType.MULTIPOINT, false, false);
		} else if (args.length === 2) {
			super(GeometryType.MULTIPOINT, args[0], args[1]);
		} else if (args.length === 1 && args[0] instanceof Point) {
			super(GeometryType.MULTIPOINT, args[0].hasZ, args[0].hasM);
			this.addPoint(args[0]);
		} else if (args.length === 1 && args[0] instanceof MultiPoint) {
			super(GeometryType.MULTIPOINT, args[0].hasZ, args[0].hasM);
			args[0].points.forEach(point => this.addPoint(point));
		} else if (args.length === 1 && args[0].length != null) {
			super(GeometryType.MULTIPOINT, GeometryCollection.hasZ(args[0]), GeometryCollection.hasM(args[0]));
			this.points = args[0];
		} else if (args.length === 3) {
			super(args[0], args[1], args[2]);
		}
	}

	/**
	 * Get the points
	 * @return points
	 */
	public get points(): Array<Point> {
		return this.geometries;
	}

	/**
	 * Set the points
	 * @param points points
	 */
	public set points(points: Array<Point>) {
		this.geometries = points;
	}

	/**
	 * Add a point
	 * @param point point
	 */
	public addPoint(point: Point): void {
		this.addGeometry(point);
	}

	/**
	 * Add points
	 * @param points points
	 */
	public addPoints(points: Array<Point>): void {
		this.addGeometries(points);
	}

	/**
	 * Get the number of points
	 * @return number of points
	 */
	public numPoints(): number {
		return this.numGeometries();
	}

	/**
	 * Returns the Nth point
	 * 
	 * @param n nth point to return
	 * @return point
	 */
	public getPoint(n: number): Point{
		return this.getGeometry(n);
	}

	/**
	 * {@inheritDoc}
	 */
	public copy(): Geometry {
		return new MultiPoint(this);
	}

	/**
	 * {@inheritDoc}
	 */
	public isSimple(): boolean {
		return this.points.filter((pA, index) => {
			return this.points.findIndex(pB => pA.equals(pB)) === index;
		}).length == this.numPoints();
	}
}
