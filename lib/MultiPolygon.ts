import { GeometryType, Geometry, Polygon, MultiSurface } from "./internal";

/**
 * A restricted form of MultiSurface where each Surface in the collection must
 * be of type Polygon.
 */
export class MultiPolygon extends MultiSurface<Polygon> {

	public constructor();
	public constructor(hasZ: boolean, hasM: boolean);
	public constructor(multiPolygon: MultiPolygon);
	public constructor(points: Array<Polygon>);
	public constructor(type: GeometryType, hasZ: boolean, hasM: boolean);

	/**
	 * Constructor
	 */
	public constructor(...args) {
		if (args.length === 0) {
			super(GeometryType.MULTIPOLYGON, false, false);
		} else if (args.length === 2) {
			super(GeometryType.MULTIPOLYGON, args[0], args[1]);
		} else if (args.length === 3) {
			super(args[0], args[1], args[2]);
		} else if (args.length === 1 && args[0] instanceof Polygon) {
			super(GeometryType.MULTIPOLYGON, args[0].hasZ, args[0].hasM);
			this.addPolygon(args[0]);
		} else if (args.length === 1 && args[0] instanceof MultiPolygon) {
			super(GeometryType.MULTIPOLYGON, args[0].hasZ, args[0].hasM);
			args[0].polygons.forEach(polygon => this.addPolygon(polygon));
		} else if (args.length === 1 && args[0].length != null) {
			super(GeometryType.MULTIPOLYGON, Geometry.hasZ(args[0]), Geometry.hasM(args[0]));
			this.polygons = (args[0] as Array<Polygon>);
		}
	}

	/**
	 * Get the polygons
	 * @return polygons
	 */
	public get polygons(): Array<Polygon> {
		return this.getSurfaces();
	}

	/**
	 * Set the polygons
	 * @param polygons polygons
	 */
	public set polygons(polygons: Array<Polygon>) {
		this.setSurfaces(polygons);
	}

	/**
	 * Add a polygon
	 * @param polygon polygon
	 */
	public addPolygon(polygon: Polygon): void {
		this.addSurface(polygon);
	}

	/**
	 * Add polygons
	 * @param polygons polygons
	 */
	public addPolygons(polygons: Array<Polygon>): void {
		this.addSurfaces(polygons);
	}

	/**
	 * Get the number of polygons
	 * @return number of polygons
	 */
	public numPolygons(): number {
		return this.numSurfaces();
	}

	/**
	 * Returns the Nth polygon
	 * @param n  nth polygon to return
	 * @return polygon
	 */
	public getPolygon(n: number): Polygon {
		return this.getSurface(n);
	}

	/**
	 * {@inheritDoc}
	 */
	public copy(): Geometry {
		return new MultiPolygon(this);
	}
}
