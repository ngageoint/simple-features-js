import { GeometryType, Geometry, Point, LineString, SFException } from "./internal";

/**
 * A LineString that is both closed and simple.
 */
export class LinearRing extends LineString {
	public constructor();
	public constructor(lineString: LineString);
	public constructor(points: Array<Point>);
	public constructor(hasZ: boolean, hasM: boolean);
	public constructor(type: GeometryType, hasZ: boolean, hasM: boolean);

	/**
	 * Constructor
	 */
	public constructor (...args) {
		if (args.length === 0) {
			super(args)
		} else if (args.length === 1 && args[0] instanceof LinearRing) {
			super(args[0].hasZ, args[0].hasM);
			args[0].points.forEach(point => this.addPoint(point.copy() as Point));
		} else if (args.length === 1 && args[0].length != null) {
			super(Geometry.hasZ(args[0]), Geometry.hasM(args[0]));
			this.points = args[0];
		} else if (args.length === 2) {
			super(args[0], args[1])
		}
	}


	/**
	 * {@inheritDoc}
	 */
	public set points(points: Array<Point>) {
		// @ts-ignore
		super.points = points;
		if (!this.isEmpty()) {
			if (!this.isClosed()) {
				this.addPoint(points[0]);
			}
			if (this.numPoints() < 4) {
				throw new SFException("A closed linear ring must have at least four points.");
			}
		}
	}

	/**
	 * {@inheritDoc}
	 */
	public copy(): Geometry {
		return new LinearRing(this);
	}

}
