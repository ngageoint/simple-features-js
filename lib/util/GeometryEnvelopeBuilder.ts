import {
	Geometry,
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
	MultiCurve,
	MultiSurface,
	GeometryEnvelope,
	Curve
} from "../internal";

/**
 * Builds an envelope from a Geometry
 */
export class GeometryEnvelopeBuilder {
	/**
	 * Build Geometry Envelope
	 * @param geometry geometry to build envelope from
	 * @return geometry envelope
	 */
	public static buildEnvelope (geometry: Geometry): GeometryEnvelope {
		let envelope = new GeometryEnvelope();

		envelope.minX = Number.MAX_VALUE;
		envelope.maxX = -Number.MAX_VALUE;
		envelope.minY = Number.MAX_VALUE;
		envelope.maxY = -Number.MAX_VALUE;

		GeometryEnvelopeBuilder.buildEnvelopeWithEnvelope(geometry, envelope);

		if (envelope.minX > envelope.maxX || envelope.minY > envelope.maxY) {
			envelope = null;
		}

		return envelope;
	}

	/**
	 * Build Geometry Envelope
	 * @param geometry geometry to build envelope from
	 * @param envelope geometry envelope to expand
	 */
	public static buildEnvelopeWithEnvelope(geometry: Geometry, envelope: GeometryEnvelope): void {
		if (geometry instanceof Point) {
			GeometryEnvelopeBuilder.addPoint(envelope, geometry);
		} else if (geometry instanceof LineString) {
			GeometryEnvelopeBuilder.addLineString(envelope, geometry);
		} else if (geometry instanceof Polygon) {
			GeometryEnvelopeBuilder.addPolygon(envelope, geometry);
		} else if (geometry instanceof MultiPoint) {
			GeometryEnvelopeBuilder.addMultiPoint(envelope, geometry);
		} else if (geometry instanceof MultiLineString) {
			GeometryEnvelopeBuilder.addMultiLineString(envelope, geometry);
		} else if (geometry instanceof MultiPolygon) {
			GeometryEnvelopeBuilder.addMultiPolygon(envelope, geometry);
		}  else if (geometry instanceof CircularString) {
			GeometryEnvelopeBuilder.addLineString(envelope, geometry);
		} else if (geometry instanceof CompoundCurve) {
			GeometryEnvelopeBuilder.addCompoundCurve(envelope, geometry);
		} else if (geometry instanceof CurvePolygon) {
			GeometryEnvelopeBuilder.addCurvePolygon(envelope, geometry);
		} else if (geometry instanceof PolyhedralSurface) {
			GeometryEnvelopeBuilder.addPolyhedralSurface(envelope, geometry);
		} else if (geometry instanceof TIN) {
			GeometryEnvelopeBuilder.addPolyhedralSurface(envelope, geometry);
		} else if (geometry instanceof Triangle) {
			GeometryEnvelopeBuilder.addPolygon(envelope, geometry);
		} else if (geometry instanceof GeometryCollection || geometry instanceof MultiCurve || geometry instanceof MultiSurface) {
			GeometryEnvelopeBuilder.updateHasZandM(envelope, geometry);
			const geometries = (geometry as GeometryCollection<Geometry>).geometries;
			geometries.forEach(subGeometry => {
				GeometryEnvelopeBuilder.buildEnvelopeWithEnvelope(subGeometry, envelope);
			});
		}
	}

	/**
	 * Update the has z and m values
	 * @param envelope geometry envelope
	 * @param geometry geometry
	 */
	private static updateHasZandM (envelope: GeometryEnvelope, geometry: Geometry) {
		if (!envelope.hasZ && geometry.hasZ) {
			envelope.hasZ = true;
		}
		if (!envelope.hasM && geometry.hasM) {
			envelope.hasM = true;
		}
	}

