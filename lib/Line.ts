import { Geometry, Point, LineString, SFException } from "./internal";

/**
 * A LineString with exactly 2 Points.
 */
export class Line extends LineString {
	public constructor();
	public constructor(hasZ: boolean, hasM: boolean);
	public constructor(points: Array<Point>);
	public constructor(line: Line);

	/**
	 * Constructor
	 */
	public constructor (...args) {
		if (args.length === 0) {
			super(false, false);
		} else if (args.length === 1 && args[0] instanceof Line) {
			super(args[0].hasZ, args[0].hasM);
			args[0].points.forEach(point => this.addPoint(point.copy() as Point));
		} else if (args.length === 1 && args[0].length != null) {
			super(Geometry.hasZ(args[0]), Geometry.hasM(args[0]));
			this.points = args[0];
		} else if (args.length === 2) {
			super(args[0], args[1]);
		}
	}

	/**
	 * {@inheritDoc}
	 */
	public set points(points: Array<Point>) {
		// @ts-ignore
		super.points = points;
		if (this.numPoints() != 2) {
			throw new SFException("A line must have exactly 2 points.");
		}
	}

	/**
	 * {@inheritDoc}
	 */
	public copy(): Geometry {
		return new Line(this);
	}
}
