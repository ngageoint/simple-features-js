// @ts-ignore
const should = require('chai').should();
const { Point, Polygon, LineString, GeometryUtils, GeometryType, GeometryCollection, GeometryEnvelopeBuilder, MultiPolygon } = require('../lib/internal');
const SFTestUtils = require('./SFTestUtils');

/**
 * Number of random geometries to create for each test
 */
GEOMETRIES_PER_TEST = 10;


function geometryCentroidTester(geometry) {
	const point = geometry.getCentroid();
	const envelope = GeometryEnvelopeBuilder.buildEnvelope(geometry);

	if (geometry.geometryType === GeometryType.POINT) {
		envelope.minX.should.be.equal(point.x);
		envelope.maxX.should.be.equal(point.x);
		envelope.minY.should.be.equal(point.y);
		envelope.maxY.should.be.equal(point.y);
	}

	(point.x >= envelope.minX).should.be.true;
	(point.x <= envelope.maxX).should.be.true;
	(point.y >= envelope.minY).should.be.true;
	(point.y <= envelope.maxY).should.be.true;

	const envelopeCentroid1 = envelope.buildGeometry().getCentroid();
	const envelopeCentroid2 = envelope.centroid;

	let deviation = 0.000000000001;

	envelopeCentroid1.x.should.be.within(envelopeCentroid2.x - deviation, envelopeCentroid2.x + deviation);
	envelopeCentroid1.y.should.be.within(envelopeCentroid2.y - deviation, envelopeCentroid2.y + deviation);

	return point;
}

function createPolygon () {
	const polygon = new Polygon();
	const lineString = new LineString();
	lineString.addPoint(createRandomPoint(-180.0, 45.0, 90.0, 45.0));
	lineString.addPoint(createRandomPoint(-180.0, -90.0, 90.0, 45.0));
	lineString.addPoint(createRandomPoint(90.0, -90.0, 90.0, 45.0));
	lineString.addPoint(createRandomPoint(90.0, 45.0, 90.0, 45.0));
	polygon.addRing(lineString);

	const holeLineString = new LineString();
	holeLineString.addPoint(createRandomPoint(-90.0, 0.0, 90.0, 45.0));
	holeLineString.addPoint(createRandomPoint(-90.0, -45.0, 90.0, 45.0));
	holeLineString.addPoint(createRandomPoint(0.0, -45.0, 90.0, 45.0));
	holeLineString.addPoint(createRandomPoint(0.0, 0.0, 90.0, 45.0));
	polygon.addRing(holeLineString);
	return polygon;
}

function createPoint(minX, minY, xRange, yRange) {
	const x = minX + (Math.random() * xRange);
	const y = minY + (Math.random() * yRange);
	return new Point(x, y);
}

function createMultiPolygon() {
	const multiPolygon = new MultiPolygon();
	const num = 1 + Math.round(Math.random() * 5);
	for (let i = 0; i < num; i++) {
		multiPolygon.addPolygon(createPolygon());
	}
	return multiPolygon;
}

function createGeometryCollection (hasZ, hasM) {
	const geometryCollection = new GeometryCollection(hasZ, hasM);
	const num = 1 + Math.round(Math.random() * 5);
	for (let i = 0; i < num; i++) {
		let geometry = null;
		const randomGeometry = Math.floor(Math.random() * 6);

		switch (randomGeometry) {
			case 0:
				geometry = global.createPoint(hasZ, hasM);
				break;
			case 1:
				geometry = global.createLineString(hasZ, hasM);
				break;
			case 2:
				geometry = createPolygon();
				break;
			case 3:
				geometry = global.createMultiPoint(hasZ, hasM);
				break;
			case 4:
				geometry = global.createMultiLineString(hasZ, hasM);
				break;
			case 5:
				geometry = createMultiPolygon();
				break;
		}

		geometryCollection.addGeometry(geometry);
	}

	return geometryCollection;
}

/**
 * Test the child hierarchy recursively
 * @param geometryType geometry type
 * @param childHierarchy child hierarchy
 */
