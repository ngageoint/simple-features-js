import { Geometry, Point, LineString, Polygon } from "./internal";

/**
 * Geometry envelope
 */
export class GeometryEnvelope {
	/**
	 * Min X
	 */
	private _minX: number;

	/**
	 * Max X
	 */
	private _maxX: number;

	/**
	 * Min Y
	 */
	private _minY: number;

	/**
	 * Max Y
	 */
	private _maxY: number;

	/**
	 * True if has z coordinates
	 */
	private _hasZ: boolean = false;

	/**
	 * Min Z
	 */
	private _minZ: number;

	/**
	 * Max Z
	 */
	private _maxZ: number;

	/**
	 * True if has M measurements
	 */
	private _hasM: boolean = false;

	/**
	 * Min M
	 */
	private _minM: number;

	/**
	 * Max M
	 */
	private _maxM: number;

	public constructor();
	public constructor(envelope: GeometryEnvelope);
	public constructor(hasZ: boolean, hasM: boolean);
	public constructor(minX: number, minY: number, maxX: number, maxY: number);
	public constructor(minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number);
	public constructor(minX: number, minY: number, minZ: number, minM: number, maxX: number, maxY: number, maxZ: number, maxM: number);
	public constructor(minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number);

	/**
	 * Constructor
	 */
	constructor (...args) {
		if (args.length === 1 && args[0] instanceof GeometryEnvelope) {this.minX = args[0].minX;
		  this.maxX = args[0].maxX;
		  this.minY = args[0].minY;
		  this.maxY = args[0].maxY;
		  this.hasZ = args[0].hasZ;
		  this.minZ = args[0].minZ;
		  this.maxZ = args[0].maxZ;
		  this.hasM = args[0].hasM;
		  this.minM = args[0].minM;
		  this.maxM = args[0].maxM;
		} else if (args.length === 2) {

		} else if (args.length === 4) {

		} else if (args.length === 6) {

		} else if (args.length === 8) {

		}
	}

	/**
	 * True if has Z coordinates
	 * 
	 * @return has z
	 * @see #hasZ()
	 */
	public is3D (): boolean {
		return this.hasZ;
	}
	/**
	 * True if has M measurements
	 * @return has m
	 * @see #hasM()
	 */
	public isMeasured (): boolean {
		return this.hasM;
	}

	/**
	 * Get min x
	 * @return min x
	 */
	public get minX () {
		return this._minX;
	}

	/**
	 * Set min x
	 * @param minX min x
	 */
	public set minX (minX: number) {
		this._minX = minX;
	}

	/**
	 * Get max x
	 * @return max x
	 */
	public get maxX (): number {
		return this._maxX;
	}

	/**
	 * Set max x
	 * @param maxX max x
	 */
	public set maxX(maxX: number) {
		this._maxX = maxX;
	}

	/**
	 * Get min y
	 * @return min y
	 */
	public get minY (): number {
		return this._minY;
	}

	/**
	 * Set min y
	 * @param minY min y
	 */
	public set minY (minY: number) {
		this._minY = minY;
	}

	/**
	 * Get max y
	 * @return max y
	 */
	public get maxY () {
		return this._maxY;
	}

	/**
	 * Set max y
	 * @param maxY max y
	 */
	public set maxY (maxY: number) {
		this._maxY = maxY;
	}

	/**
	 * True if has Z coordinates
	 * @return has z
	 */
	public get hasZ (): boolean {
		return this._hasZ;
	}

	/**
	 * Set has z coordinates
	 * @param hasZ has z
	 */
	public set hasZ (hasZ: boolean) {
		this._hasZ = hasZ;
	}

	/**
	 * Get min z
	 * @return min z
	 */
	public get minZ (): number {
		return this._minZ;
	}

	/**
	 * Set min z
	 * @param minZ min z
	 */
	public set minZ (minZ: number) {
		this._minZ = minZ;
	}

	/**
	 * Get max z
	 * @return max z
	 */
	public get maxZ (): number {
		return this._maxZ;
	}

	/**
	 * Set max z
	 * @param maxZ max z
	 */
	public set maxZ (maxZ: number) {
		this._maxZ = maxZ;
	}

	/**
	 * Has m coordinates
	 * @return true if has m coordinates
	 */
	public get hasM (): boolean {
		return this._hasM;
	}

	/**
	 * Set has m coordinates
	 * @param hasM has m
	 */
	public set hasM (hasM: boolean) {
		this._hasM = hasM;
	}

	/**
	 * Get min m
	 * @return min m
	 */
	public get minM (): number {
		return this._minM;
	}

	/**
	 * Set min m
	 * @param minM min m
	 */
	public set minM(minM: number) {
		this._minM = minM;
	}

	/**
	 * Get max m
	 * @return max m
	 */
	public get maxM (): number {
		return this._maxM;
	}

