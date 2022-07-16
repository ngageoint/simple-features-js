import { GeometryType, Geometry, GeometryCollection, SFException } from "../internal";


/**
 * Extended Geometry Collection providing abstract geometry collection type
 * support
 *
 * @param <T> geometry type
 */
export class ExtendedGeometryCollection<T extends Geometry> extends GeometryCollection<T> {
	/**
	 * Extended geometry collection geometry type
	 */
	private _editableGeometryType: GeometryType;

	public constructor (geometryCollection: GeometryCollection<T>);
	public constructor (extendedGeometryCollection: ExtendedGeometryCollection<T>);

	public constructor(...args) {
		if (args.length === 1 && args[0] instanceof GeometryCollection) {
			super(GeometryType.GEOMETRYCOLLECTION, args[0].hasZ, args[0].hasM);
			this.geometryType = GeometryType.GEOMETRYCOLLECTION
			this.geometries = args[0].geometries;
			this.updateGeometryType();
		} else if (args.length === 1 && args[0] instanceof ExtendedGeometryCollection) {
			super(GeometryType.GEOMETRYCOLLECTION, args[0].hasZ, args[0].hasM);
			this.geometryType = GeometryType.GEOMETRYCOLLECTION
			for (const geometry of args[0].geometries) {
				const geometryCopy = geometry.copy();
				this.addGeometry(geometryCopy);
			}
			this.geometryType = args[0].geometryType;
		}
	}

	/**
	 * Update the extended geometry type based upon the contained geometries
	 */
	public updateGeometryType(): void {
		let geometryType = this.getCollectionType();
		switch (geometryType) {
		case GeometryType.GEOMETRYCOLLECTION:
		case GeometryType.MULTICURVE:
		case GeometryType.MULTISURFACE:
			break;
		case GeometryType.MULTIPOINT:
			geometryType = GeometryType.GEOMETRYCOLLECTION;
			break;
		case GeometryType.MULTILINESTRING:
			geometryType = GeometryType.MULTICURVE;
			break;
		case GeometryType.MULTIPOLYGON:
			geometryType = GeometryType.MULTISURFACE;
			break;
		default:
			throw new SFException(
					"Unsupported extended geometry collection geometry type: "
							+ geometryType);
		}
		this.geometryType = geometryType;
	}

	/**
	 * {@inheritDoc}
	 */
	public get geometryType(): GeometryType {
		return this._editableGeometryType;
	}

	/**
	 * {@inheritDoc}
	 */
	public set geometryType(geometryType: GeometryType) {
		this._editableGeometryType = geometryType;
	}

	/**
	 * {@inheritDoc}
	 */
	public copy(): Geometry {
		return new ExtendedGeometryCollection<T>(this);
	}


	/**
	 * {@inheritDoc}
	 */
	public equals(obj: Geometry): boolean {
		return (obj instanceof ExtendedGeometryCollection && this.geometryType === obj.geometryType);
	}

}
