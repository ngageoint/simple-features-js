import { GeometryType, Geometry, Point, Curve, ShamosHoey } from "./internal";

/**
 * A Curve that connects two or more points in space.
 */
export class LineString extends Curve {
	/**
	 * List of points
	 */
	private _points: Array<Point>

	public constructor();
	public constructor(lineString: LineString);
	public constructor(points: Array<Point>);
	public constructor(hasZ: boolean, hasM: boolean);
	public constructor(type: GeometryType, hasZ: boolean, hasM: boolean);

	/**
	 * Constructor
	 */
	public constructor (...args: any[]) {
		if (args.length === 0) {
			super(GeometryType.LINESTRING, false, false);
			this._points = []
		} else if (args.length === 1 && args[0] instanceof LineString) {
			super(GeometryType.LINESTRING, args[0].hasZ, args[0].hasM);
			this._points = []
			args[0].points.forEach(point => this.addPoint(point.copy() as Point));
		} else if (args.length === 1 && args[0] instanceof Array) {
			super(GeometryType.LINESTRING, Geometry.hasZ(args[0]), Geometry.hasM(args[0]));
			this._points = []
			this.points = args[0]
		} else if (args.length === 2) {
			super(GeometryType.LINESTRING, args[0], args[1]);
			this._points = []
		} else if (args.length === 3) {
			super(args[0], args[1], args[2]);
			this._points = []
		}
	}

	/**
	 * Get the points
	 * @return points
	 */
	public get points (): Array<Point> {
		return this._points;
	}

	/**
	 * Set the points
	 * @param points points
	 */
	public set points (points: Array<Point>) {
		this._points = points;
	}

	/**
	 * Add a point
	 * @param point point
	 */
	public addPoint (point: Point): void {
		this._points.push(point);
		this.updateZM(point);
	}

	/**
	 * Add points
	 * @param points points
	 */
	public addPoints (points: Array<Point>): void {
		points.forEach(point => this.addPoint(point));
	}

	/**
	 * Get the number of points
	 * @return number of points
	 */
	public numPoints (): number {
		return this._points.length;
	}

	/**
	 * Returns the Nth point
	 * @param n nth point to return
	 * @return point
	 */
	public getPoint (n: number): Point {
		return this._points[n];
	}

	/**
	 * {@inheritDoc}
	 */
	public startPoint (): Point {
		let startPoint: Point = null;
		if (!this.isEmpty()) {
			startPoint = this._points[0];
		}
		return startPoint;
	}

	/**
	 * {@inheritDoc}
	 */
	public endPoint (): Point {
		let endPoint: Point = null;
		if (!this.isEmpty()) {
			endPoint = this._points[this.points.length - 1];
		}
		return endPoint;
	}

	/**
	 * {@inheritDoc}
	 */
	public isSimple (): boolean {
		return ShamosHoey.simplePolygonPoints(this._points);
	}

	/**
	 * {@inheritDoc}
	 */
	public copy(): Geometry {
		return new LineString(this);
	}

	/**
	 * {@inheritDoc}
	 */
	public isEmpty(): boolean {
		return this._points.length === 0;
	}

	/**
	 * {@inheritDoc}
	 */
	public equals(obj: Geometry): boolean {
		let equal = true
		if (obj instanceof LineString && this.numPoints() === obj.numPoints()) {
			for (let i = 0; i < this._points.length; i++) {
				if (!this.getPoint(i).equals(obj.getPoint(i))) {
					equal = false
					break
				}
			}
		} else {
			equal = false
		}
		return equal
	}
}
