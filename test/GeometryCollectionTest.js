import { MultiPoint, GeometryCollection, GeometryType, ExtendedGeometryCollection, MultiPolygon, MultiLineString } from '../lib/internal'

describe('GeometrySerializableTest', function () {
  it('test multi point', function () {
    const points = [];
    for (let i = 0; i < 5; i++) {
      points.push(global.createPoint(global.coinFlip(), global.coinFlip()));
    }
    let geometries = [];
    geometries.push(...points);

    const multiPoint = new MultiPoint(points);
    const geometryCollection = new GeometryCollection(geometries);
		multiPoint.numPoints().should.be.equal(geometryCollection.numGeometries());
		multiPoint.numGeometries().should.be.equal(geometryCollection.numGeometries());
		for (let i = 0; i < multiPoint.numGeometries(); i++) {
			multiPoint.getGeometry(i).equals(geometryCollection.getGeometry(i)).should.be.true;
		}

		multiPoint.isMultiPoint().should.be.true;
		multiPoint.getCollectionType().should.be.equal(GeometryType.MULTIPOINT);

    multiPoint.isMultiLineString().should.be.false;
    multiPoint.isMultiCurve().should.be.false;
    multiPoint.isMultiPolygon().should.be.false;
    multiPoint.isMultiSurface().should.be.false;

		geometryCollection.isMultiPoint().should.be.true;
		geometryCollection.getCollectionType().should.be.equal(GeometryType.MULTIPOINT);
		geometryCollection.isMultiLineString().should.be.false;
		geometryCollection.isMultiCurve().should.be.false;
		geometryCollection.isMultiPolygon().should.be.false;
		geometryCollection.isMultiSurface().should.be.false;

    const multiPoint2 = geometryCollection.getAsMultiPoint();
		multiPoint.equals(multiPoint2).should.be.true;
		multiPoint.getAsMultiPoint().equals(multiPoint2).should.be.true;

    const geometryCollection2 = multiPoint.getAsGeometryCollection();
		geometryCollection.equals(geometryCollection2).should.be.true;
		geometryCollection2.equals(geometryCollection.getAsGeometryCollection()).should.be.true;

    const extendedGeometryCollection = new ExtendedGeometryCollection(geometryCollection);
		extendedGeometryCollection.geometryType.should.be.equal(GeometryType.GEOMETRYCOLLECTION);
		extendedGeometryCollection.getCollectionType().should.be.equal(GeometryType.MULTIPOINT);
		extendedGeometryCollection.equals(new ExtendedGeometryCollection(geometryCollection)).should.be.true;
  });

  it('test multi line string', function () {
    const lineStrings = [];
    for (let i = 0;  i < 5; i++)  {
      lineStrings.push(global.createLineString(global.coinFlip(), global.coinFlip()));
    }

 		const geometries = [];
    geometries.push(...lineStrings);

    const multiLineString = new MultiLineString(lineStrings);
    const geometryCollection = new GeometryCollection(geometries);

		multiLineString.numLineStrings().should.be.equal(geometryCollection.numGeometries());
		multiLineString.numGeometries().should.be.equal(geometryCollection.numGeometries());
		for (let i = 0; i < multiLineString.numGeometries(); i++) {
			multiLineString.getGeometry(i).equals(geometryCollection.getGeometry(i)).should.be.true;
		}

		multiLineString.isMultiLineString().should.be.true;
		multiLineString.isMultiCurve().should.be.true;
		multiLineString.getCollectionType().should.be.equal(GeometryType.MULTILINESTRING);
		multiLineString.isMultiPoint().should.be.false;
		multiLineString.isMultiPolygon().should.be.false;
		multiLineString.isMultiSurface().should.be.false;

		geometryCollection.isMultiLineString().should.be.true;
		geometryCollection.isMultiCurve().should.be.true;
		geometryCollection.getCollectionType().should.be.equal(GeometryType.MULTILINESTRING);
		geometryCollection.isMultiPoint().should.be.false;
		geometryCollection.isMultiPolygon().should.be.false;
		geometryCollection.isMultiSurface().should.be.false;

    const multiLineString2 = geometryCollection.getAsMultiLineString();

		multiLineString.equals(multiLineString2).should.be.true;
		multiLineString2.equals(multiLineString.getAsMultiLineString()).should.be.true;

    const geometryCollection2 = multiLineString.getAsGeometryCollection();
		geometryCollection.equals(geometryCollection2).should.be.true;
		geometryCollection2.equals(geometryCollection.getAsGeometryCollection()).should.be.true;

    const multiCurve = geometryCollection.getAsMultiCurve();
		for (let i = 0; i < multiLineString.numGeometries(); i++) {
			multiLineString.getGeometry(i).equals(multiCurve.getGeometry(i)).should.be.true;
		}
    const multiCurve2 = multiLineString.getAsMultiCurve();
		multiCurve.equals(multiCurve2).should.be.true;

    const extendedGeometryCollection = new ExtendedGeometryCollection(geometryCollection);
		extendedGeometryCollection.geometryType.should.be.equal(GeometryType.MULTICURVE);
		extendedGeometryCollection.getCollectionType().should.be.equal(GeometryType.MULTILINESTRING);
		extendedGeometryCollection.equals(new ExtendedGeometryCollection(geometryCollection)).should.be.true;
  });

  it('test multi polygon', function () {
    const polygons = [];
    for (let i = 0; i < 5; i++ ) {
      polygons.push(global.createPolygon(global.coinFlip(), global.coinFlip()));
    }

    const geometries = []
    geometries.push(...polygons);

    const multiPolygon = new MultiPolygon(polygons);
    const geometryCollection = new GeometryCollection(geometries);

		multiPolygon.numPolygons().should.be.equal(geometryCollection.numGeometries());
		multiPolygon.numGeometries().should.be.equal(geometryCollection.numGeometries());
		for (let i = 0; i < multiPolygon.numGeometries(); i++) {
			multiPolygon.getGeometry(i).equals(geometryCollection.getGeometry(i)).should.be.true;
		}

		multiPolygon.isMultiPolygon().should.be.true;
		multiPolygon.isMultiSurface().should.be.true;
		multiPolygon.getCollectionType().should.be.equal(GeometryType.MULTIPOLYGON);
		multiPolygon.isMultiLineString().should.be.false;
		multiPolygon.isMultiCurve().should.be.false;
		multiPolygon.isMultiPoint().should.be.false;

		geometryCollection.isMultiPolygon().should.be.true;
		geometryCollection.isMultiSurface().should.be.true;
		geometryCollection.getCollectionType().should.be.equal(GeometryType.MULTIPOLYGON);
		geometryCollection.isMultiLineString().should.be.false;
		geometryCollection.isMultiCurve().should.be.false;
		geometryCollection.isMultiPoint().should.be.false;

    const multiPolygon2 = geometryCollection.getAsMultiPolygon();
		multiPolygon.equals(multiPolygon2).should.be.true;
		multiPolygon2.equals(multiPolygon.getAsMultiPolygon()).should.be.true;

    const geometryCollection2 = multiPolygon.getAsGeometryCollection();
		geometryCollection.equals(geometryCollection2).should.be.true;
		geometryCollection2.equals(geometryCollection.getAsGeometryCollection()).should.be.true;

    const multiSurface = geometryCollection.getAsMultiSurface();
		for (let i = 0; i < multiPolygon.numGeometries(); i++) {
			multiPolygon.getGeometry(i).equals(multiSurface.getGeometry(i)).should.be.true;
		}
    const multiSurface2 = multiPolygon.getAsMultiSurface();
		multiSurface.equals(multiSurface2);

		const extendedGeometryCollection = new ExtendedGeometryCollection(geometryCollection);
		extendedGeometryCollection.geometryType.should.be.equal(GeometryType.MULTISURFACE);
		extendedGeometryCollection.getCollectionType().should.be.equal(GeometryType.MULTIPOLYGON);
		extendedGeometryCollection.equals(new ExtendedGeometryCollection(geometryCollection)).should.be.true;
  });

  it('test multi curve', function () {
    const curves = [];
    for (let i = 0; i < 5; i++) {
      if (i % 2 === 0) {
        curves.push(global.createCompoundCurve(global.coinFlip(), global.coinFlip()));
      } else {
        curves.push(global.createLineString(global.coinFlip(), global.coinFlip()));
      }
    }

    const geometries = [];
    geometries.push(...curves);

    const multiCurve = new GeometryCollection(curves);
    const geometryCollection = new GeometryCollection(geometries);

		multiCurve.numGeometries().should.be.equal(geometryCollection.numGeometries());
		for (let i = 0; i < multiCurve.numGeometries(); i++) {
			multiCurve.getGeometry(i).equals(geometryCollection.getGeometry(i)).should.be.true;
		}

		multiCurve.isMultiCurve().should.be.true;
		multiCurve.getCollectionType().should.be.equal(GeometryType.MULTICURVE);
		multiCurve.isMultiSurface().should.be.false;
		multiCurve.isMultiLineString().should.be.false;
		multiCurve.isMultiPolygon().should.be.false;
		multiCurve.isMultiPoint().should.be.false;

		geometryCollection.isMultiCurve().should.be.true;
		geometryCollection.getCollectionType().should.be.equal(GeometryType.MULTICURVE);
		geometryCollection.isMultiPolygon().should.be.false;
		geometryCollection.isMultiLineString().should.be.false;
		geometryCollection.isMultiSurface().should.be.false;
		geometryCollection.isMultiPoint().should.be.false;

    const multiCurve2 = geometryCollection.getAsMultiCurve();
		multiCurve.equals(multiCurve2).should.be.true;
		multiCurve2.equals(multiCurve.getAsMultiCurve()).should.be.true;

    const geometryCollection2 = multiCurve.getAsGeometryCollection();
		geometryCollection.equals(geometryCollection2).should.be.true;
		geometryCollection2.equals(geometryCollection.getAsGeometryCollection()).should.be.true;

    const extendedGeometryCollection = new ExtendedGeometryCollection(geometryCollection);
    const extendedGeometryCollection2 = new ExtendedGeometryCollection(multiCurve);
		extendedGeometryCollection.geometryType.should.be.equal(GeometryType.MULTICURVE)
		extendedGeometryCollection2.geometryType.should.be.equal(GeometryType.MULTICURVE)
		extendedGeometryCollection.getCollectionType().should.be.equal(GeometryType.MULTICURVE)
		extendedGeometryCollection2.getCollectionType().should.be.equal(GeometryType.MULTICURVE)
		extendedGeometryCollection.equals(new ExtendedGeometryCollection(geometryCollection)).should.be.true;
		extendedGeometryCollection.equals(extendedGeometryCollection2).should.be.true;
  });

  it('test multi surface', function () {
    const surfaces = [];
    for (let i = 0; i < 5; i++) {
      if (i % 2 === 0) {
        surfaces.push(global.createCurvePolygon(global.coinFlip(), global.coinFlip()));
      } else {
        surfaces.push(global.createPolygon(global.coinFlip(), global.coinFlip()));
      }
    }

    const geometries = [];
    geometries.push(...surfaces);

    const multiSurface = new GeometryCollection(surfaces);
    const geometryCollection = new GeometryCollection(geometries);

		multiSurface.numGeometries().should.be.equal(geometryCollection.numGeometries());
		for (let i = 0; i < multiSurface.numGeometries(); i++) {
			multiSurface.getGeometry(i).equals(geometryCollection.getGeometry(i)).should.be.true;
		}
		multiSurface.isMultiSurface().should.be.true;
		multiSurface.getCollectionType().should.be.equal(GeometryType.MULTISURFACE);
		multiSurface.isMultiCurve().should.be.false;
		multiSurface.isMultiLineString().should.be.false;
		multiSurface.isMultiPolygon().should.be.false;
		multiSurface.isMultiPoint().should.be.false;

		geometryCollection.isMultiSurface().should.be.true;
		geometryCollection.getCollectionType().should.be.equal(GeometryType.MULTISURFACE);
		geometryCollection.isMultiPolygon().should.be.false;
		geometryCollection.isMultiLineString().should.be.false;
		geometryCollection.isMultiCurve().should.be.false;
		geometryCollection.isMultiPoint().should.be.false;

		const multiSurface2 = geometryCollection.getAsMultiSurface();
		multiSurface.equals(multiSurface2).should.be.true;
		multiSurface2.equals(multiSurface.getAsMultiSurface()).should.be.true;

    const geometryCollection2 = multiSurface.getAsGeometryCollection();
		geometryCollection.equals(geometryCollection2).should.be.true;
		geometryCollection2.equals(geometryCollection.getAsGeometryCollection()).should.be.true;

    const extendedGeometryCollection = new ExtendedGeometryCollection(geometryCollection);
    const extendedGeometryCollection2 = new ExtendedGeometryCollection(multiSurface);
		extendedGeometryCollection.geometryType.should.be.equal(GeometryType.MULTISURFACE)
		extendedGeometryCollection2.geometryType.should.be.equal(GeometryType.MULTISURFACE)
		extendedGeometryCollection.getCollectionType().should.be.equal(GeometryType.MULTISURFACE)
		extendedGeometryCollection2.getCollectionType().should.be.equal(GeometryType.MULTISURFACE)
		extendedGeometryCollection.equals(new ExtendedGeometryCollection(geometryCollection)).should.be.true;
		extendedGeometryCollection.equals(extendedGeometryCollection2).should.be.true;
  });
});
