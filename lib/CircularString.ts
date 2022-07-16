import { GeometryType, Geometry, Point, LineString } from "./internal";

/**
 * Circular String, Curve sub type
 *
 * @author osbornb
 */
export class CircularString extends LineString {

	public constructor();
	public constructor(hasZ: boolean, hasM: boolean);
	public constructor(geometry: Geometry);

	/**
	 * Constructor
	 */
	public constructor(...args) {
		if (args.length === 0) {
			super(GeometryType.CIRCULARSTRING, false, false);
		} else if (args.length === 2) {
			super(GeometryType.CIRCULARSTRING, args[0], args[1]);
		} else if (args.length === 1 && args[0] instanceof CircularString) {
			super(GeometryType.CIRCULARSTRING, args[0].hasZ, args[1].hasM);
			args[0].points.forEach(point => this.addPoint(point.copy() as Point));
		} else if (args.length === 1 && args[0].length != null) {
			super(GeometryType.CIRCULARSTRING, Geometry.hasZ(args[0]), Geometry.hasM(args[0]));
			args[0].forEach(point => this.addPoint(point.copy()))
		} else if (args.length === 3) {
			super(args[0], args[1], args[2]);
		}
	}

	/**
	 * {@inheritDoc}
	 */
	public copy(): Geometry {
		return new CircularString(this);
	}
}
