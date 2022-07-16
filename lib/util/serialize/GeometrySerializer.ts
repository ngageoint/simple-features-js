import {
    SFException,
    GeometryType,
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
} from "../../internal";

export class GeometrySerializer {
    /**
     * Serialize the geometry to JSON
     * @param geometry geometry
     * @return serialized JSON
     */
    public static serialize(geometry: Geometry): string  {
        return JSON.stringify(geometry);
    }

    public static fromJSON (obj: any): Geometry {
        let geometry: Geometry;
        const geometryType = obj._geometryType
        switch (geometryType) {
            case GeometryType.POINT:
                const point = new Point();
                point.x = obj._x;
                point.y = obj._y;
                point.z = obj._z;
                point.m = obj._m;
                point.hasZ = obj._hasZ;
                point.hasM = obj._hasM;
                geometry = point
                break;
            case GeometryType.LINESTRING:
                const lineString = new LineString();
                obj._points.forEach(point => {
                    lineString.addPoint(GeometrySerializer.fromJSON(point) as Point);
                })
                lineString.hasZ = obj._hasZ;
                lineString.hasM = obj._hasM;
                geometry = lineString
                break;
            case GeometryType.POLYGON:
                const polygon = new Polygon();
                obj._rings.forEach(ring => {
                    polygon.addRing(GeometrySerializer.fromJSON(ring) as LineString);
                })
                polygon.hasZ = obj._hasZ;
                polygon.hasM = obj._hasM;
                geometry = polygon;
                break;
            case GeometryType.MULTIPOINT:
                const multiPoint = new MultiPoint();
                obj._geometries.forEach(point => {
                    multiPoint.addPoint(GeometrySerializer.fromJSON(point) as Point);
                })
                multiPoint.hasZ = obj._hasZ;
                multiPoint.hasM = obj._hasM;
                geometry = multiPoint;
                break;
            case GeometryType.MULTILINESTRING:
                const multiLineString = new MultiLineString();
                obj._geometries.forEach(lineString => {
                    multiLineString.addLineString(GeometrySerializer.fromJSON(lineString) as LineString);
                });
                multiLineString.hasZ = obj._hasZ;
                multiLineString.hasM = obj._hasM;
                geometry = multiLineString;
                break;
            case GeometryType.MULTIPOLYGON:
                const multiPolygon = new MultiPolygon();
                obj._geometries.forEach(polygon => {
                    multiPolygon.addPolygon(GeometrySerializer.fromJSON(polygon) as Polygon);
                });
                multiPolygon.hasZ = obj._hasZ;
                multiPolygon.hasM = obj._hasM;
                geometry = multiPolygon;
                break;
            case GeometryType.GEOMETRYCOLLECTION:
                const geometryCollection = new GeometryCollection();
                obj._geometries.forEach(geometry => {
                    geometryCollection.addGeometry(GeometrySerializer.fromJSON(geometry));
                });
                geometryCollection.hasZ = obj._hasZ;
                geometryCollection.hasM = obj._hasM;
                geometry = geometryCollection;
                break;
            case GeometryType.CIRCULARSTRING:
                const circularString = new CircularString();
                obj._points.forEach(point => {
                    circularString.addPoint(GeometrySerializer.fromJSON(point) as Point);
                })
                circularString.hasZ = obj._hasZ;
                circularString.hasM = obj._hasM;
                geometry = circularString;
                break;
            case GeometryType.COMPOUNDCURVE:
                const compoundCurve = new CompoundCurve();
                obj._lineStrings.forEach(lineString => {
                    compoundCurve.addLineString(GeometrySerializer.fromJSON(lineString) as LineString);
                });
                compoundCurve.hasZ = obj._hasZ;
                compoundCurve.hasM = obj._hasM;
                geometry = compoundCurve;
                break;
            case GeometryType.CURVEPOLYGON:
                const curvePolygon = new CurvePolygon();
                obj._rings.forEach(ring => {
                    curvePolygon.addRing(GeometrySerializer.fromJSON(ring) as LineString);
                });
                curvePolygon.hasZ = obj._hasZ;
                curvePolygon.hasM = obj._hasM;
                geometry = curvePolygon;
                break;
            case GeometryType.POLYHEDRALSURFACE:
                const polyhedralSurface = new PolyhedralSurface();
                obj._polygons.forEach(polygon => {
                    polyhedralSurface.addPolygon(GeometrySerializer.fromJSON(polygon) as Polygon);
                });
                polyhedralSurface.hasZ = obj._hasZ;
                polyhedralSurface.hasM = obj._hasM;
                geometry = polyhedralSurface;
                break;
            case GeometryType.TIN:
                const tin = new TIN();
                obj._polygons.forEach(polygon => {
                    tin.addPolygon(GeometrySerializer.fromJSON(polygon) as Polygon);
                });
                tin.hasZ = obj._hasZ;
                tin.hasM = obj._hasM;
                geometry = tin;
                break;
            case GeometryType.TRIANGLE:
                const triangle = new Triangle();
                obj._rings.forEach(ring => {
                    triangle.addRing(GeometrySerializer.fromJSON(ring) as LineString);
                })
                triangle.hasZ = obj._hasZ;
                triangle.hasM = obj._hasM;
                geometry = triangle;
                break;
            default:
                throw new SFException("Geometry Type not supported: " + geometryType);
        }
        return geometry;
    }

    /**
     * Deserialize the json into a geometry
     * @param json serialized json
     * @return geometry
     */
    public static deserialize(json: string): Geometry {
        return GeometrySerializer.fromJSON(JSON.parse(json));
    }
}