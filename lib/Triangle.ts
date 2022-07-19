import { GeometryType, Geometry, LineString, Polygon } from "./internal";

/**
 * Triangle
 */
export class Triangle extends Polygon {
	public constructor();
	public constructor(lineString: LineString);
	public constructor(triangle: Triangle);
	public constructor(lineStrings: Array<LineString>);
	public constructor(hasZ: boolean, hasM: boolean);
	public constructor(type: GeometryType, hasZ: boolean, hasM: boolean);

	/**
	 * Constructor
	 */
	public constructor (...args: any[]) {
		if (args.length === 0) {
			super(GeometryType.TRIANGLE, false, false);
		} else if (args.length === 1 && args[0] instanceof Triangle) {
			super(GeometryType.TRIANGLE, args[0].hasZ, args[0].hasM);
			args[0].rings.forEach(ring => this.addRing(ring.copy() as LineString));
		} else if (args.length === 1 && args[0] instanceof LineString) {
			super(GeometryType.TRIANGLE, args[0].hasZ, args[0].hasM);
			this.addRing(args[0]);
		}  else if (args.length === 1 && args[0].length != null) {
			super(GeometryType.TRIANGLE, args[0].hasZ, args[0].hasM);
			this.rings = (args[0] as Array<LineString>)
		} else if (args.length === 2) {
			super(GeometryType.TRIANGLE, args[0], args[1]);
		} else if (args.length === 3) {
			super(args[0], args[1], args[2]);
		}
	}

	/**
	 * {@inheritDoc}
	 */
	public copy(): Geometry {
		return new Triangle(this);
	}
}