	/**
	 * Set max m
	 * @param maxM max m
	 */
	public set maxM(maxM: number) {
		this._maxM = maxM;
	}

	/**
	 * Get the x range
	 * @return x range
	 */
	public get xRange(): number {
		return this._maxX - this._minX;
	}

	/**
	 * Get the y range
	 * @return y range
	 */
	public get yRange (): number {
		return this._maxY - this._minY;
	}

	/**
	 * Get the z range
	 * @return z range
	 */
	public get zRange (): number {
		let range = null;
		if (this._minZ != null && this._maxZ != null) {
			range = this._maxZ - this._minZ;
		}
		return range;
	}

	/**
	 * Get the m range
	 * @return m range
	 */
	public get mRange(): number {
		let range = null;
		if (this._minM != null && this._maxM != null) {
			range = this._maxM - this._minM;
		}
		return range;
	}

	/**
	 * Determine if the envelope is of a single point
	 * @return true if a single point bounds
	 * @since 2.0.5
	 */
	public isPoint (): boolean {
		return this._minX === this._maxX && this._minY === this._maxY
	}

	/**
	 * Get the envelope centroid point
	 * @return centroid point
	 */
	public get centroid (): Point {
		return new Point((this._minX + this._maxX) / 2.0, (this._minY + this._maxY) / 2.0);
	}

	/**
	 * Determine if intersects with the provided envelope
	 * @param envelope geometry envelope
	 * @param allowEmpty allow empty ranges when determining intersection
	 * @return true if intersects
	 */
	public intersects (envelope: GeometryEnvelope, allowEmpty: boolean): boolean {
		return this.overlap(envelope, allowEmpty) != null;
	}

	/**
	 * Get the overlapping geometry envelope with the provided envelope
	 * @param envelope geometry envelope
	 * @param allowEmpty allow empty ranges when determining intersection
	 * @return geometry envelope
	 */
	public overlap (envelope: GeometryEnvelope, allowEmpty: boolean = false): GeometryEnvelope {
		const minX = Math.max(this.minX, envelope.minX);
		const maxX = Math.min(this.maxX, envelope.maxX);
		const minY = Math.max(this.minY, envelope.minY);
		const maxY = Math.min(this.maxY, envelope.maxY);

		let overlap: GeometryEnvelope = null;

		if ((minX < maxX && minY < maxY) || (allowEmpty && minX <= maxX && minY <= maxY)) {
			overlap = new GeometryEnvelope(minX, minY, maxX, maxY);
		}

		return overlap;
	}

	/**
	 * Get the union geometry envelope combined with the provided envelope
	 * @param envelope geometry envelope
	 * @return geometry envelope
	 */
	public union (envelope: GeometryEnvelope): GeometryEnvelope {
		const minX = Math.max(this.minX, envelope.minX);
		const maxX = Math.min(this.maxX, envelope.maxX);
		const minY = Math.max(this.minY, envelope.minY);
		const maxY = Math.min(this.maxY, envelope.maxY);

		let union: GeometryEnvelope = null;

		if (minX < maxX && minY < maxY) {
			union = new GeometryEnvelope(minX, minY, maxX, maxY);
		}

		return union;
	}

	/**
	 * Determine if inclusively contains the provided envelope
	 * @param envelope geometry envelope
	 * @return true if contains
	 */
	public contains(envelope: GeometryEnvelope): boolean {
		return this.minX <= envelope.minX
				&& this.maxX >= envelope.maxX
				&& this.minY <= envelope.minY
				&& this.maxY >= envelope.maxY;
	}

	/**
	 * Build a geometry representation of the geometry envelope
	 * @return geometry, polygon or point
	 */
	public buildGeometry (): Geometry {
		let geometry: Geometry;
		if (this.isPoint()) {
			geometry = new Point(this.minX, this.minY);
		} else {
			let polygon = new Polygon();
			let ring = new LineString();
			ring.addPoint(new Point(this.minX, this.minY));
			ring.addPoint(new Point(this.maxX, this.minY));
			ring.addPoint(new Point(this.maxX, this.maxY));
			ring.addPoint(new Point(this.minX, this.maxY));
			polygon.addRing(ring);
			geometry = polygon;
		}
		return geometry;
	}

	/**
	 * Copy the geometry envelope
	 * @return geometry envelope copy
	 */
	public copy (): GeometryEnvelope {
		return new GeometryEnvelope(this);
	}

	/**
	 * {@inheritDoc}
	 */
	public equals(obj: GeometryEnvelope): boolean {
		return !(!(obj instanceof GeometryEnvelope)
			|| this.minX !== obj.minX
			|| this.maxX !== obj.maxX
			|| this.minY !== obj.minY
			|| this.maxY !== obj.maxY
			|| this.minZ !== obj.minZ
			|| this.maxZ !== obj.maxZ
			|| this.minM !== obj.minM
			|| this.maxM !== obj.maxM)
	}

}
