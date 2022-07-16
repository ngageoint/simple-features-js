import { GeometryType, Geometry } from "./internal";

/**
 * A single location in space. Each point has an X and Y coordinate. A point MAY
 * optionally also have a Z and/or an M value.
 */
export class Point extends Geometry {
	/**
	 * X coordinate
	 */
	private _x: number;

	/**
	 * Y coordinate
	 */
	private _y: number;

	/**
	 * Z coordinate
	 */
	private _z: number;

	/**
	 * M value
	 */
	private _m: number;

	public constructor();
	public constructor(point: Point);
	public constructor(x: number, y: number);
	public constructor(x: number, y: number, z: number);
	public constructor(x: number, y: number, z: number, m: number);
	public constructor(hasZ: boolean, hasM: boolean, x: number, y: number);

	/**
	 * Constructor
	 */
	public constructor (...args: any[]) {
		if (args.length === 0) {
			super(GeometryType.POINT, false, false);
			this._x = 0;
			this._y = 0;
		} else if (args.length === 1 && args[0] instanceof Point) {
			super(GeometryType.POINT, args[0].hasZ, args[0].hasM);
			this._x = args[0].x
			this._y = args[0].y
			this._z = args[0].z
			this._m = args[0].m
		} else if (args.length === 2) {
			super(GeometryType.POINT, false, false);
			this._x = args[0]
			this._y = args[1]
		} else if (args.length === 3) {
			super(GeometryType.POINT, args[2] != null, false);
			this._x = args[0]
			this._y = args[1]
			this._z = args[2]
		} else if (args.length === 4) {
			if (typeof args[0] === "boolean" && typeof args[1] === "boolean") {
				super(GeometryType.POINT, args[0], args[1]);
				this._x = args[2]
				this._y = args[3]
			} else {
				super(GeometryType.POINT, args[2] != null, args[3] != null);
				this._x = args[0]
				this._y = args[1]
				this._z = args[2]
				this._m = args[3]
			}
		}
	}


	/**
	 * Get x
	 * @return x
	 */
	public get x (): number {
		return this._x;
	}

	/**
	 * Set y
	 * @param x
	 */
	public set x (x: number) {
		this._x = x;
	}

	/**
	 * Get y
	 * @return y
	 */
	public get y (): number {
		return this._y;
	}

	/**
	 * Set y
	 * @param y
	 */
	public set y (y: number) {
		this._y = y;
	}


	/**
	 * Get z
	 * @return z
	 */
	public get z (): number {
		return this._z;
	}

	/**
	 * Set z
	 * @param z
	 */
	public set z (z: number) {
		this._z = z;
		this.hasZ = z != null;
	}

	/**
	 * Get m
	 * 
	 * @return m
	 */
	public get m (): number {
		return this._m;
	}

	/**
	 * Set m
	 * @param m
	 */
	public set m (m: number) {
		this._m = m;
		this.hasM = m != null;
	}


	/**
	 * {@inheritDoc}
	 */
	public copy (): Geometry {
		return new Point(this);
	}

	/**
	 * {@inheritDoc}
	 */
	public isEmpty (): boolean {
		return false;
	}

	/**
	 * {@inheritDoc}
	 */
	public isSimple (): boolean {
		return true;
	}

	/**
	 * {@inheritDoc}
	 */
	public equals (obj: Geometry): boolean {
		return super.equals(obj) && obj instanceof Point && this.m === obj.m && this.z === obj.z && this.x === obj.x && this.y === obj.y
	}
}
