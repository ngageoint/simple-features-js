import { GeometryPrinter, LineString, Point, Polygon, ShamosHoey } from "../lib/internal";

function addPoint(points, x, y) {
	points.push(new Point(x, y));
}

describe('ShamosHoeyTest', function () {
	it('test simple', function () {
		let points = [];

		addPoint(points, 0, 0);
		addPoint(points, 1, 0);
		addPoint(points, 0.5, 1);

		ShamosHoey.simplePolygonPoints(points).should.be.true;
		ShamosHoey.simplePolygonLineString(new LineString(points)).should.be.true;
		ShamosHoey.simplePolygon(new Polygon(new LineString(points))).should.be.true;
		new LineString(points).isSimple().should.be.true;
		new Polygon(new LineString(points)).isSimple().should.be.true;
		points.length.should.be.equal(3);

		addPoint(points, 0, 0);

		ShamosHoey.simplePolygonPoints(points).should.be.true;
		ShamosHoey.simplePolygonLineString(new LineString(points)).should.be.true;
		ShamosHoey.simplePolygon(new Polygon(new LineString(points))).should.be.true;
		new LineString(points).isSimple().should.be.true;
		new Polygon(new LineString(points)).isSimple().should.be.true;
		points.length.should.be.equal(4);

		points = [];

		addPoint(points, 0, 100);
		addPoint(points, 100, 0);
		addPoint(points, 200, 100);
		addPoint(points, 100, 200);
		addPoint(points, 0, 100);

		ShamosHoey.simplePolygonPoints(points).should.be.true;
		ShamosHoey.simplePolygonLineString(new LineString(points)).should.be.true;
		ShamosHoey.simplePolygon(new Polygon(new LineString(points))).should.be.true;
		new LineString(points).isSimple().should.be.true;
		new Polygon(new LineString(points)).isSimple().should.be.true;
		points.length.should.be.equal(5);

		points = [];

		addPoint(points, -104.8384094, 39.753657);
		addPoint(points, -104.8377228, 39.7354422);
		addPoint(points, -104.7930908, 39.7364983);
		addPoint(points, -104.8233891, 39.7440222);
		addPoint(points, -104.7930908, 39.7369603);
		addPoint(points, -104.808197, 39.7541849);
		addPoint(points, -104.8383236, 39.753723);

		ShamosHoey.simplePolygonPoints(points).should.be.true;
		ShamosHoey.simplePolygonLineString(new LineString(points)).should.be.true;
		ShamosHoey.simplePolygon(new Polygon(new LineString(points))).should.be.true;
		new LineString(points).isSimple().should.be.true;
		new Polygon(new LineString(points)).isSimple().should.be.true;
		points.length.should.be.equal(7);

		points = [];

		addPoint(points, -106.3256836, 40.2962865);
		addPoint(points, -105.6445313, 38.5911138);
		addPoint(points, -105.0842285, 40.3046654);
		addPoint(points, -105.6445313, 38.5911139);

		ShamosHoey.simplePolygonPoints(points).should.be.true;
		ShamosHoey.simplePolygonLineString(new LineString(points)).should.be.true;
		ShamosHoey.simplePolygon(new Polygon(new LineString(points))).should.be.true;
		new LineString(points).isSimple().should.be.true;
		new Polygon(new LineString(points)).isSimple().should.be.true;
		points.length.should.be.equal(4);
	});

	it('test non simple', function () {
		let points = [];

		addPoint(points, 0, 0);

		ShamosHoey.simplePolygonPoints(points).should.be.false;
		ShamosHoey.simplePolygonLineString(new LineString(points)).should.be.false;
		ShamosHoey.simplePolygon(new Polygon(new LineString(points))).should.be.false;
		(new LineString(points)).isSimple().should.be.false;
		(new Polygon(new LineString(points))).isSimple().should.be.false;
		points.length.should.be.equal(1);

		addPoint(points, 1, 0);

		ShamosHoey.simplePolygonPoints(points).should.be.false;
		ShamosHoey.simplePolygonLineString(new LineString(points)).should.be.false;
		ShamosHoey.simplePolygon(new Polygon(new LineString(points))).should.be.false;
		(new LineString(points)).isSimple().should.be.false;
		(new Polygon(new LineString(points))).isSimple().should.be.false;
		points.length.should.be.equal(2);

		addPoint(points, 0, 0);

		ShamosHoey.simplePolygonPoints(points).should.be.false;
		ShamosHoey.simplePolygonLineString(new LineString(points)).should.be.false;
		ShamosHoey.simplePolygon(new Polygon(new LineString(points))).should.be.false;
		(new LineString(points)).isSimple().should.be.false;
		(new Polygon(new LineString(points))).isSimple().should.be.false;
		points.length.should.be.equal(3);

		points = [];

		addPoint(points, 0, 100);
		addPoint(points, 100, 0);
		addPoint(points, 200, 100);
		addPoint(points, 100, 200);
		addPoint(points, 100.01, 200);
		addPoint(points, 0, 100);

		ShamosHoey.simplePolygonPoints(points).should.be.false;
		ShamosHoey.simplePolygonLineString(new LineString(points)).should.be.false;
		ShamosHoey.simplePolygon(new Polygon(new LineString(points))).should.be.false;
		(new LineString(points)).isSimple().should.be.false;
		(new Polygon(new LineString(points))).isSimple().should.be.false;
		points.length.should.be.equal(6);

		points = [];

		addPoint(points, -104.8384094, 39.753657);
		addPoint(points, -104.8377228, 39.7354422);
		addPoint(points, -104.7930908, 39.7364983);
		addPoint(points, -104.8233891, 39.7440222);
		addPoint(points, -104.8034763, 39.7387424);
		addPoint(points, -104.7930908, 39.7369603);
		addPoint(points, -104.808197, 39.7541849);
		addPoint(points, -104.8383236, 39.753723);

		ShamosHoey.simplePolygonPoints(points).should.be.false;
		ShamosHoey.simplePolygonLineString(new LineString(points)).should.be.false;
		ShamosHoey.simplePolygon(new Polygon(new LineString(points))).should.be.false;
		(new LineString(points)).isSimple().should.be.false;
		(new Polygon(new LineString(points))).isSimple().should.be.false;
		points.length.should.be.equal(8);

		points = [];

		addPoint(points, -106.3256836, 40.2962865);
		addPoint(points, -105.6445313, 38.5911138);
		addPoint(points, -105.0842285, 40.3046654);
		addPoint(points, -105.6445313, 38.5911138);

		ShamosHoey.simplePolygonPoints(points).should.be.false;
		ShamosHoey.simplePolygonLineString(new LineString(points)).should.be.false;
		ShamosHoey.simplePolygon(new Polygon(new LineString(points))).should.be.false;
		(new LineString(points)).isSimple().should.be.false;
		(new Polygon(new LineString(points))).isSimple().should.be.false;
		points.length.should.be.equal(4);
	});

	it('test simple hole', function () {
		let polygon = new Polygon();

		let points = [];

		addPoint(points, 0, 0);
		addPoint(points, 10, 0);
		addPoint(points, 5, 10);

		let ring = new LineString();
		ring.points = points;

		polygon.addRing(ring);

		ShamosHoey.simplePolygon(polygon).should.be.true;
		polygon.isSimple().should.be.true;
		polygon.numRings().should.be.equal(1);
		polygon.rings[0].numPoints().should.be.equal(3);

		let holePoints = []

		addPoint(holePoints, 1, 1);
		addPoint(holePoints, 9, 1);
		addPoint(holePoints, 5, 9);

		let hole = new LineString();
		hole.points = holePoints;

		polygon.addRing(hole);

		ShamosHoey.simplePolygon(polygon).should.be.true;
		polygon.isSimple().should.be.true;
		polygon.numRings().should.be.equal(2);
		polygon.rings[0].numPoints().should.be.equal(3);
		polygon.rings[1].numPoints().should.be.equal(3);
	});

	it('test non simple hole', function () {
		let polygon = new Polygon();

		let points = [];

		addPoint(points, 0, 0);
		addPoint(points, 10, 0);
		addPoint(points, 5, 10);

		let ring = new LineString();
		ring.points = points;

		polygon.addRing(ring);

		ShamosHoey.simplePolygon(polygon).should.be.true;
		polygon.isSimple().should.be.true;
		polygon.numRings().should.be.equal(1);
		polygon.rings[0].numPoints().should.be.equal(3);

		let holePoints = [];

		addPoint(holePoints, 1, 1);
		addPoint(holePoints, 9, 1);
		addPoint(holePoints, 5, 9);
		addPoint(holePoints, 5.000001, 9);

		let hole = new LineString();
		hole.points = holePoints;

		polygon.addRing(hole);

		ShamosHoey.simplePolygon(polygon).should.be.false;
		polygon.isSimple().should.be.false;
		polygon.numRings().should.be.equal(2);
		polygon.rings[0].numPoints().should.be.equal(3);
		polygon.rings[1].numPoints().should.be.equal(4);
	});

	it('test intersecting hole', function () {
		let polygon = new Polygon();

		let points = [];

		addPoint(points, 0, 0);
		addPoint(points, 10, 0);
		addPoint(points, 5, 10);

		let ring = new LineString();
		ring.points = points;

		polygon.addRing(ring);

		ShamosHoey.simplePolygon(polygon).should.be.true;
		polygon.isSimple().should.be.true;
		polygon.numRings().should.be.equal(1);
		polygon.rings[0].numPoints().should.be.equal(3);

		let holePoints = [];

		addPoint(holePoints, 1, 1);
		addPoint(holePoints, 9, 1);
		addPoint(holePoints, 5, 10);

		let hole = new LineString();
		hole.points = holePoints;

		polygon.addRing(hole);

		ShamosHoey.simplePolygon(polygon).should.be.false;
		polygon.isSimple().should.be.false;
		polygon.numRings().should.be.equal(2);
		polygon.rings[0].numPoints().should.be.equal(3);
		polygon.rings[1].numPoints().should.be.equal(3);
	});

	it('test intersecting holes', function () {
		let polygon = new Polygon();

		let points = [];

		addPoint(points, 0, 0);
		addPoint(points, 10, 0);
		addPoint(points, 5, 10);

		let ring = new LineString();
		ring.points = points;

		polygon.addRing(ring);

		ShamosHoey.simplePolygon(polygon).should.be.true;
		polygon.isSimple().should.be.true;
		polygon.numRings().should.be.equal(1);
		polygon.rings[0].numPoints().should.be.equal(3);

		let holePoints1 = [];

		addPoint(holePoints1, 1, 1);
		addPoint(holePoints1, 9, 1);
		addPoint(holePoints1, 5, 9);

		let hole1 = new LineString();
		hole1.points = holePoints1;

		polygon.addRing(hole1);

		ShamosHoey.simplePolygon(polygon).should.be.true;
		polygon.isSimple().should.be.true;
		polygon.numRings().should.be.equal(2);
		polygon.rings[0].numPoints().should.be.equal(3);
		polygon.rings[1].numPoints().should.be.equal(3);

		let holePoints2 = [];

		addPoint(holePoints2, 5.0, 0.1);
		addPoint(holePoints2, 6.0, 0.1);
		addPoint(holePoints2, 5.5, 1.00001);

		let hole2 = new LineString();
		hole2.points = holePoints2;

		polygon.addRing(hole2);

		ShamosHoey.simplePolygon(polygon).should.be.false;
		polygon.isSimple().should.be.false;
		polygon.numRings().should.be.equal(3);
		polygon.rings[0].numPoints().should.be.equal(3);
		polygon.rings[1].numPoints().should.be.equal(3);
		polygon.rings[2].numPoints().should.be.equal(3);
	});

	it('test hole inside hole', function () {
		let polygon = new Polygon();

		let points = [];

		addPoint(points, 0, 0);
		addPoint(points, 10, 0);
		addPoint(points, 5, 10);

		let ring = new LineString();
		ring.points = points;

		polygon.addRing(ring);

		ShamosHoey.simplePolygon(polygon).should.be.true;
		polygon.isSimple().should.be.true;
		polygon.numRings().should.be.equal(1);
		polygon.rings[0].numPoints().should.be.equal(3);

		let holePoints1 = [];

		addPoint(holePoints1, 1, 1);
		addPoint(holePoints1, 9, 1);
		addPoint(holePoints1, 5, 9);

		let hole1 = new LineString();
		hole1.points = holePoints1;

		polygon.addRing(hole1);

		ShamosHoey.simplePolygon(polygon).should.be.true;
		polygon.isSimple().should.be.true;
		polygon.numRings().should.be.equal(2);
		polygon.rings[0].numPoints().should.be.equal(3);
		polygon.rings[1].numPoints().should.be.equal(3);

		let holePoints2 = [];

		addPoint(holePoints2, 2, 2);
		addPoint(holePoints2, 8, 2);
		addPoint(holePoints2, 5, 8);

		let hole2 = new LineString();
		hole2.points = holePoints2;

		polygon.addRing(hole2);

		ShamosHoey.simplePolygon(polygon).should.be.false;
		polygon.isSimple().should.be.false;
		polygon.numRings().should.be.equal(3);
		polygon.rings[0].numPoints().should.be.equal(3);
		polygon.rings[1].numPoints().should.be.equal(3);
		polygon.rings[2].numPoints().should.be.equal(3);
	});

	it('test external hole', function () {
		let polygon = new Polygon();

		let points = [];

		addPoint(points, 0, 0);
		addPoint(points, 10, 0);
		addPoint(points, 5, 10);

		let ring = new LineString();
		ring.points = points;

		polygon.addRing(ring);

		ShamosHoey.simplePolygon(polygon).should.be.true;
		polygon.isSimple().should.be.true;
		polygon.numRings().should.be.equal(1);
		polygon.rings[0].numPoints().should.be.equal(3);

		let holePoints = [];

		addPoint(holePoints, -1, 1);
		addPoint(holePoints, -1, 3);
		addPoint(holePoints, -2, 1);

		let hole = new LineString();
		hole.points = holePoints;

		polygon.addRing(hole);

		ShamosHoey.simplePolygon(polygon).should.be.false;
		polygon.isSimple().should.be.false;
		polygon.numRings().should.be.equal(2);
		polygon.rings[0].numPoints().should.be.equal(3);
		polygon.rings[1].numPoints().should.be.equal(3);
	});

	it('test large simple', function (done) {
		this.timeout(0);
		let increment = .01;
		let radius = 1250;
		let x = -radius + increment;
		let y = 0;

		let points = [];

		while (x <= radius) {
			if (x <= 0) {
				y -= increment;
			} else {
				y += increment;
			}
			addPoint(points, x, y);
			x += increment;
		}

		x = radius - increment;
		while (x >= -radius) {
			if (x >= 0) {
				y += increment;
			} else {
				y -= increment;
			}
			addPoint(points, x, y);
			x -= increment;
		}

		ShamosHoey.simplePolygonPoints(points).should.be.true;
		ShamosHoey.simplePolygonLineString(new LineString(points)).should.be.true;
		ShamosHoey.simplePolygon(new Polygon(new LineString(points))).should.be.true;
		(new LineString(points)).isSimple().should.be.true;
		(new Polygon(new LineString(points))).isSimple().should.be.true;
		points.length.should.be.equal(Math.round(radius / increment * 4));
		done();
	});

	it('test large non simple', function (done) {
		this.timeout(0);
		let increment = .01;
		let radius = 1250;
		let x = -radius + increment;
		let y = 0;

		let points = [];

		while (x <= radius) {
			if (x <= 0) {
				y -= increment;
			} else {
				y += increment;
			}
			addPoint(points, x, y);
			x += increment;
		}

		let previousPoint = points[points.length - 2];
		let invalidIndex = points.length;
		addPoint(points, previousPoint.x, previousPoint.y - .000000000000001);

		x = radius - increment;
		while (x >= -radius) {
			if (x >= 0) {
				y += increment;
			} else {
				y -= increment;
			}
			addPoint(points, x, y);
			x -= increment;
		}

		ShamosHoey.simplePolygonPoints(points).should.be.false;
		ShamosHoey.simplePolygonLineString(new LineString(points)).should.be.false;
		ShamosHoey.simplePolygon(new Polygon(new LineString(points))).should.be.false;
		(new LineString(points)).isSimple().should.be.false;
		(new Polygon(new LineString(points))).isSimple().should.be.false;
		points.length.should.be.equal(1 + Math.round(radius / increment * 4));

		points.splice(invalidIndex, 1);
		previousPoint = points[points.length - 3];
		addPoint(points, previousPoint.x, previousPoint.y + .000000000000001);

		ShamosHoey.simplePolygonPoints(points).should.be.false;
		ShamosHoey.simplePolygonLineString(new LineString(points)).should.be.false;
		ShamosHoey.simplePolygon(new Polygon(new LineString(points))).should.be.false;
		(new LineString(points)).isSimple().should.be.false;
		(new Polygon(new LineString(points))).isSimple().should.be.false;
		points.length.should.be.equal(1 + Math.round(radius / increment * 4));
		done();
	});
});
