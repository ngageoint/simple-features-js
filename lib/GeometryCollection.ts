import {
	GeometryType,
	Geometry,
	Curve,
	Surface,
	Point,
	LineString,
	Polygon,
	MultiPoint,
	MultiLineString,
	MultiPolygon,
	UnsupportedOperationException,
	SFException
} from './internal'

/**
 * A collection of zero or more Geometry instances.
 * @param <T> geometry type
 */
export class GeometryCollection<T extends Geometry> extends Geometry {

	/**
	 * List of geometries
	 */
	private _geometries: Array<T>;

	public constructor();
	public constructor(geometryCollection: GeometryCollection<T>);
	public constructor(geometries: Array<T>);
	public constructor(geometry: Geometry);
	public constructor(hasZ: boolean, hasM: boolean);
	public constructor(type: GeometryType, hasZ: boolean, hasM: boolean);

	/**
	 * Constructor
	 */
	public constructor(...args) {
		if (args.length === 0) {
			super(GeometryType.GEOMETRYCOLLECTION, false, false);
			this._geometries = [];
		} else if (args.length === 2) {
			super(GeometryType.GEOMETRYCOLLECTION, args[0], args[1]);
			this._geometries = [];
		} else if (args.length === 1 && args[0].length != null) {
			super(GeometryType.GEOMETRYCOLLECTION, Geometry.hasZ(args[0]), Geometry.hasM(args[0]));
			this.geometries = args[0] || [];
		} else if (args.length === 1 && args[0] instanceof GeometryCollection) {
			super(GeometryType.GEOMETRYCOLLECTION, args[0].hasZ, args[0].hasM);
			this._geometries = [];
			args[0].geometries.forEach(geometry => this.addGeometry(geometry))
		} else if (args.length === 1 && args[0] instanceof Geometry) {
			super(GeometryType.GEOMETRYCOLLECTION, args[0].hasZ, args[0].hasM);
			this._geometries = [];
			this.addGeometry(args[0] as T);
		} else if (args.length === 3) {
			super(args[0], args[1], args[2]);
			this._geometries = [];
		}
	}

	/**
	 * Get the list of geometries
	 * @return geometries
	 */
	public get geometries(): Array<T> {
		return this._geometries;
	}

	/**
	 * Set the geometries
	 * @param geometries geometries
	 */
	public set geometries(geometries: Array<T>) {
		this._geometries = [];
		geometries.forEach(geometry => this.addGeometry(geometry));
	}

	/**
	 * Add a geometry
	 * @param geometry geometry
	 */
	public addGeometry(geometry: T): void {
		this._geometries.push(geometry);
		this.updateZM(geometry);
	}

	/**
	 * Add geometries
	 * @param geometries geometries
	 */
	public addGeometries(geometries: Array<T>): void {
		geometries.forEach(geometry => this.addGeometry(geometry));
	}

	/**
	 * Get the number of geometries in the collection
	 * 
	 * @return number of geometries
	 */
	public numGeometries(): number {
		return this._geometries.length;
	}

	/**
	 * Returns the Nth geometry
	 * @param n nth geometry to return
	 * @return geometry
	 */
	public getGeometry(n: number): T {
		return this._geometries[n];
	}

	/**
	 * Get the collection type by evaluating the geometries
	 * @return collection geometry type, one of: {@link GeometryType#MULTIPOINT},
	 * 		   {@link GeometryType#MULTILINESTRING},
	 *         {@link GeometryType#MULTIPOLYGON},
	 *         {@link GeometryType#MULTICURVE},
	 *         {@link GeometryType#MULTISURFACE},
	 *         {@link GeometryType#GEOMETRYCOLLECTION}
	 */
	public getCollectionType(): GeometryType {
		let geometryType: GeometryType = this.geometryType;

		switch (geometryType) {
		case GeometryType.MULTIPOINT:
		case GeometryType.MULTILINESTRING:
		case GeometryType.MULTIPOLYGON:
			break;
		case GeometryType.GEOMETRYCOLLECTION:
		case GeometryType.MULTICURVE:
		case GeometryType.MULTISURFACE:
			if (this.isMultiPoint()) {
				geometryType = GeometryType.MULTIPOINT;
			} else if (this.isMultiLineString()) {
				geometryType = GeometryType.MULTILINESTRING;
			} else if (this.isMultiPolygon()) {
				geometryType = GeometryType.MULTIPOLYGON;
			} else if (this.isMultiCurve()) {
				geometryType = GeometryType.MULTICURVE;
			} else if (this.isMultiSurface()) {
				geometryType = GeometryType.MULTISURFACE;
			}
			break;
		default:
			throw new SFException("Unexpected Geometry Collection Type: " + geometryType);
		}

		return geometryType;
	}

	/**
	 * Determine if this geometry collection is a {@link MultiPoint} instance or
	 * contains only {@link Point} geometries
	 * @return true if a multi point or contains only points
	 */
	public isMultiPoint(): boolean {
		let isMultiPoint = this instanceof MultiPoint;
		if (!isMultiPoint) {
			isMultiPoint = this.isCollectionOfType(Point);
		}
		return isMultiPoint;
	}

	/**
	 * Get as a {@link MultiPoint}, either the current instance or newly created
	 * from the {@link Point} geometries
	 * 
	 * @return multi point
	 */
	public getAsMultiPoint (): MultiPoint {
		let multiPoint;
		if (this instanceof MultiPoint) {
			multiPoint = this as MultiPoint;
		} else {
			multiPoint = new MultiPoint(this._geometries as unknown as Array<Point>);
		}
		return multiPoint;
	}

