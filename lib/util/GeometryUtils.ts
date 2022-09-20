import { List } from "tstl";
import {
	SFException,
	GeometryType,
	Geometry,
	CentroidPoint,
	Point,
	LineString,
	Polygon,
	MultiPoint,
	MultiLineString,
	MultiPolygon,
	CircularString,
	CompoundCurve,
	CurvePolygon,
	PolyhedralSurface,
	TIN,
	Triangle,
	GeometryCollection,
	CentroidSurface,
	DegreesCentroid,
	CentroidCurve,
	Curve,
	Line,
	GeometryConstants,
	GeometryEnvelope
} from "../internal";

/**
 * Utilities for Geometry objects
 */
export class GeometryUtils {

	/**
	 * Default epsilon for line tolerance
	 */
	public static DEFAULT_EPSILON: number = 0.000000000000001;

	/**
	 * Get the dimension of the Geometry, 0 for points, 1 for curves, 2 for
	 * surfaces. If a collection, the largest dimension is returned.
	 * @param geometry geometry object
	 * @return dimension (0, 1, or 2)
	 */
	public static getDimension(geometry: Geometry): number {
		let dimension: number = -1;

		const geometryType: GeometryType = geometry.geometryType;
		switch (geometryType) {
			case GeometryType.POINT:
			case GeometryType.MULTIPOINT:
				dimension = 0;
				break;
			case GeometryType.LINESTRING:
			case GeometryType.MULTILINESTRING:
			case GeometryType.CIRCULARSTRING:
			case GeometryType.COMPOUNDCURVE:
				dimension = 1;
				break;
			case GeometryType.POLYGON:
			case GeometryType.CURVEPOLYGON:
			case GeometryType.MULTIPOLYGON:
			case GeometryType.POLYHEDRALSURFACE:
			case GeometryType.TIN:
			case GeometryType.TRIANGLE:
				dimension = 2;
				break;
			case GeometryType.GEOMETRYCOLLECTION:
			case GeometryType.MULTICURVE:
			case GeometryType.MULTISURFACE:
				(geometry as GeometryCollection<Geometry>).geometries.forEach(subGeometry => {
					dimension = Math.max(dimension, GeometryUtils.getDimension(subGeometry));
				})
				break;
			default:
				throw new SFException("Unsupported Geometry Type: " + geometryType);
		}
		return dimension;
	}

	/**
	 * Get the Pythagorean theorem distance between two points
	 * @param point1 point 1
	 * @param point2 point 2
	 * @return distance
	 */
	public static distance(point1: Point, point2: Point): number {
		const diffX = point1.x - point2.x;
		const diffY = point1.y - point2.y;

		return Math.sqrt(diffX * diffX + diffY * diffY);
	}

	/**
	 * Get the Pythagorean theorem distance between the line end points
	 * 
	 * @param line
	 *            line
	 * @return distance
	 * @since 1.0.3
	 */
	public static distanceFromLine(line: Line): number {
		return GeometryUtils.distance(line.startPoint(), line.endPoint());
	}

	/**
	 * Get the bearing heading in degrees between two points in degrees
	 * 
	 * @param point1
	 *            point 1
	 * @param point2
	 *            point 2
	 * @return bearing angle in degrees between 0 and 360
	 * @since 1.0.3
	 */
	public static bearing(point1: Point, point2: Point): number {
		const y1 = GeometryUtils.degreesToRadians(point1.y);
		const y2 = GeometryUtils.degreesToRadians(point2.y);
		const xDiff = GeometryUtils.degreesToRadians(point2.x - point1.x);
		const y = Math.sin(xDiff) * Math.cos(y2);
		const x = Math.cos(y1) * Math.sin(y2)
			- Math.sin(y1) * Math.cos(y2) * Math.cos(xDiff);
		return (GeometryUtils.radiansToDegrees(Math.atan2(y, x)) + 360) % 360;
	}

	/**
	 * Get the bearing heading in degrees between line end points in degrees
	 * 
	 * @param line
	 *            line
	 * @return bearing angle in degrees between 0 inclusively and 360
	 *         exclusively
	 * @since 1.0.3
	 */
	public static bearingLine(line: Line): number {
		return GeometryUtils.bearing(line.startPoint(), line.endPoint());
	}

	/**
	 * Determine if the bearing is in any north direction
	 * 
	 * @param bearing
	 *            bearing angle in degrees
	 * @return true if north bearing
	 * @since 1.0.3
	 */
	public static isNorthBearing(bearing: number): boolean {
		bearing %= 360.0;
		return bearing < GeometryConstants.BEARING_EAST
			|| bearing > GeometryConstants.BEARING_WEST;
	}

	/**
	 * Determine if the bearing is in any east direction
	 * 
	 * @param bearing
	 *            bearing angle in degrees
	 * @return true if east bearing
	 * @since 1.0.3
	 */
	public static isEastBearing(bearing: number): boolean {
		bearing %= 360.0;
		return bearing > GeometryConstants.BEARING_NORTH
			&& bearing < GeometryConstants.BEARING_SOUTH;
	}

	/**
	 * Determine if the bearing is in any south direction
	 * 
	 * @param bearing
	 *            bearing angle in degrees
	 * @return true if south bearing
	 * @since 1.0.3
	 */
	public static isSouthBearing(bearing: number): boolean {
		bearing %= 360.0;
		return bearing > GeometryConstants.BEARING_EAST
			&& bearing < GeometryConstants.BEARING_WEST;
	}

	/**
	 * Determine if the bearing is in any west direction
	 * 
	 * @param bearing
	 *            bearing angle in degrees
	 * @return true if west bearing
	 * @since 1.0.3
	 */
	public static isWestBearing(bearing: number): boolean {
		return (bearing % 360.0) > GeometryConstants.BEARING_SOUTH;
	}

	/**
	 * Convert degrees to radians
	 * 
	 * @param degrees
	 *            degrees
	 * @return radians
	 * @since 1.0.3
	 */
	public static degreesToRadians(degrees: number): number {
		return degrees * GeometryConstants.DEGREES_TO_RADIANS;
	}

	/**
	 * Convert radians to degrees
	 * 
	 * @param radians
	 *            radians
	 * @return degrees
	 * @since 1.0.3
	 */
	public static radiansToDegrees(radians: number): number {
		return radians * GeometryConstants.RADIANS_TO_DEGREES;
	}

	/**
	 * Get the centroid point of a 2 dimensional representation of the Geometry
	 * (balancing point of a 2d cutout of the geometry). Only the x and y
	 * coordinate of the resulting point are calculated and populated. The
	 * resulting {@link Point#getZ()} and {@link Point#getM()} methods will
	 * always return null.
	 * @param geometry geometry object
	 * @return centroid point
	 */
	public static getCentroid(geometry: Geometry): Point {
		let centroid: Point = null;
		const dimension = GeometryUtils.getDimension(geometry);
		switch (dimension) {
			case 0:
				const point: CentroidPoint = new CentroidPoint(geometry);
				centroid = point.getCentroid();
				break;
			case 1:
				const curve: CentroidCurve = new CentroidCurve(geometry);
				centroid = curve.getCentroid();
				break;
			case 2:
				const surface: CentroidSurface = new CentroidSurface(geometry);
				centroid = surface.getCentroid();
				break;
		}
		return centroid;
	}

	/**
	 * Get the geographic centroid point of a 2 dimensional representation of
	 * the degree unit Geometry. Only the x and y coordinate of the resulting
	 * point are calculated and populated. The resulting {@link Point#getZ()}
	 * and {@link Point#getM()} methods will always return null.
	 * 
	 * @param geometry  geometry object
	 * @return centroid point
	 */
	public static getDegreesCentroid(geometry: Geometry): Point {
		return DegreesCentroid.getCentroid(geometry);
	}

	/**
	 * Minimize the WGS84 geometry using the shortest x distance between each
	 * connected set of points. Resulting x values will be in the range: -540.0
	 * &lt;= x &lt;= 540.0
	 * 
	 * @param geometry
	 *            geometry
	 * @since 1.0.3
	 */
	public static minimizeWGS84(geometry: Geometry): void {
		GeometryUtils.minimize(geometry, GeometryConstants.WGS84_HALF_WORLD_LON_WIDTH);
	}

	/**
	 * Minimize the Web Mercator geometry using the shortest x distance between
	 * each connected set of points. Resulting x values will be in the range:
	 * -60112525.028367732 &lt;= x &lt;= 60112525.028367732
	 * 
	 * @param geometry
	 *            geometry
	 * @since 1.0.3
	 */
	public static minimizeWebMercator(geometry: Geometry): void {
		GeometryUtils.minimize(geometry, GeometryConstants.WEB_MERCATOR_HALF_WORLD_WIDTH);
	}

	/**
	 * Minimize the geometry using the shortest x distance between each
	 * connected set of points. The resulting geometry point x values will be in
	 * the range: (3 * min value &lt;= x &lt;= 3 * max value
	 *
	 * Example: For WGS84 provide a max x of 180.0. Resulting x values will be
	 * in the range: -540.0 &lt;= x &lt;= 540.0
	 *
	 * Example: For web mercator provide a world width of 20037508.342789244.
	 * Resulting x values will be in the range: -60112525.028367732 &lt;= x
	 * &lt;= 60112525.028367732
	 *
	 * @param geometry geometry
	 * @param maxX max positive x value in the geometry projection
	 */
	public static minimizeGeometry(geometry: Geometry, maxX: number): void {
		GeometryUtils.minimize(geometry, maxX);
	}

	/**
	 * Minimize the geometry using the shortest x distance between each
	 * connected set of points. The resulting geometry point x values will be in
	 * the range: (3 * min value &lt;= x &lt;= 3 * max value
	 *
	 * Example: For WGS84 provide a max x of
	 * {@link GeometryConstants#WGS84_HALF_WORLD_LON_WIDTH}. Resulting x values
	 * will be in the range: -540.0 &lt;= x &lt;= 540.0
	 *
	 * Example: For web mercator provide a world width of
	 * {@link GeometryConstants#WEB_MERCATOR_HALF_WORLD_WIDTH}. Resulting x
	 * values will be in the range: -60112525.028367732 &lt;= x &lt;=
	 * 60112525.028367732
	 *
	 * @param geometry
	 *            geometry
	 * @param maxX
	 *            max positive x value in the geometry projection
	 * @since 1.0.3
	 */
	public static minimize(geometry: Geometry, maxX: number): void {
		const geometryType = geometry.geometryType;
		switch (geometryType) {
			case GeometryType.LINESTRING:
				GeometryUtils.minimizeLineString(geometry as LineString, maxX);
				break;
			case GeometryType.POLYGON:
				GeometryUtils.minimizePolygon(geometry as Polygon, maxX);
				break;
			case GeometryType.MULTILINESTRING:
				GeometryUtils.minimizeMultiLineString(geometry as MultiLineString, maxX);
				break;
			case GeometryType.MULTIPOLYGON:
				GeometryUtils.minimizeMultiPolygon(geometry as MultiPolygon, maxX);
				break;
			case GeometryType.CIRCULARSTRING:
				GeometryUtils.minimizeLineString(geometry as CircularString, maxX);
				break;
			case GeometryType.COMPOUNDCURVE:
				GeometryUtils.minimizeCompoundCurve(geometry as CompoundCurve, maxX);
				break;
			case GeometryType.CURVEPOLYGON:
				const curvePolygon = geometry as CurvePolygon<Curve>;
				GeometryUtils.minimizeCurvePolygon(curvePolygon, maxX);
				break;
			case GeometryType.POLYHEDRALSURFACE:
				GeometryUtils.minimizePolyhedralSurface(geometry as PolyhedralSurface, maxX);
				break;
			case GeometryType.TIN:
				GeometryUtils.minimizePolyhedralSurface(geometry as TIN, maxX);
				break;
			case GeometryType.TRIANGLE:
				GeometryUtils.minimizePolygon(geometry as Triangle, maxX);
				break;
			case GeometryType.GEOMETRYCOLLECTION:
			case GeometryType.MULTICURVE:
			case GeometryType.MULTISURFACE:
				const geomCollection = geometry as GeometryCollection<Geometry>;
				for (const subGeometry of geomCollection.geometries) {
					GeometryUtils.minimizeGeometry(subGeometry, maxX);
				}
				break;
			default:
				break;

		}
	}