function testChildHierarchy(geometryType, childHierarchy) {
	const childTypes = GeometryUtils.childTypes(geometryType);
	if (childTypes.length === 0) {
		should.not.exist(childHierarchy)
	} else {
		childTypes.length.should.be.equal(childHierarchy.size);
		for (const childType of childTypes) {
			childHierarchy.has(childType).should.be.true;
			geometryType.should.be.equal(GeometryUtils.parentType(childType));
			geometryType.should.be.equal(GeometryUtils.parentHierarchy(childType)[0]);
			testChildHierarchy(childType, GeometryUtils.childHierarchy(childType));
		}
	}
}

describe('GeometryUtilsTest', function() {

	it('test point centroid', function() {
		for (let i = 0; i < GEOMETRIES_PER_TEST; i++) {
			// Create and test a point
			const point = global.createPoint(global.coinFlip(), global.coinFlip());
			GeometryUtils.getDimension(point).should.be.equal(0);
			geometryCentroidTester(point);
		}
	});

	it('test line string centroid', function() {
		for (let i = 0; i < GEOMETRIES_PER_TEST; i++) {
			// Create and test a line string
			const lineString = global.createLineString(global.coinFlip(), global.coinFlip());
			GeometryUtils.getDimension(lineString).should.be.equal(1);
			geometryCentroidTester(lineString);
		}
	});

	it('test polygon centroid', function() {
		for (let i = 0; i < GEOMETRIES_PER_TEST; i++) {
			// Create and test a polygon
			const polygon = createPolygon();
			GeometryUtils.getDimension(polygon).should.be.equal(2);
			geometryCentroidTester(polygon);
		}

	});

	it('test MultiPoint centroid', function() {
		for (let i = 0; i < GEOMETRIES_PER_TEST; i++) {
			// Create and test a multi point
			const multiPoint = global.createMultiPoint(global.coinFlip(), global.coinFlip());
			GeometryUtils.getDimension(multiPoint).should.be.equal(0);
			geometryCentroidTester(multiPoint);
		}
	});

	it('test MultiLineString centroid', function() {
		for (let i = 0; i < GEOMETRIES_PER_TEST; i++) {
			// Create and test a multi line string
			const multiLineString = global.createMultiLineString(global.coinFlip(), global.coinFlip());
			GeometryUtils.getDimension(multiLineString).should.be.equal(1);
			geometryCentroidTester(multiLineString);
		}
	});

	it('test MultiPolygon centroid', function() {
		for (let i = 0; i < GEOMETRIES_PER_TEST; i++) {
			// Create and test a multi polygon
			const multiPolygon = createMultiPolygon();
			GeometryUtils.getDimension(multiPolygon).should.be.equal(2);
			geometryCentroidTester(multiPolygon);
		}
	});

	it('test GeometryCollection centroid', function() {
		for (let i = 0; i < GEOMETRIES_PER_TEST; i++) {
			// Create and test a geometry collection
			const geometryCollection = createGeometryCollection(global.coinFlip(), global.coinFlip());
			geometryCentroidTester(geometryCollection);
		}
	});

	it('test polygon centroid with and without hole', function() {
		const polygon = new Polygon();
		const lineString = new LineString();
		lineString.addPoint(new Point(-90, 45));
		lineString.addPoint(new Point(-90, -45));
		lineString.addPoint(new Point(90, -45));
		lineString.addPoint(new Point(90, 45));
		polygon.addRing(lineString);
		GeometryUtils.getDimension(polygon).should.be.equal(2);
		let centroid = geometryCentroidTester(polygon);
		centroid.x.should.be.equal(0.0);
		centroid.y.should.be.equal(0.0);
		const holeLineString = new LineString();
		holeLineString.addPoint(new Point(0, 45));
		holeLineString.addPoint(new Point(0, 0));
		holeLineString.addPoint(new Point(90, 0));
		holeLineString.addPoint(new Point(90, 45));
		polygon.addRing(holeLineString);
		GeometryUtils.getDimension(polygon).should.be.equal(2);
		centroid = geometryCentroidTester(polygon);
		centroid.x.should.be.equal(-15.0);
		centroid.y.should.be.equal(-7.5);
	});

	it('test copy, minimize, and normalize', function() {
		const polygon = new Polygon();
		const ring = new LineString();
		const random = Math.random();
		if (random < .5) {
			ring.addPoint(createRandomPoint(90.0, 0.0, 90.0, 90.0));
			ring.addPoint(createRandomPoint(90.0, -90.0, 90.0, 90.0));
			ring.addPoint(createRandomPoint(-180.0, -90.0, 89.0, 90.0));
			ring.addPoint(createRandomPoint(-180.0, 0.0, 89.0, 90.0));
		} else {
			ring.addPoint(createRandomPoint(-180.0, 0.0, 89.0, 90.0));
			ring.addPoint(createRandomPoint(-180.0, -90.0, 89.0, 90.0));
			ring.addPoint(createRandomPoint(90.0, -90.0, 90.0, 90.0));
			ring.addPoint(createRandomPoint(90.0, 0.0, 90.0, 90.0));
		}
		polygon.addRing(ring);

		const polygon2 = polygon.copy();
		GeometryUtils.minimizeGeometry(polygon2, 180.0);

		const polygon3 = polygon2.copy();
		GeometryUtils.normalizeGeometry(polygon3, 180.0);

		const points = ring.points;
		const ring2 = polygon2.rings[0];
		const points2 = ring2.points;
		const ring3 = polygon3.rings[0];
		const points3 = ring3.points;

		let deviation = 0.000000000001

		for (let i = 0; i < points.length; i++) {
			const point = points[i];
			const point2 = points2[i];
			const point3 = points3[i];
			point.y.should.be.within(point2.y - deviation, point2.y + deviation);
			point.y.should.be.within(point3.y - deviation, point3.y + deviation);
			point.x.should.be.within(point3.x - deviation, point3.x + deviation);

			if (i < 2) {
				point.x.should.be.within(point2.x - deviation, point2.x + deviation);
			} else {
				let point2Value = point2.x;
				if (random < .5) {
					point2Value -= 360.0;
				} else {
					point2Value += 360.0;
				}
				point.x.should.be.within(point2Value - deviation, point2Value + deviation);
			}
		}

	});

	it('test simplify points', function() {
		const halfWorldWidth = 20037508.342789244;

		const points = [];
		const distances = [];

		let x = (Math.random() * halfWorldWidth * 2) - halfWorldWidth;
		let y = (Math.random() * halfWorldWidth * 2) - halfWorldWidth;
		let point = new Point(x, y);
		points.push(point);

		for (let i = 1; i < 100; i++) {
			const xChange = 100000.0 * Math.random() * (Math.random() < .5 ? 1 : -1);
			x += xChange;

			const yChange = 100000.0 * Math.random() * (Math.random() < .5 ? 1 : -1);
			y += yChange;
			if (y > halfWorldWidth || y < -halfWorldWidth) {
				y -= 2 * yChange;
			}

			const previousPoint = point;
			point = new Point(x, y);
			points.push(point);

			const distance = GeometryUtils.distance(previousPoint, point);
			distances.push(distance);
		}

		const sortedDistances = distances.sort();
		const tolerance = sortedDistances[Math.round(sortedDistances.length / 2)];

		const simplifiedPoints = GeometryUtils.simplifyPoints(points, tolerance);

		simplifiedPoints.length.should.be.lte(points.length);

		const firstPoint = points[0];
		const lastPoint = points[points.length - 1];
		const firstSimplifiedPoint = simplifiedPoints[0];
		const lastSimplifiedPoint = simplifiedPoints[simplifiedPoints.length - 1];

		firstPoint.x.should.be.equal(firstSimplifiedPoint.x);
		firstPoint.y.should.be.equal(firstSimplifiedPoint.y);
		lastPoint.x.should.be.equal(lastSimplifiedPoint.x);
		lastPoint.y.should.be.equal(lastSimplifiedPoint.y);

		let pointIndex = 0;
		for (let i = 1; i < simplifiedPoints.length; i++) {
			const simplifiedPoint = simplifiedPoints[i];
			const simplifiedDistance = GeometryUtils.distance(simplifiedPoints[i - 1], simplifiedPoint);

			simplifiedDistance.should.be.gte(tolerance);

			for (pointIndex++; pointIndex < points.length; pointIndex++) {
				const newPoint = points[pointIndex];
				if (newPoint.x === simplifiedPoint.x && newPoint.y === simplifiedPoint.y) {
					break;
				}
			}
			(pointIndex < points.length).should.be.true;
		}
	});

	it('test point in polygon', function() {
		const points = [];
		points.push(new Point(0, 5));
		points.push(new Point(5, 0));
		points.push(new Point(10, 5));
		points.push(new Point(5, 10));
		GeometryUtils.closedPolygonPoints(points).should.be.false;

		let deviation = 0.00000000000001;

		for (let point of points) {
			GeometryUtils.pointInPolygonRingPoints(point, points).should.be.true;
		}

		GeometryUtils.pointInPolygonRingPoints(new Point(deviation, 5), points).should.be.true;
		GeometryUtils.pointInPolygonRingPoints(new Point(5, deviation), points).should.be.true;
		GeometryUtils.pointInPolygonRingPoints(new Point(10 - deviation, 5), points).should.be.true;
		GeometryUtils.pointInPolygonRingPoints(new Point(5, 10 - deviation), points).should.be.true;

		GeometryUtils.pointInPolygonRingPoints(new Point(5, 5), points).should.be.true;

		GeometryUtils.pointInPolygonRingPoints(new Point(2.5 + deviation, 7.5 - deviation), points).should.be.true;
		GeometryUtils.pointInPolygonRingPoints(new Point(2.5 + deviation, 2.5 + deviation), points).should.be.true;
		GeometryUtils.pointInPolygonRingPoints(new Point(7.5 - deviation, 2.5 + deviation), points).should.be.true;
		GeometryUtils.pointInPolygonRingPoints(new Point(7.5 - deviation, 7.5 - deviation), points).should.be.true;

		GeometryUtils.pointInPolygonRingPoints(new Point(2.5, 7.5), points).should.be.true;
		GeometryUtils.pointInPolygonRingPoints(new Point(2.5, 2.5), points).should.be.true;
		GeometryUtils.pointInPolygonRingPoints(new Point(7.5, 2.5), points).should.be.true;
		GeometryUtils.pointInPolygonRingPoints(new Point(7.5, 7.5), points).should.be.true;

		deviation = .0000001;

		GeometryUtils.pointInPolygonRingPoints(new Point(0, 0), points).should.be.false;
		GeometryUtils.pointInPolygonRingPoints(new Point(0 - deviation, 5), points).should.be.false;
		GeometryUtils.pointInPolygonRingPoints(new Point(5, 0 - deviation), points).should.be.false;
		GeometryUtils.pointInPolygonRingPoints(new Point(10 + deviation, 5), points).should.be.false;
		GeometryUtils.pointInPolygonRingPoints(new Point(5, 10 + deviation), points).should.be.false;

		GeometryUtils.pointInPolygonRingPoints(new Point(2.5 - deviation, 7.5 + deviation), points).should.be.false;
		GeometryUtils.pointInPolygonRingPoints(new Point(2.5 - deviation, 2.5 - deviation), points).should.be.false;
		GeometryUtils.pointInPolygonRingPoints(new Point(7.5 + deviation, 2.5 - deviation), points).should.be.false;
		GeometryUtils.pointInPolygonRingPoints(new Point(7.5 + deviation, 7.5 + deviation), points).should.be.false;

		const firstPoint = points[0];
		points.push(new Point(firstPoint.x, firstPoint.y));

		GeometryUtils.closedPolygonPoints(points).should.be.true;

		for (let point of points) {
			GeometryUtils.pointInPolygonRingPoints(point, points).should.be.true;
		}

		GeometryUtils.pointInPolygonRingPoints(new Point(2.5 + deviation, 7.5 - deviation), points).should.be.true;
		GeometryUtils.pointInPolygonRingPoints(new Point(2.5, 7.5), points).should.be.true;
		GeometryUtils.pointInPolygonRingPoints(new Point(2.5 - deviation, 7.5 + deviation), points).should.be.false;
	});

	it('test closed polygon', function() {
		const points = [];
		points.push(new Point(0.1, 0.2));
		points.push(new Point(5.3, 0.4));
		points.push(new Point(5.5, 5.6));
		GeometryUtils.closedPolygonPoints(points).should.be.false;
		const firstPoint = points[0];
		points.push(new Point(firstPoint.x, firstPoint.y));
		GeometryUtils.closedPolygonPoints(points).should.be.true;
	});

	it('test point on line', function() {
		const points = [];
		points.push(new Point(0, 0));
		points.push(new Point(5, 0));
		points.push(new Point(5, 5));

		for (const point of points) {
			GeometryUtils.pointOnLinePoints(point, points).should.be.true;
		}
		GeometryUtils.pointOnLinePoints(new Point(2.5, 0), points).should.be.true;
		GeometryUtils.pointOnLinePoints(new Point(5, 2.5), points).should.be.true;
		GeometryUtils.pointOnLinePoints(new Point(2.5, 0.00000001), points).should.be.true;
		GeometryUtils.pointOnLinePoints(new Point(2.5, 0.0000001), points).should.be.false;
		GeometryUtils.pointOnLinePoints(new Point(5, 2.500000001), points).should.be.true;
		GeometryUtils.pointOnLinePoints(new Point(5, 2.50000001), points).should.be.false;
		GeometryUtils.pointOnLinePoints(new Point(-0.0000000000000001, 0), points).should.be.true;
		GeometryUtils.pointOnLinePoints(new Point(-0.000000000000001, 0), points).should.be.false;
		GeometryUtils.pointOnLinePoints(new Point(5, 5.0000000000000001), points).should.be.true;
		GeometryUtils.pointOnLinePoints(new Point(5, 5.000000000000001), points).should.be.false;
	});

	/**
	 * Test the geometry type parent and child hierarchy methods
	 */
	it('test hierarchy', function() {
		for (const geometryType of GeometryType.values()) {

			let parentType = GeometryUtils.parentType(geometryType);
			let parentHierarchy = GeometryUtils.parentHierarchy(geometryType);

			let previousParentType = null;

			while (parentType != null) {
				parentType.should.be.equal(parentHierarchy[0])
				if (previousParentType != null) {
					const childTypes = GeometryUtils.childTypes(parentType);
					(childTypes.indexOf(previousParentType) > -1).should.be.true;
					const childHierarchy = GeometryUtils.childHierarchy(parentType);
					should.exist(childHierarchy.get(previousParentType));
				}

				previousParentType = parentType;
				parentType = GeometryUtils.parentType(previousParentType);
				parentHierarchy = GeometryUtils.parentHierarchy(previousParentType);

			}
			parentHierarchy.length.should.be.equal(0);
			testChildHierarchy(geometryType, GeometryUtils.childHierarchy(geometryType));
		}
	});

	/**
	 * Test centroid and degrees centroid
	 */
	it('test centroid', function() {
		const point = new Point(15, 35);

		let centroid = point.getCentroid();
		centroid.x.should.be.equal(15);
		centroid.y.should.be.equal(35);

		let degreesCentroid = point.getDegreesCentroid();

		degreesCentroid.x.should.be.equal(15);
		degreesCentroid.y.should.be.equal(35);

		const lineString = new LineString();
		lineString.addPoint(new Point(0, 5));
		lineString.addPoint(point);

		centroid = lineString.getCentroid();

		centroid.x.should.be.equal(7.5);
		centroid.y.should.be.equal(20.0);

		degreesCentroid = lineString.getDegreesCentroid();

		degreesCentroid.x.should.be.equal(6.764392425440724);
		degreesCentroid.y.should.be.equal(20.157209770845522);

		lineString.addPoint(new Point(2, 65));

		centroid = lineString.getCentroid();

		centroid.x.should.be.equal(7.993617921179541);
		centroid.y.should.be.equal(34.808537635386266);

		degreesCentroid = lineString.getDegreesCentroid();

		degreesCentroid.x.should.be.equal(5.85897989020252);
		degreesCentroid.y.should.be.equal(35.20025371999032);

		const polygon = new Polygon(lineString);

		centroid = polygon.getCentroid();

		centroid.x.should.be.equal(5.666666666666667);
		centroid.y.should.be.equal(35.0);

		degreesCentroid = polygon.getDegreesCentroid();

		degreesCentroid.x.should.be.equal(5.85897989020252);
		degreesCentroid.y.should.be.equal(35.20025371999032);

		lineString.addPoint(new Point(-20, 40));
		lineString.addPoint(new Point(0, 5));

		centroid = polygon.getCentroid();

		centroid.x.should.be.equal(-1.3554502369668247);
		centroid.y.should.be.equal(36.00315955766193);

		degreesCentroid = polygon.getDegreesCentroid();

		degreesCentroid.x.should.be.equal(-0.6891904581641471);
		degreesCentroid.y.should.be.equal(37.02524099014426);
	});
});
