import { SFException, GeometryType, Geometry, Point, GeometryCollection, MultiPoint } from "../../internal";

/**
 * Calculate the centroid from point based geometries. Implementation based on
 * the JTS (Java Topology Suite) CentroidPoint.
 */
export class CentroidPoint {
	/**
	 * Point count
	 */
	private _count: number = 0;

	/**
	 * Sum of point locations
	 */
	private _sum: Point = new Point();

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
	 * Add a point based dimension 0 geometry to the centroid total
	 * @param geometry geometry
	 */
	public add(geometry: Geometry): void {
		const geometryType: GeometryType = geometry.geometryType;
		switch (geometryType) {
		case GeometryType.POINT:
			this.addPoint(geometry as Point);
			break;
		case GeometryType.MULTIPOINT:
			let multiPoint: MultiPoint = geometry as MultiPoint;
			multiPoint.points.forEach(point => this.addPoint(point));
			break;
		case GeometryType.GEOMETRYCOLLECTION:
		case GeometryType.MULTICURVE:
		case GeometryType.MULTISURFACE:
			(geometry as GeometryCollection<Geometry>).geometries.forEach(subGeometry => this.add(subGeometry));
			break;
		default:
			throw new SFException("Unsupported CentroidPoint Geometry Type: " + geometryType);
		}
	}

	/**
	 * Add a point to the centroid total
	 * @param point point
	 */
	private addPoint(point: Point): void {
		this._count++;
		this._sum.x = this._sum.x + point.x;
		this._sum.y = this._sum.y + point.y;
	}

	/**
	 * Get the centroid point
	 * @return centroid point
	 */
	public getCentroid(): Point {
		return new Point(this._sum.x / this._count, this._sum.y / this._count);
	}

}
