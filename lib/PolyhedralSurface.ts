import { GeometryType, Geometry, Surface, Polygon, UnsupportedOperationException } from "./internal";

/**
 * Contiguous collection of polygons which share common boundary segments.
 * 
 * @author osbornb
 */
export class PolyhedralSurface extends Surface {

	/**
	 * List of polygons
	 */
	private _polygons: Array<Polygon>;

	public constructor();
	public constructor(polygon: Polygon);
	public constructor(polyhedralSurface: PolyhedralSurface);
	public constructor(polygons: Array<Polygon>);
	public constructor(hasZ: boolean, hasM: boolean);
	public constructor(type: GeometryType, hasZ: boolean, hasM: boolean);

	/**
	 * Constructor
	 */
	public constructor (...args: any[]) {
		if (args.length === 0) {
			super(GeometryType.POLYHEDRALSURFACE, false, false);
			this._polygons = []
		} else if (args.length === 1 && args[0] instanceof Polygon) {
			super(GeometryType.POLYHEDRALSURFACE, args[0].hasZ, args[0].hasM);
			this._polygons = []
			this.addPolygon(args[0])
		} else if (args.length === 1 && args[0] instanceof PolyhedralSurface) {
			super(GeometryType.POLYHEDRALSURFACE, args[0].hasZ, args[0].hasM);
			this._polygons = []
			args[0].polygons.forEach(polygon => this.addPolygon(polygon.copy() as Polygon));
		}  else if (args.length === 1 && args[0].length != null) {
			super(GeometryType.POLYHEDRALSURFACE, args[0].hasZ, args[0].hasM);
			this._polygons = args[0]
		} else if (args.length === 2) {
			super(GeometryType.POLYHEDRALSURFACE, args[0], args[1]);
			this._polygons = []
		} else if (args.length === 3) {
			super(args[0], args[1], args[2]);
			this._polygons = []
		}
	}

	/**
	 * Get polygons
	 * @return polygons
	 */
	public get polygons(): Array<Polygon> {
		return this._polygons;
	}

	/**
	 * Get patches
	 * 
	 * @return patches
	 * @see #getPolygons()
	 */
	public get patches(): Array<Polygon> {
		return this._polygons;
	}

	/**
	 * Set polygons
	 * 
	 * @param polygons
	 *            polygons
	 */
	public set polygons(polygons: Array<Polygon>) {
		this._polygons = polygons;
	}

	/**
	 * Set patches
	 * 
	 * @param patches
	 *            patches
	 * @see #setPolygons(List)
	 */
	public set patches(polygons: Array<Polygon>) {
		this._polygons = polygons;
	}

	/**
	 * Add polygon
	 * @param polygon polygon
	 */
	public addPolygon(polygon: Polygon): void {
		this._polygons.push(polygon);
		this.updateZM(polygon);
	}

	/**
	 * Add patch
	 * @param patch patch
	 * @see #addPolygon(Polygon)
	 */
	public addPatch(patch: Polygon): void {
		this.addPolygon(patch);
	}

	/**
	 * Add polygons
	 * @param polygons polygons
	 */
	public addPolygons(polygons: Array<Polygon>): void {
		for (const polygon of polygons) {
			this.addPolygon(polygon);
		}
	}

	/**
	 * Add patches
	 * @param patches patches
	 * @see #addPolygons(List)
	 */
	public addPatches(patches: Array<Polygon>): void {
		this.addPolygons(patches);
	}

	/**
	 * Get the number of polygons
	 * @return number of polygons
	 */
	public numPolygons(): number {
		return this._polygons.length;
	}

	/**
	 * Get the number of polygons
	 * @return number of polygons
	 * @see #numPolygons()
	 */
	public numPatches(): number {
		return this.numPolygons();
	}

	/**
	 * Get the Nth polygon
	 * @param n nth polygon to return
	 * @return polygon
	 */
	public getPolygon(n: number): Polygon {
		return this._polygons[n];
	}

	/**
	 * Get the Nth polygon patch
	 * @param n nth polygon patch to return
	 * @return polygon patch
	 * @see #getPolygon(int)
	 */
	public getPatch(n: number): Polygon {
		return this.getPolygon(n);
	}

	/**
	 * {@inheritDoc}
	 */
	public copy(): Geometry {
		return new PolyhedralSurface(this);
	}

	/**
	 * {@inheritDoc}
	 */
	public isEmpty(): boolean {
		return this._polygons.length === 0;
	}

	/**
	 * {@inheritDoc}
	 */
	public isSimple(): boolean {
		throw new UnsupportedOperationException("Is Simple not implemented for PolyhedralSurface");
	}

	/**
	 * {@inheritDoc}
	 */
	public equals(obj: Geometry): boolean {
		let equal = true;
		if (obj instanceof PolyhedralSurface && this.numPatches() === obj.numPatches()) {
			for (let i = 0; i < this.numPatches(); i++) {
				if (!this.getPatch(i).equals(obj.getPatch(i))) {
					equal = false;
					break;
				}
			}
		} else {
			equal = false;
		}
		return equal
	}
}