	/**
	 * Minimize the line string
	 * 
	 * @param lineString
	 *            line string
	 * @param maxX
	 *            max positive x value in the geometry projection
	 */
	private static minimizeLineString(lineString: LineString, maxX: number): void {
		const points: Array<Point> = lineString.points;
		if (points.length > 1) {
			const point: Point = points[0];
			for (let i = 1; i < points.length; i++) {
				let nextPoint = points[i];
				if (point.x < nextPoint.x) {
					if (nextPoint.x - point.x > point.x
						- nextPoint.x + (maxX * 2.0)) {
						nextPoint.x = nextPoint.x - (maxX * 2.0);
					}
				} else if (point.x > nextPoint.x) {
					if (point.x - nextPoint.x > nextPoint.x
						- point.x + (maxX * 2.0)) {
						nextPoint.x = nextPoint.x + (maxX * 2.0);
					}
				}
			}
		}
	}

	/**
	 * Minimize the multi line string
	 * @param multiLineString multi line string
	 * @param maxX max positive x value in the geometry projection
	 */
	private static minimizeMultiLineString(multiLineString: MultiLineString, maxX: number): void {
		multiLineString.lineStrings.forEach(lineString => GeometryUtils.minimizeLineString(lineString, maxX));
	}

	/**
	 * Minimize the polygon
	 * @param polygon polygon
	 * @param maxX max positive x value in the geometry projection
	 */
	private static minimizePolygon(polygon: Polygon, maxX: number): void {
		polygon.rings.forEach(ring => GeometryUtils.minimizeLineString(ring, maxX));
	}

	/**
	 * Minimize the multi polygon
	 * @param multiPolygon multi polygon
	 * @param maxX max positive x value in the geometry projection
	 */
	private static minimizeMultiPolygon(multiPolygon: MultiPolygon, maxX: number): void {
		multiPolygon.polygons.forEach(polygon => GeometryUtils.minimizePolygon(polygon, maxX));
	}

	/**
	 * Minimize the compound curve
	 * @param compoundCurve compound curve
	 * @param maxX max positive x value in the geometry projection
	 */
	private static minimizeCompoundCurve(compoundCurve: CompoundCurve, maxX: number): void {
		compoundCurve.lineStrings.forEach(lineString => GeometryUtils.minimizeLineString(lineString, maxX));
	}

	/**
	 * Minimize the curve polygon
	 * @param curvePolygon curve polygon
	 * @param maxX max positive x value in the geometry projection
	 */
	private static minimizeCurvePolygon(curvePolygon: CurvePolygon<Curve>, maxX: number): void {
		curvePolygon.rings.forEach(ring => GeometryUtils.minimizeGeometry(ring, maxX));
	}

	/**
	 * Minimize the polyhedral surface
	 * @param polyhedralSurface polyhedral surface
	 * @param maxX max positive x value in the geometry projection
	 */
	private static minimizePolyhedralSurface(polyhedralSurface: PolyhedralSurface, maxX: number): void {
		polyhedralSurface.polygons.forEach(polygon => GeometryUtils.minimizePolygon(polygon, maxX));
	}

	/**
	 * Normalize the WGS84 geometry using the shortest x distance between each
	 * connected set of points. Resulting x values will be in the range: -180.0
	 * &lt;= x &lt;= 180.0
	 * 
	 * @param geometry
	 *            geometry
	 * @since 1.0.3
	 */
	public static normalizeWGS84(geometry: Geometry): void {
		GeometryUtils.normalize(geometry, GeometryConstants.WGS84_HALF_WORLD_LON_WIDTH);
	}

	/**
	 * Normalize the Web Mercator geometry using the shortest x distance between
	 * each connected set of points. Resulting x values will be in the range:
	 * -20037508.342789244 &lt;= x &lt;= 20037508.342789244
	 * 
	 * @param geometry
	 *            geometry
	 * @since 1.0.3
	 */
	public static normalizeWebMercator(geometry: Geometry): void {
		GeometryUtils.normalize(geometry, GeometryConstants.WEB_MERCATOR_HALF_WORLD_WIDTH);
	}

	/**
	 * Normalize the geometry so all points outside of the min and max value
	 * range are adjusted to fall within the range.
	 *
	 * Example: For WGS84 provide a max x of 180.0. Resulting x values will be
	 * in the range: -180.0 &lt;= x &lt;= 180.0.
	 *
	 * Example: For web mercator provide a world width of 20037508.342789244.
	 * Resulting x values will be in the range: -20037508.342789244 &lt;= x
	 * &lt;= 20037508.342789244.
	 *
	 * @param geometry geometry
	 * @param maxX max positive x value in the geometry projection
	 */
	public static normalizeGeometry(geometry: Geometry, maxX: number) {
		GeometryUtils.normalize(geometry, maxX);
	}

	/**
	 * Normalize the geometry so all points outside of the min and max value
	 * range are adjusted to fall within the range.
	 *
	 * Example: For WGS84 provide a max x of
	 * {@link GeometryConstants#WGS84_HALF_WORLD_LON_WIDTH}. Resulting x values
	 * will be in the range: -180.0 &lt;= x &lt;= 180.0
	 *
	 * Example: For web mercator provide a world width of
	 * {@link GeometryConstants#WEB_MERCATOR_HALF_WORLD_WIDTH}. Resulting x
	 * values will be in the range: -20037508.342789244 &lt;= x &lt;=
	 * 20037508.342789244
	 *
	 * @param geometry
	 *            geometry
	 * @param maxX
	 *            max positive x value in the geometry projection
	 * @since 1.0.3
	 */
	public static normalize(geometry: Geometry, maxX: number): void {
		const geometryType = geometry.geometryType;
		switch (geometryType) {
			case GeometryType.POINT:
				GeometryUtils.normalizePoint(geometry as Point, maxX);
				break;
			case GeometryType.LINESTRING:
				GeometryUtils.normalizeLineString(geometry as LineString, maxX);
				break;
			case GeometryType.POLYGON:
				GeometryUtils.normalizePolygon(geometry as Polygon, maxX);
				break;
			case GeometryType.MULTIPOINT:
				GeometryUtils.normalizeMultiPoint(geometry as MultiPoint, maxX);
				break;
			case GeometryType.MULTILINESTRING:
				GeometryUtils.normalizeMultiLineString(geometry as MultiLineString, maxX);
				break;
			case GeometryType.MULTIPOLYGON:
				GeometryUtils.normalizeMultiPolygon(geometry as MultiPolygon, maxX);
				break;
			case GeometryType.CIRCULARSTRING:
				GeometryUtils.normalizeLineString(geometry as CircularString, maxX);
				break;
			case GeometryType.COMPOUNDCURVE:
				GeometryUtils.normalizeCompoundCurve(geometry as CompoundCurve, maxX);
				break;
			case GeometryType.CURVEPOLYGON:
				GeometryUtils.normalizeCurvePolygon(geometry as CurvePolygon<Curve>, maxX);
				break;
			case GeometryType.POLYHEDRALSURFACE:
				GeometryUtils.normalizePolyhedralSurface(geometry as PolyhedralSurface, maxX);
				break;
			case GeometryType.TIN:
				GeometryUtils.normalizePolyhedralSurface(geometry as TIN, maxX);
				break;
			case GeometryType.TRIANGLE:
				GeometryUtils.normalizePolygon(geometry as Triangle, maxX);
				break;
			case GeometryType.GEOMETRYCOLLECTION:
			case GeometryType.MULTICURVE:
			case GeometryType.MULTISURFACE:
				for (const subGeometry of (geometry as GeometryCollection<Geometry>).geometries) {
					GeometryUtils.normalizeGeometry(subGeometry, maxX);
				}
				break;
			default:
				break;

		}

	}

	/**
	 * Normalize the point
	 * 
	 * @param point
	 *            point
	 * @param maxX
	 *            max positive x value in the geometry projection
	 */
	private static normalizePoint(point: Point, maxX: number): void {

		if (point.x < -maxX) {
			point.x = point.x + (maxX * 2.0);
		} else if (point.x > maxX) {
			point.x = point.x - (maxX * 2.0);
		}
	}

	/**
	 * Normalize the multi point
	 * @param multiPoint multi point
	 * @param maxX max positive x value in the geometry projection
	 */
	private static normalizeMultiPoint(multiPoint: MultiPoint, maxX: number): void {
		multiPoint.points.forEach(point => GeometryUtils.normalizePoint(point, maxX));
	}

	/**
	 * Normalize the line string
	 * @param lineString line string
	 * @param maxX max positive x value in the geometry projection
	 */
	private static normalizeLineString(lineString: LineString, maxX: number): void {
		lineString.points.forEach(point => GeometryUtils.normalizePoint(point, maxX));
	}

	/**
	 * Normalize the multi line string
	 * @param multiLineString  multi line string
	 * @param maxX max positive x value in the geometry projection
	 */
	private static normalizeMultiLineString(multiLineString: MultiLineString, maxX: number): void {
		multiLineString.lineStrings.forEach(lineString => GeometryUtils.normalizeLineString(lineString, maxX));
	}

	/**
	 * Normalize the polygon
	 * @param polygon polygon
	 * @param maxX max positive x value in the geometry projection
	 */
	private static normalizePolygon(polygon: Polygon, maxX: number): void {
		polygon.rings.forEach(ring => GeometryUtils.normalizeLineString(ring, maxX));
	}

	/**
	 * Normalize the multi polygon
	 * @param multiPolygon  multi polygon
	 * @param maxX  max positive x value in the geometry projection
	 */
	private static normalizeMultiPolygon(multiPolygon: MultiPolygon, maxX: number): void {
		multiPolygon.polygons.forEach(polygon => GeometryUtils.normalizePolygon(polygon, maxX));
	}

	/**
	 * Normalize the compound curve
	 * @param compoundCurve compound curve
	 * @param maxX max positive x value in the geometry projection
	 */
	private static normalizeCompoundCurve(compoundCurve: CompoundCurve, maxX: number): void {
		compoundCurve.lineStrings.forEach(lineString => GeometryUtils.normalizeLineString(lineString, maxX));
	}

	/**
	 * Normalize the curve polygon
	 * @param curvePolygon curve polygon
	 * @param maxX max positive x value in the geometry projection
	 */
	private static normalizeCurvePolygon(curvePolygon: CurvePolygon<Curve>, maxX: number): void {
		curvePolygon.rings.forEach(ring => GeometryUtils.normalizeGeometry(ring, maxX));
	}

	/**
	 * Normalize the polyhedral surface
	 * @param polyhedralSurface polyhedral surface
	 * @param maxX max positive x value in the geometry projection
	 */
	private static normalizePolyhedralSurface(polyhedralSurface: PolyhedralSurface, maxX: number): void {
		polyhedralSurface.polygons.forEach(polygon => GeometryUtils.normalizePolygon(polygon, maxX));
	}

	/**
	 * Normalize the x value
	 * 
	 * @param x
	 *            x value
	 * @param maxX
	 *            max positive x value in the geometry projection
	 */
	private static normalizeX(x: number, maxX: number): number {
		if (x < -maxX) {
			x = x + (maxX * 2.0);
		} else if (x > maxX) {
			x = x - (maxX * 2.0);
		}
		return x;
	}

	/**
	 * Simplify the ordered points (representing a line, polygon, etc) using the
	 * Douglas Peucker algorithm to create a similar curve with fewer points.
	 * Points should be in a meters unit type projection. The tolerance is the
	 * minimum tolerated distance between consecutive points.
	 *
	 * @param points geometry points
	 * @param tolerance minimum tolerance in meters for consecutive points
	 * @return simplified points
	 * @since 1.0.4
	 */
	public static simplifyPoints(points: Array<Point>, tolerance: number): Array<Point> {
		return GeometryUtils._simplifyPoints(points, tolerance, 0, points.length - 1);
	}

