import { SFException, GeometryType, Geometry, Point, GeometryCollection, CurvePolygon, PolyhedralSurface, Polygon, LineString, CompoundCurve, GeometryUtils, Curve } from "../../internal";

/**
 * Centroid calculations for geometries in degrees
 *
 */
export class DegreesCentroid {

	/**
	 * Radians to Degrees conversion
	 */
	public static RADIANS_TO_DEGREES: number = 180.0 / Math.PI;

	/**
	 * Degrees to Radians conversion
	 */
	public static DEGREES_TO_RADIANS: number = Math.PI / 180.0;

	/**
	 * Geometry
	 */
	private _geometry: Geometry;

	/**
	 * Number of points
	 */
	private _points: number = 0;

	/**
	 * x sum
	 */
	private _x: number = 0;

	/**
	 * y sum
	 */
	private _y: number = 0;

	/**
	 * z sum
	 */
	private _z: number = 0;

	public constructor();
	public constructor(geometry: Geometry);

	/**
	 * Constructor
	 */
	public constructor (...args) {
		if (args.length === 1 && args[0] instanceof Geometry) {
			this._geometry = args[0];
		}
	}


	/**
	 * Get the degree geometry centroid
	 * @param geometry geometry
	 * @return centroid point
	 */
	public static getCentroid(geometry: Geometry): Point {
		return new DegreesCentroid(geometry).getCentroid();
	}

	/**
	 * Get the centroid point
	 * @return centroid point
	 */
	public getCentroid(): Point {
		let centroid: Point;

		if (this._geometry.geometryType == GeometryType.POINT) {
			centroid = this._geometry as Point
		} else {

			this.calculate(this._geometry);

			this._x = this._x / this._points;
			this._y = this._y / this._points;
			this._z = this._z / this._points;

			const centroidLongitude = Math.atan2(this._y, this._x);
			const centroidLatitude = Math.atan2(this._z, Math.sqrt(this._x * this._x + this._y * this._y));

			centroid = new Point(centroidLongitude * DegreesCentroid.RADIANS_TO_DEGREES, centroidLatitude * DegreesCentroid.RADIANS_TO_DEGREES);
		}

		return centroid;
	}

	/**
	 * Add to the centroid calculation for the Geometry
	 * 
	 * @param geometry
	 *            Geometry
	 */
	private calculate(geometry: Geometry): void {
		const geometryType = geometry.geometryType;

		switch (geometryType) {
			case GeometryType.GEOMETRY:
				throw new SFException("Unexpected Geometry Type of " + geometryType + " which is abstract");
			case GeometryType.POINT:
				this.calculatePoint(geometry as Point);
				break;
			case GeometryType.LINESTRING:
			case GeometryType.CIRCULARSTRING:
				this.calculateLineString(geometry as LineString);
				break;
			case GeometryType.POLYGON:
			case GeometryType.TRIANGLE:
				this.calculatePolygon(geometry as Polygon);
				break;
			case GeometryType.GEOMETRYCOLLECTION:
			case GeometryType.MULTIPOINT:
			case GeometryType.MULTICURVE:
			case GeometryType.MULTILINESTRING:
			case GeometryType.MULTISURFACE:
			case GeometryType.MULTIPOLYGON:
				this.calculateGeometryCollection(geometry as GeometryCollection<Geometry>);
				break;
			case GeometryType.COMPOUNDCURVE:
				this.calculateCompoundCurve(geometry as CompoundCurve);
				break;
			case GeometryType.CURVEPOLYGON:
				this.calculateCurvePolygon(geometry as CurvePolygon<Curve>);
				break;
			case GeometryType.CURVE:
				throw new SFException("Unexpected Geometry Type of "
						+ geometryType + " which is abstract");
			case GeometryType.SURFACE:
				throw new SFException("Unexpected Geometry Type of "
						+ geometryType + " which is abstract");
			case GeometryType.POLYHEDRALSURFACE:
			case GeometryType.TIN:
				this.calculatePolyhedralSurface(geometry as PolyhedralSurface);
				break;
			default:
				throw new SFException("Geometry Type not supported: " + geometryType);
		}
	}

	/**
	 * Add to the centroid calculation for the Point
	 * @param point Point
	 */
	private calculatePoint(point: Point): void {
		const latitude = point.y * DegreesCentroid.DEGREES_TO_RADIANS;
		const longitude = point.x * DegreesCentroid.DEGREES_TO_RADIANS;
		const cosLatitude = Math.cos(latitude);
		this._x += cosLatitude * Math.cos(longitude);
		this._y += cosLatitude * Math.sin(longitude);
		this._z += Math.sin(latitude);
		this._points++;
	}

	/**
	 * Add to the centroid calculation for the Line String
	 * @param lineString Line String
	 */
	private calculateLineString(lineString: LineString): void {
		lineString.points.forEach(point => this.calculatePoint(point));
	}

	/**
	 * Add to the centroid calculation for the Polygon
	 * @param polygon Polygon
	 */
	private calculatePolygon(polygon: Polygon): void {
		if (polygon.numRings() > 0) {
			const exteriorRing = polygon.getExteriorRing();
			let numPoints = exteriorRing.numPoints();
			if (GeometryUtils.closedPolygonRing(exteriorRing)) {
				numPoints--;
			}
			for (let i = 0; i < numPoints; i++) {
				this.calculatePoint(exteriorRing.getPoint(i));
			}
		}
	}

	/**
	 * Add to the centroid calculation for the Geometry Collection
	 * @param geometryCollection Geometry Collection
	 */
	private calculateGeometryCollection(geometryCollection: GeometryCollection<Geometry>) {
		for (const geometry of geometryCollection.geometries) {
			this.calculate(geometry);
		}
	}

	/**
	 * Add to the centroid calculation for the Compound Curve
	 * @param compoundCurve Compound Curve
	 */
	private calculateCompoundCurve(compoundCurve: CompoundCurve): void {

		for (const lineString of compoundCurve.lineStrings) {
			this.calculateLineString(lineString);
		}

	}

	/**
	 * Add to the centroid calculation for the Curve Polygon
	 * @param curvePolygon Curve Polygon
	 */
	private calculateCurvePolygon(curvePolygon: CurvePolygon<Curve>): void {

		for (const ring of curvePolygon.rings) {
			this.calculate(ring);
		}

	}

	/**
	 * Add to the centroid calculation for the Polyhedral Surface
	 * @param polyhedralSurface Polyhedral Surface
	 */
	private calculatePolyhedralSurface(polyhedralSurface: PolyhedralSurface): void {
		for (const polygon of polyhedralSurface.polygons) {
			this.calculatePolygon(polygon);
		}
	}

}
