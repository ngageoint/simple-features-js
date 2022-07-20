import { GeometryType, Geometry, Surface, Curve, UnsupportedOperationException } from "./internal";

/**
 * A planar surface defined by an exterior ring and zero or more interior ring.
 * Each ring is defined by a Curve instance.
 * @param <T> curve type
 */
export class CurvePolygon<T extends Curve> extends Surface {
	/**
	 * List of rings
	 */
	private _rings: Array<T>;

	public constructor();
	public constructor(hasZ: boolean, hasM: boolean);
	public constructor(rings: Array<T>);
	public constructor(ring: T);
	public constructor(curvePolygon: CurvePolygon<T>);
	public constructor(type: GeometryType, hasZ: boolean, hasM: boolean);

	/**
	 * Constructor
	 */
	public constructor (...args) {
		if (args.length === 0) {
			super(GeometryType.CURVEPOLYGON, false, false);
			this._rings = [];
		} else if (args.length === 2) {
			super(GeometryType.CURVEPOLYGON, args[0], args[1]);
			this._rings = [];
		} else if (args.length === 1 && args[0].length != null) {
			super(GeometryType.CURVEPOLYGON, Geometry.hasZ(args[0]), Geometry.hasM(args[0]));
			this.rings = args[0] || [];
		} else if (args.length === 1 && args[0] instanceof Curve) {
			super(GeometryType.CURVEPOLYGON, args[0].hasZ, args[0].hasM);
			this._rings = [];
			this.addRing(args[0] as T);
		} else if (args.length === 1 && args[0] instanceof CurvePolygon) {
			super(GeometryType.CURVEPOLYGON, args[0].hasZ, args[0].hasM);
			this._rings = [];
			args[0].rings.forEach(ring => this.addRing(ring.copy() as T))
		} else if (args.length === 3) {
			super(args[0], args[1], args[2]);
			this._rings = [];
		}
	}


	/**
	 * Get the rings
	 * @return rings
	 */
	public get rings(): Array<T> {
		return this._rings;
	}

	/**
	 * Set the rings
	 * @param rings rings
	 */
	public set rings(rings: Array<T>) {
		this._rings = [];
		rings.forEach(ring => this.addRing(ring));
	}

	/**
	 * Add a ring
	 * @param ring ring
	 */
	public addRing(ring: T): void {
		this._rings.push(ring);
		this.updateZM(ring);
	}

	/**
	 * Add rings
	 * @param rings rings
	 */
	public addRings(rings: Array<T>): void {
		rings.forEach(ring => this.addRing(ring));
	}

	/**
	 * Get the number of rings including exterior and interior
	 * @return number of rings
	 */
	public numRings(): number {
		return this._rings.length;
	}

	/**
	 * Returns the Nth ring where the exterior ring is at 0, interior rings
	 * begin at 1
	 * @param n nth ring to return
	 * @return ring
	 */
	public getRing (n: number): Curve {
		return this._rings[n];
	}

	/**
	 * Get the exterior ring
	 * 
	 * @return exterior ring
	 */
	public getExteriorRing (): T {
		return this._rings[0];
	}

	/**
	 * Get the number of interior rings
	 * 
	 * @return number of interior rings
	 */
	public numInteriorRings(): number {
		return this._rings.length - 1;
	}

	/**
	 * Returns the Nth interior ring for this Polygon
	 * @param n interior ring number
	 * @return interior ring
	 */
	public getInteriorRing(n: number): T {
		return this._rings[n + 1];
	}

	/**
	 * {@inheritDoc}
	 */
	public copy(): Geometry {
		return new CurvePolygon(this);
	}

	/**
	 * {@inheritDoc}
	 */
	public isEmpty(): boolean {
		return this._rings.length === 0;
	}

	/**
	 * {@inheritDoc}
	 */
	public isSimple(): boolean {
		throw new UnsupportedOperationException("Is Simple not implemented for CurvePolygon");
	}

	/**
	 * {@inheritDoc}
	 */
	public equals(obj: Geometry): boolean {
		let equal = true;
		if (obj instanceof CurvePolygon) {
			if (this.numRings() === obj.numRings()) {
				for (let i = 0; i < this.numRings(); i++) {
					if (!this.getRing(i).equals(obj.getRing(i))) {
						equal = false;
						break;
					}
				}
			} else {
				equal = false;
			}
		} else {
			equal = false;
		}
		return equal
	}
}
