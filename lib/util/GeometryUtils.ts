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
	Curve
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
	 * Get the centroid point of a 2 dimensional representation of the Geometry
	 * (balancing point of a 2d cutout of the geometry). Only the x and y
	 * coordinate of the resulting point are calculated and populated. The
	 * resulting {@link Point#getZ()} and {@link Point#getM()} methods will
	 * always return null.
	 * @param geometry geometry object
	 * @return centroid point
	 */
	public static getCentroid (geometry: Geometry): Point {
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
		let geometryType: GeometryType = geometry.geometryType;
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
			GeometryUtils.minimizeCurvePolygon(geometry as CurvePolygon<Curve>, maxX);
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
			for (const subGeometry of (geometry as GeometryCollection<Geometry>).geometries) {
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
		return GeometryUtils.pointOnPolygonEdgeWithEpsilon(point, polygon,GeometryUtils.DEFAULT_EPSILON);
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
		return GeometryUtils.pointOnLinePointsWithEpsilon(point, points,GeometryUtils.DEFAULT_EPSILON);
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