	/**
	 * Determine if this geometry collection is a {@link MultiLineString}
	 * instance or contains only {@link LineString} geometries
	 * @return true if a multi line string or contains only line strings
	 */
	public isMultiLineString(): boolean {
		let isMultiLineString: boolean = this instanceof MultiLineString;
		if (!isMultiLineString) {
			isMultiLineString = this.isCollectionOfType(LineString);
		}
		return isMultiLineString;
	}

	/**
	 * Get as a {@link MultiLineString}, either the current instance or newly
	 * created from the {@link LineString} geometries
	 * @return multi line string
	 */
	public getAsMultiLineString(): MultiLineString {
		let multiLineString: MultiLineString;
		if (this instanceof MultiLineString) {
			multiLineString = this as MultiLineString;
		} else {
			multiLineString = new MultiLineString(this._geometries as unknown as Array<LineString>);
		}
		return multiLineString;
	}

	/**
	 * Determine if this geometry collection is a {@link MultiPolygon} instance
	 * or contains only {@link Polygon} geometries
	 * @return true if a multi polygon or contains only polygons
	 */
	public isMultiPolygon(): boolean {
		let isMultiPolygon: boolean = this instanceof MultiPolygon;
		if (!isMultiPolygon) {
			isMultiPolygon = this.isCollectionOfType(Polygon);
		}
		return isMultiPolygon;
	}

	/**
	 * Get as a {@link MultiPolygon}, either the current instance or newly
	 * created from the {@link Polygon} geometries
	 * 
	 * @return multi polygon
	 */
	public getAsMultiPolygon(): MultiPolygon {
		let multiPolygon: MultiPolygon;
		if (this instanceof MultiPolygon) {
			multiPolygon = this as MultiPolygon;
		} else {
			multiPolygon = new MultiPolygon(this._geometries as unknown as Array<Polygon>);
		}
		return multiPolygon;
	}

	/**
	 * Determine if this geometry collection contains only {@link Curve}
	 * geometries
	 * @return true if contains only curves
	 */
	public isMultiCurve(): boolean {
		let isMultiCurve: boolean = this instanceof MultiLineString;
		if (!isMultiCurve) {
			isMultiCurve = this.isCollectionOfType(Curve);
		}
		return isMultiCurve;
	}

	/**
	 * Get as a Multi Curve, a {@link Curve} typed Geometry Collection
	 * @return multi curve
	 */
	public getAsMultiCurve(): GeometryCollection<Curve> {
		let multiCurve: GeometryCollection<Curve>;
		if (this instanceof MultiLineString) {
			multiCurve = new GeometryCollection<Curve>(this.geometries);
		} else {
			multiCurve = this as unknown as GeometryCollection<Curve>;
			if (!multiCurve.isEmpty()) {
				const curve: Curve = multiCurve.getGeometry(0);
			}
		}
		return multiCurve;
	}

	/**
	 * Determine if this geometry collection contains only {@link Surface}
	 * geometries
	 * 
	 * @return true if contains only surfaces
	 */
	public isMultiSurface(): boolean {
		let isMultiSurface = this instanceof MultiPolygon;
		if (!isMultiSurface) {
			isMultiSurface = this.isCollectionOfType(Surface);
		}
		return isMultiSurface;
	}

	/**
	 * Get as a Multi Surface, a {@link Surface} typed Geometry Collection
	 * @return multi surface
	 */
	public getAsMultiSurface(): GeometryCollection<Surface> {
		let multiSurface: GeometryCollection<Surface>;
		if (this instanceof MultiPolygon) {
			multiSurface = new GeometryCollection<Surface>(this.geometries);
		} else {
			multiSurface = this as unknown as GeometryCollection<Curve>;
			if (!multiSurface.isEmpty()) {
				const surface: Surface = multiSurface.getGeometry(0);
			}
		}
		return multiSurface;
	}

	/**
	 * Get as a top level Geometry Collection
	 * @return geometry collection
	 */
	public getAsGeometryCollection (): GeometryCollection<Geometry> {
		return new GeometryCollection<Geometry>(this.geometries);
	}

	/**
	 * Determine if the geometries in this collection are made up only of the
	 * provided geometry class type
	 * @param type geometry class type
	 * @return true if a collection of the type
	 */
	private isCollectionOfType(type): boolean {
		let isType = true;
		for ( let i = 0; i < this._geometries.length; i++) {
			const geometry = this._geometries[i]
			if (!(geometry instanceof type)) {
				isType = false;
				break;
			}
		}
		return isType;
	}

	/**
	 * {@inheritDoc}
	 */
	public copy(): Geometry {
		return new GeometryCollection<T>(this);
	}

	/**
	 * {@inheritDoc}
	 */
	public isEmpty(): boolean {
		return this._geometries.length === 0;
	}

	/**
	 * {@inheritDoc}
	 */
	public isSimple(): boolean {
		throw new UnsupportedOperationException("Is Simple not implemented for GeometryCollection");
	}

	/**
	 * {@inheritDoc}
	 */
	public equals(obj: Geometry): boolean {
		let equals = true;
		if (obj instanceof GeometryCollection && this.numGeometries() === obj.numGeometries()) {
			for (let i = 0; i < this.numGeometries(); i++) {
				if (!this.getGeometry(i).equals(obj.getGeometry(i))) {
					equals = false;
					break;
				}
			}
		} else {
			equals = false;
		}
		return equals;
	}
}
