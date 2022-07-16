import { GeometryType, Geometry, LineString, CurvePolygon, ShamosHoey } from "./internal";

/**
 * A restricted form of CurvePolygon where each ring is defined as a simple,
 * closed LineString.
 *
 */
export class Polygon extends CurvePolygon<LineString> {
	public constructor();
	public constructor(lineString: LineString);
	public constructor(polygon: Polygon);
	public constructor(lineStrings: Array<LineString>);
	public constructor(hasZ: boolean, hasM: boolean);
	public constructor(type: GeometryType, hasZ: boolean, hasM: boolean);

	/**
	 * Constructor
	 */
	public constructor (...args: any[]) {
		if (args.length === 0) {
			super(GeometryType.POLYGON, false, false);
		} else if (args.length === 1 && args[0] instanceof Polygon) {
			super(GeometryType.POLYGON, args[0].hasZ, args[0].hasM);
			args[0].rings.forEach(ring => this.addRing(ring.copy() as LineString));
		} else if (args.length === 1 && args[0] instanceof LineString) {
			super(GeometryType.POLYGON, args[0].hasZ, args[0].hasM);
			this.addRing(args[0]);
		}  else if (args.length === 1 && args[0].length != null) {
			super(GeometryType.POLYGON, args[0].hasZ, args[0].hasM);
			this.rings = (args[0] as Array<LineString>)
		} else if (args.length === 2) {
			super(GeometryType.POLYGON, args[0], args[1]);
		} else if (args.length === 3) {
			super(args[0], args[1], args[2]);
		}
	}

	/**
	 * {@inheritDoc}
	 */
	public copy(): Geometry {
		return new Polygon(this);
	}

	/**
	 * {@inheritDoc}
	 */
	public isSimple(): boolean {
		return ShamosHoey.simplePolygon(this);
	}
}
