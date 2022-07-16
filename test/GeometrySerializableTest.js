// @ts-ignore
import { GeometrySerializer } from '../lib/internal'
import SFTestUtils from './SFTestUtils'

function testSerializable (geometry) {
  const json = GeometrySerializer.serialize(geometry);
  const deserializedGeometry = GeometrySerializer.deserialize(json);
  global.compareGeometries(geometry, deserializedGeometry);

}

describe('GeometrySerializableTest', function () {
  it('test polygon', function () {
    testSerializable(global.createPolygon(Math.random() < .5, Math.random() < .5));
  });

  it('test line string', function () {
    testSerializable(global.createLineString(Math.random() < .5, Math.random() < .5));
  });

  it('test point', function () {
    testSerializable(global.createPoint(Math.random() < .5, Math.random() < .5));
  });

  it('test geometry collection', function () {
    testSerializable(global.createGeometryCollection(Math.random() < .5, Math.random() < .5));
  });

  it('test multi polygon', function () {
    testSerializable(global.createMultiPolygon(Math.random() < .5, Math.random() < .5));
  });

  it('test multi line string', function () {
    testSerializable(global.createMultiLineString(Math.random() < .5, Math.random() < .5));
  });

  it('test multi point', function () {
    testSerializable(global.createMultiPoint(Math.random() < .5, Math.random() < .5));
  });

  it('test curve polygon', function () {
    testSerializable(global.createCurvePolygon(Math.random() < .5, Math.random() < .5));
  });

  it('test compound curve', function () {
    testSerializable(global.createCompoundCurve(Math.random() < .5, Math.random() < .5));
  });
});
