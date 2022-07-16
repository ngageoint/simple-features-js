import { SFException, GeometryType, Geometry, Point, GeometryCollection, MultiLineString, LineString, CompoundCurve, GeometryUtils } from "../../internal";

/**
 * Calculate the centroid from curve based geometries. Implementation based on
 * the JTS (Java Topology Suite) CentroidLine.
 */
export class CentroidCurve {

	/**
	 * Sum of curve point locations
	 */
	private _sum = new Point();

	/**
	 * Total length of curves
	 */
	private _totalLength = 0;


	public constructor();
	public constructor(geometry: Geometry);

	/**
	 * Constructor
	 */
	public constructor (...args) {
		if (args.length === 1 && args[0] instanceof Geometry) {
			this.add(args[0])
		}
	}


	/**
	 * Add a curve based dimension 1 geometry to the centroid total. Ignores
	 * dimension 0 geometries.
	 * @param geometry geometry
	 */
	public add(geometry: Geometry): void {
		const geometryType = geometry.geometryType;
		switch (geometryType) {
		case GeometryType.LINESTRING:
		case GeometryType.CIRCULARSTRING:
			this.addLineString(geometry as LineString);
			break;
		case GeometryType.MULTILINESTRING:
			this.addLineStrings((geometry as MultiLineString).lineStrings);
			break;
		case GeometryType.COMPOUNDCURVE:
			this.addLineStrings((geometry as CompoundCurve).lineStrings);
			break;
		case GeometryType.GEOMETRYCOLLECTION:
		case GeometryType.MULTICURVE:
		case GeometryType.MULTISURFACE:
			(geometry as GeometryCollection<Geometry>).geometries.forEach(geometry => {
				this.add(geometry)
			})
			break;
		case GeometryType.POINT:
		case GeometryType.MULTIPOINT:
			// Doesn't contribute to curve dimension
			break;
		default:
			throw new SFException("Unsupported CentroidCurve Geometry Type: " + geometryType);
		}
	}

	/**
	 * Add line strings to the centroid total
	 * @param lineStrings line strings
	 */
	private addLineStrings(lineStrings: Array<LineString>): void {
		lineStrings.forEach(lineString => this.addLineString(lineString))
	}

	/**
	 * Add a line string to the centroid total
	 * @param lineString line string
	 */
	private addLineString(lineString: LineString): void {
		this.addPoints(lineString.points);
	}

	/**
	 * Add points to the centroid total
	 * 
	 * @param points
	 *            points
	 */
	private addPoints(points: Array<Point>): void {
		for (let i = 0; i < points.length - 1; i++) {
			let point = points[i];
			let nextPoint = points[i + 1];
			let length = GeometryUtils.distance(point, nextPoint);
			this._totalLength += length;
			let midX = (point.x + nextPoint.x) / 2;
			this._sum.x = this._sum.x + (length * midX);
			let midY = (point.y + nextPoint.y) / 2;
			this._sum.y = this._sum.y + (length * midY);
		}
	}

	/**
	 * Get the centroid point
	 * @return centroid point
	 */
	public getCentroid(): Point {
		return new Point(this._sum.x / this._totalLength, this._sum.y / this._totalLength);
	}

}