	/**
	 * Add Point
	 * @param envelope geometry envelope
	 * @param point point
	 */
	private static addPoint(envelope: GeometryEnvelope, point: Point): void {

		GeometryEnvelopeBuilder.updateHasZandM(envelope, point);

		let x = point.x;
		let y = point.y;
		if (x < envelope.minX) {
			envelope.minX = x;
		}
		if (x > envelope.maxX) {
			envelope.maxX = x;
		}
		if (y < envelope.minY) {
			envelope.minY = y;
		}
		if (y > envelope.maxY) {
			envelope.maxY = y;
		}
		if (point.hasZ) {
			let z = point.z;
			if (z != null) {
				if (envelope.minZ == null || z < envelope.minZ) {
					envelope.minZ = z;
				}
				if (envelope.maxZ == null || z > envelope.maxZ) {
					envelope.maxZ = z;
				}
			}
		}
		if (point.hasM) {
			let m = point.m;
			if (m != null) {
				if (envelope.minM == null || m < envelope.minM) {
					envelope.minM = m;
				}
				if (envelope.maxM == null || m > envelope.maxM) {
					envelope.maxM = m;
				}
			}
		}
	}

	/**
	 * Add MultiPoint
	 * @param envelope geometry envelope
	 * @param multiPoint multi point
	 */
	private static addMultiPoint(envelope: GeometryEnvelope, multiPoint: MultiPoint): void {
		GeometryEnvelopeBuilder.updateHasZandM(envelope, multiPoint);
		multiPoint.points.forEach(point => GeometryEnvelopeBuilder.addPoint(envelope, point));
	}

	/**
	 * Add LineString
	 * @param envelope geometry envelope
	 * @param lineString line string
	 */
	private static addLineString(envelope: GeometryEnvelope, lineString: LineString | CircularString): void {
		GeometryEnvelopeBuilder.updateHasZandM(envelope, lineString);
		lineString.points.forEach(point => GeometryEnvelopeBuilder.addPoint(envelope, point));
	}

	/**
	 * Add MultiLineString
	 * @param envelope geometry envelope
	 * @param multiLineString multi line string
	 */
	private static addMultiLineString(envelope: GeometryEnvelope, multiLineString: MultiLineString): void {
		GeometryEnvelopeBuilder.updateHasZandM(envelope, multiLineString);
		multiLineString.lineStrings.forEach(lineString => GeometryEnvelopeBuilder.addLineString(envelope, lineString));
	}

	/**
	 * Add Polygon
	 * @param envelope geometry envelope
	 * @param polygon polygon
	 */
	private static addPolygon(envelope: GeometryEnvelope, polygon: Polygon): void {
		GeometryEnvelopeBuilder.updateHasZandM(envelope, polygon);
		polygon.rings.forEach(ring => GeometryEnvelopeBuilder.addLineString(envelope, ring));
	}

	/**
	 * Add MultiPolygon
	 * @param envelope geometry envelope
	 * @param multiPolygon multi polygon
	 */
	private static addMultiPolygon(envelope: GeometryEnvelope, multiPolygon: MultiPolygon): void {
		GeometryEnvelopeBuilder.updateHasZandM(envelope, multiPolygon);
		multiPolygon.polygons.forEach(polygon => GeometryEnvelopeBuilder.addPolygon(envelope, polygon));
	}

	/**
	 * Add CompoundCurve
	 * @param envelope geometry envelope
	 * @param compoundCurve compound curve
	 */
	private static addCompoundCurve(envelope: GeometryEnvelope, compoundCurve: CompoundCurve): void {
		GeometryEnvelopeBuilder.updateHasZandM(envelope, compoundCurve);
		compoundCurve.lineStrings.forEach(lineString => GeometryEnvelopeBuilder.addLineString(envelope, lineString));
	}

	/**
	 * Add CurvePolygon
	 * @param envelope geometry envelope
	 * @param curvePolygon curve polygon
	 */
	private static addCurvePolygon(envelope: GeometryEnvelope, curvePolygon: CurvePolygon<Curve>): void {
		GeometryEnvelopeBuilder.updateHasZandM(envelope, curvePolygon);
		curvePolygon.rings.forEach(ring => GeometryEnvelopeBuilder.buildEnvelopeWithEnvelope(ring, envelope));
	}

	/**
	 * Add PolyhedralSurface
	 * @param envelope geometry envelope
	 * @param polyhedralSurface polyhedral surface
	 */
	private static addPolyhedralSurface(envelope: GeometryEnvelope, polyhedralSurface: PolyhedralSurface): void {
		GeometryEnvelopeBuilder.updateHasZandM(envelope, polyhedralSurface);
		polyhedralSurface.polygons.forEach(polygon => GeometryEnvelopeBuilder.addPolygon(envelope, polygon));
	}
}