	/**
	 * Simplify the ordered points (representing a line, polygon, etc) using the
	 * Douglas Peucker algorithm to create a similar curve with fewer points.
	 * Points should be in a meters unit type projection. The tolerance is the
	 * minimum tolerated distance between consecutive points.
	 *
	 * @param points geometry points
	 * @param tolerance minimum tolerance in meters for consecutive points
	 * @param startIndex start index
	 * @param endIndex end index
	 * @return simplified points
	 */
	private static _simplifyPoints(points: Array<Point>, tolerance: number, startIndex: number, endIndex: number): Array<Point> {
		let result: Array<Point>;

		let dmax: number = 0.0;
		let index: number = 0;

		let startPoint: Point = points[startIndex];
		let endPoint: Point = points[endIndex];

		for (let i = startIndex + 1; i < endIndex; i++) {
			let point: Point = points[i];

			let d: number = GeometryUtils.perpendicularDistance(point, startPoint, endPoint);

			if (d > dmax) {
				index = i;
				dmax = d;
			}
		}

		if (dmax > tolerance) {
			const recResults1: Array<Point> = GeometryUtils._simplifyPoints(points, tolerance, startIndex, index);
			const recResults2: Array<Point> = GeometryUtils._simplifyPoints(points, tolerance, index, endIndex);
			result = recResults1.slice(0, recResults1.length - 1);
			result.push(...recResults2);

		} else {
			result = [];
			result.push(startPoint);
			result.push(endPoint);
		}

		return result;
	}

	/**
	 * Calculate the perpendicular distance between the point and the line
	 * represented by the start and end points. Points should be in a meters
	 * unit type projection.
	 *
	 * @param point point
	 * @param lineStart point representing the line start
	 * @param lineEnd point representing the line end
	 * @return distance in meters
	 */
	public static perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
		let x = point.x;
		let y = point.y;
		let startX = lineStart.x;
		let startY = lineStart.y;
		let endX = lineEnd.x;
		let endY = lineEnd.y;

		let vX = endX - startX;
		let vY = endY - startY;
		let wX = x - startX;
		let wY = y - startY;
		let c1 = wX * vX + wY * vY;
		let c2 = vX * vX + vY * vY;

		let x2;
		let y2;
		if (c1 <= 0) {
			x2 = startX;
			y2 = startY;
		} else if (c2 <= c1) {
			x2 = endX;
			y2 = endY;
		} else {
			let b = c1 / c2;
			x2 = startX + b * vX;
			y2 = startY + b * vY;
		}

