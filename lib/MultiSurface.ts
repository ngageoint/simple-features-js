import { GeometryType, Surface, GeometryCollection } from "./internal";

/**
 * A restricted form of GeometryCollection where each Geometry in the collection
 * must be of type Surface.
 *
 * @param <T> surface type
 */
export abstract class MultiSurface<T extends Surface> extends GeometryCollection<T> {

	/**
	 * Constructor
	 * 
	 * @param type geometry type
	 * @param hasZ has z
	 * @param hasM has m
	 */
	protected constructor(type: GeometryType, hasZ: boolean, hasM: boolean) {
		super(type, hasZ, hasM);
	}

	/**
	 * Get the surfaces
	 * @return surfaces
	 */
	public getSurfaces(): Array<T> {
		return this.geometries;
	}

	/**
	 * Set the surfaces
	 * @param surfaces surfaces
	 */
	public setSurfaces(surfaces: Array<T>): void {
		this.geometries = surfaces;
	}

	/**
	 * Add a surface
	 * @param surface surface
	 */
	public addSurface(surface: T): void {
		this.addGeometry(surface);
	}

	/**
	 * Add surfaces
	 * 
	 * @param surfaces
	 *            surfaces
	 */
	public addSurfaces(surfaces: Array<T>): void {
		this.addGeometries(surfaces);
	}

	/**
	 * Get the number of surfaces
	 * @return number of surfaces
	 */
	public numSurfaces(): number {
		return this.numGeometries();
	}

	/**
	 * Returns the Nth surface
	 * @param n nth line surface to return
	 * @return surface
	 */
	public getSurface(n: number): T {
		return this.getGeometry(n);
	}

}
