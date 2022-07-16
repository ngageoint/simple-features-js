import {GeometryEnvelope, GeometryEnvelopeBuilder, GeometryType, GeometryUtils, Point } from './internal'

/**
 * The root of the geometry type hierarchy
 */
export abstract class Geometry {

  /**
   * Geometry type
   */
  private readonly _geometryType: GeometryType;

  /**
   * Has z coordinates
   */
  private _hasZ: boolean;

  /**
   * Has m values
   */
  private _hasM: boolean;

  /**
   * Constructor
   * @param geometryType geometry type
   * @param hasZ has z
   * @param hasM has m
   */
  protected constructor(geometryType: GeometryType, hasZ: boolean, hasM: boolean) {
    this._geometryType = geometryType;
    this._hasZ = hasZ;
    this._hasM = hasM;
  }

  /**
   * Get the geometry type
   * @return geometry type
   */
  public get geometryType(): GeometryType {
    return this._geometryType;
  }

  /**
   * Does the geometry have z coordinates
   * @return true if has z coordinates
   */
  public get hasZ(): boolean {
    return this._hasZ;
  }

  /**
   * Set if the geometry has z coordinates
   * @param hasZ true if has z coordinates
   */
  public set hasZ (hasZ: boolean) {
    this._hasZ = hasZ;
  }

  /**
   * Does the geometry have z coordinates
   * @return true if has z coordinates
   * @see #hasZ()
   */
  public get is3D (): boolean {
    return this.hasZ;
  }

  /**
   * Does the geometry have m coordinates
   * @return true if has m coordinates
   */
  public get hasM (): boolean {
    return this._hasM;
  }

  /**
   * Set if the geometry has m coordinates
   * @param hasM true if has m coordinates
   */
  public set hasM (hasM: boolean) {
    this._hasM = hasM;
  }

  /**
   * Update currently false hasZ and hasM values using the provided geometry
   * @param geometry  geometry
   */
  public updateZM (geometry: Geometry): void {
    if (!this.hasZ) {
      this.hasZ = geometry.hasZ;
    }
    if (!this.hasM) {
      this.hasM = geometry.hasM;
    }
  }

  /**
   * Determine if the geometries contain a Z value
   * @param geometries list of geometries
   * @return true if has z
   */
  public static hasZ (geometries: Array<Geometry>) : boolean{
    let hasZ = false;
    for (const geometry of geometries) {
      if (geometry.hasZ) {
        hasZ = true;
        break;
      }
    }
    return hasZ;
  }

  /**
   * Determine if the geometries contain a M value
   * @param geometries list of geometries
   * @return true if has m
   */
  public static hasM (geometries: Array<Geometry>) {
    let hasM = false;
    for (const geometry of geometries) {
      if (geometry.hasM) {
        hasM = true;
        break;
      }
    }
    return hasM;
  }

  /**
   * Does the geometry have m coordinates.
   * @return true if has m coordinates
   * @see #hasM()
   */
  public isMeasured (): boolean {
    return this.hasM;
  }

  /**
   * Get the minimum bounding box for this Geometry
   * @return geometry envelope
   */
  public getEnvelope(): GeometryEnvelope {
    return GeometryEnvelopeBuilder.buildEnvelope(this);
  }

  /**
   * Expand the envelope with the minimum bounding box for this Geometry
   * @param envelope geometry envelope to expand
   */
  public expandEnvelope(envelope: GeometryEnvelope): void {
    GeometryEnvelopeBuilder.buildEnvelopeWithEnvelope(this, envelope);
  }

  /**
   * Get the inherent dimension (0, 1, or 2) for this Geometry
   * @return dimension
   */
  public getDimension(): number {
    return GeometryUtils.getDimension(this);
  }

  /**
   * Get the mathematical centroid point of a 2 dimensional representation of
   * the Geometry (balancing point of a 2d cutout of the geometry). Only the x
   * and y coordinate of the resulting point are calculated and populated. The
   * resulting {@link Point#getZ()} and {@link Point#getM()} methods will
   * always return null.
   * @return centroid point
   */
  public getCentroid(): Point {
    return GeometryUtils.getCentroid(this);
  }

  /**
   * Get the geographic centroid point of a 2 dimensional representation of
   * the degree unit Geometry. Only the x and y coordinate of the resulting
   * point are calculated and populated. The resulting {@link Point#getZ()}
   * and {@link Point#getM()} methods will always return null.
   * @return centroid point
   */
  public getDegreesCentroid(): Point {
    return GeometryUtils.getDegreesCentroid(this);
  }

  /**
   * Copy the geometry
   * @return geometry copy
   */
  public abstract copy(): Geometry;

  /**
   * Is the Geometry empty
   * @return true if empty
   */
  public abstract isEmpty(): boolean;

  /**
   * Determine if this Geometry has no anomalous geometric points, such as
   * self intersection or self tangency
   * @return true if simple
   */
  public abstract isSimple(): boolean;

  public equals (obj: Geometry): boolean {
    return !(this.geometryType !== obj.geometryType || this.hasM !== obj.hasM || this.hasZ !== obj.hasZ)
  }
}