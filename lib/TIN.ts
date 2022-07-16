import { GeometryType, Geometry, PolyhedralSurface, Polygon } from "./internal";

/**
 * A tetrahedron (4 triangular faces), corner at the origin and each unit
 * coordinate digit.
 */
export class TIN extends PolyhedralSurface {
	public constructor();
	public constructor(polygon: Polygon);
	public constructor(tin: TIN);
	public constructor(polygons: Array<Polygon>);
	public constructor(hasZ: boolean, hasM: boolean);
	public constructor(type: GeometryType, hasZ: boolean, hasM: boolean);

	/**
	 * Constructor
	 */
	public constructor (...args: any[]) {
		if (args.length === 0) {
			super(GeometryType.TIN, false, false);
		} else if (args.length === 1 && args[0] instanceof Polygon) {
			super(GeometryType.TIN, args[0].hasZ, args[0].hasM);
			this.addPolygon(args[0])
		} else if (args.length === 1 && args[0] instanceof TIN) {
			super(GeometryType.TIN, args[0].hasZ, args[0].hasM);
			args[0].polygons.forEach(polygon => this.addPolygon(polygon.copy() as Polygon));
		}  else if (args.length === 1 && args[0].length != null) {
			super(GeometryType.TIN, args[0].hasZ, args[0].hasM);
			this.polygons = args[0]
		} else if (args.length === 2) {
			super(GeometryType.TIN, args[0], args[1]);
		} else if (args.length === 3) {
			super(args[0], args[1], args[2]);
		}
	}

	/**
	 * {@inheritDoc}
	 */
	public copy(): Geometry {
		return new TIN(this);
	}
}