		return Math.sqrt(Math.pow(x2 - x, 2) + Math.pow(y2 - y, 2));
	}

	/**
	 * Check if the point is in the polygon
	 * @param point point
	 * @param polygon polygon
	 * @return true if in the polygon
	 */
	public static pointInPolygon(point: Point, polygon: Polygon): boolean {
		return GeometryUtils.pointInPolygonWithEpsilon(point, polygon, GeometryUtils.DEFAULT_EPSILON);
	}

	/**
	 * Check if the point is in the polygon
	 * 
	 * @param point point
	 * @param polygon polygon
	 * @param epsilon epsilon line tolerance
	 * @return true if in the polygon
	 */
	public static pointInPolygonWithEpsilon(point: Point, polygon: Polygon, epsilon: number): boolean {
		let contains: boolean = false;
		const rings: Array<LineString> = polygon.rings;
		if (rings.length > 0) {
			contains = GeometryUtils.pointInPolygonRingWithEpsilon(point, rings[0], epsilon);
			if (contains) {
				// Check the holes
				for (let i = 1; i < rings.length; i++) {
					if (GeometryUtils.pointInPolygonRingWithEpsilon(point, rings[i], epsilon)) {
						contains = false;
						break;
					}
				}
			}
		}

		return contains;
	}

	/**
	 * Check if the point is in the polygon ring
	 * 
	 * @param point point
	 * @param ring polygon ring
	 * @return true if in the polygon
	 */
	public static pointInPolygonRing(point: Point, ring: LineString): boolean {
		return GeometryUtils.pointInPolygonRingWithEpsilon(point, ring, GeometryUtils.DEFAULT_EPSILON);
	}

	/**
	 * Check if the point is in the polygon ring
	 * 
	 * @param point point
	 * @param ring polygon ring
	 * @param epsilon epsilon line tolerance
	 * @return true if in the polygon
	 */
	public static pointInPolygonRingWithEpsilon(point: Point, ring: LineString, epsilon: number): boolean {
		return GeometryUtils.pointInPolygonRingPointsWithEpsilon(point, ring.points, epsilon);
	}

	/**
	 * Check if the point is in the polygon points
	 * @param point point
	 * @param points polygon points
	 * @return true if in the polygon
	 */
	public static pointInPolygonRingPoints(point: Point, points: Array<Point>): boolean {
		return GeometryUtils.pointInPolygonRingPointsWithEpsilon(point, points, GeometryUtils.DEFAULT_EPSILON);
	}

	/**
	 * Check if the point is in the polygon points
	 * @param point point
	 * @param points polygon points
	 * @param epsilon epsilon line tolerance
	 * @return true if in the polygon
	 */
	public static pointInPolygonRingPointsWithEpsilon(point: Point, points: Array<Point>, epsilon: number): boolean {

		let contains = false;

		let i = 0;
		let j = points.length - 1;
		if (GeometryUtils.closedPolygonPoints(points)) {
			j = i++;
		}

		for (; i < points.length; j = i++) {
			let point1 = points[i];
			let point2 = points[j];

			// Shortcut check if polygon contains the point within tolerance
			if (Math.abs(point1.x - point.x) <= epsilon && Math.abs(point1.y - point.y) <= epsilon) {
				contains = true;
				break;
			}

			if (((point1.y > point.y) !== (point2.y > point.y))
				&& (point.x < (point2.x - point1.x) * (point.y - point1.y) / (point2.y - point1.y) + point1.x)) {
				contains = !contains;
			}
		}

		if (!contains) {
			// Check the polygon edges
			contains = GeometryUtils.pointOnPolygonEdgePoints(point, points);
		}

		return contains;
	}

	/**
	 * Check if the point is on the polygon edge
	 * @param point point
	 * @param polygon polygon
	 * @return true if on the polygon edge
	 */
	public static pointOnPolygonEdge(point: Point, polygon: Polygon): boolean {
		return GeometryUtils.pointOnPolygonEdgeWithEpsilon(point, polygon, GeometryUtils.DEFAULT_EPSILON);
	}

	/**
	 * Check if the point is on the polygon edge
	 * 
	 * @param point point
	 * @param polygon polygon
	 * @param epsilon epsilon line tolerance
	 * @return true if on the polygon edge
	 */
	public static pointOnPolygonEdgeWithEpsilon(point: Point, polygon: Polygon, epsilon: number): boolean {
		return polygon.numRings() > 0 && GeometryUtils.pointOnPolygonEdgeRingWithEpsilon(point, polygon.rings[0], epsilon);
	}

	/**
	 * Check if the point is on the polygon ring edge
	 * @param point point
	 * @param ring polygon ring
	 * @return true if on the polygon edge
	 */
	public static pointOnPolygonEdgeRing(point: Point, ring: LineString): boolean {
		return GeometryUtils.pointOnPolygonEdgeRingWithEpsilon(point, ring, GeometryUtils.DEFAULT_EPSILON);
	}

	/**
	 * Check if the point is on the polygon ring edge
	 * 
	 * @param point point
	 * @param ring polygon ring
	 * @param epsilon epsilon line tolerance
	 * @return true if on the polygon edge
	 */
	public static pointOnPolygonEdgeRingWithEpsilon(point: Point, ring: LineString, epsilon: number): boolean {
		return GeometryUtils.pointOnPolygonEdgePointsWithEpsilon(point, ring.points, epsilon);
	}

	/**
	 * Check if the point is on the polygon ring edge points
	 * @param point point
	 * @param points polygon points
	 * @return true if on the polygon edge
	 */
	public static pointOnPolygonEdgePoints(point: Point, points: Array<Point>): boolean {
		return GeometryUtils.pointOnPolygonEdgePointsWithEpsilon(point, points, GeometryUtils.DEFAULT_EPSILON);
	}

	/**
	 * Check if the point is on the polygon ring edge points
	 * @param point point
	 * @param points polygon points
	 * @param epsilon epsilon line tolerance
	 * @return true if on the polygon edge
	 */
	public static pointOnPolygonEdgePointsWithEpsilon(point: Point, points: Array<Point>, epsilon: number): boolean {
		return GeometryUtils.pointOnPathPointArray(point, points, epsilon, !GeometryUtils.closedPolygonPoints(points));
	}

	/**
	 * Check if the polygon outer ring is explicitly closed, where the first and
	 * last point are the same
	 * @param polygon polygon
	 * @return true if the first and last points are the same
	 */
	public static closedPolygon(polygon: Polygon): boolean {
		return polygon.numRings() > 0 && GeometryUtils.closedPolygonRing(polygon.rings[0]);
	}

	/**
	 * Check if the polygon ring is explicitly closed, where the first and last
	 * point are the same
	 * @param ring polygon ring
	 * @return true if the first and last points are the same
	 */
	public static closedPolygonRing(ring: LineString): boolean {
		return GeometryUtils.closedPolygonPoints(ring.points);
	}

	/**
	 * Check if the polygon ring points are explicitly closed, where the first
	 * and last point are the same
	 * @param points polygon ring points
	 * @return true if the first and last points are the same
	 */
	public static closedPolygonPoints(points: Array<Point>): boolean {
		let closed = false;
		if (points.length > 0) {
			let first = points[0];
			let last = points[points.length - 1];
			closed = first.x == last.x && first.y == last.y;
		}
		return closed;
	}

	/**
	 * Check if the point is on the line
	 * @param point point
	 * @param line  line
	 * @return true if on the line
	 */
	public static pointOnLine(point: Point, line: LineString): boolean {
		return GeometryUtils.pointOnLineWithEpsilon(point, line, GeometryUtils.DEFAULT_EPSILON);
	}

	/**
	 * Check if the point is on the line
	 * @param point point
	 * @param line line
	 * @param epsilon epsilon line tolerance
	 * @return true if on the line
	 */
	public static pointOnLineWithEpsilon(point: Point, line: LineString, epsilon: number): boolean {
		return GeometryUtils.pointOnLinePointsWithEpsilon(point, line.points, epsilon);
	}

	/**
	 * Check if the point is on the line represented by the points
	 * @param point point
	 * @param points line points
	 * @return true if on the line
	 */
	public static pointOnLinePoints(point: Point, points: Array<Point>): boolean {
		return GeometryUtils.pointOnLinePointsWithEpsilon(point, points, GeometryUtils.DEFAULT_EPSILON);
	}

	/**
	 * Check if the point is on the line represented by the points
	 * @param point point
	 * @param points line points
	 * @param epsilon epsilon line tolerance
	 * @return true if on the line
	 */
	public static pointOnLinePointsWithEpsilon(point: Point, points: Array<Point>, epsilon: number): boolean {
		return GeometryUtils.pointOnPathPointArray(point, points, epsilon, false);
	}

	/**
	 * Check if the point is on the path between point 1 and point 2
	 * @param point point
	 * @param point1 path point 1
	 * @param point2 path point 2
	 * @return true if on the path
	 */
	public static pointOnPath(point: Point, point1: Point, point2: Point): boolean {
		return GeometryUtils.pointOnPathWithEpsilon(point, point1, point2, GeometryUtils.DEFAULT_EPSILON);
	}

	/**
	 * Check if the point is on the path between point 1 and point 2
	 * @param point point
	 * @param point1 path point 1
	 * @param point2 path point 2
	 * @param epsilon epsilon line tolerance
	 * @return true if on the path
	 */
	public static pointOnPathWithEpsilon(point: Point, point1: Point, point2: Point, epsilon: number): boolean {
		let contains = false;
		const x21 = point2.x - point1.x;
		const y21 = point2.y - point1.y;
		const xP1 = point.x - point1.x;
		const yP1 = point.y - point1.y;
		const dp = xP1 * x21 + yP1 * y21;
		if (dp >= 0.0) {
			const lengthP1 = xP1 * xP1 + yP1 * yP1;
			const length21 = x21 * x21 + y21 * y21;
			if (lengthP1 <= length21) {
				contains = Math.abs(dp * dp - lengthP1 * length21) <= epsilon;
			}
		}
		return contains;
	}

	/**
	 * Check if the point is on the path between the points
	 * @param point point
	 * @param points path points
	 * @param epsilon epsilon line tolerance
	 * @param circular true if a path exists between the first and last point (a non explicitly closed polygon)
	 * @return true if on the path
	 */
	private static pointOnPathPointArray(point: Point, points: Array<Point>, epsilon: number, circular: boolean): boolean {

		let onPath = false;

		let i = 0;
		let j = points.length - 1;
		if (!circular) {
			j = i++;
		}

		for (; i < points.length; j = i++) {
			let point1: Point = points[i];
			let point2: Point = points[j];
			if (GeometryUtils.pointOnPathWithEpsilon(point, point1, point2, epsilon)) {
				onPath = true;
				break;
			}
		}

		return onPath;
	}

	/**
	 * Get the point intersection between two lines
	 * 
	 * @param line1
	 *            first line
	 * @param line2
	 *            second line
	 * @return intersection point or null if no intersection
	 * @since 1.0.3
	 */
	public static intersectionLine(line1: Line, line2: Line): Point {
		return GeometryUtils.intersection(line1.startPoint(), line1.endPoint(),
			line2.startPoint(), line2.endPoint());
	}

	/**
	 * Get the point intersection between end points of two lines
	 * 
	 * @param line1Point1
	 *            first point of the first line
	 * @param line1Point2
	 *            second point of the first line
	 * @param line2Point1
	 *            first point of the second line
	 * @param line2Point2
	 *            second point of the second line
	 * @return intersection point or null if no intersection
	 * @since 2.1.0
	 */
	public static intersection(line1Point1: Point, line1Point2: Point,
		line2Point1: Point, line2Point2: Point): Point {

		let intersection: Point = null;

		const a1 = line1Point2.y - line1Point1.y;
		const b1 = line1Point1.x - line1Point2.x;
		const c1 = a1 * (line1Point1.x) + b1 * (line1Point1.y);

		const a2 = line2Point2.y - line2Point1.y;
		const b2 = line2Point1.x - line2Point2.x;
		const c2 = a2 * (line2Point1.x) + b2 * (line2Point1.y);

		const determinant = a1 * b2 - a2 * b1;

		if (determinant != 0) {
			const x = (b2 * c1 - b1 * c2) / determinant;
			const y = (a1 * c2 - a2 * c1) / determinant;
			intersection = new Point(x, y);
		}

		return intersection;
	}

	/**
	 * Convert a geometry in degrees to a geometry in meters
	 * 
	 * @param geometry
	 *            geometry in degrees
	 * @return geometry in meters
	 * @since 1.0.3
	 */
	public static degreesToMeters(geometry: Geometry): Geometry {
		let meters: Geometry = null;

		switch (geometry.geometryType) {
			case GeometryType.POINT:
				meters = GeometryUtils.degreesToMetersPoint(geometry as Point);
				break;
			case GeometryType.LINESTRING:
				meters = GeometryUtils.degreesToMetersLineString(geometry as LineString);
				break;
			case GeometryType.POLYGON:
				meters = GeometryUtils.degreesToMetersPolygon(geometry as Polygon);
				break;
			case GeometryType.MULTIPOINT:
				meters = GeometryUtils.degreesToMetersMultiPoint(geometry as MultiPoint);
				break;
			case GeometryType.MULTILINESTRING:
				meters = GeometryUtils.degreesToMetersMultiLineString(geometry as MultiLineString);
				break;
			case GeometryType.MULTIPOLYGON:
				meters = GeometryUtils.degreesToMetersMultiPolygon(geometry as MultiPolygon);
				break;
			case GeometryType.CIRCULARSTRING:
				meters = GeometryUtils.degreesToMetersCircularString(geometry as CircularString);
				break;
			case GeometryType.COMPOUNDCURVE:
				meters = GeometryUtils.degreesToMetersCompundCurve(geometry as CompoundCurve);
				break;
			case GeometryType.CURVEPOLYGON:
				const curvePolygon = geometry as CurvePolygon<Curve>;
				meters = GeometryUtils.degreesToMetersCurvePolygon(curvePolygon);
				break;
			case GeometryType.POLYHEDRALSURFACE:
				meters = GeometryUtils.degreesToMetersPolyhedralSurface(geometry as PolyhedralSurface);
				break;
			case GeometryType.TIN:
				meters = GeometryUtils.degreesToMetersPolyhedralSurface(geometry as TIN);
				break;
			case GeometryType.TRIANGLE:
				meters = GeometryUtils.degreesToMetersPolygon(geometry as Triangle);
				break;
			case GeometryType.GEOMETRYCOLLECTION:
			case GeometryType.MULTICURVE:
			case GeometryType.MULTISURFACE:
				const metersCollection = new GeometryCollection();
				const geomCollection = geometry as GeometryCollection<Geometry>;
				for (const subGeometry of geomCollection.geometries) {
					metersCollection.addGeometry(GeometryUtils.degreesToMeters(subGeometry));
				}
				meters = metersCollection;
				break;
			default:
				break;

		}

		return meters;
	}

	/**
	 * Convert a point in degrees to a point in meters
	 * 
	 * @param point
	 *            point in degrees
	 * @return point in meters
	 * @since 1.0.3
	 */
	public static degreesToMetersPoint(point: Point): Point {
		const value = GeometryUtils.degreesToMetersCoord(point.x, point.y);
		value.z = point.z;
		value.m = point.m;
		return value;
	}

	/**
	 * Convert a coordinate in degrees to a point in meters
	 * 
	 * @param x
	 *            x value in degrees
	 * @param y
	 *            y value in degrees
	 * @return point in meters
	 * @since 1.0.3
	 */
	public static degreesToMetersCoord(x: number, y: number): Point {
		x = GeometryUtils.normalizeX(x, GeometryConstants.WGS84_HALF_WORLD_LON_WIDTH);
		y = Math.min(y, GeometryConstants.WGS84_HALF_WORLD_LAT_HEIGHT);
		y = Math.max(y, GeometryConstants.DEGREES_TO_METERS_MIN_LAT);
		const xValue = x * GeometryConstants.WEB_MERCATOR_HALF_WORLD_WIDTH
			/ GeometryConstants.WGS84_HALF_WORLD_LON_WIDTH;
		let yValue = Math.log(Math.tan(
			(GeometryConstants.WGS84_HALF_WORLD_LAT_HEIGHT + y) * Math.PI
			/ (2 * GeometryConstants.WGS84_HALF_WORLD_LON_WIDTH)))
			/ (Math.PI / GeometryConstants.WGS84_HALF_WORLD_LON_WIDTH);
		yValue = yValue * GeometryConstants.WEB_MERCATOR_HALF_WORLD_WIDTH
			/ GeometryConstants.WGS84_HALF_WORLD_LON_WIDTH;
		return new Point(xValue, yValue);
	}

	/**
	 * Convert a multi point in degrees to a multi point in meters
	 * 
	 * @param multiPoint
	 *            multi point in degrees
	 * @return multi point in meters
	 * @since 1.0.3
	 */
	public static degreesToMetersMultiPoint(multiPoint: MultiPoint): MultiPoint {
		const meters = new MultiPoint(multiPoint.hasZ,
			multiPoint.hasM);
		for (const point of multiPoint.points) {
			meters.addPoint(GeometryUtils.degreesToMetersPoint(point));
		}
		return meters;
	}

	/**
	 * Convert a line string in degrees to a line string in meters
	 * 
	 * @param lineString
	 *            line string in degrees
	 * @return line string in meters
	 * @since 2.2.0
	 */
	public static degreesToMetersLineString(lineString: LineString): LineString {
		const meters = new LineString(lineString.hasZ,
			lineString.hasM);
		for (const point of lineString.points) {
			meters.addPoint(GeometryUtils.degreesToMetersPoint(point));
		}
		return meters;
	}

	/**
	 * Convert a line in degrees to a line in meters
	 * 
	 * @param line
	 *            line in degrees
	 * @return line in meters
	 * @since 1.0.3
	 */
	public static degreesToMetersLine(line: Line): Line {
		const meters = new Line(line.hasZ, line.hasM);
		for (const point of line.points) {
			meters.addPoint(GeometryUtils.degreesToMetersPoint(point));
		}
		return meters;
	}

	/**
	 * Convert a multi line string in degrees to a multi line string in meters
	 * 
	 * @param multiLineString
	 *            multi line string in degrees
	 * @return multi line string in meters
	 * @since 1.0.3
	 */
	public static degreesToMetersMultiLineString(
		multiLineString: MultiLineString): MultiLineString {
		const meters = new MultiLineString(multiLineString.hasZ,
			multiLineString.hasM);
		for (const lineString of multiLineString.lineStrings) {
			meters.addLineString(GeometryUtils.degreesToMetersLineString(lineString));
		}
		return meters;
	}

	/**
	 * Convert a polygon in degrees to a polygon in meters
	 * 
	 * @param polygon
	 *            polygon in degrees
	 * @return polygon in meters
	 * @since 1.0.3
	 */
	public static degreesToMetersPolygon(polygon: Polygon): Polygon {
		const meters = new Polygon(polygon.hasZ, polygon.hasM);
		for (const ring of polygon.rings) {
			meters.addRing(GeometryUtils.degreesToMetersLineString(ring));
		}
		return meters;
	}

	/**
	 * Convert a multi polygon in degrees to a multi polygon in meters
	 * 
	 * @param multiPolygon
	 *            multi polygon in degrees
	 * @return multi polygon in meters
	 * @since 1.0.3
	 */
	public static degreesToMetersMultiPolygon(multiPolygon: MultiPolygon): MultiPolygon {
		const meters = new MultiPolygon(multiPolygon.hasZ,
			multiPolygon.hasM);
		for (const polygon of multiPolygon.polygons) {
			meters.addPolygon(GeometryUtils.degreesToMetersPolygon(polygon));
		}
		return meters;
	}

	/**
	 * Convert a circular string in degrees to a circular string in meters
	 * 
	 * @param circularString
	 *            circular string in degrees
	 * @return circular string in meters
	 * @since 1.0.3
	 */
	public static degreesToMetersCircularString(
		circularString: CircularString): CircularString {
		const meters = new CircularString(circularString.hasZ,
			circularString.hasM);
		for (const point of circularString.points) {
			meters.addPoint(GeometryUtils.degreesToMetersPoint(point));
		}
		return meters;
	}

	/**
	 * Convert a compound curve in degrees to a compound curve in meters
	 * 
	 * @param compoundCurve
	 *            compound curve in degrees
	 * @return compound curve in meters
	 * @since 1.0.3
	 */
	public static degreesToMetersCompundCurve(compoundCurve: CompoundCurve): CompoundCurve {
		const meters = new CompoundCurve(compoundCurve.hasZ,
			compoundCurve.hasM);
		for (const lineString of compoundCurve.lineStrings) {
			meters.addLineString(GeometryUtils.degreesToMetersLineString(lineString));
		}
		return meters;
	}

	/**
	 * Convert a curve polygon in degrees to a curve polygon in meters
	 * 
	 * @param curvePolygon
	 *            curve polygon in degrees
	 * @return curve polygon in meters
	 * @since 1.0.3
	 */
	public static degreesToMetersCurvePolygon(
		curvePolygon: CurvePolygon<Curve>): CurvePolygon<Curve> {
		const meters = new CurvePolygon(curvePolygon.hasZ,
			curvePolygon.hasM);
		for (const ring of curvePolygon.rings) {
			meters.addRing(GeometryUtils.degreesToMeters(ring) as Curve);
		}
		return meters;
	}

	/**
	 * Convert a polyhedral surface in degrees to a polyhedral surface in meters
	 * 
	 * @param polyhedralSurface
	 *            polyhedral surface in degrees
	 * @return polyhedral surface in meters
	 * @since 1.0.3
	 */
	public static degreesToMetersPolyhedralSurface(
		polyhedralSurface: PolyhedralSurface): PolyhedralSurface {
		const meters = new PolyhedralSurface(
			polyhedralSurface.hasZ, polyhedralSurface.hasM);
		for (const polygon of polyhedralSurface.polygons) {
			meters.addPolygon(GeometryUtils.degreesToMetersPolygon(polygon));
		}
		return meters;
	}

	/**
	 * Convert a geometry in meters to a geometry in degrees
	 * 
	 * @param geometry
	 *            geometry in meters
	 * @return geometry in degrees
	 * @since 1.0.3
	 */
	public static metersToDegrees(geometry: Geometry): Geometry {
		let degrees: Geometry = null;

		switch (geometry.geometryType) {
			case GeometryType.POINT:
				degrees = GeometryUtils.metersToDegreesPoint(geometry as Point);
				break;
			case GeometryType.LINESTRING:
				degrees = GeometryUtils.metersToDegreesLineString(geometry as LineString);
				break;
			case GeometryType.POLYGON:
				degrees = GeometryUtils.metersToDegreesPolygon(geometry as Polygon);
				break;
			case GeometryType.MULTIPOINT:
				degrees = GeometryUtils.metersToDegreesMultiPoint(geometry as MultiPoint);
				break;
			case GeometryType.MULTILINESTRING:
				degrees = GeometryUtils.metersToDegreesMultiLineString(geometry as MultiLineString);
				break;
			case GeometryType.MULTIPOLYGON:
				degrees = GeometryUtils.metersToDegreesMultiPolygon(geometry as MultiPolygon);
				break;
			case GeometryType.CIRCULARSTRING:
				degrees = GeometryUtils.metersToDegreesCircularString(geometry as CircularString);
				break;
			case GeometryType.COMPOUNDCURVE:
				degrees = GeometryUtils.metersToDegreesCompoundCurve(geometry as CompoundCurve);
				break;
			case GeometryType.CURVEPOLYGON:
				const curvePolygon = geometry as CurvePolygon<Curve>;
				degrees = GeometryUtils.metersToDegreesCurvePolygon(curvePolygon);
				break;
			case GeometryType.POLYHEDRALSURFACE:
				degrees = GeometryUtils.metersToDegreesPolyhedralSurface(geometry as PolyhedralSurface);
				break;
			case GeometryType.TIN:
				degrees = GeometryUtils.metersToDegreesPolyhedralSurface(geometry as TIN);
				break;
			case GeometryType.TRIANGLE:
				degrees = GeometryUtils.degreesToMetersPolygon(geometry as Triangle);
				break;
			case GeometryType.GEOMETRYCOLLECTION:
			case GeometryType.MULTICURVE:
			case GeometryType.MULTISURFACE:
				const degreesCollection = new GeometryCollection();
				const geomCollection = geometry as GeometryCollection<Geometry>;
				for (const subGeometry of geomCollection.geometries) {
					degreesCollection.addGeometry(GeometryUtils.metersToDegrees(subGeometry));
				}
				degrees = degreesCollection;
				break;
			default:
				break;

		}

		return degrees;
	}

	/**
	 * Convert a point in meters to a point in degrees
	 * 
	 * @param point
	 *            point in meters
	 * @return point in degrees
	 * @since 1.0.3
	 */
	public static metersToDegreesPoint(point: Point): Point {
		const value = GeometryUtils.metersToDegreesCoord(point.x, point.y);
		value.z = point.z;
		value.m = point.m;
		return value;
	}

	/**
	 * Convert a coordinate in meters to a point in degrees
	 * 
	 * @param x
	 *            x value in meters
	 * @param y
	 *            y value in meters
	 * @return point in degrees
	 * @since 1.0.3
	 */
	public static metersToDegreesCoord(x: number, y: number): Point {
		const xValue = x * GeometryConstants.WGS84_HALF_WORLD_LON_WIDTH
			/ GeometryConstants.WEB_MERCATOR_HALF_WORLD_WIDTH;
		let yValue = y * GeometryConstants.WGS84_HALF_WORLD_LON_WIDTH
			/ GeometryConstants.WEB_MERCATOR_HALF_WORLD_WIDTH;
		yValue = Math.atan(Math.exp(yValue
			* (Math.PI / GeometryConstants.WGS84_HALF_WORLD_LON_WIDTH)))
			/ Math.PI * (2 * GeometryConstants.WGS84_HALF_WORLD_LON_WIDTH)
			- GeometryConstants.WGS84_HALF_WORLD_LAT_HEIGHT;
		return new Point(xValue, yValue);
	}

	/**
	 * Convert a multi point in meters to a multi point in degrees
	 * 
	 * @param multiPoint
	 *            multi point in meters
	 * @return multi point in degrees
	 * @since 1.0.3
	 */
	public static metersToDegreesMultiPoint(multiPoint: MultiPoint): MultiPoint {
		const degrees = new MultiPoint(multiPoint.hasZ,
			multiPoint.hasM);
		for (const point of multiPoint.points) {
			degrees.addPoint(GeometryUtils.metersToDegreesPoint(point));
		}
		return degrees;
	}

	/**
	 * Convert a line string in meters to a line string in degrees
	 * 
	 * @param lineString
	 *            line string in meters
	 * @return line string in degrees
	 * @since 1.0.3
	 */
	public static metersToDegreesLineString(lineString: LineString): LineString {
		const degrees = new LineString(lineString.hasZ,
			lineString.hasM);
		for (const point of lineString.points) {
			degrees.addPoint(GeometryUtils.metersToDegreesPoint(point));
		}
		return degrees;
	}

	/**
	 * Convert a line in meters to a line in degrees
	 * 
	 * @param line
	 *            line in meters
	 * @return line in degrees
	 * @since 1.0.3
	 */
	public static metersToDegreesLine(line: Line): Line {
		const degrees = new Line(line.hasZ, line.hasM);
		for (const point of line.points) {
			degrees.addPoint(GeometryUtils.metersToDegreesPoint(point));
		}
		return degrees;
	}

	/**
	 * Convert a multi line string in meters to a multi line string in degrees
	 * 
	 * @param multiLineString
	 *            multi line string in meters
	 * @return multi line string in degrees
	 * @since 1.0.3
	 */
	public static metersToDegreesMultiLineString(
		multiLineString: MultiLineString): MultiLineString {
		const degrees = new MultiLineString(multiLineString.hasZ,
			multiLineString.hasM);
		for (const lineString of multiLineString.lineStrings) {
			degrees.addLineString(GeometryUtils.metersToDegreesLineString(lineString));
		}
		return degrees;
	}

	/**
	 * Convert a polygon in meters to a polygon in degrees
	 * 
	 * @param polygon
	 *            polygon in meters
	 * @return polygon in degrees
	 * @since 1.0.3
	 */
	public static metersToDegreesPolygon(polygon: Polygon): Polygon {
		const degrees = new Polygon(polygon.hasZ, polygon.hasM);
		for (const ring of polygon.rings) {
			degrees.addRing(GeometryUtils.metersToDegreesLineString(ring));
		}
		return degrees;
	}

	/**
	 * Convert a multi polygon in meters to a multi polygon in degrees
	 * 
	 * @param multiPolygon
	 *            multi polygon in meters
	 * @return multi polygon in degrees
	 * @since 1.0.3
	 */
	public static metersToDegreesMultiPolygon(multiPolygon: MultiPolygon): MultiPolygon {
		const degrees = new MultiPolygon(multiPolygon.hasZ,
			multiPolygon.hasM);
		for (const polygon of multiPolygon.polygons) {
			degrees.addPolygon(GeometryUtils.metersToDegreesPolygon(polygon));
		}
		return degrees;
	}

	/**
	 * Convert a circular string in meters to a circular string in degrees
	 * 
	 * @param circularString
	 *            circular string in meters
	 * @return circular string in degrees
	 * @since 1.0.3
	 */
	public static metersToDegreesCircularString(circularString: CircularString): CircularString {
		const degrees = new CircularString(circularString.hasZ,
			circularString.hasM);
		for (const point of circularString.points) {
			degrees.addPoint(GeometryUtils.metersToDegreesPoint(point));
		}
		return degrees;
	}

	/**
	 * Convert a compound curve in meters to a compound curve in degrees
	 * 
	 * @param compoundCurve
	 *            compound curve in meters
	 * @return compound curve in degrees
	 * @since 1.0.3
	 */
	public static metersToDegreesCompoundCurve(compoundCurve: CompoundCurve): CompoundCurve {
		const degrees = new CompoundCurve(compoundCurve.hasZ,
			compoundCurve.hasM);
		for (const lineString of compoundCurve.lineStrings) {
			degrees.addLineString(GeometryUtils.metersToDegreesLineString(lineString));
		}
		return degrees;
	}

	/**
	 * Convert a curve polygon in meters to a curve polygon in degrees
	 * 
	 * @param curvePolygon
	 *            curve polygon in meters
	 * @return curve polygon in degrees
	 * @since 2.2.0
	 */
	public static metersToDegreesCurvePolygon(
		curvePolygon: CurvePolygon<Curve>): CurvePolygon<Curve> {
		const degrees = new CurvePolygon(curvePolygon.hasZ,
			curvePolygon.hasM);
		for (const ring of curvePolygon.rings) {
			degrees.addRing(GeometryUtils.metersToDegrees(ring) as Curve);
		}
		return degrees;
	}

	/**
	 * Convert a polyhedral surface in meters to a polyhedral surface in degrees
	 * 
	 * @param polyhedralSurface
	 *            polyhedral surface in meters
	 * @return polyhedral surface in degrees
	 * @since 1.0.3
	 */
	public static metersToDegreesPolyhedralSurface(
		polyhedralSurface: PolyhedralSurface): PolyhedralSurface {
		const degrees = new PolyhedralSurface(
			polyhedralSurface.hasZ, polyhedralSurface.hasM);
		for (const polygon of polyhedralSurface.polygons) {
			degrees.addPolygon(GeometryUtils.metersToDegreesPolygon(polygon));
		}
		return degrees;
	}

	/**
	 * Get a WGS84 bounded geometry envelope
	 * 
	 * @return geometry envelope
	 * @since 1.0.3
	 */
	public static wgs84Envelope(): GeometryEnvelope {
		return new GeometryEnvelope(
			-GeometryConstants.WGS84_HALF_WORLD_LON_WIDTH,
			-GeometryConstants.WGS84_HALF_WORLD_LAT_HEIGHT,
			GeometryConstants.WGS84_HALF_WORLD_LON_WIDTH,
			GeometryConstants.WGS84_HALF_WORLD_LAT_HEIGHT);
	}

	/**
	 * Get a WGS84 bounded geometry envelope used for projection transformations
	 * (degrees to meters)
	 * 
	 * @return geometry envelope
	 * @since 1.0.3
	 */
	public static wgs84TransformableEnvelope(): GeometryEnvelope {
		return new GeometryEnvelope(
			-GeometryConstants.WGS84_HALF_WORLD_LON_WIDTH,
			GeometryConstants.DEGREES_TO_METERS_MIN_LAT,
			GeometryConstants.WGS84_HALF_WORLD_LON_WIDTH,
			GeometryConstants.WGS84_HALF_WORLD_LAT_HEIGHT);
	}

	/**
	 * Get a Web Mercator bounded geometry envelope
	 * 
	 * @return geometry envelope
	 * @since 1.0.3
	 */
	public static webMercatorEnvelope(): GeometryEnvelope {
		return new GeometryEnvelope(
			-GeometryConstants.WEB_MERCATOR_HALF_WORLD_WIDTH,
			-GeometryConstants.WEB_MERCATOR_HALF_WORLD_WIDTH,
			GeometryConstants.WEB_MERCATOR_HALF_WORLD_WIDTH,
			GeometryConstants.WEB_MERCATOR_HALF_WORLD_WIDTH);
	}

	/**
	 * Get a WGS84 geometry envelope with Web Mercator bounds
	 * 
	 * @return geometry envelope
	 * @since 1.0.3
	 */
	public static wgs84EnvelopeWithWebMercator(): GeometryEnvelope {
		return new GeometryEnvelope(
			-GeometryConstants.WGS84_HALF_WORLD_LON_WIDTH,
			GeometryConstants.WEB_MERCATOR_MIN_LAT_RANGE,
			GeometryConstants.WGS84_HALF_WORLD_LON_WIDTH,
			GeometryConstants.WEB_MERCATOR_MAX_LAT_RANGE);
	}

	/**
	 * Crop the geometry in meters by web mercator world bounds. Cropping
	 * removes points outside the envelope and creates new points on the line
	 * intersections with the envelope.
	 * 
	 * @param geometry
	 *            geometry in meters
	 * @return cropped geometry in meters or null
	 * @since 1.0.3
	 */
	public static cropWebMercator(geometry: Geometry): Geometry {
		return GeometryUtils.crop(geometry, GeometryUtils.webMercatorEnvelope());
	}

	/**
	 * Crop the geometry in meters by the envelope bounds in meters. Cropping
	 * removes points outside the envelope and creates new points on the line
	 * intersections with the envelope.
	 * 
	 * @param geometry
	 *            geometry in meters
	 * @param envelope
	 *            envelope in meters
	 * @return cropped geometry in meters or null
	 * @since 1.0.3
	 */
	public static crop(geometry: Geometry, envelope: GeometryEnvelope): Geometry {

		let crop: Geometry = null;

		if (GeometryUtils.containsGeometryEnvelope(envelope, geometry.getEnvelope())) {
			crop = geometry;
		} else {

			switch (geometry.geometryType) {
				case GeometryType.POINT:
					crop = GeometryUtils.cropPoint(geometry as Point, envelope);
					break;
				case GeometryType.LINESTRING:
					crop = GeometryUtils.cropLineString(geometry as LineString, envelope);
					break;
				case GeometryType.POLYGON:
					crop = GeometryUtils.cropPolygon(geometry as Polygon, envelope);
					break;
				case GeometryType.MULTIPOINT:
					crop = GeometryUtils.cropMultiPoint(geometry as MultiPoint, envelope);
					break;
				case GeometryType.MULTILINESTRING:
					crop = GeometryUtils.cropMultiLineString(geometry as MultiLineString, envelope);
					break;
				case GeometryType.MULTIPOLYGON:
					crop = GeometryUtils.cropMultiPolygon(geometry as MultiPolygon, envelope);
					break;
				case GeometryType.CIRCULARSTRING:
					crop = GeometryUtils.cropCircularString(geometry as CircularString, envelope);
					break;
				case GeometryType.COMPOUNDCURVE:
					crop = GeometryUtils.cropCompoundCurve(geometry as CompoundCurve, envelope);
					break;
				case GeometryType.CURVEPOLYGON:
					const curvePolygon = geometry as CurvePolygon<Curve>;
					crop = GeometryUtils.cropCurvePolygon(curvePolygon, envelope);
					break;
				case GeometryType.POLYHEDRALSURFACE:
					crop = GeometryUtils.cropPolyhedralSurface(geometry as PolyhedralSurface, envelope);
					break;
				case GeometryType.TIN:
					crop = GeometryUtils.cropPolyhedralSurface(geometry as TIN, envelope);
					break;
				case GeometryType.TRIANGLE:
					crop = GeometryUtils.cropPolygon(geometry as Triangle, envelope);
					break;
				case GeometryType.GEOMETRYCOLLECTION:
				case GeometryType.MULTICURVE:
				case GeometryType.MULTISURFACE:
					const cropCollection = new GeometryCollection();
					const geomCollection = geometry as GeometryCollection<Geometry>;
					for (const subGeometry of geomCollection.geometries) {
						cropCollection.addGeometry(GeometryUtils.crop(subGeometry, envelope));
					}
					crop = cropCollection;
					break;
				default:
					break;

			}

		}

		return crop;
	}

	/**
	 * Crop the point by the envelope bounds.
	 * 
	 * @param point
	 *            point
	 * @param envelope
	 *            envelope
	 * @return cropped point or null
	 * @since 1.0.3
	 */
	public static cropPoint(point: Point, envelope: GeometryEnvelope): Point {
		let crop: Point = null;
		if (GeometryUtils.containsPoint(envelope, point)) {
			crop = new Point(point);
		}
		return crop;
	}

	/**
	 * Crop the list of consecutive points in meters by the envelope bounds in
	 * meters. Cropping removes points outside the envelope and creates new
	 * points on the line intersections with the envelope.
	 * 
	 * @param points
	 *            consecutive points
	 * @param envelope
	 *            envelope in meters
	 * @return cropped points in meters or null
	 * @since 1.0.3
	 */
	public static cropPoints(points: List<Point>,
		envelope: GeometryEnvelope): List<Point> {

		let crop = new List<Point>();

		const left = envelope.getLeft();
		const bottom = envelope.getBottom();
		const right = envelope.getRight();
		const top = envelope.getTop();

		let previousPoint = null;
		let previousContains = false;
		for (const point of points) {
			const contains = GeometryUtils.containsPoint(envelope, point);

			if (previousPoint != null && (!contains || !previousContains)) {

				const line = new Line(previousPoint, point);
				const bearing = GeometryUtils.bearingLine(GeometryUtils.metersToDegreesLine(line));

				const westBearing = GeometryUtils.isWestBearing(bearing);
				const eastBearing = GeometryUtils.isEastBearing(bearing);
				const southBearing = GeometryUtils.isSouthBearing(bearing);
				const northBearing = GeometryUtils.isNorthBearing(bearing);

				let vertLine = null;
				if (point.x > envelope.maxX) {
					if (eastBearing) {
						vertLine = right;
					}
				} else if (point.x < envelope.minX) {
					if (westBearing) {
						vertLine = left;
					}
				} else if (eastBearing) {
					vertLine = left;
				} else if (westBearing) {
					vertLine = right;
				}

				let horizLine = null;
				if (point.y > envelope.maxY) {
					if (northBearing) {
						horizLine = top;
					}
				} else if (point.y < envelope.minY) {
					if (southBearing) {
						horizLine = bottom;
					}
				} else if (northBearing) {
					horizLine = bottom;
				} else if (southBearing) {
					horizLine = top;
				}

				let vertIntersection = null;
				if (vertLine != null) {
					vertIntersection = GeometryUtils.intersectionLine(line, vertLine);
					if (vertIntersection != null
						&& !GeometryUtils.containsGeometryEnvelope(envelope, vertIntersection)) {
						vertIntersection = null;
					}
				}

				let horizIntersection = null;
				if (horizLine != null) {
					horizIntersection = GeometryUtils.intersectionLine(line, horizLine);
					if (horizIntersection != null
						&& !GeometryUtils.containsGeometryEnvelope(envelope, horizIntersection)) {
						horizIntersection = null;
					}
				}

				let intersection1: Point = null;
				let intersection2: Point = null;
				if (vertIntersection != null && horizIntersection != null) {
					const vertDistance = GeometryUtils.distance(previousPoint,
						vertIntersection);
					const horizDistance = GeometryUtils.distance(previousPoint,
						horizIntersection);
					if (vertDistance <= horizDistance) {
						intersection1 = vertIntersection;
						intersection2 = horizIntersection;
					} else {
						intersection1 = horizIntersection;
						intersection2 = vertIntersection;
					}
				} else if (vertIntersection != null) {
					intersection1 = vertIntersection;
				} else {
					intersection1 = horizIntersection;
				}

				if (intersection1 != null && !GeometryUtils.isEqual(intersection1, point)
					&& !GeometryUtils.isEqual(intersection1, previousPoint)) {

					crop.push(intersection1);

					if (!contains && !previousContains && intersection2 != null
						&& !GeometryUtils.isEqual(intersection2, intersection1)) {
						crop.push(intersection2);
					}
				}

			}

			if (contains) {
				crop.push(point);
			}

			previousPoint = point;
			previousContains = contains;
		}

		if (crop.empty) {
			crop = null;
		} else if (crop.size() > 1) {

			if (points.get(0).equals(points.get(points.size() - 1))
				&& !crop.get(0).equals(crop.get(crop.size() - 1))) {
				crop.push(new Point(crop.get(0)));
			}

			if (crop.size() > 2) {

				const simplified = new List<Point>();
				simplified.push(crop.get(0));
				for (let i = 1; i < crop.size() - 1; i++) {
					const previous = simplified.get(simplified.size() - 1);
					const point = crop.get(i);
					const next = crop.get(i + 1);
					if (!GeometryUtils.pointOnPath(point, previous, next)) {
						simplified.push(point);
					}
				}
				simplified.push(crop.get(crop.size() - 1));
				crop = simplified;

			}

		}

		return crop;
	}

	/**
	 * Crop the multi point by the envelope bounds.
	 * 
	 * @param multiPoint
	 *            multi point
	 * @param envelope
	 *            envelope
	 * @return cropped multi point or null
	 * @since 1.0.3
	 */
	public static cropMultiPoint(multiPoint: MultiPoint,
		envelope: GeometryEnvelope): MultiPoint {
		let crop: MultiPoint = null;
		const cropPoints = new List<Point>();
		for (const point of multiPoint.points) {
			const cropPoint = GeometryUtils.cropPoint(point, envelope);
			if (cropPoint != null) {
				cropPoints.push(cropPoint);
			}
		}
		if (!cropPoints.empty) {
			crop = new MultiPoint(multiPoint.hasZ, multiPoint.hasM);
			crop.points = cropPoints;
		}
		return crop;
	}

	/**
	 * Crop the line string in meters by the envelope bounds in meters. Cropping
	 * removes points outside the envelope and creates new points on the line
	 * intersections with the envelope.
	 * 
	 * @param lineString
	 *            line string in meters
	 * @param envelope
	 *            envelope in meters
	 * @return cropped line string in meters or null
	 * @since 1.0.3
	 */
	public static cropLineString(lineString: LineString,
		envelope: GeometryEnvelope): LineString {
		let crop: LineString = null;
		const cropPoints = GeometryUtils.cropPoints(lineString.points, envelope);
		if (cropPoints != null) {
			crop = new LineString(lineString.hasZ, lineString.hasM);
			crop.points = cropPoints;
		}
		return crop;
	}

	/**
	 * Crop the line in meters by the envelope bounds in meters. Cropping
	 * removes points outside the envelope and creates new points on the line
	 * intersections with the envelope.
	 * 
	 * @param line
	 *            line in meters
	 * @param envelope
	 *            envelope in meters
	 * @return cropped line in meters or null
	 * @since 1.0.3
	 */
	public static cropLine(line: Line, envelope: GeometryEnvelope): Line {
		let crop: Line = null;
		const cropPoints = GeometryUtils.cropPoints(line.points, envelope);
		if (cropPoints != null) {
			crop = new Line(line.hasZ, line.hasM);
			crop.points = cropPoints;
		}
		return crop;
	}

	/**
	 * Crop the multi line string in meters by the envelope bounds in meters.
	 * Cropping removes points outside the envelope and creates new points on
	 * the line intersections with the envelope.
	 * 
	 * @param multiLineString
	 *            multi line string in meters
	 * @param envelope
	 *            envelope in meters
	 * @return cropped multi line string in meters or null
	 * @since 1.0.3
	 */
	public static cropMultiLineString(multiLineString: MultiLineString,
		envelope: GeometryEnvelope): MultiLineString {
		let crop: MultiLineString = null;
		const cropLineStrings = new List<LineString>();
		for (const lineString of multiLineString.lineStrings) {
			const cropLineString = GeometryUtils.cropLineString(lineString, envelope);
			if (cropLineString != null) {
				cropLineStrings.push(cropLineString);
			}
		}
		if (!cropLineStrings.empty) {
			crop = new MultiLineString(multiLineString.hasZ,
				multiLineString.hasM);
			crop.lineStrings = cropLineStrings;
		}
		return crop;
	}

	/**
	 * Crop the polygon in meters by the envelope bounds in meters. Cropping
	 * removes points outside the envelope and creates new points on the line
	 * intersections with the envelope.
	 * 
	 * @param polygon
	 *            polygon in meters
	 * @param envelope
	 *            envelope in meters
	 * @return cropped polygon in meters or null
	 * @since 1.0.3
	 */
	public static cropPolygon(polygon: Polygon, envelope: GeometryEnvelope): Polygon {
		let crop: Polygon = null;
		const cropRings = new List<LineString>();
		for (const ring of polygon.rings) {
			const points = ring.points;
			if (!ring.isClosed()) {
				points.push(new Point(points.get(0)));
			}
			const cropPoints = GeometryUtils.cropPoints(points, envelope);
			if (cropPoints != null) {
				const cropRing = new LineString(ring.hasZ, ring.hasM);
				cropRing.points = cropPoints;
				cropRings.push(cropRing);
			}
		}
		if (!cropRings.empty) {
			crop = new Polygon(polygon.hasZ, polygon.hasM);
			crop.rings = cropRings;
		}
		return crop;
	}

	/**
	 * Crop the multi polygon in meters by the envelope bounds in meters.
	 * Cropping removes points outside the envelope and creates new points on
	 * the line intersections with the envelope.
	 * 
	 * @param multiPolygon
	 *            multi polygon in meters
	 * @param envelope
	 *            envelope in meters
	 * @return cropped multi polygon in meters or null
	 * @since 1.0.3
	 */
	public static cropMultiPolygon(multiPolygon: MultiPolygon,
		envelope: GeometryEnvelope): MultiPolygon {
		let crop: MultiPolygon = null;
		const cropPolygons = new List<Polygon>();
		for (const polygon of multiPolygon.polygons) {
			const cropPolygon = GeometryUtils.cropPolygon(polygon, envelope);
			if (cropPolygon != null) {
				cropPolygons.push(cropPolygon);
			}
		}
		if (!cropPolygons.empty) {
			crop = new MultiPolygon(multiPolygon.hasZ, multiPolygon.hasM);
			crop.polygons = cropPolygons;
		}
		return crop;
	}

	/**
	 * Crop the circular string in meters by the envelope bounds in meters.
	 * Cropping removes points outside the envelope and creates new points on
	 * the line intersections with the envelope.
	 * 
	 * @param circularString
	 *            circular string in meters
	 * @param envelope
	 *            envelope in meters
	 * @return cropped circular string in meters or null
	 * @since 1.0.3
	 */
	public static cropCircularString(circularString: CircularString,
		envelope: GeometryEnvelope): CircularString {
		let crop: CircularString = null;
		const cropPoints = GeometryUtils.cropPoints(circularString.points, envelope);
		if (cropPoints != null) {
			crop = new CircularString(circularString.hasZ,
				circularString.hasM);
			crop.points = cropPoints;
		}
		return crop;
	}

	/**
	 * Crop the compound curve in meters by the envelope bounds in meters.
	 * Cropping removes points outside the envelope and creates new points on
	 * the line intersections with the envelope.
	 * 
	 * @param compoundCurve
	 *            compound curve in meters
	 * @param envelope
	 *            envelope in meters
	 * @return cropped compound curve in meters or null
	 * @since 1.0.3
	 */
	public static cropCompoundCurve(compoundCurve: CompoundCurve,
		envelope: GeometryEnvelope): CompoundCurve {
		let crop: CompoundCurve = null;
		const cropLineStrings = new List<LineString>();
		for (const lineString of compoundCurve.lineStrings) {
			const cropLineString = GeometryUtils.cropLineString(lineString, envelope);
			if (cropLineString != null) {
				cropLineStrings.push(cropLineString);
			}
		}
		if (!cropLineStrings.empty) {
			crop = new CompoundCurve(compoundCurve.hasZ,
				compoundCurve.hasM);
			crop.lineStrings = cropLineStrings;
		}
		return crop;
	}

	/**
	 * Crop the curve polygon in meters by the envelope bounds in meters.
	 * Cropping removes points outside the envelope and creates new points on
	 * the line intersections with the envelope.
	 * 
	 * @param curvePolygon
	 *            curve polygon in meters
	 * @param envelope
	 *            envelope in meters
	 * @return cropped curve polygon in meters or null
	 * @since 1.0.3
	 */
	public static cropCurvePolygon(curvePolygon: CurvePolygon<Curve>,
		envelope: GeometryEnvelope): CurvePolygon<Curve> {
		let crop: CurvePolygon<Curve> = null;
		const cropRings = new List<Curve>();
		for (const ring of curvePolygon.rings) {
			const cropRing = GeometryUtils.crop(ring, envelope);
			if (cropRing != null) {
				cropRings.push(cropRing as Curve);
			}
		}
		if (!cropRings.empty) {
			crop = new CurvePolygon(curvePolygon.hasZ, curvePolygon.hasM);
			crop.rings = cropRings;
		}
		return crop;
	}

	/**
	 * Crop the polyhedral surface in meters by the envelope bounds in meters.
	 * Cropping removes points outside the envelope and creates new points on
	 * the line intersections with the envelope.
	 * 
	 * @param polyhedralSurface
	 *            polyhedral surface in meters
	 * @param envelope
	 *            envelope in meters
	 * @return cropped polyhedral surface in meters or null
	 * @since 1.0.3
	 */
	public static cropPolyhedralSurface(polyhedralSurface: PolyhedralSurface,
		envelope: GeometryEnvelope): PolyhedralSurface {
		let crop: PolyhedralSurface = null;
		const cropPolygons = new List<Polygon>();
		for (const polygon of polyhedralSurface.polygons) {
			const cropPolygon = GeometryUtils.cropPolygon(polygon, envelope);
			if (cropPolygon != null) {
				cropPolygons.push(cropPolygon);
			}
		}
		if (!cropPolygons.empty) {
			crop = new PolyhedralSurface(polyhedralSurface.hasZ,
				polyhedralSurface.hasM);
			crop.polygons = cropPolygons;
		}
		return crop;
	}

	/**
	 * Determine if the points are equal within the default tolerance of
	 * {@link GeometryConstants#DEFAULT_EQUAL_EPSILON}. For exact equality, use
	 * {@link Point#equals(Object)}.
	 * 
	 * @param point1
	 *            point 1
	 * @param point2
	 *            point 2
	 * @return true if equal
	 * @since 1.0.3
	 */
	public static isEqual(point1: Point, point2: Point): boolean {
		return GeometryUtils.isEqualWithEpsilon(point1, point2, GeometryConstants.DEFAULT_EQUAL_EPSILON);
	}

	/**
	 * Determine if the points are equal within the tolerance. For exact
	 * equality, use {@link Point#equals(Object)}.
	 * 
	 * @param point1
	 *            point 1
	 * @param point2
	 *            point 2
	 * @param epsilon
	 *            epsilon equality tolerance
	 * @return true if equal
	 * @since 1.0.3
	 */
	public static isEqualWithEpsilon(point1: Point, point2: Point, epsilon: number): boolean {
		let equal = Math.abs(point1.x - point2.x) <= epsilon
			&& Math.abs(point1.y - point2.y) <= epsilon
			&& point1.hasZ == point2.hasZ
			&& point1.hasM == point2.hasM;
		if (equal) {
			if (point1.hasZ) {
				equal = Math.abs(point1.z - point2.z) <= epsilon;
			}
			if (equal && point1.hasM) {
				equal = Math.abs(point1.m - point2.m) <= epsilon;
			}
		}
		return equal;
	}

	/**
	 * Determine if the envelope contains the point within the default tolerance
	 * of {@link GeometryConstants#DEFAULT_EQUAL_EPSILON}. For exact equality,
	 * use {@link GeometryEnvelope#contains(Point)}.
	 * 
	 * @param envelope
	 *            envelope
	 * @param point
	 *            point
	 * @return true if contains
	 * @since 1.0.3
	 */
	public static containsPoint(envelope: GeometryEnvelope, point: Point): boolean {
		return envelope.containsPointWithEpsilon(point,
			GeometryConstants.DEFAULT_EQUAL_EPSILON);
	}

	/**
	 * Determine if the first envelope contains the second within the default
	 * tolerance of {@link GeometryConstants#DEFAULT_EQUAL_EPSILON}. For exact
	 * equality, use {@link GeometryEnvelope#contains(GeometryEnvelope)}.
	 * 
	 * @param envelope1
	 *            envelope 1
	 * @param envelope2
	 *            envelope 2
	 * @return true if contains
	 * @since 1.0.3
	 */
	public static containsGeometryEnvelope(envelope1: GeometryEnvelope,
		envelope2: GeometryEnvelope): boolean {
		return envelope1.containsWithEpsilon(envelope2,
			GeometryConstants.DEFAULT_EQUAL_EPSILON);
	}

	/**
	 * Bound all points in the geometry to be within WGS84 limits.
	 * 
	 * To perform a geometry crop using line intersections, see
	 * {@link #degreesToMeters(Geometry)} and
	 * {@link #crop(Geometry, GeometryEnvelope)}.
	 * 
	 * @param geometry
	 *            geometry
	 * @since 1.0.3
	 */
	public static boundWGS84(geometry: Geometry): void {
		GeometryUtils.bound(geometry, GeometryUtils.wgs84Envelope());
	}

	/**
	 * Bound all points in the geometry to be within WGS84 projection
	 * transformable (degrees to meters) limits.
	 * 
	 * To perform a geometry crop using line intersections, see
	 * {@link #degreesToMeters(Geometry)} and
	 * {@link #crop(Geometry, GeometryEnvelope)}.
	 * 
	 * @param geometry
	 *            geometry
	 * @since 1.0.3
	 */
	public static boundWGS84Transformable(geometry: Geometry): void {
		GeometryUtils.bound(geometry, GeometryUtils.wgs84TransformableEnvelope());
	}

	/**
	 * Bound all points in the geometry to be within Web Mercator limits.
	 * 
	 * To perform a geometry crop using line intersections, see
	 * {@link #cropWebMercator(Geometry)}.
	 * 
	 * @param geometry
	 *            geometry
	 * @since 2.2.0
	 */
	public static boundWebMercator(geometry: Geometry): void {
		GeometryUtils.bound(geometry, GeometryUtils.webMercatorEnvelope());
	}

	/**
	 * Bound all points in the WGS84 geometry to be within degree Web Mercator
	 * limits.
	 * 
	 * To perform a geometry crop using line intersections, see
	 * {@link #degreesToMeters(Geometry)} and
	 * {@link #cropWebMercator(Geometry)}.
	 * 
	 * @param geometry
	 *            geometry
	 * @since 2.2.0
	 */
	public static boundWGS84WithWebMercator(geometry: Geometry): void {
		GeometryUtils.bound(geometry, GeometryUtils.wgs84EnvelopeWithWebMercator());
	}

	/**
	 * Bound all points in the geometry to be within the geometry envelope.
	 * Point x and y values are bounded by the min and max envelope values.
	 * 
	 * To perform a geometry crop using line intersections, see
	 * {@link #crop(Geometry, GeometryEnvelope)} (requires geometry in meters).
	 * 
	 * @param geometry
	 *            geometry
	 * @param envelope
	 *            geometry envelope
	 * @since 1.0.3
	 */
	public static bound(geometry: Geometry, envelope: GeometryEnvelope): void {

		const geometryType = geometry.geometryType;
		switch (geometryType) {
			case GeometryType.POINT:
				GeometryUtils.boundPoint(geometry as Point, envelope);
				break;
			case GeometryType.LINESTRING:
				GeometryUtils.boundLineString(geometry as LineString, envelope);
				break;
			case GeometryType.POLYGON:
				GeometryUtils.boundPolygon(geometry as Polygon, envelope);
				break;
			case GeometryType.MULTIPOINT:
				GeometryUtils.boundMultiPoint(geometry as MultiPoint, envelope);
				break;
			case GeometryType.MULTILINESTRING:
				GeometryUtils.boundMultiLineString(geometry as MultiLineString, envelope);
				break;
			case GeometryType.MULTIPOLYGON:
				GeometryUtils.boundMultiPolygon(geometry as MultiPolygon, envelope);
				break;
			case GeometryType.CIRCULARSTRING:
				GeometryUtils.boundLineString(geometry as CircularString, envelope);
				break;
			case GeometryType.COMPOUNDCURVE:
				GeometryUtils.boundCompoundCurve(geometry as CompoundCurve, envelope);
				break;
			case GeometryType.CURVEPOLYGON:
				const curvePolygon = geometry as CurvePolygon<Curve>;
				GeometryUtils.boundCurvePolygon(curvePolygon, envelope);
				break;
			case GeometryType.POLYHEDRALSURFACE:
				GeometryUtils.boundPolyhedralSurface(geometry as PolyhedralSurface, envelope);
				break;
			case GeometryType.TIN:
				GeometryUtils.boundPolyhedralSurface(geometry as TIN, envelope);
				break;
			case GeometryType.TRIANGLE:
				GeometryUtils.boundPolygon(geometry as Triangle, envelope);
				break;
			case GeometryType.GEOMETRYCOLLECTION:
			case GeometryType.MULTICURVE:
			case GeometryType.MULTISURFACE:
				const geomCollection = geometry as GeometryCollection<Geometry>;
				for (const subGeometry of geomCollection.geometries) {
					GeometryUtils.bound(subGeometry, envelope);
				}
				break;
			default:
				break;

		}

	}

	/**
	 * Bound the point by the geometry envelope
	 * 
	 * @param point
	 *            point
	 * @param envelope
	 *            geometry envelope
	 * @since 1.0.3
	 */
	private static boundPoint(point: Point, envelope: GeometryEnvelope): void {
		const x = point.x;
		const y = point.y;
		if (x < envelope.minX) {
			point.x = (envelope.minX);
		} else if (x > envelope.maxX) {
			point.x = (envelope.maxX);
		}
		if (y < envelope.minY) {
			point.y = (envelope.minY);
		} else if (y > envelope.maxY) {
			point.y = (envelope.maxY);
		}
	}

	/**
	 * Bound the multi point by the geometry envelope
	 * 
	 * @param multiPoint
	 *            multi point
	 * @param envelope
	 *            geometry envelope
	 * @since 1.0.3
	 */
	private static boundMultiPoint(multiPoint: MultiPoint,
		envelope: GeometryEnvelope): void {
		for (const point of multiPoint.points) {
			GeometryUtils.boundPoint(point, envelope);
		}
	}

	/**
	 * Bound the line string by the geometry envelope
	 * 
	 * @param lineString
	 *            line string
	 * @param envelope
	 *            geometry envelope
	 * @since 1.0.3
	 */
	private static boundLineString(lineString: LineString,
		envelope: GeometryEnvelope): void {
		for (const point of lineString.points) {
			GeometryUtils.boundPoint(point, envelope);
		}
	}

	/**
	 * Bound the multi line string by the geometry envelope
	 * 
	 * @param multiLineString
	 *            multi line string
	 * @param envelope
	 *            geometry envelope
	 * @since 1.0.3
	 */
	private static boundMultiLineString(multiLineString: MultiLineString,
		envelope: GeometryEnvelope): void {
		for (const lineString of multiLineString.lineStrings) {
			GeometryUtils.boundLineString(lineString, envelope);
		}
	}

	/**
	 * Bound the polygon by the geometry envelope
	 * 
	 * @param polygon
	 *            polygon
	 * @param envelope
	 *            geometry envelope
	 * @since 1.0.3
	 */
	private static boundPolygon(polygon: Polygon, envelope: GeometryEnvelope): void {
		for (const ring of polygon.rings) {
			GeometryUtils.boundLineString(ring, envelope);
		}
	}

	/**
	 * Bound the multi polygon by the geometry envelope
	 * 
	 * @param multiPolygon
	 *            multi polygon
	 * @param envelope
	 *            geometry envelope
	 * @since 1.0.3
	 */
	private static boundMultiPolygon(multiPolygon: MultiPolygon,
		envelope: GeometryEnvelope): void {
		for (const polygon of multiPolygon.polygons) {
			GeometryUtils.boundPolygon(polygon, envelope);
		}
	}

	/**
	 * Bound the compound curve by the geometry envelope
	 * 
	 * @param compoundCurve
	 *            compound curve
	 * @param envelope
	 *            geometry envelope
	 * @since 1.0.3
	 */
	private static boundCompoundCurve(compoundCurve: CompoundCurve,
		envelope: GeometryEnvelope): void {
		for (const lineString of compoundCurve.lineStrings) {
			GeometryUtils.boundLineString(lineString, envelope);
		}
	}

	/**
	 * Bound the curve polygon by the geometry envelope
	 * 
	 * @param curvePolygon
	 *            curve polygon
	 * @param envelope
	 *            geometry envelope
	 * @since 1.0.3
	 */
	private static boundCurvePolygon(curvePolygon: CurvePolygon<Curve>,
		envelope: GeometryEnvelope): void {
		for (const ring of curvePolygon.rings) {
			GeometryUtils.bound(ring, envelope);
		}
	}

	/**
	 * Bound the polyhedral surface by the geometry envelope
	 * 
	 * @param polyhedralSurface
	 *            polyhedral surface
	 * @param envelope
	 *            geometry envelope
	 * @since 1.0.3
	 */
	private static boundPolyhedralSurface(polyhedralSurface: PolyhedralSurface,
		envelope: GeometryEnvelope): void {
		for (const polygon of polyhedralSurface.polygons) {
			GeometryUtils.boundPolygon(polygon, envelope);
		}
	}

	/**
	 * Get the parent type hierarchy of the provided geometry type starting with
	 * the immediate parent. If the argument is GEOMETRY, an empty list is
	 * returned, else the final type in the list will be GEOMETRY.
	 * @param geometryType geometry type
	 * @return list of increasing parent types
	 */
	public static parentHierarchy(geometryType: GeometryType): Array<GeometryType> {
		let hierarchy: Array<GeometryType> = [];
		let parentType = GeometryUtils.parentType(geometryType);
		while (parentType != null) {
			hierarchy.push(parentType);
			parentType = GeometryUtils.parentType(parentType);
		}
		return hierarchy;
	}

	/**
	 * Get the parent Geometry Type of the provided geometry type
	 * @param geometryType geometry type
	 * @return parent geometry type or null if argument is GEOMETRY (no parent type)
	 */
	public static parentType(geometryType: GeometryType): GeometryType {
		let parentType: GeometryType = null;

		switch (geometryType) {

			case GeometryType.GEOMETRY:
				break;
			case GeometryType.POINT:
				parentType = GeometryType.GEOMETRY;
				break;
			case GeometryType.LINESTRING:
				parentType = GeometryType.CURVE;
				break;
			case GeometryType.POLYGON:
				parentType = GeometryType.CURVEPOLYGON;
				break;
			case GeometryType.MULTIPOINT:
				parentType = GeometryType.GEOMETRYCOLLECTION;
				break;
			case GeometryType.MULTILINESTRING:
				parentType = GeometryType.MULTICURVE;
				break;
			case GeometryType.MULTIPOLYGON:
				parentType = GeometryType.MULTISURFACE;
				break;
			case GeometryType.GEOMETRYCOLLECTION:
				parentType = GeometryType.GEOMETRY;
				break;
			case GeometryType.CIRCULARSTRING:
				parentType = GeometryType.LINESTRING;
				break;
			case GeometryType.COMPOUNDCURVE:
				parentType = GeometryType.CURVE;
				break;
			case GeometryType.CURVEPOLYGON:
				parentType = GeometryType.SURFACE;
				break;
			case GeometryType.MULTICURVE:
				parentType = GeometryType.GEOMETRYCOLLECTION;
				break;
			case GeometryType.MULTISURFACE:
				parentType = GeometryType.GEOMETRYCOLLECTION;
				break;
			case GeometryType.CURVE:
				parentType = GeometryType.GEOMETRY;
				break;
			case GeometryType.SURFACE:
				parentType = GeometryType.GEOMETRY;
				break;
			case GeometryType.POLYHEDRALSURFACE:
				parentType = GeometryType.SURFACE;
				break;
			case GeometryType.TIN:
				parentType = GeometryType.POLYHEDRALSURFACE;
				break;
			case GeometryType.TRIANGLE:
				parentType = GeometryType.POLYGON;
				break;
			default:
				throw new SFException("Geometry Type not supported: " + geometryType);
		}

		return parentType;
	}

	/**
	 * Get the child type hierarchy of the provided geometry type.
	 * @param geometryType geometry type
	 * @return child type hierarchy, null if no children
	 */
	public static childHierarchy(geometryType: GeometryType): Map<GeometryType, Map<GeometryType, any>> {
		let hierarchy: Map<GeometryType, Map<GeometryType, any>> = null;

		let childTypes: Array<GeometryType> = GeometryUtils.childTypes(geometryType);

		if (childTypes.length > 0) {
			hierarchy = new Map();

			for (let childType of childTypes) {
				hierarchy.set(childType, GeometryUtils.childHierarchy(childType));
			}
		}

		return hierarchy;
	}

	/**
	 * Get the immediate child Geometry Types of the provided geometry type
	 * @param geometryType geometry type
	 * @return child geometry types, empty list if no child types
	 */
	public static childTypes(geometryType: GeometryType): Array<GeometryType> {
		let childTypes: Array<GeometryType> = [];
		switch (geometryType) {
			case GeometryType.GEOMETRY:
				childTypes.push(GeometryType.POINT);
				childTypes.push(GeometryType.GEOMETRYCOLLECTION);
				childTypes.push(GeometryType.CURVE);
				childTypes.push(GeometryType.SURFACE);
				break;
			case GeometryType.POINT:
				break;
			case GeometryType.LINESTRING:
				childTypes.push(GeometryType.CIRCULARSTRING);
				break;
			case GeometryType.POLYGON:
				childTypes.push(GeometryType.TRIANGLE);
				break;
			case GeometryType.MULTIPOINT:
				break;
			case GeometryType.MULTILINESTRING:
				break;
			case GeometryType.MULTIPOLYGON:
				break;
			case GeometryType.GEOMETRYCOLLECTION:
				childTypes.push(GeometryType.MULTIPOINT);
				childTypes.push(GeometryType.MULTICURVE);
				childTypes.push(GeometryType.MULTISURFACE);
				break;
			case GeometryType.CIRCULARSTRING:
				break;
			case GeometryType.COMPOUNDCURVE:
				break;
			case GeometryType.CURVEPOLYGON:
				childTypes.push(GeometryType.POLYGON);
				break;
			case GeometryType.MULTICURVE:
				childTypes.push(GeometryType.MULTILINESTRING);
				break;
			case GeometryType.MULTISURFACE:
				childTypes.push(GeometryType.MULTIPOLYGON);
				break;
			case GeometryType.CURVE:
				childTypes.push(GeometryType.LINESTRING);
				childTypes.push(GeometryType.COMPOUNDCURVE);
				break;
			case GeometryType.SURFACE:
				childTypes.push(GeometryType.CURVEPOLYGON);
				childTypes.push(GeometryType.POLYHEDRALSURFACE);
				break;
			case GeometryType.POLYHEDRALSURFACE:
				childTypes.push(GeometryType.TIN);
				break;
			case GeometryType.TIN:
				break;
			case GeometryType.TRIANGLE:
				break;
			default:
				throw new SFException("Geometry Type not supported: " + geometryType);
		}

		return childTypes;
	}
}
