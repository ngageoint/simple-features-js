import { GeometryType, Geometry } from "./internal";

/**
 * The base type for all 2-dimensional geometry types. A 2-dimensional geometry
 * is a geometry that has an area.
 */
export abstract class Surface extends Geometry {

	/**
	 * Constructor
	 * @param type geometry type
	 * @param hasZ has z
	 * @param hasM has m
	 */
	protected constructor (type: GeometryType, hasZ: boolean, hasM: boolean) {
		super(type, hasZ, hasM);
	}
}
